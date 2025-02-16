import { type Game } from "../game.ts";
import type { StepResult } from "../step/game-steps.ts";
import { type PlayerCardSelection, useHandCards } from "../cards/cards.ts";
import type { Player } from "../player/player.ts";
import { inGameFlow } from "../game-flow/game-turn-flow.ts";
import { getMappedLocation, type GetRequiredLocation } from "../location/location.ts";
import type { GameLog } from "../game-log/game-log.ts";

// actions/free action is wrong
// some actions are always free actions, some can be free
export type Action = Move<true> | Move<false> | MakeSupplies | DropSupplies | MakeSupplyCentre;

export const actionTypes = [
  "move",
  "make_supplies",
  "drop_supplies",
  "make_supply_centre",
] as const satisfies Action["type"][];

export type Move<T extends boolean = boolean> = {
  type: "move";
  isFree: T;
  toLocationName: string;
};

export type MakeSupplies = {
  type: "make_supplies";
  isFree: false;
};

export type DropSupplies = {
  type: "drop_supplies";
  isFree: false;
  supplyCubes: number;
};

export type MakeSupplyCentre = {
  type: "make_supply_centre";
  isFree: false;
  cardSelection: PlayerCardSelection;
};

// Question: Should the game be immutable? might be really costly
// to remake the entire state 1000 times, but it would mean that
// on any exception the original unmodified world could be returned.

// Question: Game flow control should not be manual
//           this should return as part of the step result
//           the change it wants to make to flow control.
//           Then things like losing the game can override the pending change

export const takeAction = (game: Game, action: Action, gameLog: GameLog): StepResult => {
  if (!inGameFlow(game, "take_4_actions")) {
    return { type: "no_effect", cause: "wrong turn flow" };
  }

  if (!action.isFree) {
    if (game.turnFlow.remainingActions < 1) {
      return {
        type: "no_effect",
        cause: "No actions remaining",
      };
    }
  }

  const player = game.turnFlow.player;

  switch (action.type) {
    case "move":
      return move(player, action, getMappedLocation(game.locations), gameLog);
    case "drop_supplies":
      return dropSupplies(player, action, gameLog);
    case "make_supplies":
      return makeSupplies(player, gameLog);
    case "make_supply_centre":
      return makeSupplyCentre(game, action.cardSelection);
  }
};

export const makeSupplies = (player: Player, gameLog: GameLog): StepResult => {
  player.supplyCubes++;
  gameLog(`${player.name} made supplies, they now have ${player.supplyCubes}`);
  gameLog(`${player.name} has ${player.supplyCubes} on their card`);
  return {
    type: "state_changed",
  };
};

export const makeSupplyCentre = (game: Game, cardSelection: PlayerCardSelection): StepResult => {
  const player = game.turnFlow.player;

  if (player.location.supplyCentre) {
    return {
      type: "no_effect",
      cause: `${player.location.name} already has a supply centre.`,
    };
  }

  if (player.location.colour === "none") {
    return {
      type: "no_effect",
      cause: `${player.location.name} is not a valid location for a supply centre`,
    };
  }

  const { selected, discardUsed } = useHandCards(game, cardSelection);

  const validCards = selected
    .filter((card) => card.type === "city")
    .filter((card) => card.location.colour === player.location.colour);

  if (validCards.length < 5) {
    return {
      type: "no_effect",
      cause: `Not enough cards (${validCards.length}) of matching colour (${player.location.colour}) to make a supply centre.`,
    };
  }

  const hasCurrentLocation = validCards.some((card) => card.location.name === player.location.name);
  if (!hasCurrentLocation) {
    return {
      type: "no_effect",
      cause: `One of the select cards must match the current location ${player.location.name}`,
    };
  }

  // Create a supply centre
  player.location.supplyCentre = true;
  game.gameLog.push(`${player.name} created a supply center at ${player.location.name}`);
  discardUsed();

  return {
    type: "state_changed",
  };
};

export const dropSupplies = (player: Player, drop: DropSupplies, gameLog: GameLog): StepResult => {
  if (player.supplyCubes < drop.supplyCubes) {
    return {
      type: "no_effect",
      cause: `${player.name} only has ${player.supplyCubes} cubes and cannot drop ${drop.supplyCubes}`,
    };
  }

  player.location.supplyCubes += drop.supplyCubes;
  player.supplyCubes -= drop.supplyCubes;

  gameLog(`${player.name} dropped ${drop.supplyCubes} cubes at ${player.location.name}`);
  gameLog(`${player.name} has ${player.supplyCubes} remaining on their card`);
  return {
    type: "state_changed",
  };
};

export const move = <T extends boolean>(
  player: Player,
  move: Move<T>,
  getLocation: GetRequiredLocation,
  gameLog: GameLog,
): StepResult => {
  const possibleDestinationNames = player.location.connections.map((connection) => connection.location.name).join(", ");
  const location = getLocation(move.toLocationName);
  if (location === undefined) {
    return {
      type: "no_effect",
      cause: `Invalid move target "${move.toLocationName}, possible destinations: (${possibleDestinationNames})"`,
    };
  }

  const fromLocationName = player.location.name;

  const canMove = player.location.connections.some((connection) => connection.location.name === move.toLocationName);
  if (!canMove) {
    return {
      type: "no_effect",
      cause: `Invalid move target "${move.toLocationName}, possible destinations: (${possibleDestinationNames})"`,
    };
  }

  player.location.players = player.location.players.filter((playerAtLocation) => playerAtLocation.name !== player.name);
  player.location = location;
  player.location.players.push(player);

  gameLog(`${player.name} moved from ${fromLocationName} to ${player.location.name}`);
  return {
    type: "state_changed",
  };
};
