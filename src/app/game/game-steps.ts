import {
  cardDisplayName,
  type Game,
  type GameFlow,
  type GameFlowOver,
  type GameFlowWon,
  type GameLog,
  getNextTurnOrder,
  inGameFlow,
  type Player,
} from "./game.ts";
import { type Action, takeAction } from "./actions.ts";
import { drawInfectionCard } from "./infect-cities.ts";
import { epidemic } from "./epidemic.ts";

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
  | { type: "check_for_exposure"; player: Player }
  | {
      type: "player_action";
      player: Player;
      action: Action;
    }
  | { type: "draw_player_card"; player: Player }
  | { type: "draw_infection_card"; player: Player }
  | { type: "play_event_card"; player: Player; TODO_defineComplexChoices: unknown }
  | { type: "discard_player_cards"; player: Player; cardNames: string[] };

export type StepResult =
  | { type: "no_effect"; cause: string }
  | {
      type: "state_changed";
      nextGameFlow?: GameFlow;
    }
  | { type: "game_end"; nextGameFlow: GameFlowWon | GameFlowOver };

export type GameDriver = {
  takeStep: (step: Step) => StepResult;
  getNextSteps: () => string[];
  getGame: () => Game;
};

export const makeGameDriver = (game: Game, gameLog: GameLog): GameDriver => {
  return {
    takeStep: (step) => {
      const startingPlayerName = step.player.name;

      const result = takeGameStep(game, step, gameLog);

      if (result.type !== "no_effect" && result.nextGameFlow) {
        game.gameFlow = result.nextGameFlow;

        if (inGameFlow(game, "player_turn:take_4_actions") && startingPlayerName !== game.gameFlow.player.name) {
          gameLog(`Turn passed to ${game.gameFlow.player.name}`);
        }

        gameLog(`Game flow moved to: "${game.gameFlow.type}"`);
      }

      return result;
    },
    getNextSteps: () => [],
    getGame: () => game,
  };
};

export const takeGameStep = (game: Game, step: Step, gameLog: GameLog): StepResult => {
  let result: StepResult | undefined = undefined;

  if (!inGameFlow(game, "player_turn:")) {
    // TODO handle without using exceptions
    throw new Error("game is already over");
  }
  const player = game.gameFlow.player;

  // Is it this player's turn
  if (player.name !== step.player.name) {
    return {
      type: "no_effect",
      cause: `Wrong player, expected "${player.name}" received "${step.player.name}"`,
    };
  }

  if (inGameFlow(game, "player_turn:exposure_check") && step.type === "check_for_exposure") {
    gameLog(`${step.player.name} checked for exposure`);
    result = {
      type: "state_changed",
      nextGameFlow: {
        type: "player_turn:take_4_actions",
        player: player,
        remainingActions: 4,
      },
    };
  }

  if (inGameFlow(game, "player_turn:take_4_actions") && step.type === "player_action") {
    result = takeAction(game, step.action, gameLog);
    if (result.type === "state_changed" && !step.action.isFree) {
      if (game.gameFlow.remainingActions <= 1) {
        gameLog(`All actions taken`);
        result.nextGameFlow = {
          type: "player_turn:draw_2_cards",
          player,
          remainingCards: 2,
        };
      } else {
        game.gameFlow.remainingActions--;
        gameLog(`${step.player.name} has ${game.gameFlow.remainingActions} action(s) remaining`);
      }
    }
  }

  if (inGameFlow(game, "player_turn:draw_2_cards") && step.type === "draw_player_card") {
    const playerCard = game.playerDeck.drawPile.pop();

    // Players ran out of time.
    if (playerCard === undefined) {
      gameLog("Unable to draw card, player deck is empty.");
      return {
        type: "game_end",
        nextGameFlow: {
          type: "game_over",
          cause: "Player deck empty.",
        },
      };
    }
    gameLog(`${step.player.name} received ${cardDisplayName(playerCard)} card`);

    if (playerCard.type === "epidemic") {
      epidemic(game, gameLog);
    } else {
      step.player.cards.push(playerCard);
    }

    result = {
      type: "state_changed",
    };

    if (game.gameFlow.remainingCards <= 1) {
      result.nextGameFlow = {
        type: "player_turn:infect_cities",
        player,
        remainingCards: game.infectionRate.cards,
      };
    } else {
      game.gameFlow.remainingCards--;
      gameLog(`${player.name} has ${game.gameFlow.remainingCards} player card(s) remaining`);
    }
  }

  if (inGameFlow(game, "player_turn:infect_cities") && step.type === "draw_infection_card") {
    const infectionResult = drawInfectionCard(game, gameLog);
    if (infectionResult.maybeEnd.type === "game_over") {
      return {
        type: "game_end",
        nextGameFlow: {
          type: "game_over",
          cause: infectionResult.maybeEnd.cause,
        },
      };
    }

    result = {
      type: "state_changed",
    };

    if (game.gameFlow.remainingCards <= 1) {
      const nextTurnOrder = getNextTurnOrder(game.gameFlow.player.turnOrder);
      const nextPlayer = Array.from(game.players.values()).find((player) => player.turnOrder === nextTurnOrder);
      if (nextPlayer === undefined) {
        throw new Error("Unable to find the next player in turn order");
      }

      result.nextGameFlow = {
        type: "player_turn:exposure_check",
        player: nextPlayer,
      };
    } else {
      game.gameFlow.remainingCards--;
      gameLog(`${player.name} has ${game.gameFlow.remainingCards} infection card(s) remaining`);
    }
  }

  if (result === undefined) {
    result = {
      type: "no_effect",
      cause: `Step "${step.type}" not expected during game flow "${game.gameFlow.type}".`,
    };
  }

  if (result.type === "state_changed") {
    game.stepHistory.push(step);
  }

  return result;
};
