import type { CliRunner } from "../app/cli/yargs-cli-runner.ts";
import { makeYargsCliRunner } from "../app/cli/yargs-cli-runner.ts";
import { hideBin } from "yargs/helpers";
import { fileRepository } from "../app/repository/file-repository.ts";

export const boostrapCli = (): CliRunner => {
  return makeYargsCliRunner(console, fileRepository, hideBin(process.argv));
};
