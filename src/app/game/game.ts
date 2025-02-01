export type Location = {
  name: string;
  type: "haven" | "port" | "inland";
  supplyCubes: number;
  plagueCubes: number;
  connections: Connection[];
  characters: Character[];
};

export type Character = {
  name: string;
  location: Location;
  supplyCubes: number;
};

export type Connection = {
  location: Location;
  type: "land" | "sea";
};

export type WorldMap = {
  locations: Location[];
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

export const gameCharacterFinder = (game: Game) => (name: string) =>
  game.characters.find((character) => character.name === name);

export const gameLocationFinder = (game: Game) => (name: string) =>
  game.map.locations.find((location) => location.name === name);

export type Game = {
  phase:
    | {
        type: "exposure_check";
        character: Character;
      }
    | {
        type: "take_4_actions";
        character: Character;
        remainingActions: number;
      }
    | {
        type: "draw_2_cards";
        character: Character;
      }
    | {
        type: "infect_cities";
        character: Character;
      };
  map: WorldMap;
  characters: Character[];
  objectives: Objective[];
  bonusSupplies: number;
  month: Month;
  outbreaks: number;
  state: "not_started" | "playing" | "lost" | "won";
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
): [LocationDisplayName, Location] => [
  name,
  {
    name,
    type,
    supplyCubes: 0,
    plagueCubes: 0,
    characters: [],
    connections: [],

    // Override defaults with any provided options
    ...options,
  },
];

const makeCharacter = (
  name: string,
  startingLocationName: LocationDisplayName,
  locationMap: Map<LocationDisplayName, Location>,
): Character => {
  const location = locationMap.get(startingLocationName);
  if (location === undefined) {
    throw new Error("Character creation failed - starting location missing", {
      cause: { name, startingLocationName },
    });
  }

  return {
    name,
    location,
    supplyCubes: 0,
  };
};

export const makeGame = (): Game => {
  const locationMap: Map<LocationDisplayName, Location> = new Map([
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

  for (const [from, to] of links) {
    const fromLocation = locationMap.get(from);
    const toLocation = locationMap.get(to);

    if (fromLocation === undefined || toLocation === undefined) {
      throw new Error("Invalid link - locations not found", { cause: { from, to } });
    }

    const connectionType: Connection["type"] =
      fromLocation.type === "inland" || toLocation.type === "inland" ? "land" : "sea";

    fromLocation.connections.push({
      location: toLocation,
      type: connectionType,
    });

    toLocation.connections.push({
      location: fromLocation,
      type: connectionType,
    });
  }

  const julian = makeCharacter("Hammond", LocationNames.OCEAN_GATE, locationMap);

  return {
    phase: {
      type: "take_4_actions",
      character: julian,
      remainingActions: TURN_ACTION_COUNT,
    },
    map: {
      locations: Array.from(locationMap.values()),
    },
    characters: [
      julian,
      makeCharacter("Denji", LocationNames.GEIDI_PRIME, locationMap),
      makeCharacter("Robin", LocationNames.OCEAN_GATE, locationMap),
      makeCharacter("Joel Smasher", LocationNames.GEIDI_PRIME, locationMap),
      // makeCharacter("Jewel", LocationNames.COLUMBIA, locationMap),
      // makeCharacter("John RedCorn", LocationNames.BUENOS_AIRES, locationMap),
    ],
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
    bonusSupplies: 15,
    month: {
      name: "March",
      supplies: 27,
    },
    outbreaks: 0,
    state: "not_started",
  };
};
