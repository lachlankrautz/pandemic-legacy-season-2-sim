import { type Game, getNextTurnOrder } from "../game.ts";
import { type Action, takeAction } from "../action/actions.ts";
import { drawInfectionCard } from "../infection/infect-cities.ts";
import { epidemic } from "../infection/epidemic.ts";
import type { Player } from "../player/player.ts";
import { type GameTurnFlow, inGameFlow } from "../game-flow/game-turn-flow.ts";
import { cardDisplayName } from "../location/location.ts";
import type { GameLog } from "../game-log/game-log.ts";

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
      nextGameFlow?: GameTurnFlow;
    };

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
        game.turnFlow = result.nextGameFlow;

        if (inGameFlow(game, "take_4_actions") && startingPlayerName !== game.turnFlow.player.name) {
          gameLog(`Turn passed to ${game.turnFlow.player.name}`);
        }

        gameLog(`Game flow moved to: "${game.turnFlow.type}"`);
      }

      return result;
    },
    getNextSteps: () => [],
    getGame: () => game,
  };
};

export const takeGameStep = (game: Game, step: Step, gameLog: GameLog): StepResult => {
  let result: StepResult | undefined = undefined;

  if (!inGameFlow(game, "")) {
    // TODO handle without using exceptions
    throw new Error("game is already over");
  }
  const player = game.turnFlow.player;

  // Is it this player's turn
  if (player.name !== step.player.name) {
    return {
      type: "no_effect",
      cause: `Wrong player, expected "${player.name}" received "${step.player.name}"`,
    };
  }

  if (inGameFlow(game, "exposure_check") && step.type === "check_for_exposure") {
    gameLog(`${step.player.name} checked for exposure`);
    result = {
      type: "state_changed",
      nextGameFlow: {
        type: "take_4_actions",
        player: player,
        remainingActions: 4,
      },
    };
  }

  if (inGameFlow(game, "take_4_actions") && step.type === "player_action") {
    result = takeAction(game, step.action, gameLog);
    if (result.type === "state_changed" && !step.action.isFree) {
      if (game.turnFlow.remainingActions <= 1) {
        gameLog(`All actions taken`);
        result.nextGameFlow = {
          type: "draw_2_cards",
          player,
          remainingCards: 2,
        };
      } else {
        game.turnFlow.remainingActions--;
        gameLog(`${step.player.name} has ${game.turnFlow.remainingActions} action(s) remaining`);
      }
    }
  }

  if (inGameFlow(game, "draw_2_cards") && step.type === "draw_player_card") {
    const playerCard = game.playerDeck.drawPile.pop();

    // Players ran out of time.
    if (playerCard === undefined) {
      gameLog("Game Over: Unable to draw card, player deck is empty.");
      game.state = {
        type: "lost",
        cause: "Unable to draw card, player deck is empty.",
      };
      return { type: "state_changed" };
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

    if (game.turnFlow.remainingCards <= 1) {
      result.nextGameFlow = {
        type: "infect_cities",
        player,
        remainingCards: game.infectionRate.cards,
      };
    } else {
      game.turnFlow.remainingCards--;
      gameLog(`${player.name} has ${game.turnFlow.remainingCards} player card(s) remaining`);
    }
  }

  if (inGameFlow(game, "infect_cities") && step.type === "draw_infection_card") {
    const infectionResult = drawInfectionCard(game, gameLog);
    if (infectionResult.maybeEnd.type === "game_over") {
      gameLog(`Game Over: ${infectionResult.maybeEnd.cause}`);
      game.state = {
        type: "lost",
        cause: infectionResult.maybeEnd.cause,
      };
      return { type: "state_changed" };
    }

    result = {
      type: "state_changed",
    };

    if (game.turnFlow.remainingCards <= 1) {
      const nextTurnOrder = getNextTurnOrder(game.turnFlow.player.turnOrder);
      const nextPlayer = Array.from(game.players.values()).find((player) => player.turnOrder === nextTurnOrder);
      if (nextPlayer === undefined) {
        throw new Error("Unable to find the next player in turn order");
      }

      result.nextGameFlow = {
        type: "exposure_check",
        player: nextPlayer,
      };
    } else {
      game.turnFlow.remainingCards--;
      gameLog(`${player.name} has ${game.turnFlow.remainingCards} infection card(s) remaining`);
    }
  }

  if (result === undefined) {
    result = {
      type: "no_effect",
      cause: `Step "${step.type}" not expected during game flow "${game.turnFlow.type}".`,
    };
  }

  if (result.type === "state_changed") {
    game.stepHistory.push(step);
  }

  return result;
};
