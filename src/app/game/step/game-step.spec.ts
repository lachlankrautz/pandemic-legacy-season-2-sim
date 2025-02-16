import { describe, it, expect, vi } from "vitest";
import { makeGameDriver, takeGameStep } from "./game-steps.ts";
import { gameFactory } from "../game-factories.ts";
import { makeGameLog } from "../game-log/game-log.ts";
import { makeLogger } from "../../logging/logger.ts";
import { stepFactory } from "./step-factories.ts";
import { playerMapFactory } from "../player/player-factories.ts";

const logger = makeLogger();

describe("game driver", () => {
  it("makes a driver from a game", () => {
    const game = gameFactory.build();
    const gameLog = makeGameLog(game, logger);

    expect(() => makeGameDriver(game, gameLog)).not.toThrow();
  });

  it("advances game turn flow after successful step", () => {
    const game = gameFactory.build({ turnFlow: { type: "exposure_check" } });
    const gameLog = makeGameLog(game, logger);
    const driver = makeGameDriver(game, gameLog);
    const step = stepFactory.build({ type: "check_for_exposure", player: game.turnFlow.player });

    const result = driver.takeStep(step);
    expect(result.type).toEqual("state_changed");
    expect(game.turnFlow.type).toEqual("take_4_actions");
  });
});

describe("take game step", () => {
  it("fails if the game is over", () => {
    const game = gameFactory.build({ state: { type: "lost" } });
    const step = stepFactory.build();
    const gameLog = makeGameLog(game, logger);

    expect(() => takeGameStep(game, step, gameLog)).toThrow();
  });

  it("has no effect if it isn't that player's turn", () => {
    const [player, wrongPlayer] = playerMapFactory.build().values().toArray();
    if (player === undefined || wrongPlayer === undefined) {
      throw new Error("players missing from map");
    }

    const game = gameFactory.build({ turnFlow: { player } });
    const step = stepFactory.build({ player: wrongPlayer });
    const gameLog = makeGameLog(game, logger);

    const result = takeGameStep(game, step, gameLog);

    expect(result.type).toEqual("no_effect");
    if (result.type !== "no_effect") {
      throw new Error("narrow type of already asserted value");
    }
    expect(result.cause).toContain("Wrong player");
  });

  it("returns changed result if successful", () => {
    const [player] = playerMapFactory.build().values().toArray();
    if (player === undefined) {
      throw new Error("player missing from map");
    }

    const game = gameFactory.build({ turnFlow: { player, type: "exposure_check" } });
    const step = stepFactory.build({ player, type: "check_for_exposure" });
    const gameLog = makeGameLog(game, logger);

    const result = takeGameStep(game, step, gameLog);

    expect(result.type).toEqual("state_changed");
  });

  it("logs changes if successful", () => {
    const [player] = playerMapFactory.build().values().toArray();
    if (player === undefined) {
      throw new Error("player missing from map");
    }

    const game = gameFactory.build({ turnFlow: { player, type: "exposure_check" } });
    const step = stepFactory.build({ player, type: "check_for_exposure" });
    const gameLog = vi.fn();

    const result = takeGameStep(game, step, gameLog);

    expect(result.type).toEqual("state_changed");
    expect(gameLog).toHaveBeenCalledWith(expect.stringContaining("checked for exposure"));
  });

  it("updated game turn flow if successful", () => {
    const [player] = playerMapFactory.build().values().toArray();
    if (player === undefined) {
      throw new Error("player missing from map");
    }

    const game = gameFactory.build({ turnFlow: { player, type: "exposure_check" } });
    const step = stepFactory.build({ player, type: "check_for_exposure" });
    const gameLog = vi.fn();

    const result = takeGameStep(game, step, gameLog);

    expect(result.type).toEqual("state_changed");
    if (result.type !== "state_changed") {
      throw new Error("narrow type of already asserted value");
    }
    expect(game.turnFlow.type).toEqual("take_4_actions");
  });
});
