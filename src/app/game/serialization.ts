import { Value } from "@sinclair/typebox/value";
import type { Character, Game, Location } from "./game.ts";
import { type Static, Type } from "@sinclair/typebox";

/**
 * A tree representation of a game action replacing circular
 * references with string identifiers e.g. locationName.
 * Enables JSON serialization.
 */
const actionTreeSchema = Type.Intersect([
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

/**
 * A tree representation of a game turn replacing circular
 * references with string identifiers e.g. locationName.
 * Enables JSON serialization.
 */
const turnTreeSchema = Type.Object({
  characterName: Type.String(),
  actions: Type.Array(actionTreeSchema),
});

/**
 * A tree representation of the game state replacing circular
 * references with string identifiers e.g. locationName.
 * Enables JSON serialization.
 */
const gameTreeSchema = Type.Object({
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

export type GameTree = Static<typeof gameTreeSchema>;

const gamePhaseToTree = (phase: Game["phase"]): GameTree["phase"] => {
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

const gameToTree = (game: Game): GameTree => ({
  phase: gamePhaseToTree(game.phase),
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

const treeToGamePhase = (phase: GameTree["phase"], characterMap: Map<string, Character>): Game["phase"] => {
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

const treeToGame = (tree: GameTree): Game | never => {
  const locationMap: Map<string, Location> = new Map();
  for (const location of tree.locations) {
    locationMap.set(location.name, {
      name: location.name,
      type: location.type,
      supplyCubes: location.supplyCubes,
      plagueCubes: location.plagueCubes,
      connections: [],
      characters: [],
    });
  }

  const characterMap: Map<string, Character> = new Map();
  for (const treeCharacter of tree.characters) {
    const location = locationMap.get(treeCharacter.locationName);
    if (location === undefined) {
      throw new Error("location not found", { cause: { locationName: treeCharacter.locationName } });
    }

    const character: Character = {
      name: treeCharacter.name,
      location,
      supplyCubes: treeCharacter.supplyCubes,
    };

    location.characters.push(character);

    characterMap.set(character.name, character);
  }

  return {
    phase: treeToGamePhase(tree.phase, characterMap),
    map: {
      locations: Array.from(locationMap.values()),
    },
    characters: Array.from(characterMap.values()),
    objectives: tree.objectives.map((objective) => ({
      name: objective.name,
      isCompleted: objective.isCompleted,
      isMandatory: objective.isMandatory,
    })),
    month: {
      name: tree.month.name,
      supplies: tree.month.supplies,
    },
    bonusSupplies: tree.bonusSupplies,
    outbreaks: tree.outbreaks,
    state: tree.state,
  };
};

export const serializeGame = (game: Game): string => {
  return JSON.stringify(gameToTree(game));
};

export const deserializeGame = (data: string): Game | never => {
  return treeToGame(Value.Parse(gameTreeSchema, JSON.parse(data)));
};
