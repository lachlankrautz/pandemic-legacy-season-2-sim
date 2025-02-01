import yargs from "yargs";
import type { RawCharacterAction } from "../game/serialization.ts";
import type { ActionResult, TurnResult } from "../game/actions.ts";

export type CliRunner = {
  run(): Promise<void>;
};

export type StartGameCommandLoader = () => (save: string) => void;
export type TakeTurnCommandLoader = () => (save: string, turnJson: string) => TurnResult;
export type TakeActionCommandLoader = () => (save: string, rawCharacterAction: RawCharacterAction) => ActionResult;

export const makeYargsCliRunner = (
  startGameCommandLoader: StartGameCommandLoader,
  takeTurnCommandLoader: TakeTurnCommandLoader,
  takeActionCommandLoader: TakeActionCommandLoader,
  argv: string[],
): CliRunner => {
  const yargsCli = yargs(argv)
    .command(
      "start-game",
      "Start a new game.",
      (yargs) => {
        return yargs.options({
          save: {
            type: "string",
            required: true,
          },
        });
      },
      (args) => startGameCommandLoader()(args.save),
    )
    .command(
      "take-turn",
      "Take a turn in an existing game.",
      (yargs) => {
        return yargs.options({
          save: {
            type: "string",
            required: true,
          },
          turnJson: {
            type: "string",
            required: true,
          },
        });
      },
      (args) => {
        takeTurnCommandLoader()(args.save, args.turnJson);
      },
    )
    .command(
      "move",
      "Take a move action in an existing game.",
      (yargs) => {
        return yargs.options({
          save: {
            type: "string",
            required: true,
          },
          character: {
            type: "string",
            required: true,
          },
          to: {
            type: "string",
            required: true,
          },
        });
      },
      (args) => {
        takeActionCommandLoader()(args.save, {
          characterName: args.character,
          action: {
            type: "move",
            isFree: false,
            toLocationName: args.to,
          },
        });
      },
    )
    .command(
      "make-supplies",
      "Take a make supplies action in an existing game.",
      (yargs) => {
        return yargs.options({
          save: {
            type: "string",
            required: true,
          },
          character: {
            type: "string",
            required: true,
          },
        });
      },
      (args) => {
        takeActionCommandLoader()(args.save, {
          characterName: args.character,
          action: {
            type: "make_supplies",
            isFree: false,
          },
        });
      },
    )
    .command(
      "drop-supplies",
      "Take a drop supplies action in an existing game.",
      (yargs) => {
        return yargs.options({
          save: {
            type: "string",
            required: true,
          },
          character: {
            type: "string",
            required: true,
          },
          supplyCubes: {
            type: "number",
            required: true,
          },
        });
      },
      (args) => {
        takeActionCommandLoader()(args.save, {
          characterName: args.character,
          action: {
            type: "drop_supplies",
            isFree: false,
            supplyCubes: args.supplyCubes,
          },
        });
      },
    )
    .demandCommand();

  return {
    async run() {
      await yargsCli.parseAsync();
    },
  };
};
