import type { Player } from "../player/player.ts";
import type { Connection, Game } from "../game.ts";
import type { PlayerCard } from "../cards/cards.ts";

export type CityColour = "blue" | "yellow" | "black" | "none";

export type StaticLocation = Pick<Location, "type" | "colour"> & { name: LocationName };

export const StaticLocations = {
  ["San Francisco"]: {
    name: "San Francisco",
    type: "inland",
    colour: "yellow",
  },
  ["Chicago"]: {
    name: "Chicago",
    type: "inland",
    colour: "yellow",
  },
  ["Atlanta"]: {
    name: "Atlanta",
    type: "inland",
    colour: "yellow",
  },
  ["Washington"]: {
    name: "Washington",
    type: "inland",
    colour: "yellow",
  },
  ["New York"]: {
    name: "New York",
    type: "inland",
    colour: "yellow",
  },
  ["Jacksonville"]: {
    name: "Jacksonville",
    type: "inland",
    colour: "yellow",
  },
  ["Hardhome"]: {
    name: "Hardhome",
    type: "inland",
    colour: "yellow",
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
    colour: "yellow",
  },
  ["Columbia"]: {
    name: "Columbia",
    type: "inland",
    colour: "yellow",
  },
  ["Sao Paulo"]: {
    name: "Sao Paulo",
    type: "inland",
    colour: "yellow",
  },
  ["Geidi Prime"]: {
    name: "Geidi Prime",
    type: "inland",
    colour: "yellow",
  },
  ["London"]: {
    name: "London",
    type: "inland",
    colour: "yellow",
  },
  ["Tripoli"]: {
    name: "Tripoli",
    type: "inland",
    colour: "yellow",
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
    colour: "yellow",
  },
  ["Istanbul"]: {
    name: "Istanbul",
    type: "inland",
    colour: "yellow",
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
