import type { Player } from "../player/player.ts";
import type { Connection } from "../game.ts";
import type { Deck, InfectionCard, PlayerCard } from "../cards/cards.ts";

export type CityColour = "blue" | "yellow" | "black" | "none";

export type StaticLocation = Pick<Location, "name" | "type" | "coordinates" | "colour">;

export const StaticLocations = {
  ["San Francisco"]: {
    name: "San Francisco",
    type: "inland",
    coordinates: [37.7749, -122.4194],
    colour: "blue",
  },
  ["Chicago"]: {
    name: "Chicago",
    type: "inland",
    coordinates: [41.8781, -87.6298],
    colour: "blue",
  },
  ["Atlanta"]: {
    name: "Atlanta",
    type: "inland",
    coordinates: [33.749, -84.388],
    colour: "blue",
  },
  ["Washington"]: {
    name: "Washington",
    type: "inland",
    coordinates: [38.9072, -77.0369],
    colour: "blue",
  },
  ["New York"]: {
    name: "New York",
    type: "inland",
    coordinates: [40.7128, -74.006],
    colour: "blue",
  },
  ["Jacksonville"]: {
    name: "Jacksonville",
    type: "inland",
    coordinates: [30.3322, -81.6557],
    colour: "yellow",
  },
  ["Hardhome"]: {
    name: "Hardhome",
    type: "inland",
    coordinates: [24.951082, -123.850498],
    colour: "none",
  },
  ["Lima"]: {
    name: "Lima",
    type: "inland",
    coordinates: [-12.0464, -77.0428],
    colour: "yellow",
  },
  ["Bogota"]: {
    name: "Bogota",
    type: "inland",
    coordinates: [4.611, -74.0817],
    colour: "yellow",
  },
  ["Santiago"]: {
    name: "Santiago",
    type: "inland",
    coordinates: [-33.4489, -70.6693],
    colour: "yellow",
  },
  ["Buenos Aires"]: {
    name: "Buenos Aires",
    type: "inland",
    coordinates: [-34.6037, -58.3816],
    colour: "yellow",
  },
  ["Ocean Gate"]: {
    name: "Ocean Gate",
    type: "inland",
    coordinates: [44.02262, -42.507791],
    colour: "none",
  },
  ["Columbia"]: {
    name: "Columbia",
    type: "inland",
    coordinates: [3.285608, -40.408968],
    colour: "none",
  },
  ["Sao Paulo"]: {
    name: "Sao Paulo",
    type: "inland",
    coordinates: [-23.5505, -46.6333],
    colour: "yellow",
  },
  ["Geidi Prime"]: {
    name: "Geidi Prime",
    type: "inland",
    coordinates: [38.795636, 4.621832],
    colour: "none",
  },
  ["London"]: {
    name: "London",
    type: "inland",
    coordinates: [51.5074, -0.1278],
    colour: "blue",
  },
  ["Tripoli"]: {
    name: "Tripoli",
    type: "inland",
    coordinates: [32.8872, 13.1914],
    colour: "black",
  },
  ["Lagos"]: {
    name: "Lagos",
    type: "inland",
    coordinates: [6.5244, 3.3792],
    colour: "yellow",
  },
  ["Kinshasa"]: {
    name: "Kinshasa",
    type: "inland",
    coordinates: [-4.4419, 15.2663],
    colour: "yellow",
  },
  ["Cairo"]: {
    name: "Cairo",
    type: "inland",
    coordinates: [30.0444, 31.2357],
    colour: "black",
  },
  ["Istanbul"]: {
    name: "Istanbul",
    type: "inland",
    coordinates: [41.0082, 28.9784],
    colour: "black",
  },
} as const satisfies Record<LocationName, StaticLocation>;

export type Location<TColour extends CityColour = CityColour> = {
  name: string;
  type: "haven" | "port" | "inland";
  coordinates: [number, number];
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
