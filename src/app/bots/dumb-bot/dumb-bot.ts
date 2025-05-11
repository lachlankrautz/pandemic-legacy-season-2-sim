import { type Game } from "../../game/game.ts";
import type { GameDriver, Step } from "../../game/step/game-steps.ts";
import type { Logger } from "../../logging/logger.ts";
import { HAND_LIMIT } from "../../game/step/required-steps/required-steps.ts";
import type { Player } from "../../game/player/player.ts";
import { type GameOnType, isGameOnType } from "../../game/game-flow/game-turn-flow.ts";
import type { Action } from "../../game/action/actions.ts";
import type { PlayerCard } from "../../game/cards/cards.ts";
import { getSafeLocations } from "../../game/location/location.ts";

type CardTypeRank = {
  yellow: number;
  blue: number;
  black: number;
  none: number;
};

/**
 * Determine the order of cards to keep when discarding a card.
 */
export const compareCards = (cards: PlayerCard[]) => {
  const cardTypeRank = cards.reduce(
    (cardTypeRank: CardTypeRank, card) => {
      if (card.type === "city") {
        cardTypeRank[card.location.colour]++;
      }
      return cardTypeRank;
    },
    {
      yellow: 0.1,
      black: 0.2,
      blue: 0.3,
      none: 0,
    },
  );

  return (a: PlayerCard, b: PlayerCard): number => {
    const aRank = a.type === "city" ? cardTypeRank[a.location.colour] : -1;
    const bRank = b.type === "city" ? cardTypeRank[b.location.colour] : -1;
    return bRank - aRank;
  };
};

export const playGame = (driver: GameDriver, logger: Logger): void => {
  const game = driver.getGame();

  while (game.state.type === "playing") {
    driver.takeStep(makeStep(game, game.turnFlow.player, logger));
  }

  logger.info("Bot run finished");
};

export const playGameTick = (driver: GameDriver, logger: Logger): void => {
  const game = driver.getGame();
  if (game.state.type === "playing") {
    const result = driver.takeStep(makeStep(game, game.turnFlow.player, logger));
    if (result.type === "no_effect") {
      throw new Error("bot took an action that had no effect");
    }
  }
};

export const makeStep = (game: Game, player: Player, logger: Logger): Step => {
  const requiredStep = makeRequiredStep(game, player);
  if (requiredStep !== undefined) {
    return requiredStep;
  }

  const adminStep = makeAdminStep(game, player);
  if (adminStep !== undefined) {
    return adminStep;
  }

  if (isGameOnType(game, "take_4_actions")) {
    return {
      type: "player_action",
      player,
      action: makeActionStep(game, player, logger),
    };
  }

  throw new Error("not implemented", { cause: { game } });
};

const makeActionStep = (game: GameOnType<"take_4_actions">, player: Player, logger: Logger): Action => {
  const safeLocations = getSafeLocations(game.infectionDeck);

  if (player.location.type === "haven") {
    const notHaven = player.location.connections
      .map((connection) => connection.location)
      .find((location) => location.type !== "haven");

    if (notHaven !== undefined) {
      return {
        type: "move",
        isFree: false,
        toLocationName: notHaven.name,
      };
    }
  }

  // On the first action move somewhere that needs supplies more
  if (game.turnFlow.remainingActions === 4) {
    if (player.location.supplyCubes > 2) {
      const moveCandidate = player.location.connections
        .filter((connection) => connection.location.type !== "haven" && !safeLocations.has(connection.location.name))
        .sort((a, b) => a.location.supplyCubes - b.location.supplyCubes)[0];

      if (moveCandidate !== undefined) {
        logger.info("moving to worse location", {
          fromLocationWithSupply: player.location.supplyCubes,
          toLocationWithSupply: moveCandidate.location.name,
        });
        return {
          type: "move",
          isFree: false,
          toLocationName: moveCandidate.location.name,
        };
      }
    }
  }

  if (game.turnFlow.remainingActions > 1) {
    return {
      type: "make_supplies",
      // TODO ok this seems silly, the action should know if it's free or not
      isFree: false,
    };
  }

  return {
    type: "drop_supplies",
    isFree: false,
    supplyCubes: player.supplyCubes,
  };
};

const makeRequiredStep = (_: Game, player: Player): Step | undefined => {
  if (player.cards.some((card) => card.type === "epidemic")) {
    return {
      type: "resolve_epidemic",
      player,
    };
  }

  if (player.cards.length > HAND_LIMIT) {
    player.cards.sort(compareCards(player.cards));
    return {
      type: "discard_player_card",
      player,
      cardIndex: player.cards.length - 1,
    };
  }

  return;
};

const makeAdminStep = (game: Game, player: Player): Step | undefined => {
  switch (game.turnFlow.type) {
    case "exposure_check":
      return {
        type: "check_for_exposure",
        player,
      };
    case "draw_2_cards":
      return {
        type: "draw_player_card",
        player,
      };
    case "infect_cities":
      return {
        type: "draw_infection_card",
        player,
      };
  }

  return;
};
