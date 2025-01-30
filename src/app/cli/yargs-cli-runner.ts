import type { Logger } from "../logging/logger.ts";
import yargs from "yargs";
import type { Repository } from "../repository/repository.ts";

export type CliRunner = {
  run(): Promise<void>;
};

export const makeYargsCliRunner = (logger: Logger, repo: Repository, argv: string[]): CliRunner => {
  const yargsCli = yargs(argv)
    .command(
      "start-game",
      "Start a new game.",
      (yargs) => {
        return yargs.options({
          fileName: {
            type: "string",
            required: true,
          },
        });
      },
      (args) => {
        logger.info("starting new game");
        logger.info(`saving game to file: ${args.fileName}`);
      },
    )
    .command(
      "take-turn",
      "Take a turn in an existing game.",
      (yargs) => {
        return yargs.options({
          fileName: {
            type: "string",
            required: true,
          },
          turn: {
            type: "string",
            required: true,
          },
        });
      },
      (args) => {
        logger.info("taking a turn");
        logger.info(`saving game to file: ${args.fileName}`);
      },
    )
    .demandCommand();

  return {
    async run() {
      await yargsCli.parseAsync();
    },
  };
};
