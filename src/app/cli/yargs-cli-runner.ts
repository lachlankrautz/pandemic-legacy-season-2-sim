import yargs from "yargs";
import type { SerializableStep } from "../serialization/step-serialization.ts";

export type CliRunner = {
  run(): Promise<void>;
};

// "Lazy" functions delay loading their dependencies until called.
// Allows the cli to offer all possible operations without the
// program needing to load every dependency.

export type LazyPlayTuiCommand = () => () => void;

export type LazyStartGameCommand = () => (save: string) => void;

export type LazyTakeStepCommand = () => (save: string, step: SerializableStep) => void;

export type LazyTakeSerializedStepCommand = () => (save: string, stepJson: string) => void;

export const makeYargsCliRunner = (
  playTui: LazyPlayTuiCommand,
  startGame: LazyStartGameCommand,
  takeStep: LazyTakeStepCommand,
  tepCommandLoader: LazyTakeSerializedStepCommand,
  argv: string[],
): CliRunner => {
  const yargsCli = yargs(argv)
    .command(
      "play",
      "Boot up the game TUI",
      (yargs) => yargs,
      () => playTui()(),
    )
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
      (args) => startGame()(args.save),
    )
    .command(
      "take-step",
      "Take a turn in an existing game.",
      (yargs) => {
        return yargs.options({
          save: {
            type: "string",
            required: true,
          },
          step: {
            type: "string",
            description: "JSON step",
            required: true,
          },
        });
      },
      (args) => tepCommandLoader()(args.save, args.step),
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
          player: {
            type: "string",
            required: true,
          },
          to: {
            type: "string",
            required: true,
          },
        });
      },
      (args) =>
        takeStep()(args.save, {
          type: "player_action",
          playerName: args.player,
          action: {
            type: "move",
            isFree: false,
            toLocationName: args.to,
          },
        }),
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
          player: {
            type: "string",
            required: true,
          },
        });
      },
      (args) =>
        takeStep()(args.save, {
          type: "player_action",
          playerName: args.player,
          action: {
            type: "make_supplies",
            isFree: false,
          },
        }),
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
          player: {
            type: "string",
            required: true,
          },
          supplyCubes: {
            type: "number",
            required: true,
          },
        });
      },
      (args) =>
        takeStep()(args.save, {
          type: "player_action",
          playerName: args.player,
          action: {
            type: "drop_supplies",
            isFree: false,
            supplyCubes: args.supplyCubes,
          },
        }),
    )
    .demandCommand();

  return {
    async run() {
      await yargsCli.parseAsync();
    },
  };
};
