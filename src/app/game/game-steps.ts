import { type Game, getGamePlayer, getNextTurnOrder } from "./game.ts";
import { type Action, takeAction } from "./actions.ts";

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
  | { type: "check_for_exposure"; playerName: string }
  | {
      type: "player_action";
      playerName: string;
      action: Action;
    }
  | { type: "draw_player_card"; playerName: string }
  | { type: "draw_infection_card" }
  | { type: "play_event_card"; playerName: string; TODO_defineComplexChoices: unknown }
  | { type: "discard_player_cards"; playerName: string; cardNames: string[] };

export type StepResult =
  | { type: "no_effect"; cause: string }
  | {
      type: "state_changed";
      gameLog: string[];
    };

export type GameDriver = {
  takeStep: (step: Step) => StepResult;
  getNextSteps: () => string[];
  getGame: () => Game;
};

export const makeGameDriver = (game: Game): GameDriver => {
  return {
    takeStep: (step) => takeGameStep(game, step),
    getNextSteps: () => [],
    getGame: () => game,
  };
};

// TODO Move phase check logic up from takeAction to here
//      make the current phase something the type system knows once
//      checked so that functions like "takeAction" can only accept
//      a game state in that phase.
export const takeGameStep = (game: Game, step: Step): StepResult => {
  let result: StepResult | undefined = undefined;

  const gameFlow = game.gameFlow;

  if (gameFlow.type !== "player_turn") {
    // TODO handle without using exceptions
    throw new Error("game is already over");
  }

  const phase = gameFlow.phase;

  if (phase.type === "exposure_check" && step.type === "check_for_exposure") {
    result = {
      type: "state_changed",
      gameLog: [`${step.playerName} checked for exposure`],
    };
    gameFlow.phase = {
      type: "take_4_actions",
      remainingActions: 4,
    };
  }

  if (phase.type === "take_4_actions") {
    if (step.type === "player_action") {
      // TODO Come back an waste loads of time trying to figure out how to
      //      narrow the type with a nested discriminated union without having
      //      to create a new object.
      result = takeAction({ ...gameFlow, phase }, game, step.playerName, step.action);
      if (result.type === "state_changed" && !step.action.isFree) {
        if (phase.remainingActions <= 1) {
          gameFlow.phase = {
            type: "draw_2_cards",
            remainingCards: 2,
          };
        } else {
          phase.remainingActions--;
        }
      }
    }
  }

  if (gameFlow.phase.type === "draw_2_cards" && step.type === "draw_player_card") {
    if (gameFlow.phase.remainingCards <= 1) {
      gameFlow.phase = {
        type: "infect_cities",
        remainingCards: game.infectionRate.cards,
      };
    } else {
      gameFlow.phase.remainingCards--;
    }
    result = {
      type: "state_changed",
      gameLog: [`${step.playerName} drew a player card`],
    };
  }

  if (gameFlow.phase.type === "infect_cities" && step.type === "draw_infection_card") {
    if (gameFlow.phase.remainingCards <= 1) {
      // TODO make the "next" player part of the state that can't be stuffed up
      const turnOrder = getGamePlayer(game)(gameFlow.playerName)?.turnOrder;
      if (turnOrder === undefined) {
        throw new Error("unable to determine turn order of current player");
      }
      const nextTurnOrder = getNextTurnOrder(turnOrder);
      const nextPlayer = Array.from(game.players.values()).find((player) => player.turnOrder === nextTurnOrder);
      if (nextPlayer === undefined) {
        throw new Error("Unable to find the next player in turn order");
      }

      game.gameFlow = {
        type: "player_turn",
        playerName: nextPlayer.name,
        phase: {
          type: "exposure_check",
        },
      };
    } else {
      gameFlow.phase.remainingCards--;
    }

    result = {
      type: "state_changed",
      gameLog: [`Drew an infection card`],
    };
  }

  if (result === undefined) {
    // TODO need to handle the wrong step at the wrong timing window
    //      without a harsh error.
    throw new Error("Probably a timing error", { cause: step });
  }

  if (result.type === "state_changed") {
    game.stepHistory.push(step);
    game.gameLog.push(...result.gameLog);
  }

  return result;
};
