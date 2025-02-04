import type { Logger } from "../logging/logger.ts";
import type { Repository } from "../repository/repository.ts";
import { type Game, type GameLog, makeGameLog } from "./game.ts";
import { makeGameDriver } from "./game-steps.ts";
import { makeStepMapper, type SerializableStep, serializableStepSchema } from "../serialization/step-serialization.ts";
import { Value } from "@sinclair/typebox/value";

export const takeSerializedGameStepUseCase = (logger: Logger, repo: Repository, fileName: string, stepJson: string) => {
  const inputStep = Value.Parse(serializableStepSchema, JSON.parse(stepJson));
  return takeGameStepUseCase(logger, repo, fileName, inputStep);
};

export const takeGameStepUseCase = (
  logger: Logger,
  repo: Repository,
  fileName: string,
  inputStep: SerializableStep,
) => {
  const game: Game = repo.loadGame(fileName);
  const gameLog: GameLog = makeGameLog(game, logger);
  const driver = makeGameDriver(game, gameLog);
  const step = makeStepMapper().toActual(inputStep);

  const result = driver.takeStep(step);
  switch (result.type) {
    case "no_effect":
      logger.warn(result.cause);
      break;
    case "state_changed":
      break;
  }

  repo.saveGame(fileName, game);
};
