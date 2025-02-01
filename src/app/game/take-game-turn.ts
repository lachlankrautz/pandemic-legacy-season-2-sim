import type { Logger } from "../logging/logger.ts";
import type { Repository } from "../repository/repository.ts";
import { type ActionResult, takeAction, takeTurn, type Turn, type TurnResult } from "./actions.ts";
import { deserializeTurn, type RawCharacterAction, rawCharacterActionToCharacterAction } from "./serialization.ts";
import { type Game, gameCharacterFinder, gameLocationFinder } from "./game.ts";

export const takeRawCharacterAction = (
  logger: Logger,
  repo: Repository,
  fileName: string,
  rawCharacterAction: RawCharacterAction,
): ActionResult => {
  const game = repo.loadGame(fileName);
  const { character, action } = rawCharacterActionToCharacterAction(
    rawCharacterAction,
    gameCharacterFinder(game),
    gameLocationFinder(game),
  );

  const result = takeAction(game, character, action);
  logger.info(result.summary);
  repo.saveGame(fileName, game);

  return result;
};

export const takeSerializedGameTurn = (
  logger: Logger,
  repo: Repository,
  fileName: string,
  turnJson: string,
): TurnResult => {
  const game = repo.loadGame(fileName);
  const turn = deserializeTurn(turnJson, gameCharacterFinder(game), gameLocationFinder(game));

  const result = takeGameTurn(logger, game, turn);
  repo.saveGame(fileName, game);
  return result;
};

export const takeGameTurn = (_: Logger, game: Game, turn: Turn): TurnResult => {
  return takeTurn(game, turn);
};
