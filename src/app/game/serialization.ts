import { Value } from "@sinclair/typebox/value";
import type { Character, Game, Location } from "./game.ts";
import { type Static, Type } from "@sinclair/typebox";
import type { Action, CharacterAction, Turn } from "./actions.ts";

/**
 * A representation of a game action using only primitives, replacing
 * circular references with string identifiers.
 * e.g. locationName.
 */
const rawActionSchema = Type.Intersect([
  Type.Object({
    isFree: Type.Boolean(),
  }),
  Type.Union([
    Type.Object({
      type: Type.Literal("move"),
      toLocationName: Type.String(),
    }),
    Type.Object({
      type: Type.Literal("make_supplies"),
    }),
    Type.Object({
      type: Type.Literal("drop_supplies"),
      supplyCubes: Type.Number(),
    }),
  ]),
]);

export type GetLocation = (name: string) => Location | undefined;

export type RawAction = Static<typeof rawActionSchema>;

const rawCharacterActionSchema = Type.Object({
  characterName: Type.String(),
  action: rawActionSchema,
});

export type RawCharacterAction = Static<typeof rawCharacterActionSchema>;

export const rawCharacterActionToCharacterAction = (
  rawCharacterAction: RawCharacterAction,
  getCharacter: GetCharacter,
  getLocation: GetLocation,
): CharacterAction => {
  const character = getCharacter(rawCharacterAction.characterName);
  if (character === undefined) {
    throw new Error("Failed to create character action - character not found", {
      cause: { characterName: rawCharacterAction.characterName },
    });
  }

  return {
    character,
    action: rawActionToAction(rawCharacterAction.action, getLocation),
  };
};

export const rawActionToAction = (rawAction: RawAction, getLocation: GetLocation): Action => {
  let location: Location | undefined;

  switch (rawAction.type) {
    case "move":
      location = getLocation(rawAction.toLocationName);
      if (location === undefined) {
        throw new Error("Failed to create action - location not found", { cause: { locationName: rawAction.type } });
      }
      return {
        type: rawAction.type,
        isFree: rawAction.isFree,
        to: location,
      };
    case "drop_supplies":
      return {
        type: rawAction.type,
        isFree: rawAction.isFree,
        supplyCubes: rawAction.supplyCubes,
      };
    case "make_supplies":
      return {
        type: rawAction.type,
        isFree: rawAction.isFree,
      };
    default:
      throw new Error("Unknown action type", { cause: { action: rawAction } });
  }
};

export const deserializeCharacterAction = (
  data: string,
  getCharacter: GetCharacter,
  getLocation: GetLocation,
): CharacterAction | never => {
  const { characterName, action } = Value.Parse(rawCharacterActionSchema, JSON.parse(data));

  const character = getCharacter(characterName);
  if (character === undefined) {
    throw new Error("Character action creation failed - character missing", {
      cause: { characterName },
    });
  }

  return {
    character,
    action: rawActionToAction(action, getLocation),
  };
};

/**
 * A representation of a game turn using only primitives, replacing
 * circular references with string identifiers.
 * e.g. locationName.
 */
const rawTurnSchema = Type.Object({
  characterName: Type.String(),
  actions: Type.Array(rawActionSchema),
});

export type RawTurn = Static<typeof rawTurnSchema>;

export type GetCharacter = (name: string) => Character | undefined;

export const rawTurnToTurn = (rawTurn: RawTurn, getCharacter: GetCharacter, getLocation: GetLocation): Turn => {
  const character = getCharacter(rawTurn.characterName);
  if (character === undefined) {
    throw new Error("Create turn failed - specified character not found");
  }

  return {
    character,
    actions: rawTurn.actions.map((action) => rawActionToAction(action, getLocation)),
  };
};

export const deserializeTurn = (data: string, getCharacter: GetCharacter, getLocation: GetLocation): Turn | never => {
  return rawTurnToTurn(Value.Parse(rawTurnSchema, JSON.parse(data)), getCharacter, getLocation);
};

/**
 * A representation of a game using only primitives, replacing
 * circular references with string identifiers.
 * e.g. locationName.
 */
const rawGameSchema = Type.Object({
  phase: Type.Union([
    Type.Object({
      type: Type.Literal("exposure_check"),
      characterName: Type.String(),
    }),
    Type.Object({
      type: Type.Literal("take_4_actions"),
      characterName: Type.String(),
      remainingActions: Type.Number(),
    }),
    Type.Object({
      type: Type.Literal("draw_2_cards"),
      characterName: Type.String(),
    }),
    Type.Object({
      type: Type.Literal("infect_cities"),
      characterName: Type.String(),
    }),
  ]),
  locations: Type.Array(
    Type.Object({
      name: Type.String(),
      type: Type.Union([Type.Literal("haven"), Type.Literal("port"), Type.Literal("inland")]),
      supplyCubes: Type.Number(),
      plagueCubes: Type.Number(),
      connections: Type.Array(
        Type.Object({
          type: Type.Union([Type.Literal("land"), Type.Literal("sea")]),
          locationName: Type.String(),
        }),
      ),
    }),
  ),
  characters: Type.Array(
    Type.Object({
      name: Type.String(),
      locationName: Type.String(),
      supplyCubes: Type.Number(),
    }),
  ),
  objectives: Type.Array(
    Type.Object({
      name: Type.String(),
      isCompleted: Type.Boolean(),
      isMandatory: Type.Boolean(),
    }),
  ),
  month: Type.Object({
    name: Type.String(),
    supplies: Type.Number(),
  }),
  bonusSupplies: Type.Number(),
  outbreaks: Type.Number(),
  state: Type.Union([Type.Literal("not_started"), Type.Literal("playing"), Type.Literal("lost"), Type.Literal("won")]),
});

export type RawGame = Static<typeof rawGameSchema>;

const gamePhaseToRawGamePhase = (phase: Game["phase"]): RawGame["phase"] => {
  if (phase.type === "take_4_actions") {
    return {
      type: phase.type,
      characterName: phase.character.name,
      remainingActions: phase.remainingActions,
    };
  }

  return {
    type: phase.type,
    characterName: phase.character.name,
  };
};

const gameToRawGame = (game: Game): RawGame => ({
  phase: gamePhaseToRawGamePhase(game.phase),
  locations: game.map.locations.map((location) => ({
    name: location.name,
    type: location.type,
    supplyCubes: location.supplyCubes,
    plagueCubes: location.plagueCubes,
    connections: location.connections.map((connection) => ({
      type: connection.type,
      locationName: connection.location.name,
    })),
  })),
  characters: game.characters.map((character) => ({
    name: character.name,
    locationName: character.location.name,
    supplyCubes: character.supplyCubes,
  })),
  objectives: game.objectives.map((objective) => ({
    name: objective.name,
    isCompleted: objective.isCompleted,
    isMandatory: objective.isMandatory,
  })),
  month: {
    name: game.month.name,
    supplies: game.month.supplies,
  },
  bonusSupplies: game.bonusSupplies,
  outbreaks: game.outbreaks,
  state: game.state,
});

const rawGamePhaseToGamePhase = (phase: RawGame["phase"], characterMap: Map<string, Character>): Game["phase"] => {
  const character = characterMap.get(phase.characterName);
  if (character === undefined) {
    throw new Error("Game phase initialisation failed - character not found", {
      cause: { characterName: phase.characterName },
    });
  }

  if (phase.type === "take_4_actions") {
    return {
      type: phase.type,
      character,
      remainingActions: phase.remainingActions,
    };
  }

  return {
    type: phase.type,
    character,
  };
};

const rawGameToGame = (rawGame: RawGame): Game | never => {
  const locationMap: Map<string, Location> = new Map();
  for (const location of rawGame.locations) {
    locationMap.set(location.name, {
      name: location.name,
      type: location.type,
      supplyCubes: location.supplyCubes,
      plagueCubes: location.plagueCubes,
      connections: [],
      characters: [],
    });
  }

  for (const rawLocation of rawGame.locations) {
    const location = locationMap.get(rawLocation.name);
    if (location === undefined) {
      throw new Error("Failed to create connections - source location not found", {
        cause: { locationName: rawLocation.name },
      });
    }
    for (const rawConnection of rawLocation.connections) {
      const connectedLocation = locationMap.get(rawConnection.locationName);
      if (connectedLocation === undefined) {
        throw new Error("Failed to create connections - destination location not found", {
          cause: { locationName: rawConnection.locationName },
        });
      }
      location.connections.push({
        type: rawConnection.type,
        location: connectedLocation,
      });
    }
  }

  const characterMap: Map<string, Character> = new Map();
  for (const rawCharacter of rawGame.characters) {
    const location = locationMap.get(rawCharacter.locationName);
    if (location === undefined) {
      throw new Error("location not found", { cause: { locationName: rawCharacter.locationName } });
    }

    const character: Character = {
      name: rawCharacter.name,
      location,
      supplyCubes: rawCharacter.supplyCubes,
    };

    location.characters.push(character);

    characterMap.set(character.name, character);
  }

  return {
    phase: rawGamePhaseToGamePhase(rawGame.phase, characterMap),
    map: {
      locations: Array.from(locationMap.values()),
    },
    characters: Array.from(characterMap.values()),
    objectives: rawGame.objectives.map((objective) => ({
      name: objective.name,
      isCompleted: objective.isCompleted,
      isMandatory: objective.isMandatory,
    })),
    month: {
      name: rawGame.month.name,
      supplies: rawGame.month.supplies,
    },
    bonusSupplies: rawGame.bonusSupplies,
    outbreaks: rawGame.outbreaks,
    state: rawGame.state,
  };
};

export const serializeGame = (game: Game): string => {
  return JSON.stringify(gameToRawGame(game), null, 2);
};

export const deserializeGame = (data: string): Game | never => {
  return rawGameToGame(Value.Parse(rawGameSchema, JSON.parse(data)));
};
