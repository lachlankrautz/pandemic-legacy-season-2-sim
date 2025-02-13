import { describe, it, expect } from "vitest";
import { gameFactory } from "../game-factories.ts";
import { makeGameLog } from "./game-log.ts";
import { makeLogger } from "../../logging/logger.ts";

describe("game log", () => {
  it("adds messages to the game's log", () => {
    const logger = makeLogger();
    const game = gameFactory.build();
    const gameLog = makeGameLog(game, logger);

    const message = "test";
    const logLength = game.gameLog.length;

    gameLog(message);

    expect(game.gameLog.length).toEqual(logLength + 1);
    expect(game.gameLog.includes(message));
  });
});
