export type Location = {
  name: string;
  isHaven: boolean;
  isPort: boolean;
  supplyCubes: number;
  plagueCubes: number;
  connections: Connection[];
};

export type Character = {
  name: string;
  location: Location;
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
  players: Character[];
  objectives: Objective[];
  bonusSupplies: number;
  month: Month;
  state: "not_started" | "playing" | "lost" | "won";
};

export const makeGame = (): Game => {
  return {
    map: {
      locations: [],
    },
    players: [],
    objectives: [],
    bonusSupplies: 15,
    month: {
      name: "March",
      supplies: 27,
    },
    state: "not_started",
  };
};
