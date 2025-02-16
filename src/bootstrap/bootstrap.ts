import type { CliRunner } from "../app/cli/yargs-cli-runner.ts";
import { makeYargsCliRunner } from "../app/cli/yargs-cli-runner.ts";
import { startGameUseCase } from "../app/game/start/start-game-use-case.ts";
import { makeFileRepository } from "../app/repository/file-repository.ts";
import type { SerializableStep } from "../app/serialization/step-serialization.ts";
import { takeGameStepUseCase, takeSerializedGameStepUseCase } from "../app/game/step/take-game-step-use-case.ts";
import { makeLogger } from "../app/logging/logger.ts";
import { type ShowInfo, showInfoUseCase } from "../app/game/view/show-info-use-case.ts";
import { makeTuiRunner } from "../app/ink-tui/root.ts";

/**
 * Manage dependencies with minimal coupling to allow easy testing.
 */
export const boostrapCli = (): CliRunner => {
  const logger = makeLogger();

  return makeYargsCliRunner(
    logger,
    () => makeTuiRunner(),
    () => (fileName: string) => startGameUseCase(logger, makeFileRepository(logger), fileName),
    () => (fileName: string, inputStep: SerializableStep) =>
      takeGameStepUseCase(logger, makeFileRepository(logger), fileName, inputStep),
    () => (fileName: string, stepJson: string) =>
      takeSerializedGameStepUseCase(logger, makeFileRepository(logger), fileName, stepJson),
    () => (fileName: string, showInfo: ShowInfo) => showInfoUseCase(makeFileRepository(logger), fileName, showInfo),
  );
};
