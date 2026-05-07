const request = require("supertest");

jest.mock("./db", () => {
  const query = jest.fn();
  return {
    pool: { query },
    initDb: jest.fn(),
  };
});

const { pool } = require("./db");
const { app } = require("./server");

describe("API", () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  test("health endpoint", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("queue stats endpoint", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ total: "1", waiting: "1", called: "0", completed: "0", cancelled: "0", paused: "0" }],
    });
    const res = await request(app).get("/api/analytics/queue-stats");
    expect(res.status).toBe(200);
    expect(res.body.waiting).toBe("1");
  });
});
