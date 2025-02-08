import type { CliRunner } from "../app/cli/yargs-cli-runner.ts";
import { makeYargsCliRunner } from "../app/cli/yargs-cli-runner.ts";
import { hideBin } from "yargs/helpers";
import { startGameUseCase } from "../app/game/start-game-use-case.ts";
import { makeFileRepository } from "../app/repository/file-repository.ts";
import type { SerializableStep } from "../app/serialization/step-serialization.ts";
import { takeGameStepUseCase, takeSerializedGameStepUseCase } from "../app/game/take-game-step-use-case.ts";
import { makeLogger } from "../app/logging/logger.ts";
import { type ShowInfo, showInfoUseCase } from "../app/game/show-info-use-case.ts";
import { makeTuiRunner } from "../app/ink-tui/main-menu.ts";

/**
 * Manage dependencies with minimal coupling to allow easy testing.
 */
export const boostrapCli = (): CliRunner => {
  const logger = makeLogger();
  const fileRepository = makeFileRepository(logger);
  return makeYargsCliRunner(
    logger,
    () => makeTuiRunner(),
    () => (fileName: string) => startGameUseCase(logger, fileRepository, fileName),
    () => (fileName: string, inputStep: SerializableStep) =>
      takeGameStepUseCase(logger, fileRepository, fileName, inputStep),
    () => (fileName: string, stepJson: string) =>
      takeSerializedGameStepUseCase(logger, fileRepository, fileName, stepJson),
    () => (fileName: string, showInfo: ShowInfo) => showInfoUseCase(fileRepository, fileName, showInfo),
    hideBin(process.argv),
  );
};
