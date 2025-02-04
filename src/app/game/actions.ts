import {
  type Player,
  type Game,
  type GetLocation,
  getGameLocation,
  type GameFlowTurnTakeActions,
  type GameLog,
} from "./game.ts";
import type { StepResult } from "./game-steps.ts";

// actions/free action is wrong
// some actions are always free actions, some can be free
export type Action = Move<true> | Move<false> | MakeSupplies | DropSupplies;

export type Move<T extends boolean> = {
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

// Question: Should the game be immutable? might be really costly
// to remake the entire state 1000 times, but it would mean that
// on any exception the original unmodified world could be returned.

// Question: Game flow control should not be manual
//           this should return as part of the step result
//           the change it wants to make to flow control.
//           Then things like losing the game can override the pending change

export const takeAction = (
  gameFlow: Readonly<GameFlowTurnTakeActions>,
  game: Game,
  player: Player,
  action: Action,
  gameLog: GameLog,
): StepResult => {
  if (!action.isFree) {
    if (gameFlow.remainingActions < 1) {
      return {
        type: "no_effect",
        cause: "No actions remaining",
      };
    }
  }

  switch (action.type) {
    case "move":
      return move(player, action, getGameLocation(game), gameLog);
    case "drop_supplies":
      return dropSupplies(player, action, gameLog);
    case "make_supplies":
      return makeSupplies(player, gameLog);
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
  getLocation: GetLocation,
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
