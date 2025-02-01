import type { CliRunner } from "../app/cli/yargs-cli-runner.ts";
import { makeYargsCliRunner } from "../app/cli/yargs-cli-runner.ts";
import { hideBin } from "yargs/helpers";
import { startGame } from "../app/game/start-game.ts";
import { makeFileRepository } from "../app/repository/file-repository.ts";
import { takeSerializedGameTurn } from "../app/game/take-game-turn.ts";

/**
 * Manage dependencies with minimal coupling to allow easy testing.
 */
export const boostrapCli = (): CliRunner => {
  const logger = console;
  const fileRepository = makeFileRepository(logger);
  return makeYargsCliRunner(
    () => (fileName: string) => startGame(logger, fileRepository, fileName),
    () => (fileName: string, turnJson: string) => takeSerializedGameTurn(logger, fileRepository, fileName, turnJson),
    hideBin(process.argv),
  );
};
