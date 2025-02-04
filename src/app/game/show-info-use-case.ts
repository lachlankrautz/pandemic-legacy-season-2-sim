import type { Logger } from "../logging/logger.ts";
import type { Repository } from "../repository/repository.ts";
import { type Game } from "./game.ts";

export type ShowInfo = "locations" | "players";

export const showInfoUseCase = (logger: Logger, repo: Repository, fileName: string, showInfo: ShowInfo) => {
  const game: Game = repo.loadGame(fileName);

  switch (showInfo) {
    case "locations":
      game.locations.values().forEach((location) => {
        logger.info(`${location.name}: ${location.supplyCubes} supply, ${location.plagueCubes} plague`);
      });
      break;
    case "players":
      game.players.values().forEach((player) => {
        logger.info(`${player.name} ${player.location.name}`);
      });
      break;
  }
};
