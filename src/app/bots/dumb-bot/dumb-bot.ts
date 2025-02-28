import { type Game } from "../../game/game.ts";
import type { GameDriver, Step } from "../../game/step/game-steps.ts";
import type { Logger } from "../../logging/logger.ts";
import { HAND_LIMIT } from "../../game/step/required-steps/required-steps.ts";
import type { Player } from "../../game/player/player.ts";
import { type GameOnType, isGameOnType } from "../../game/game-flow/game-turn-flow.ts";
import type { Action } from "../../game/action/actions.ts";

export const playGame = (driver: GameDriver, logger: Logger): void => {
  const game = driver.getGame();

  while (game.state.type === "playing") {
    driver.takeStep(makeStep(game, game.turnFlow.player));
  }

  logger.info("Bot run finished");
};

export const playGameTick = (driver: GameDriver): void => {
  const game = driver.getGame();
  if (game.state.type === "playing") {
    driver.takeStep(makeStep(game, game.turnFlow.player));
  }
};

const makeStep = (game: Game, player: Player): Step => {
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
      action: makeActionStep(game, player),
    };
  }

  throw new Error("not implemented", { cause: { game } });
};

const makeActionStep = (game: GameOnType<"take_4_actions">, player: Player): Action => {
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
  if (player.cards.length > HAND_LIMIT) {
    return {
      type: "discard_player_card",
      player,
      cardIndex: 0,
    };
  }

  if (player.cards.some((card) => card.type === "epidemic")) {
    return {
      type: "resolve_epidemic",
      player,
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
