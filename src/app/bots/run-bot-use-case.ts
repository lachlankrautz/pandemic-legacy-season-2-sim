import { makeGame } from "../game/start/new-game.ts";
import { makeGameDriver } from "../game/step/game-steps.ts";
import { makeGameLog } from "../game/game-log/game-log.ts";
import type { Logger } from "../logging/logger.ts";
import { playGame as dumbBotPlayGame } from "./dumb-bot/dumb-bot.ts";

export const runBotUseCase = (logger: Logger, botName: string) => {
  const game = makeGame();
  const gameLog = makeGameLog(game, logger);
  const driver = makeGameDriver(game, gameLog);

  if (botName === "dumb") {
    dumbBotPlayGame(driver, logger);
    return;
  }

  throw new Error("Unknown bot name", { cause: { botName } });
};
