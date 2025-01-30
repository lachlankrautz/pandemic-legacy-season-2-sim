import type { Logger } from "../logging/logger.ts";
import type { Repository } from "../repository/repository.ts";

export const takeGameTurn = (logger: Logger, repo: Repository, fileName: string, turnJson: string) => {
  logger.info(`loading game from file: ${fileName}`);
  const game = repo.loadGame(fileName);
  logger.info("taking a turn");
  // takeTurn(game);
  logger.info(`saving game to file: ${fileName}`);
  repo.saveGame(fileName, game);
};
