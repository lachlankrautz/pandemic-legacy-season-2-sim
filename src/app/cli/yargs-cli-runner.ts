import yargs from "yargs";

export type CliRunner = {
  run(): Promise<void>;
};

export type StartGameCommandLoader = () => (name: string) => void;
export type TakeTurnCommandLoader = () => (name: string, turnJson: string) => void;

export const makeYargsCliRunner = (
  startGameCommandLoader: StartGameCommandLoader,
  takeTurnCommandLoader: TakeTurnCommandLoader,
  argv: string[],
): CliRunner => {
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
      (args) => startGameCommandLoader()(args.fileName),
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
          turnJson: {
            type: "string",
            required: true,
          },
        });
      },
      (args) => takeTurnCommandLoader()(args.fileName, args.turnJson),
    )
    .demandCommand();

  return {
    async run() {
      await yargsCli.parseAsync();
    },
  };
};
