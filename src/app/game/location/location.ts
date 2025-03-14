import type { Player } from "../player/player.ts";
import type { Connection } from "../game.ts";
import type { Deck, InfectionCard, PlayerCard } from "../cards/cards.ts";

export type CityColour = "blue" | "yellow" | "black" | "none";

export type StaticLocation = Pick<Location, "name" | "type" | "colour">;

export const StaticLocations = {
  ["San Francisco"]: {
    name: "San Francisco",
    type: "inland",
    colour: "blue",
  },
  ["Chicago"]: {
    name: "Chicago",
    type: "inland",
    colour: "blue",
  },
  ["Atlanta"]: {
    name: "Atlanta",
    type: "inland",
    colour: "blue",
  },
  ["Washington"]: {
    name: "Washington",
    type: "inland",
    colour: "blue",
  },
  ["New York"]: {
    name: "New York",
    type: "inland",
    colour: "blue",
  },
  ["Jacksonville"]: {
    name: "Jacksonville",
    type: "inland",
    colour: "yellow",
  },
  ["Hardhome"]: {
    name: "Hardhome",
    type: "inland",
    colour: "none",
  },
  ["Lima"]: {
    name: "Lima",
    type: "inland",
    colour: "yellow",
  },
  ["Bogota"]: {
    name: "Bogota",
    type: "inland",
    colour: "yellow",
  },
  ["Santiago"]: {
    name: "Santiago",
    type: "inland",
    colour: "yellow",
  },
  ["Buenos Aires"]: {
    name: "Buenos Aires",
    type: "inland",
    colour: "yellow",
  },
  ["Ocean Gate"]: {
    name: "Ocean Gate",
    type: "inland",
    colour: "none",
  },
  ["Columbia"]: {
    name: "Columbia",
    type: "inland",
    colour: "none",
  },
  ["Sao Paulo"]: {
    name: "Sao Paulo",
    type: "inland",
    colour: "yellow",
  },
  ["Geidi Prime"]: {
    name: "Geidi Prime",
    type: "inland",
    colour: "none",
  },
  ["London"]: {
    name: "London",
    type: "inland",
    colour: "blue",
  },
  ["Tripoli"]: {
    name: "Tripoli",
    type: "inland",
    colour: "black",
  },
  ["Lagos"]: {
    name: "Lagos",
    type: "inland",
    colour: "yellow",
  },
  ["Kinshasa"]: {
    name: "Kinshasa",
    type: "inland",
    colour: "yellow",
  },
  ["Cairo"]: {
    name: "Cairo",
    type: "inland",
    colour: "black",
  },
  ["Istanbul"]: {
    name: "Istanbul",
    type: "inland",
    colour: "black",
  },
} as const satisfies Record<LocationName, StaticLocation>;

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

export const getMappedLocation = (map: Map<string, Location>) => (name: string) => {
  const location = map.get(name);
  if (location === undefined) {
    throw new Error(`Location not found: ${name}`);
  }
  return location;
};

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

export type LocationName = (typeof LocationNames)[keyof typeof LocationNames];

export const isLocationName = (name: string): name is LocationName => {
  return Object.values(LocationNames).includes(name);
};

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
] as const satisfies [LocationName, LocationName][];

/**
 * Safe locations are "not in play"; they do not appear in the injection deck
 * and do not need much protection.
 */
export const getSafeLocations = (deck: Deck<InfectionCard>): Set<string> => {
  const inPlay = new Set([...deck.drawPile, ...deck.discardPile].map((card) => card.location.name));
  return new Set(Object.values(LocationNames).filter((name) => !inPlay.has(name)));
};
