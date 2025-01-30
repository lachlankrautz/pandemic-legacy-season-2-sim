import type { Logger } from "../logging/logger.ts";
import type { Repository } from "../repository/repository.ts";
import { makeGame } from "./game.ts";

export const startGame = (logger: Logger, repo: Repository, fileName: string) => {
  logger.info("starting new game");
  logger.info(`saving game to file: ${fileName}`);
  repo.saveGame(fileName, makeGame());
};
