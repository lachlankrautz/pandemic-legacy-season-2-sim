import type { Logger } from "../logging/logger.ts";
import type { Repository } from "../repository/repository.ts";
import { takeTurn, type Turn } from "./actions.ts";
import { deserializeTurn } from "./serialization.ts";
import { type Game, gameCharacterFinder, gameLocationFinder } from "./game.ts";

export const takeSerializedGameTurn = (logger: Logger, repo: Repository, fileName: string, turnJson: string): void => {
  const game = repo.loadGame(fileName);
  const turn = deserializeTurn(turnJson, gameCharacterFinder(game), gameLocationFinder(game));

  takeGameTurn(logger, game, turn);
  repo.saveGame(fileName, game);
};

export const takeGameTurn = (logger: Logger, game: Game, turn: Turn): void => {
  const { summary } = takeTurn(game, turn);
  logger.info("turn taken", { summary });
};
