import type { Logger } from "../logging/logger.ts";
import yargs from "yargs";

export type CliRunner = {
  run(): Promise<void>;
};

export const makeYargsCliRunner = (logger: Logger, argv: string[]) => {
  const yargsCli = yargs(argv)
    .command(
      "start-game",
      "Start a new game.",
      (yargs) => {
        return yargs.options({
          //
        });
      },
      () => {
        logger.info("starting new game");
      },
    )
    .demandCommand();

  return {
    async run() {
      await yargsCli.parseAsync();
    },
  };
};
