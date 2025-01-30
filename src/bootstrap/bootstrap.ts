import type { CliRunner } from "../app/cli/yargs-cli-runner.ts";
import { makeYargsCliRunner } from "../app/cli/yargs-cli-runner.ts";
import { hideBin } from "yargs/helpers";
import { startGame } from "../app/game/start-game.ts";
import { fileRepository } from "../app/repository/file-repository.ts";
import { takeGameTurn } from "../app/game/take-game-turn.ts";

/**
 * Manage dependencies with minimal coupling to allow easy testing.
 */
export const boostrapCli = (): CliRunner => {
  const logger = console;
  return makeYargsCliRunner(
    () => (fileName: string) => startGame(logger, fileRepository, fileName),
    () => (fileName: string, turnJson: string) => takeGameTurn(logger, fileRepository, fileName, turnJson),
    hideBin(process.argv),
  );
};
