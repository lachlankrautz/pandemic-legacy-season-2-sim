import {
  type Deck,
  type Game,
  getMappedPlayer,
  type GetRequiredLocation,
  type InfectionCard,
  type Location,
  type Player,
  type PlayerCard,
} from "../game/game.ts";
import { Value } from "@sinclair/typebox/value";
import { type Static, Type } from "@sinclair/typebox";
import { makeStepMapper, serializableStepSchema } from "./step-serialization.ts";
import { makeActionMapper } from "./action-serialization.ts";
import { makeGameFlowMapper, serializableGameFlowSchema } from "./game-flow-serialization.ts";

export const serializablePlayerCardSchema = Type.Union([
  Type.Object({
    type: Type.Literal("city"),
    displayName: Type.String(),
    locationName: Type.String(),
  }),
  Type.Object({
    type: Type.Literal("portable_antiviral_lab"),
    displayName: Type.String(),
  }),
  Type.Object({
    type: Type.Literal("produce_supplies"),
    displayName: Type.String(),
  }),
  Type.Object({
    type: Type.Literal("event"),
    name: Type.String(),
    displayName: Type.String(),
  }),
  Type.Object({
    type: Type.Literal("epidemic"),
    displayName: Type.String(),
  }),
]);

export type SerializablePlayerCard = Static<typeof serializablePlayerCardSchema>;

export const serializableInfectionCardSchema = Type.Object({
  locationName: Type.String(),
});

export type SerializableInfectionCard = Static<typeof serializableInfectionCardSchema>;

/**
 * A serializable representation of a game where references to other objects are
 * replaced with flat identifiers.
 * e.g. { "location": Location } -> { "locationName": string }
 */
const serializableGameSchema = Type.Object({
  // TODO game setup steps should probably be modelled here
  gameFlow: serializableGameFlowSchema,
  locations: Type.Array(
    Type.Object({
      name: Type.String(),
      type: Type.Union([Type.Literal("haven"), Type.Literal("port"), Type.Literal("inland")]),
      colour: Type.Union([Type.Literal("blue"), Type.Literal("yellow"), Type.Literal("black"), Type.Literal("none")]),
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
  players: Type.Array(
    Type.Object({
      name: Type.String(),
      locationName: Type.String(),
      supplyCubes: Type.Number(),
      turnOrder: Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3), Type.Literal(4)]),
      cards: Type.Array(serializablePlayerCardSchema),
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
  playerDeck: Type.Object({
    drawPile: Type.Array(serializablePlayerCardSchema),
    discardPile: Type.Array(serializablePlayerCardSchema),
  }),
  infectionDeck: Type.Object({
    drawPile: Type.Array(serializableInfectionCardSchema),
    discardPile: Type.Array(serializableInfectionCardSchema),
  }),
  infectionRate: Type.Union([
    Type.Object({
      position: Type.Literal(1),
      cards: Type.Literal(2),
    }),
    Type.Object({
      position: Type.Literal(2),
      cards: Type.Literal(2),
    }),
    Type.Object({
      position: Type.Literal(3),
      cards: Type.Literal(2),
    }),
    Type.Object({
      position: Type.Literal(4),
      cards: Type.Literal(3),
    }),
    Type.Object({
      position: Type.Literal(5),
      cards: Type.Literal(3),
    }),
    Type.Object({
      position: Type.Literal(6),
      cards: Type.Literal(4),
    }),
    Type.Object({
      position: Type.Literal(7),
      cards: Type.Literal(4),
    }),
    Type.Object({
      position: Type.Literal(8),
      cards: Type.Literal(5),
    }),
  ]),
  incidents: Type.Number(),
  state: Type.Union([Type.Literal("not_started"), Type.Literal("playing"), Type.Literal("lost"), Type.Literal("won")]),
  stepHistory: Type.Array(serializableStepSchema),
  gameLog: Type.Array(Type.String()),
});

export type SerializableGame = Static<typeof serializableGameSchema>;

export type SerializableLocation = SerializableGame["locations"][number];

export type SerializablePlayer = SerializableGame["players"][number];

const gameToSerializableGame = (game: Game): SerializableGame => {
  const getRequiredLocation = getRequiredMapLocation(game.locations);
  const playerCardMapper = makePlayerCardMapper(getRequiredLocation);

  // TODO this seems bad, shouldn't really need the maps when
  //      going the other way
  const fakePlayerMap: Map<string, Player> = new Map();

  const stepMapper = makeStepMapper(getMappedPlayer(fakePlayerMap), makeActionMapper());
  const flowMapper = makeGameFlowMapper(getMappedPlayer(game.players));

  return {
    gameFlow: flowMapper.toSerializable(game.gameFlow),
    locations: Array.from(game.locations.values()).map((location) => ({
      name: location.name,
      type: location.type,
      colour: location.colour,
      supplyCubes: location.supplyCubes,
      plagueCubes: location.plagueCubes,
      connections: location.connections.map((connection) => ({
        type: connection.type,
        locationName: connection.location.name,
      })),
    })),
    players: Array.from(game.players.values()).map((player) => ({
      name: player.name,
      locationName: player.location.name,
      supplyCubes: player.supplyCubes,
      turnOrder: player.turnOrder,
      cards: player.cards.map((card) => playerCardMapper.toSerializable(card)),
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
    playerDeck: deckMapper(playerCardMapper).toSerializable(game.playerDeck),
    infectionDeck: deckMapper(makeInfectionCardMapper(getRequiredLocation)).toSerializable(game.infectionDeck),
    infectionRate: game.infectionRate,
    incidents: game.incidents,
    state: game.state,
    stepHistory: game.stepHistory.map((step) => stepMapper.toSerializable(step)),
    gameLog: game.gameLog,
  };
};

export type Mapper<TActual extends object, TSerializable extends object> = {
  toSerializable: (actual: TActual) => TSerializable;
  toActual: (actual: TSerializable) => TActual;
};

export const deckMapper = <TActual extends object, TSerializable extends object>(
  cardMapper: Mapper<TActual, TSerializable>,
): Mapper<Deck<TActual>, Deck<TSerializable>> => ({
  toActual: (serializable) => ({
    drawPile: serializable.drawPile.map((card) => cardMapper.toActual(card)),
    discardPile: serializable.discardPile.map((card) => cardMapper.toActual(card)),
  }),
  toSerializable: (actual) => ({
    drawPile: actual.drawPile.map((card) => cardMapper.toSerializable(card)),
    discardPile: actual.discardPile.map((card) => cardMapper.toSerializable(card)),
  }),
});

export const makePlayerCardMapper = (getLocation: GetRequiredLocation): Mapper<PlayerCard, SerializablePlayerCard> => ({
  toSerializable: (actual): SerializablePlayerCard => {
    switch (actual.type) {
      case "city":
        return {
          type: actual.type,
          locationName: actual.location.name,
          displayName: actual.displayName,
        };
      default:
        return actual;
    }
  },
  toActual: (serializable): PlayerCard => {
    let location: Location;
    switch (serializable.type) {
      case "city":
        location = getLocation(serializable.locationName);
        return {
          type: serializable.type,
          displayName: serializable.displayName,
          location,
        };
      default:
        return serializable;
    }
  },
});

export const makeInfectionCardMapper = (
  getLocation: GetRequiredLocation,
): Mapper<InfectionCard, SerializableInfectionCard> => ({
  toSerializable: (actual) => ({
    locationName: actual.location.name,
  }),
  toActual: (serializable) => ({
    location: getLocation(serializable.locationName),
  }),
});

export const getRequiredMapLocation =
  (map: Map<string, Location>): GetRequiredLocation =>
  (name: string): Location | never => {
    const location = map.get(name);
    if (location === undefined) {
      throw new Error("Location not found", { cause: { locationName: name } });
    }
    return location;
  };

export const serializableGameToGame = (serializableGame: SerializableGame): Game | never => {
  const locationMap: Map<string, Location> = new Map();
  for (const location of serializableGame.locations) {
    locationMap.set(location.name, {
      name: location.name,
      type: location.type,
      colour: location.colour,
      supplyCubes: location.supplyCubes,
      plagueCubes: location.plagueCubes,
      supplyCentre: false,
      connections: [],
      players: [],
    });
  }

  for (const rawLocation of serializableGame.locations) {
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

  const getRequiredLocation = getRequiredMapLocation(locationMap);
  const playerCardMapper = makePlayerCardMapper(getRequiredLocation);

  const playerMap: Map<string, Player> = new Map();
  for (const serializablePlayer of serializableGame.players) {
    const location = getRequiredLocation(serializablePlayer.locationName);

    const player: Player = {
      name: serializablePlayer.name,
      location,
      supplyCubes: serializablePlayer.supplyCubes,
      turnOrder: serializablePlayer.turnOrder,
      cards: serializablePlayer.cards.map((card) => playerCardMapper.toActual(card)),
    };

    location.players.push(player);

    playerMap.set(player.name, player);
  }

  const getPlayer = getMappedPlayer(playerMap);
  const stepMapper = makeStepMapper(getPlayer, makeActionMapper());
  const gameFlowMapper = makeGameFlowMapper(getPlayer);

  const game: Game = {
    gameFlow: gameFlowMapper.toActual(serializableGame.gameFlow),
    locations: locationMap,
    players: playerMap,
    objectives: serializableGame.objectives.map((objective) => ({
      name: objective.name,
      isCompleted: objective.isCompleted,
      isMandatory: objective.isMandatory,
    })),
    month: {
      name: serializableGame.month.name,
      supplies: serializableGame.month.supplies,
    },
    bonusSupplies: serializableGame.bonusSupplies,
    infectionRate: serializableGame.infectionRate,
    incidents: serializableGame.incidents,
    playerDeck: deckMapper(playerCardMapper).toActual(serializableGame.playerDeck),
    infectionDeck: deckMapper(makeInfectionCardMapper(getRequiredLocation)).toActual(serializableGame.infectionDeck),
    state: serializableGame.state,
    stepHistory: serializableGame.stepHistory.map((step) => stepMapper.toActual(step)),
    gameLog: serializableGame.gameLog,
  };

  if (game.infectionDeck.drawPile.length === 0) {
    throw new Error("Infection deck cannot be empty");
  }

  return game;
};

export const serializeGame = (game: Game): string => {
  const serializableGame = gameToSerializableGame(game);
  let serializedGame;
  try {
    serializedGame = Value.Parse(serializableGameSchema, serializableGame);
  } catch (error: unknown) {
    throw new Error("Failed to map game state to serializable data", { cause: error });
  }

  try {
    return JSON.stringify(serializedGame, null, 2);
  } catch (error: unknown) {
    throw new Error("Failed to serialize game data to json", { cause: error });
  }
};

export const deserializeGame = (json: string): Game | never => {
  let data;
  try {
    data = JSON.parse(json);
  } catch (error: unknown) {
    throw new Error("Failed to deserialize json game data", { cause: error });
  }

  let parsedData;
  try {
    parsedData = Value.Parse(serializableGameSchema, data);
  } catch (error: unknown) {
    throw new Error("Failed to parse game data", { cause: error });
  }

  return serializableGameToGame(parsedData);
};
