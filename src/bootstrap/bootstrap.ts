import type { CliRunner } from "../app/cli/yargs-cli-runner.ts";
import { makeYargsCliRunner } from "../app/cli/yargs-cli-runner.ts";
import { hideBin } from "yargs/helpers";
import { startGameUseCase } from "../app/game/start-game-use-case.ts";
import { makeFileRepository } from "../app/repository/file-repository.ts";
import type { SerializableStep } from "../app/serialization/step-serialization.ts";
import { takeGameStepUseCase, takeSerializedGameStepUseCase } from "../app/game/take-game-step-use-case.ts";

/**
 * Manage dependencies with minimal coupling to allow easy testing.
 */
export const boostrapCli = (): CliRunner => {
  const logger = console;
  const fileRepository = makeFileRepository(logger);
  return makeYargsCliRunner(
    () => () => undefined,
    () => (fileName: string) => startGameUseCase(logger, fileRepository, fileName),
    () => (fileName: string, inputStep: SerializableStep) =>
      takeGameStepUseCase(logger, fileRepository, fileName, inputStep),
    () => (fileName: string, stepJson: string) =>
      takeSerializedGameStepUseCase(logger, fileRepository, fileName, stepJson),
    hideBin(process.argv),
  );
};
