const { predictEta, normalizeDepartment } = require("./queueService");

describe("queue service utils", () => {
  test("predict eta by queue size", () => {
    expect(predictEta(3)).toBe(30);
  });

  test("normalizes department aliases", () => {
    expect(normalizeDepartment("GENERAL")).toBe("General");
    expect(normalizeDepartment("ENT")).toBe("ENT");
  });
});
