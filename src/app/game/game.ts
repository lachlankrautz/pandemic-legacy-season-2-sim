import type { Step } from "./game-steps.ts";
import type { Logger } from "../logging/logger.ts";
import type { MaybeGameEnd } from "./infect-cities.ts";

export const inGameFlow = <TPrefix extends string>(
  game: Game,
  prefix: TPrefix,
): game is Game<Extract<GameFlow, { type: `${TPrefix}${string}` }>> => {
  return game.gameFlow.type.startsWith(prefix);
};

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

export type CityColour = "blue" | "yellow" | "black" | "none";

export type Location<TColour extends CityColour = CityColour> = {
  name: string;
  type: "haven" | "port" | "inland";
  colour: TColour;
  supplyCubes: number;
  plagueCubes: number;
  supplyCentre: boolean;
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

export type CityPlayerCard<TColour extends CityColour = CityColour> = {
  type: "city";
  displayName: string;
  location: Location<TColour>;
};

export type ProduceSuppliesPlayerCard = {
  type: "produce_supplies";
  displayName: string;
};

export type PortableAntiviralLabPlayerCard = {
  type: "portable_antiviral_lab";
  displayName: string;
};

export type EpidemicPlayerCard = {
  type: "epidemic";
  displayName: string;
};

export type EventPlayerCard = {
  type: "event";
  name: string;
  displayName: string;
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

export type GetRequiredPlayer = (name: string) => Player | never;

export const getMappedPlayer = (map: Map<string, Player>) => (name: string) => {
  const player = map.get(name);
  if (player === undefined) {
    throw new Error(`Player not found: ${name}`);
  }
  return player;
};

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

/**
 * Hand limit of 7 applies at all times so playing cards
 * will always use index 0-6.
 */
export type HandCardNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PlayerCardSelection = Set<HandCardNumber>;

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
  player: Player;
};

export type GameFlowTurnTakeActions = {
  type: "player_turn:take_4_actions";
  player: Player;
  remainingActions: number;
};

export type GameFlowTurnDrawCards = {
  type: "player_turn:draw_2_cards";
  player: Player;
  remainingCards: number;
};

export type GameFlowTurnInfectCities = {
  type: "player_turn:infect_cities";
  player: Player;
  remainingCards: number;
};

export type GameFlowTurn =
  | GameFlowTurnExposureCheck
  | GameFlowTurnTakeActions
  | GameFlowTurnDrawCards
  | GameFlowTurnInfectCities;

export type GameFlow = GameFlowWon | GameFlowOver | GameFlowTurn;

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

export const LocationNames = {
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

export type LocationDisplayName = (typeof LocationNames)[keyof typeof LocationNames];

export const links = [
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

export const recordGameIncident = (game: Game, location: Location, gameLog: GameLog): MaybeGameEnd => {
  game.incidents = Math.min(GAME_MAX_INCIDENTS, game.incidents + 1);
  gameLog(`Infection at ${location.name} added a plague cube, it now has ${location.plagueCubes}`);
  gameLog(`Incident count at ${game.incidents}`);
  if (game.incidents >= GAME_MAX_INCIDENTS) {
    return {
      type: "game_over",
      cause: "Too many incidents.",
    };
  }

  return { type: "game_continues" };
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
