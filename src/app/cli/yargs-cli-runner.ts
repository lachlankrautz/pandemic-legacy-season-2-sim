import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { SerializableStep } from "../serialization/step-serialization.ts";
import type { Logger } from "../logging/logger.ts";
import type { ShowInfo } from "../game/show-info-use-case.ts";
import type { TuiRunner } from "../ink-tui/root.ts";

export type CliRunner = {
  run(args: string[]): Promise<void>;
};

// "Lazy" functions delay loading their dependencies until called.
// Allows the cli to offer all possible operations without the
// program needing to load every dependency.

export type LazyPlayTuiCommand = () => TuiRunner;

export type LazyStartGameCommand = () => (save: string) => void;

export type LazyTakeStepCommand = () => (save: string, step: SerializableStep) => void;

export type LazyTakeSerializedStepCommand = () => (save: string, stepJson: string) => void;

export type LazyShowInfoCommand = () => (save: string, showInfo: ShowInfo) => string;

export const makeYargsCliRunner = (
  logger: Logger,
  playTui: LazyPlayTuiCommand,
  startGame: LazyStartGameCommand,
  takeStep: LazyTakeStepCommand,
  stepCommandLoader: LazyTakeSerializedStepCommand,
  showInfoCommandLoader: LazyShowInfoCommand,
): CliRunner => {
  const checkDebug = (args: { debug: boolean | undefined }) => {
    if (args.debug) {
      logger.setLevel("debug");
    }
  };

  const yargsCli = yargs()
    .options({
      debug: {
        type: "boolean",
        description: "Set log level to debug",
      },
    })
    .middleware((args) => {
      checkDebug(args);
    }, true)
    .command(
      "play",
      "Boot up the game TUI",
      (yargs) => yargs,
      () => playTui().run(),
    )
    .command(
      "start-game",
      "Start a new game",
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
      "show",
      "Show info on players",
      (yargs) => {
        return yargs.options({
          filter: {
            type: "string",
            description: "show only players or locations",
            default: "all",
          },
          save: {
            type: "string",
            required: true,
          },
        });
      },
      (args) => {
        const filter = args.filter;
        if (filter !== "all" && filter !== "players" && filter !== "locations") {
          throw new Error(`Invalid filter: ${filter}`);
        }

        process.stdout.write(showInfoCommandLoader()(args.save, filter));
      },
    )
    .command(
      "take-step",
      "Take a turn in an existing game",
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
      (args) => stepCommandLoader()(args.save, args.step),
    )
    .command(
      "move",
      "Take a move action in an existing game",
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
      "Take a make supplies action in an existing game",
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
      "Take a drop supplies action in an existing game",
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
    .command(
      "make-supply-centre",
      "Make a supply centre at current location",
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
          // TODO specify which cards to use
        });
      },
      (args) =>
        takeStep()(args.save, {
          type: "player_action",
          playerName: args.player,
          action: {
            type: "make_supply_centre",
            isFree: false,
            // TODO this will fail
            cardSelection: [],
          },
        }),
    )
    .command(
      "exposure",
      "Check for exposure",
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
          type: "check_for_exposure",
          playerName: args.player,
        }),
    )
    .command(
      "draw",
      "Draw a player card",
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
          type: "draw_player_card",
          playerName: args.player,
        }),
    )
    .command(
      "infect",
      "Draw an infection card",
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
          type: "draw_infection_card",
          playerName: args.player,
        }),
    )
    .demandCommand();

  return {
    async run(args: string[]): Promise<void> {
      try {
        await yargsCli.parseAsync(hideBin(args));
      } catch (error: unknown) {
        if (logger.isDebugEnabled()) {
          throw error;
        }

        logger.error(error);
        process.exit(1);
      }
    },
  };
};
