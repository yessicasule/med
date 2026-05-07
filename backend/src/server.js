require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { v4: uuidv4 } = require("uuid");
const { pool, initDb } = require("./db");
const { normalizeDepartment, predictEta, nextTokenNumber } = require("./queueService");
const { client, queueCountGauge, observeRequest } = require("./metrics");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => observeRequest(req, res, Date.now() - start));
  next();
});

const mapUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  role: row.role,
  specialty: row.specialty,
  verified: row.verified,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapToken = (row) => ({
  id: row.id,
  tokenNumber: row.token_number,
  patientId: row.patient_id,
  patientName: row.patient_name,
  department: row.department,
  doctorId: row.doctor_id,
  status: row.status,
  priority: row.priority,
  estimatedWait: row.estimated_wait,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, phone, role, specialty } = req.body;
  const id = uuidv4();
  try {
    const result = await pool.query(
      `INSERT INTO users (id, name, email, password, phone, role, specialty, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, name, email, password, phone, role, specialty || null, role === "doctor" ? false : true]
    );
    res.status(201).json({ user: mapUser(result.rows[0]), token: `token-${id}` });
  } catch (error) {
    res.status(400).json({ message: "Registration failed", error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email = $1 AND password = $2", [email, password]);
  if (!result.rows.length) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  return res.json({ user: mapUser(result.rows[0]), token: `token-${result.rows[0].id}` });
});

app.get("/api/users", async (_req, res) => {
  const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
  res.json(result.rows.map(mapUser));
});

app.get("/api/users/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ message: "User not found" });
  res.json(mapUser(result.rows[0]));
});

app.put("/api/users/:id", async (req, res) => {
  const { name, phone, role, specialty, verified } = req.body;
  const result = await pool.query(
    `UPDATE users
     SET name = COALESCE($2, name),
         phone = COALESCE($3, phone),
         role = COALESCE($4, role),
         specialty = COALESCE($5, specialty),
         verified = COALESCE($6, verified),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [req.params.id, name, phone, role, specialty, verified]
  );
  if (!result.rows.length) return res.status(404).json({ message: "User not found" });
  res.json(mapUser(result.rows[0]));
});

app.delete("/api/users/:id", async (req, res) => {
  const deleted = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [req.params.id]);
  if (!deleted.rows.length) return res.status(404).json({ message: "User not found" });
  res.status(204).send();
});

app.post("/api/queue-tokens", async (req, res) => {
  const { patientId, patientName, department, doctorId, priority = false } = req.body;
  const normalizedDepartment = normalizeDepartment(department);

  const waitingCount = await pool.query(
    "SELECT COUNT(*) FROM queue_tokens WHERE department = $1 AND status = 'waiting'",
    [normalizedDepartment]
  );
  const queueAhead = Number(waitingCount.rows[0].count || 0);
  const tokenNumber = await nextTokenNumber(pool, normalizedDepartment);
  const estimatedWait = predictEta(queueAhead);
  const id = uuidv4();

  const result = await pool.query(
    `INSERT INTO queue_tokens
      (id, token_number, patient_id, patient_name, department, doctor_id, status, priority, estimated_wait)
     VALUES ($1, $2, $3, $4, $5, $6, 'waiting', $7, $8)
     RETURNING *`,
    [id, tokenNumber, patientId || null, patientName || null, normalizedDepartment, doctorId || null, priority, estimatedWait]
  );

  await queueCountGauge.set({ department: normalizedDepartment }, queueAhead + 1);
  res.status(201).json(mapToken(result.rows[0]));
});

app.get("/api/queue-tokens", async (req, res) => {
  const department = req.query.department ? normalizeDepartment(req.query.department) : null;
  const patientId = req.query.patientId || null;
  const conditions = [];
  const values = [];

  if (department) {
    values.push(department);
    conditions.push(`department = $${values.length}`);
  }
  if (patientId) {
    values.push(patientId);
    conditions.push(`patient_id = $${values.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(`SELECT * FROM queue_tokens ${where} ORDER BY created_at ASC`, values);
  res.json(result.rows.map(mapToken));
});

app.patch("/api/queue-tokens/:id/status", async (req, res) => {
  const { status } = req.body;
  const result = await pool.query(
    `UPDATE queue_tokens
     SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [req.params.id, status]
  );
  if (!result.rows.length) return res.status(404).json({ message: "Token not found" });
  res.json(mapToken(result.rows[0]));
});

app.post("/api/queue-tokens/:department/call-next", async (req, res) => {
  const department = normalizeDepartment(req.params.department);
  const doctorId = req.body.doctorId || null;
  const result = await pool.query(
    `SELECT * FROM queue_tokens
     WHERE department = $1 AND status = 'waiting'
     ORDER BY priority DESC, created_at ASC`,
    [department]
  );
  const candidate = doctorId ? result.rows.find((row) => row.doctor_id === doctorId) : result.rows[0];
  if (!candidate) return res.status(404).json({ message: "No waiting token" });

  const updated = await pool.query(
    `UPDATE queue_tokens
     SET status = 'called', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [candidate.id]
  );
  res.json(mapToken(updated.rows[0]));
});

app.get("/api/analytics/queue-stats", async (_req, res) => {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'waiting') AS waiting,
      COUNT(*) FILTER (WHERE status = 'called') AS called,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed,
      COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
      COUNT(*) FILTER (WHERE status = 'paused') AS paused
    FROM queue_tokens
  `);
  res.json(result.rows[0]);
});

const start = async () => {
  let attempts = 0;
  while (attempts < 15) {
    try {
      await initDb();
      break;
    } catch (error) {
      attempts += 1;
      if (attempts >= 15) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`Backend listening on ${port}`);
  });
};

if (process.env.NODE_ENV !== "test") {
  start();
}

module.exports = { app, start };
