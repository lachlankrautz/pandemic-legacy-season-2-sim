import type { Logger } from "../../logging/logger.ts";
import type { Game } from "../game.ts";

/**
 * GameLog can only log strings but saves the logs
 * to the game state as well as passing to the
 * system logger.
 */
export type GameLog = (log: string) => void;

export const makeGameLog =
  (game: Game, logger: Logger): GameLog =>
  (message: string) => {
    game.gameLog.push(message);
    logger.info(message);
  };
