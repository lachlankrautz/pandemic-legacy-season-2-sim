import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeYargsCliRunner } from "./yargs-cli-runner.ts";
import { makeLogger } from "../logging/logger.ts";

describe("yargs cli runner", () => {
  const testLogger = makeLogger();

  const mockPlayTui = vi.fn();
  const mockStartGame = vi.fn();
  const mockTakeStep = vi.fn();
  const mockTakeSerializedStep = vi.fn();
  const mockShowInfo = vi.fn();

  const act = (args: string[]): Promise<void> =>
    makeYargsCliRunner(
      testLogger,
      () => ({ run: mockPlayTui }),
      () => mockStartGame,
      () => mockTakeStep,
      () => mockTakeSerializedStep,
      () => mockShowInfo,
    ).run(["test", "command", ...args]);

  const processExitPattern: RegExp = /process\.exit/;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("missing command exits process", async () => {
    const spyConsoleError = vi.spyOn(console, "error").mockImplementation(() => true);

    await expect(act([])).rejects.toThrow(processExitPattern);

    expect(spyConsoleError).toHaveBeenNthCalledWith(3, expect.stringMatching(/Not enough .* arguments/));
    spyConsoleError.mockRestore();
  });

  it("starts new game", async () => {
    const saveName = "test";
    await act(["start-game", "--save", saveName]);
    expect(mockStartGame).toHaveBeenCalledExactlyOnceWith(saveName);
  });

  it("starting new game requires a save name", async () => {
    const spyConsoleError = vi.spyOn(console, "error").mockImplementation(() => true);

    await expect(act(["start-game"])).rejects.toThrow(processExitPattern);

    expect(spyConsoleError).toHaveBeenNthCalledWith(3, expect.stringMatching(/Missing required .* save/));
    spyConsoleError.mockRestore();
  });

  it("failing command logs and exits", async () => {
    const spyLogger = vi.spyOn(testLogger, "error").mockImplementation(() => undefined);

    const message = "test failure";
    mockStartGame.mockImplementation(() => {
      throw new Error(message);
    });
    await expect(act(["start-game", "--save", "test"])).rejects.toThrow(processExitPattern);

    expect(spyLogger).toHaveBeenNthCalledWith(1, expect.objectContaining({ message }));
    spyLogger.mockRestore();
  });

  it("failing command with debug throws", async () => {
    const message = "test failure";
    mockStartGame.mockImplementation(() => {
      throw new Error(message);
    });

    await expect(act(["start-game", "--save", "test", "--debug"])).rejects.toThrow(message);
  });
});
