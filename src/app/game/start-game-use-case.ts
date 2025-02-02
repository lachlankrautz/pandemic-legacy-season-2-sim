import type { Logger } from "../logging/logger.ts";
import type { Repository } from "../repository/repository.ts";
import { makeGame } from "./game.ts";

export const startGameUseCase = (logger: Logger, repo: Repository, fileName: string) => {
  logger.info("Starting new game");
  const game = makeGame();
  repo.saveGame(fileName, game);

  if (game.gameFlow.type !== "player_turn:take_4_actions") {
    throw new Error("Game started in unexpected state", { cause: { gameFlow: game.gameFlow } });
  }

  logger.info(`Starting player: ${game.gameFlow.playerName}`);
  logger.info(`Game flow at "${game.gameFlow.type}"`);
};
