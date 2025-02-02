import {
  type Player,
  type Game,
  type GetLocation,
  getGameLocation,
  type TakeActionsPhase,
  type GameFlowTurn,
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

export const takeAction = (
  turn: Readonly<GameFlowTurn<TakeActionsPhase>>,
  game: Game,
  playerName: string,
  action: Action,
): StepResult => {
  if (turn.playerName !== playerName) {
    return {
      type: "no_effect",
      cause: `Wrong player, expected "${turn.playerName}" received "${playerName}"`,
    };
  }

  if (!action.isFree) {
    if (turn.phase.remainingActions < 1) {
      return {
        type: "no_effect",
        cause: "No actions remaining",
      };
    }
  }

  const player = game.players.get(playerName);
  if (player === undefined) {
    // Should be fairly impossible to reach here; the player turn check
    // above logically ensures that the player must also exist.
    // This check is to catch any logical code regression.
    return {
      type: "no_effect",
      cause: `Player "${playerName}" not found`,
    };
  }

  switch (action.type) {
    case "move":
      return move(player, action, getGameLocation(game));
    case "drop_supplies":
      return dropSupplies(player, action);
    case "make_supplies":
      return makeSupplies(player);
  }
};

export const makeSupplies = (player: Player): StepResult => {
  player.supplyCubes++;
  return {
    type: "state_changed",
    gameLog: [
      `${player.name} made supplies, they now have ${player.supplyCubes}`,
      `${player.name} has ${player.supplyCubes} on their card`,
    ],
  };
};

export const dropSupplies = (player: Player, drop: DropSupplies): StepResult => {
  if (player.supplyCubes < drop.supplyCubes) {
    return {
      type: "no_effect",
      cause: `${player.name} only has ${player.supplyCubes} cubes and cannot drop ${drop.supplyCubes}`,
    };
  }

  player.location.supplyCubes += drop.supplyCubes;
  player.supplyCubes -= drop.supplyCubes;

  return {
    type: "state_changed",
    gameLog: [
      `${player.name} dropped ${drop.supplyCubes} cubes at ${player.location.name}`,
      `${player.name} has ${player.supplyCubes} remaining on their card`,
    ],
  };
};

export const move = <T extends boolean>(player: Player, move: Move<T>, getLocation: GetLocation): StepResult => {
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

  return {
    type: "state_changed",
    gameLog: [`${player.name} moved from ${fromLocationName} to ${player.location.name}`],
  };
};
