import type { Logger } from "../../logging/logger.ts";
import type { Repository } from "../../repository/repository.ts";
import { makeGame } from "./new-game.ts";

export const startGameUseCase = (logger: Logger, repo: Repository, fileName: string): void => {
  logger.info("Starting new game");
  const game = makeGame();
  repo.saveGame(fileName, game);

  if (game.turnFlow.type !== "take_4_actions") {
    throw new Error("Game started in unexpected state", { cause: { gameFlow: game.turnFlow } });
  }

  logger.info(`Starting player: ${game.turnFlow.player.name}`);
  logger.info(`Game flow at "${game.turnFlow.type}"`);
};
