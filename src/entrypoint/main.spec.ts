import { it, describe, expect, vi } from "vitest";

const mockRun = vi.fn();
const mockBootstrapCli = vi.fn(() => ({
  run: mockRun,
}));

vi.mock("../bootstrap/bootstrap.ts", () => ({
  boostrapCli: mockBootstrapCli,
}));

describe("main cli", () => {
  it("runs cli", async () => {
    await import("../entrypoint/main.ts");

    expect(mockBootstrapCli).toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalledWith(process.argv);
  });
});
