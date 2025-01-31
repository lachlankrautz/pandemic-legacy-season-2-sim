export type Location = {
  name: string;
  isHaven: boolean;
  isPort: boolean;
  supplyCubes: number;
  plagueCubes: number;
  connections: Connection[];
  characters: Character[];
};

export type Character = {
  name: string;
  location: Location;
  supplyCubes: number;
  remainingActions: number;
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

export type Game = {
  map: WorldMap;
  characters: Character[];
  objectives: Objective[];
  bonusSupplies: number;
  month: Month;
  outbreaks: number;
  state: "not_started" | "playing" | "lost" | "won";
};

export const makeGame = (): Game => {
  const locationMap: Map<string, Location> = new Map();

  return {
    map: {
      locations: Array.from(locationMap.values()),
    },
    characters: [],
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
