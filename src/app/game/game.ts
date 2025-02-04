import {
  type SerializableGame,
  serializableGameToGame,
  type SerializableInfectionCard,
  type SerializableLocation,
  type SerializablePlayer,
  type SerializablePlayerCard,
} from "../serialization/game-serialization.ts";
import type { Step } from "./game-steps.ts";
import type { Logger } from "../logging/logger.ts";
import { shuffleArray } from "./random.ts";
import { chunkArray } from "../../util/arrays.ts";

/**
 * GameLog can only log strings but saves the logs
 * to the game state as well as passing to the
 * system logger.
 */
export type GameLog = (log: string) => void;

export const makeGameLog =
  (game: Game, logger: Logger): GameLog =>
  (message: string) => {
    game.gameLog.push(message);
    logger.info(message);
  };

export const GAME_MAX_INCIDENTS = 8;

export type Location = {
  name: string;
  type: "haven" | "port" | "inland";
  supplyCubes: number;
  plagueCubes: number;
  connections: Connection[];
  players: Player[];
};

export type Deck<T> = {
  drawPile: T[];
  discardPile: T[];
};

export type PlayerCard =
  | CityPlayerCard
  | PortableAntiviralLabPlayerCard
  | EpidemicPlayerCard
  | EventPlayerCard
  | ProduceSuppliesPlayerCard;

export type CityPlayerCard = {
  type: "city";
  location: Location;
};

export type ProduceSuppliesPlayerCard = {
  type: "produce_supplies";
};

export type PortableAntiviralLabPlayerCard = {
  type: "portable_antiviral_lab";
};

export type EpidemicPlayerCard = {
  type: "epidemic";
};

export type EventPlayerCard = {
  type: "event";
  name: string;
};

export type InfectionCard = {
  location: Location;
};

export const infectionRates = [
  {
    position: 1,
    cards: 2,
  },
  {
    position: 2,
    cards: 2,
  },
  {
    position: 3,
    cards: 2,
  },
  {
    position: 4,
    cards: 3,
  },
  {
    position: 5,
    cards: 3,
  },
  {
    position: 6,
    cards: 4,
  },
  {
    position: 7,
    cards: 4,
  },
  {
    position: 8,
    cards: 5,
  },
] as const satisfies { position: number; cards: number }[];

export type GetPlayer = (name: string) => Player | undefined;

export const getGamePlayer =
  (game: Game): GetPlayer =>
  (name: string): Player | undefined =>
    game.players.get(name);

export type GetLocation = (name: string) => Location | undefined;

export const getGameLocation =
  (game: Game): GetLocation =>
  (name: string): Location | undefined =>
    game.locations.get(name);

export type GetRequiredLocation = (name: string) => Location | never;

export const cardDisplayName = (card: PlayerCard): string => {
  switch (card.type) {
    case "event":
      return card.name;
    case "city":
      return card.location.name;
    default:
      return card.type;
  }
};

export const increaseGameInjectionRate = (game: Game, gameLog: GameLog): void => {
  game.infectionRate = getIncreasedInfectionRate(game.infectionRate);
  gameLog(`Moved infection rate to position ${game.infectionRate.position}, ${game.infectionRate.cards} cards`);
};

export const getIncreasedInfectionRate = (infectionRate: InfectionRate): InfectionRate => {
  const nextPosition = Math.min(infectionRate.position + 1, 8);
  const nextRate = infectionRates.find((rate) => rate.position === nextPosition);
  if (nextRate === undefined) {
    throw new Error("Missing infection rate", { cause: { position: nextPosition } });
  }
  return nextRate;
};

export const getNextTurnOrder = (turn: TurnOrder): TurnOrder => {
  // TODO Spend countless hours trying to get typescript to know
  //      it's still a turn order without replacing the runtime maths
  //      with exhaustive branching.
  return ((turn % 4) + 1) as TurnOrder;
};

export type InfectionRate = (typeof infectionRates)[number];

export type TurnOrder = 1 | 2 | 3 | 4;

export type Player = {
  name: string;
  location: Location;
  turnOrder: TurnOrder;
  supplyCubes: number;
  cards: PlayerCard[];
};

export type Connection = {
  location: Location;
  type: "land" | "sea";
};

export type Objective = {
  name: string;
  isCompleted: boolean;
  isMandatory: boolean;
};

export type Month = {
  name: string;
  supplies: number;
};

export const TURN_ACTION_COUNT: number = 4;

export type GameFlowWon = { type: "game_won" };

export type GameFlowOver = { type: "game_over"; cause: string };

export type GameFlowTurnExposureCheck = {
  type: "player_turn:exposure_check";
  playerName: string;
};

export type GameFlowTurnTakeActions = {
  type: "player_turn:take_4_actions";
  playerName: string;
  remainingActions: number;
};

export type GameFlowTurnDrawCards = {
  type: "player_turn:draw_2_cards";
  playerName: string;
  remainingCards: number;
};

export type GameFlowTurnInfectCities = {
  type: "player_turn:infect_cities";
  playerName: string;
  remainingCards: number;
};

export type GameFlow =
  | GameFlowWon
  | GameFlowOver
  | GameFlowTurnExposureCheck
  | GameFlowTurnTakeActions
  | GameFlowTurnDrawCards
  | GameFlowTurnInfectCities;

export type Game<TFlow extends GameFlow = GameFlow> = {
  gameFlow: TFlow;
  locations: Map<string, Location>;
  players: Map<string, Player>;
  objectives: Objective[];
  month: Month;
  bonusSupplies: number;
  playerDeck: Deck<PlayerCard>;
  infectionDeck: Deck<InfectionCard>;
  infectionRate: InfectionRate;
  incidents: number;
  state: "not_started" | "playing" | "lost" | "won";
  stepHistory: Step[];
  gameLog: string[];
};

const LocationNames = {
  SAN_FRANCISCO: "San Francisco",
  CHICAGO: "Chicago",
  ATLANTA: "Atlanta",
  WASHINGTON: "Washington",
  NEW_YORK: "New York",
  JACKSONVILLE: "Jacksonville",
  HARDHOME: "Hardhome",
  LIMA: "Lima",
  BOGOTA: "Bogota",
  SANTIAGO: "Santiago",
  BUENOS_AIRES: "Buenos Aires",
  OCEAN_GATE: "Ocean Gate",
  COLUMBIA: "Columbia",
  SAO_PAULO: "Sao Paulo",
  GEIDI_PRIME: "Geidi Prime",
  LONDON: "London",
  TRIPOLI: "Tripoli",
  LAGOS: "Lagos",
  KINSHASA: "Kinshasa",
  CAIRO: "Cairo",
  ISTANBUL: "Istanbul",
} as const satisfies Record<string, string | undefined>;

type LocationDisplayName = (typeof LocationNames)[keyof typeof LocationNames];

const links = [
  [LocationNames.SAN_FRANCISCO, LocationNames.CHICAGO],
  [LocationNames.CHICAGO, LocationNames.ATLANTA],
  [LocationNames.CHICAGO, LocationNames.WASHINGTON],
  [LocationNames.WASHINGTON, LocationNames.JACKSONVILLE],
  [LocationNames.WASHINGTON, LocationNames.NEW_YORK],
  [LocationNames.NEW_YORK, LocationNames.OCEAN_GATE],
  [LocationNames.OCEAN_GATE, LocationNames.LONDON],
  [LocationNames.OCEAN_GATE, LocationNames.GEIDI_PRIME],
  [LocationNames.OCEAN_GATE, LocationNames.COLUMBIA],
  [LocationNames.GEIDI_PRIME, LocationNames.TRIPOLI],
  [LocationNames.GEIDI_PRIME, LocationNames.ISTANBUL],
  [LocationNames.TRIPOLI, LocationNames.CAIRO],
  [LocationNames.CAIRO, LocationNames.ISTANBUL],
  [LocationNames.JACKSONVILLE, LocationNames.COLUMBIA],
  [LocationNames.COLUMBIA, LocationNames.LAGOS],
  [LocationNames.LAGOS, LocationNames.KINSHASA],
  [LocationNames.COLUMBIA, LocationNames.SAO_PAULO],
  [LocationNames.SAO_PAULO, LocationNames.BUENOS_AIRES],
  [LocationNames.BUENOS_AIRES, LocationNames.SANTIAGO],
  [LocationNames.SAO_PAULO, LocationNames.LIMA],
  [LocationNames.LIMA, LocationNames.BOGOTA],
  [LocationNames.LIMA, LocationNames.HARDHOME],
] as const satisfies [LocationDisplayName, LocationDisplayName][];

type LocationOptions = Partial<Pick<Location, "supplyCubes" | "plagueCubes">>;

const locationEntry = (
  name: LocationDisplayName,
  type: Location["type"],
  options: LocationOptions = {},
): [LocationDisplayName, SerializableLocation] => [
  name,
  {
    name,
    type,
    supplyCubes: 0,
    plagueCubes: 0,
    connections: [],

    // Override defaults with any provided options
    ...options,
  },
];

const makePlayer = (name: string, locationName: LocationDisplayName, turnOrder: TurnOrder): SerializablePlayer => {
  return {
    name,
    locationName,
    turnOrder,
    supplyCubes: 0,
    cards: [],
  };
};

export const makeGame = (): Game => {
  const serializableGame = makeSerializableGame();
  return serializableGameToGame(serializableGame);
};

export const makeSerializableGame = (): SerializableGame => {
  const locationMap: Map<string, SerializableLocation> = new Map([
    // Havens
    locationEntry(LocationNames.OCEAN_GATE, "haven"),
    locationEntry(LocationNames.GEIDI_PRIME, "haven"),
    locationEntry(LocationNames.HARDHOME, "haven"),
    locationEntry(LocationNames.COLUMBIA, "haven"),

    // Ports
    locationEntry(LocationNames.SAN_FRANCISCO, "port"),
    locationEntry(LocationNames.WASHINGTON, "port"),
    locationEntry(LocationNames.NEW_YORK, "port"),
    locationEntry(LocationNames.JACKSONVILLE, "port"),
    locationEntry(LocationNames.LONDON, "port"),
    locationEntry(LocationNames.TRIPOLI, "port"),
    locationEntry(LocationNames.CAIRO, "port"),
    locationEntry(LocationNames.ISTANBUL, "port"),
    locationEntry(LocationNames.LIMA, "port"),
    locationEntry(LocationNames.BUENOS_AIRES, "port"),
    locationEntry(LocationNames.SAO_PAULO, "port"),
    locationEntry(LocationNames.LAGOS, "port"),

    // Inland cities
    locationEntry(LocationNames.CHICAGO, "inland"),
    locationEntry(LocationNames.ATLANTA, "inland"),
    locationEntry(LocationNames.BOGOTA, "inland"),
    locationEntry(LocationNames.SANTIAGO, "inland"),
    locationEntry(LocationNames.KINSHASA, "inland"),
  ]);

  const getLocation = (locationName: string): SerializableLocation => {
    const serializableLocation = locationMap.get(locationName);
    if (serializableLocation === undefined) {
      throw new Error(`Location not found ${locationName}`);
    }
    return serializableLocation;
  };

  for (const [from, to] of links) {
    const fromLocation = locationMap.get(from);
    const toLocation = locationMap.get(to);

    if (fromLocation === undefined || toLocation === undefined) {
      throw new Error("Invalid link - locations not found", { cause: { from, to } });
    }

    const connectionType: Connection["type"] =
      fromLocation.type === "inland" || toLocation.type === "inland" ? "land" : "sea";

    fromLocation.connections.push({
      locationName: toLocation.name,
      type: connectionType,
    });

    toLocation.connections.push({
      locationName: fromLocation.name,
      type: connectionType,
    });
  }

  const julian = makePlayer("Hammond", LocationNames.OCEAN_GATE, 1);

  const players = [
    julian,
    makePlayer("Denji", LocationNames.GEIDI_PRIME, 2),
    makePlayer("Robin", LocationNames.OCEAN_GATE, 3),
    makePlayer("Joel Smasher", LocationNames.GEIDI_PRIME, 4),
    // makePlayer("Jewel", LocationNames.COLUMBIA, ?),
    // makePlayer("John RedCorn", LocationNames.BUENOS_AIRES, ?),
  ];

  const playerDeck: Deck<SerializablePlayerCard> = {
    drawPile: [],
    discardPile: [],
  };

  // Cities
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.ATLANTA });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.BOGOTA });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.BOGOTA });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.BUENOS_AIRES });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.BUENOS_AIRES });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.CAIRO });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.CAIRO });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.CAIRO });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.CAIRO });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.CHICAGO });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.CHICAGO });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.ISTANBUL });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.ISTANBUL });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.ISTANBUL });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.ISTANBUL });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.JACKSONVILLE });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.JACKSONVILLE });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.JACKSONVILLE });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.JACKSONVILLE });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.KINSHASA });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.NEW_YORK });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.NEW_YORK });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.NEW_YORK });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.NEW_YORK });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.LAGOS });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.LAGOS });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.LAGOS });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.LAGOS });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.LIMA });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.LONDON });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.LONDON });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.LONDON });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.LONDON });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.SAO_PAULO });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.SAO_PAULO });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.SAO_PAULO });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.SAO_PAULO });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.SANTIAGO });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.SAN_FRANCISCO });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.SAN_FRANCISCO });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.TRIPOLI });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.TRIPOLI });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.TRIPOLI });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.TRIPOLI });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.WASHINGTON });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.WASHINGTON });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.WASHINGTON });
  playerDeck.drawPile.push({ type: "city", locationName: LocationNames.WASHINGTON });
  const cityCardCount = playerDeck.drawPile.length;

  // Portable antiviral labs
  Array.from({ length: 3 }).forEach(() => playerDeck.drawPile.push({ type: "portable_antiviral_lab" }));

  // Produce supplies
  Array.from({ length: 7 }).forEach(() => playerDeck.drawPile.push({ type: "produce_supplies" }));

  // Unrationed event
  playerDeck.drawPile.push({ type: "event", name: "Strategic Reserves" });
  playerDeck.drawPile.push({ type: "event", name: "Topaz Experimental Vaccine" });

  // Random events
  playerDeck.drawPile.push({ type: "event", name: "Extended Forecast" });
  playerDeck.drawPile.push({ type: "event", name: "Extended Time" });
  playerDeck.drawPile.push({ type: "event", name: "One Quiet Night" });
  playerDeck.drawPile.push({ type: "event", name: "Resilient Population" });
  playerDeck.drawPile.push({ type: "event", name: "Dispersal" });
  playerDeck.drawPile.push({ type: "event", name: "Drastic Measures" });
  playerDeck.drawPile.push({ type: "event", name: "Team Bravo" });
  playerDeck.drawPile.push({ type: "event", name: "Data Transfer" });
  // playerDeck.drawPile.push({ type: "event", name: "It Worked The First Time" });
  // playerDeck.drawPile.push({ type: "event", name: "Airlift" });
  // playerDeck.drawPile.push({ type: "event", name: "Hidden Stockpile" });

  // Initial shuffle
  playerDeck.drawPile = shuffleArray(playerDeck.drawPile);

  // Draw starting hands...
  for (const player of players) {
    Array.from({ length: 2 }).forEach(() => {
      const card = playerDeck.drawPile.pop();
      if (card === undefined) {
        throw new Error("Insufficient player cards to draw opening hands");
      }

      player.cards.push(card);
    });
  }

  // Epidemic
  const epidemicCount = getEpidemicCardCount(cityCardCount);
  playerDeck.drawPile = chunkArray(playerDeck.drawPile, playerDeck.drawPile.length / epidemicCount)
    .map((chunk) => {
      chunk.push({ type: "epidemic" });
      return shuffleArray(chunk);
    })
    .flat();

  const infectionDeck: Deck<SerializableInfectionCard> = {
    drawPile: [],
    discardPile: [],
  };

  infectionDeck.drawPile.push({ locationName: LocationNames.BOGOTA });
  infectionDeck.drawPile.push({ locationName: LocationNames.BOGOTA });
  infectionDeck.drawPile.push({ locationName: LocationNames.CAIRO });
  infectionDeck.drawPile.push({ locationName: LocationNames.CAIRO });
  infectionDeck.drawPile.push({ locationName: LocationNames.CAIRO });
  infectionDeck.drawPile.push({ locationName: LocationNames.CHICAGO });
  infectionDeck.drawPile.push({ locationName: LocationNames.ISTANBUL });
  infectionDeck.drawPile.push({ locationName: LocationNames.ISTANBUL });
  infectionDeck.drawPile.push({ locationName: LocationNames.ISTANBUL });
  infectionDeck.drawPile.push({ locationName: LocationNames.JACKSONVILLE });
  infectionDeck.drawPile.push({ locationName: LocationNames.JACKSONVILLE });
  infectionDeck.drawPile.push({ locationName: LocationNames.LIMA });
  infectionDeck.drawPile.push({ locationName: LocationNames.NEW_YORK });
  infectionDeck.drawPile.push({ locationName: LocationNames.NEW_YORK });
  infectionDeck.drawPile.push({ locationName: LocationNames.NEW_YORK });
  infectionDeck.drawPile.push({ locationName: LocationNames.SAN_FRANCISCO });
  infectionDeck.drawPile.push({ locationName: LocationNames.SAN_FRANCISCO });
  infectionDeck.drawPile.push({ locationName: LocationNames.SANTIAGO });
  infectionDeck.drawPile.push({ locationName: LocationNames.SAO_PAULO });
  infectionDeck.drawPile.push({ locationName: LocationNames.TRIPOLI });
  infectionDeck.drawPile.push({ locationName: LocationNames.TRIPOLI });
  infectionDeck.drawPile.push({ locationName: LocationNames.TRIPOLI });
  infectionDeck.drawPile.push({ locationName: LocationNames.WASHINGTON });
  infectionDeck.drawPile.push({ locationName: LocationNames.WASHINGTON });
  infectionDeck.drawPile.push({ locationName: LocationNames.WASHINGTON });

  // Shuffle first
  infectionDeck.drawPile = shuffleArray(infectionDeck.drawPile);

  const monthSupplies = 27;
  const bonusSupplies = 15;

  // Randomly distribute supplies
  const totalSupplies = monthSupplies + bonusSupplies;
  const infectionCities = [...new Set(infectionDeck.drawPile.map((card) => card.locationName))].map(getLocation);
  for (let i = 0; i < totalSupplies; i++) {
    const nameIndex = i % infectionCities.length;
    const city = infectionCities[nameIndex];
    if (city !== undefined) {
      city.supplyCubes++;
    }
  }

  return {
    gameFlow: {
      type: "player_turn:take_4_actions",
      playerName: julian.name,
      remainingActions: TURN_ACTION_COUNT,
    },
    locations: Array.from(locationMap.values()),
    players,
    objectives: [
      {
        name: "create_3_supply_centres",
        isCompleted: false,
        isMandatory: true,
      },
      {
        name: "complete_2_searches",
        isCompleted: false,
        isMandatory: false,
      },
      {
        name: "explore_1_region",
        isCompleted: false,
        isMandatory: false,
      },
    ],
    month: {
      name: "March",
      supplies: monthSupplies,
    },
    bonusSupplies,
    playerDeck,
    infectionDeck,
    infectionRate: {
      position: 2,
      cards: 2,
    },
    incidents: 0,
    state: "not_started",
    stepHistory: [],
    gameLog: [],
  };
};

export const recordGameIncident = (game: Game, location: Location, gameLog: GameLog): void => {
  game.incidents = Math.min(GAME_MAX_INCIDENTS, game.incidents + 1);
  gameLog(`Infection at ${location.name} added a plague cube, it now has ${location.plagueCubes}`);
  gameLog(`Incident count at ${game.incidents}`);
  if (game.incidents >= GAME_MAX_INCIDENTS) {
    game.gameFlow = {
      type: "game_over",
      cause: "Too many incidents",
    };
    gameLog("Game Over: Too many incidents.");
  }
};

export const getEpidemicCardCount = (cityCardCount: number): number => {
  if (cityCardCount >= 63) {
    return 10;
  } else if (cityCardCount >= 58) {
    return 9;
  } else if (cityCardCount >= 52) {
    return 8;
  } else if (cityCardCount >= 45) {
    return 7;
  } else if (cityCardCount >= 37) {
    return 6;
  } else {
    return 5;
  }
};
