import type { Logger } from "../logging/logger.ts";
import type { Repository } from "../repository/repository.ts";
import type { Game } from "./game.ts";
import { makeGameDriver } from "./game-steps.ts";
import {
  type SerializableStep,
  serializableStepSchema,
  serializableStepToStep,
} from "../serialization/step-serialization.ts";
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
  const driver = makeGameDriver(game);
  const step = serializableStepToStep(inputStep);

  const result = driver.takeStep(step);
  switch (result.type) {
    case "no_effect":
      logger.error("Invalid step", { step, cause: result.cause });
      break;
    case "state_changed":
      result.gameLog.map((log) => logger.info(log));
      break;
  }

  repo.saveGame(fileName, game);
};
