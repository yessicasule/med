const DEPARTMENT_PREFIX = {
  Cardiology: "C",
  ENT: "E",
  General: "G",
  Ortho: "O",
};

const normalizeDepartment = (department) => {
  const aliases = {
    CARDIOLOGY: "Cardiology",
    ENT: "ENT",
    GENERAL: "General",
    ORTHO: "Ortho",
  };
  return aliases[department] || department;
};

const predictEta = (queueAhead, avgConsultationTime = 10) => queueAhead * avgConsultationTime;

const nextTokenNumber = async (pool, department) => {
  const normalized = normalizeDepartment(department);
  const prefix = DEPARTMENT_PREFIX[normalized] || normalized[0]?.toUpperCase() || "T";
  const result = await pool.query(
    `SELECT token_number
     FROM queue_tokens
     WHERE department = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [normalized]
  );

  const last = result.rows[0]?.token_number || `${prefix}000`;
  const numberPart = Number(last.replace(prefix, "")) || 0;
  return `${prefix}${String(numberPart + 1).padStart(3, "0")}`;
};

module.exports = { normalizeDepartment, predictEta, nextTokenNumber };
