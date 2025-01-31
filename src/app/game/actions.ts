import type { Character, Location } from "./game.ts";

// actions/free action is wrong
// some actions are always free actions, some can be free
export type Action = { isFree: boolean } & (Move | MakeSupplies | DropSupplies);

export type Move = {
  type: "move";
  to: Location;
};

export type MakeSupplies = {
  type: "make_supplies";
};

export type DropSupplies = {
  type: "drop_supplies";
  supplyCubes: number;
};

export type Turn = {
  character: Character;
  actions: Action[];
};

// Question: Should the game be immutable? might be really costly
// to remake the entire state 1000 times, but it would mean that
// on any exception the original unmodified world could be returned.

export const takeTurn = (turn: Turn): void => {
  turn.actions.forEach((action) => takeAction(turn.character, action));
};

export const takeAction = (character: Character, action: Action): void => {
  if (!action.isFree) {
    if (character.remainingActions === 0) {
      throw new Error("insufficient remaining action points to perform action", {
        cause: {
          character,
          action,
        },
      });
    }

    character.remainingActions -= 1;
  }

  switch (action.type) {
    case "move":
      move(character, action);
      break;
    case "drop_supplies":
      dropSupplies(character, action);
      break;
    case "make_supplies":
      makeSupplies(character);
      break;
  }
};

export const makeSupplies = (character: Character): void => {
  character.supplyCubes++;
};

export const dropSupplies = (character: Character, drop: DropSupplies): void => {
  if (character.supplyCubes < drop.supplyCubes) {
    throw new Error("insufficient drop supplies to perform action", {
      cause: {
        character,
        drop,
      },
    });
  }

  character.location.supplyCubes += drop.supplyCubes;
  character.supplyCubes -= drop.supplyCubes;
};

export const move = (character: Character, move: Move): void => {
  const canMove = character.location.connections.some((connection) => connection.location.name === move.to.name);
  if (!canMove) {
    throw new Error(`cannot move from "${character.location.name}" to "${move.to.name}"`);
  }

  character.location.characters = character.location.characters.filter(
    (characterAtLocation) => characterAtLocation.name !== character.name,
  );
  character.location = move.to;
  character.location.characters.push(character);
};
