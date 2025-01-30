import type { CliRunner } from "../app/cli/yargs-cli-runner.ts";
import { makeYargsCliRunner } from "../app/cli/yargs-cli-runner.ts";
import { hideBin } from "yargs/helpers";

export const boostrapCli = (): CliRunner => {
  return makeYargsCliRunner(console, hideBin(process.argv));
};
