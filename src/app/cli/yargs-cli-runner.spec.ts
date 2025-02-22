import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeYargsCliRunner } from "./yargs-cli-runner.ts";
import { makeLogger } from "../logging/logger.ts";
import { showInfoTypes } from "../game/view/show-info-use-case.ts";
import { serializableStepFactory } from "../serialization/step-serialization-factories.ts";
import { LocationNames } from "../game/location/location.ts";
import type { SerializableStep } from "../serialization/step-serialization.ts";

describe("yargs cli runner", () => {
  const testLogger = makeLogger();

  const mockPlayTui = vi.fn();
  const mockStartGame = vi.fn();
  const mockTakeStep = vi.fn();
  const mockTakeSerializedStep = vi.fn();
  const mockShowInfo = vi.fn(() => "");

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
    const spyConsoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

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
    const spyConsoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(act(["start-game"])).rejects.toThrow(processExitPattern);

    expect(spyConsoleError).toHaveBeenNthCalledWith(3, expect.stringMatching(/Missing required .* save/));
    spyConsoleError.mockRestore();
  });

  it("runs take-step command", () => {
    const step = JSON.stringify(serializableStepFactory.build());
    act(["take-step", "--save", "test", "--step", step]);
    expect(mockTakeSerializedStep).toHaveBeenCalledWith("test", step);
  });

  it("runs move command", () => {
    act(["move", "--save", "test", "--player", "Hammond", "--to", LocationNames.CHICAGO]);
    const expectedStep: SerializableStep = {
      type: "player_action",
      playerName: "Hammond",
      action: {
        type: "move",
        isFree: false,
        toLocationName: LocationNames.CHICAGO,
      },
    };
    expect(mockTakeStep).toHaveBeenCalledWith("test", expectedStep);
  });

  it("runs make-supplies command", () => {
    act(["make-supplies", "--save", "test", "--player", "Hammond"]);
    const expectedStep: SerializableStep = {
      type: "player_action",
      playerName: "Hammond",
      action: {
        type: "make_supplies",
        isFree: false,
      },
    };
    expect(mockTakeStep).toHaveBeenCalledWith("test", expectedStep);
  });

  it("runs drop-supplies command", () => {
    act(["drop-supplies", "--save", "test", "--player", "Hammond", "--supplyCubes", "3"]);
    const expectedStep: SerializableStep = {
      type: "player_action",
      playerName: "Hammond",
      action: {
        type: "drop_supplies",
        isFree: false,
        supplyCubes: 3,
      },
    };
    expect(mockTakeStep).toHaveBeenCalledWith("test", expectedStep);
  });

  it("runs make-supply-centre command", () => {
    // TODO this has to actually pass the hand size args through
    act(["make-supply-centre", "--save", "test", "--player", "Hammond"]);
    const expectedStep: SerializableStep = {
      type: "player_action",
      playerName: "Hammond",
      action: {
        type: "make_supply_centre",
        isFree: false,
        cardSelection: [],
      },
    };
    expect(mockTakeStep).toHaveBeenCalledWith("test", expectedStep);
  });

  it("runs check for exposure command", () => {
    act(["exposure", "--save", "test", "--player", "Hammond"]);
    const expectedStep: SerializableStep = {
      type: "check_for_exposure",
      playerName: "Hammond",
    };
    expect(mockTakeStep).toHaveBeenCalledWith("test", expectedStep);
  });

  it("runs draw player card command", () => {
    act(["draw", "--save", "test", "--player", "Hammond"]);
    const expectedStep: SerializableStep = {
      type: "draw_player_card",
      playerName: "Hammond",
    };
    expect(mockTakeStep).toHaveBeenCalledWith("test", expectedStep);
  });

  it("runs draw infection card command", () => {
    act(["infect", "--save", "test", "--player", "Hammond"]);
    const expectedStep: SerializableStep = {
      type: "draw_infection_card",
      playerName: "Hammond",
    };
    expect(mockTakeStep).toHaveBeenCalledWith("test", expectedStep);
  });

  it("runs epidemic command", () => {
    act(["epidemic", "--save", "test", "--player", "Hammond"]);
    const expectedStep: SerializableStep = {
      type: "resolve_epidemic",
      playerName: "Hammond",
    };
    expect(mockTakeStep).toHaveBeenCalledWith("test", expectedStep);
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

  it.each(showInfoTypes)("shows game info: %s", async (showInfoType) => {
    await act(["show", "--debug", "--save", "test", "--filter", showInfoType]);
    expect(mockShowInfo).toHaveBeenCalledWith("test", showInfoType);
  });
});
