import { queueService } from "./queueService";
import { queueApi } from "@/api/queue";

jest.mock("@/api/queue", () => ({
  queueApi: {
    createToken: jest.fn(),
    getTokens: jest.fn(),
    updateStatus: jest.fn(),
    callNext: jest.fn(),
    getStats: jest.fn(),
  },
}));

describe("queueService", () => {
  it("generates token through API", async () => {
    (queueApi.createToken as jest.Mock).mockResolvedValue({ id: "1", tokenNumber: "G001" });
    const token = await queueService.generateToken("p1", "GENERAL");
    expect(token.tokenNumber).toBe("G001");
  });

  it("computes stats payload", async () => {
    (queueApi.getStats as jest.Mock).mockResolvedValue({
      total: "8",
      waiting: "2",
      called: "1",
      completed: "4",
      cancelled: "1",
      paused: "0",
    });
    const stats = await queueService.stats();
    expect(stats.total).toBe(8);
    expect(stats.completed).toBe(4);
  });
});
