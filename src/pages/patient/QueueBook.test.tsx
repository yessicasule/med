import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import QueueBook from "./QueueBook";

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "p1" } }),
}));

jest.mock("@/services/queueService", () => ({
  queueService: {
    generateToken: jest.fn().mockResolvedValue({
      id: "t1",
      tokenNumber: "G001",
      estimatedWait: 10,
      department: "GENERAL",
    }),
  },
}));

describe("QueueBook", () => {
  it("renders queue token booking panel", async () => {
    render(<QueueBook />);
    expect(screen.getByText("Book Queue Token")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Generate Token"));
    expect(await screen.findByText("Your Token Number")).toBeInTheDocument();
  });
});
