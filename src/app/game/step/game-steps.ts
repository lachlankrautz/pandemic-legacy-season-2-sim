import { type Game } from "../game.ts";
import { type Action } from "../action/actions.ts";
import type { Player } from "../player/player.ts";
import { type GameTurnFlow } from "../game-flow/game-turn-flow.ts";
import type { GameLog } from "../game-log/game-log.ts";
import { chainHandlers, stepHandlers } from "./step-handlers.ts";
import { checkObjectives } from "../objectives/check-objectives.ts";

/**
 * A step is an atomic level of interaction with the game. A step could be
 * an action taken by a player, drawing a single player card or
 * triggering automated game logic like infecting cities.
 *
 * The game driver acts as a state machine that takes steps as input, every
 * choice made by the players in a game is represented as a step.
 *
 * Because the game includes play "at any time" events cards it can never
 * assume that a turn is over and run automated logic. Instead, the game
 * effectively always pauses after each step allowing players to always
 * chose when that logic resolves.
 *
 * The game can be queried to show what steps it expects next. It does
 * not react to steps it does not expect to receive. e.g. an action taken
 * by not the current player simply does nothing.
 */

export type Step =
  | CheckExposureStep
  | PlayerActionStep
  | DrawPlayerCardStep
  | DrawInfectionCardStep
  | PlayEventCardStep
  | DiscardPlayerCardStep
  | ResolveEpidemicStep;

export type CheckExposureStep = { type: "check_for_exposure"; player: Player };

export type PlayerActionStep = {
  type: "player_action";
  player: Player;
  action: Action;
};

export type DrawPlayerCardStep = { type: "draw_player_card"; player: Player };

export type DrawInfectionCardStep = { type: "draw_infection_card"; player: Player };

export type PlayEventCardStep = { type: "play_event_card"; player: Player; TODO_defineComplexChoices: unknown };

export type DiscardPlayerCardStep = { type: "discard_player_card"; player: Player; cardIndex: number };

export type ResolveEpidemicStep = { type: "resolve_epidemic"; player: Player };

export type StepResult = { type: "no_effect"; cause: string } | ChangedStepResult;

export type ChangedStepResult = {
  type: "state_changed";
  builtSupplyCentre?: boolean;
  connectedCity?: boolean;
  nextGameFlow?: GameTurnFlow;
};

export type StepType = Step["type"];

export const stepTypes = [
  "check_for_exposure",
  "player_action",
  "draw_player_card",
  "draw_infection_card",
  "play_event_card",
  "discard_player_card",
  "resolve_epidemic",
] as const satisfies StepType[];

export type StepOnType<TStepType extends StepType> = Extract<Step, { type: TStepType }>;

export const isStepOnType = <TStepType extends StepType>(
  step: Step,
  type: TStepType,
): step is StepOnType<TStepType> => {
  return step.type === type;
};

export type GameDriver = {
  takeStep: (step: Step) => StepResult;
  getNextSteps: () => string[];
  getGame: () => Game;
};

export const makeGameDriver = (game: Game, gameLog: GameLog): GameDriver => {
  return {
    takeStep: (step) => {
      const result = takeGameStep(game, step, gameLog);

      // TODO this and other after step logic doesn't seem to be in the right place
      if (result.type !== "no_effect" && result.nextGameFlow) {
        if (game.turnFlow.type !== result.nextGameFlow.type) {
          gameLog(`Game flow moved to: "${game.turnFlow.type}"`);
        }
        game.turnFlow = result.nextGameFlow;
      }

      return result;
    },
    getNextSteps: () => [],
    getGame: () => game,
  };
};

export const takeGameStep = (game: Game, step: Step, gameLog: GameLog): StepResult => {
  // TODO move to a handler
  if (game.state.type !== "playing") {
    // TODO handle without using exceptions
    throw new Error("game is already over");
  }
  const player = game.turnFlow.player;

  // TODO move to a handler
  // Is it this player's turn
  if (player.name !== step.player.name) {
    return {
      type: "no_effect",
      cause: `Wrong player, expected "${player.name}" received "${step.player.name}"`,
    };
  }

  const handler = chainHandlers(stepHandlers);

  const result: StepResult = handler({ game, gameLog, step });

  // TODO missing abstraction for step result handling?
  if (result.type === "state_changed") {
    game.stepHistory.push(step);
    if (result.nextGameFlow) {
      game.turnFlow = result.nextGameFlow;
    }
  }

  checkObjectives(game, gameLog, result);

  return result;
};
