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
  | { type: "draw_infection_card"; playerName: string }
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

export const takeGameStep = (game: Game, step: Step): StepResult => {
  let result: StepResult | undefined = undefined;

  const gameFlow = game.gameFlow;

  if (!gameFlow.type.startsWith("player_turn:")) {
    // TODO handle without using exceptions
    throw new Error("game is already over");
  }

  if (gameFlow.type === "player_turn:exposure_check" && step.type === "check_for_exposure") {
    result = {
      type: "state_changed",
      gameLog: [`${step.playerName} checked for exposure`],
    };
    game.gameFlow = {
      type: "player_turn:take_4_actions",
      playerName: gameFlow.playerName,
      remainingActions: 4,
    };
    result.gameLog.push(`Game flow moved to: "${game.gameFlow.type}"`);
  }

  if (gameFlow.type === "player_turn:take_4_actions") {
    if (step.type === "player_action") {
      // TODO Come back and waste loads of time trying to figure out how to
      //      narrow the type with a nested discriminated union without having
      //      to create a new object.
      result = takeAction(gameFlow, game, step.playerName, step.action);
      if (result.type === "state_changed" && !step.action.isFree) {
        if (gameFlow.remainingActions <= 1) {
          game.gameFlow = {
            type: "player_turn:draw_2_cards",
            playerName: gameFlow.playerName,
            remainingCards: 2,
          };
          result.gameLog.push(`All actions taken`);
          result.gameLog.push(`Game flow moved to: "${game.gameFlow.type}"`);
        } else {
          gameFlow.remainingActions--;
          result.gameLog.push(`${gameFlow.remainingActions} action(s) remaining`);
        }
      }
    }
  }

  if (gameFlow.type === "player_turn:draw_2_cards" && step.type === "draw_player_card") {
    result = {
      type: "state_changed",
      gameLog: [`${step.playerName} drew a player card`],
    };
    if (gameFlow.remainingCards <= 1) {
      game.gameFlow = {
        type: "player_turn:infect_cities",
        playerName: gameFlow.playerName,
        remainingCards: game.infectionRate.cards,
      };
      result.gameLog.push(`Game flow moved to: "${game.gameFlow.type}"`);
    } else {
      gameFlow.remainingCards--;
      result.gameLog.push(`${gameFlow.remainingCards}  card(s) remaining`);
    }
  }

  if (gameFlow.type === "player_turn:infect_cities" && step.type === "draw_infection_card") {
    result = {
      type: "state_changed",
      gameLog: [`Drew an infection card`],
    };
    if (gameFlow.remainingCards <= 1) {
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
        type: "player_turn:exposure_check",
        playerName: nextPlayer.name,
      };
      result.gameLog.push(`Turn passed to: "${game.gameFlow.playerName}"`);
      result.gameLog.push(`Game flow moved to: "${game.gameFlow.type}"`);
    } else {
      gameFlow.remainingCards--;
      result.gameLog.push(`${gameFlow.remainingCards} infection card(s) remaining`);
    }
  }

  if (result === undefined) {
    result = {
      type: "no_effect",
      cause: `Step "${step.type}" not expected during game flow "${gameFlow.type}".`,
    };
  }

  if (result.type === "state_changed") {
    game.stepHistory.push(step);
    game.gameLog.push(...result.gameLog);
  }

  return result;
};
