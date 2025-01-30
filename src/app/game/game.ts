import { takeTurn, type Turn } from "./actions.ts";

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
  players: Character[];
  objectives: Objective[];
  bonusSupplies: number;
  month: Month;
  outbreaks: number;
  state: "not_started" | "playing" | "lost" | "won";
};

export type GameRunner = {
  startNewGame: () => Game;
  takeGameTurn: (game: Game, turn: Turn) => void;
};

export const makeGameRunner = (): GameRunner => ({
  startNewGame: makeGame,
  takeGameTurn: (_: Game, turn: Turn) => takeTurn(turn),
});

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
    outbreaks: 0,
    state: "not_started",
  };
};
