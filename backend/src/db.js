const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "mediqueue",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'receptionist', 'admin')),
      specialty TEXT,
      verified BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS queue_tokens (
      id UUID PRIMARY KEY,
      token_number TEXT NOT NULL,
      patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
      patient_name TEXT,
      department TEXT NOT NULL CHECK (department IN ('Cardiology', 'ENT', 'General', 'Ortho')),
      doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      status TEXT NOT NULL CHECK (status IN ('waiting', 'called', 'completed', 'cancelled', 'paused')),
      priority BOOLEAN DEFAULT false,
      estimated_wait INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
};

module.exports = { pool, initDb };
