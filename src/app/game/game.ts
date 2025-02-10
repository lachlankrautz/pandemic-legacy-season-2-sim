import type { Step } from "./step/game-steps.ts";
import type { Player } from "./player/player.ts";
import type { GameFlow } from "./game-flow/game-flow.ts";
import type { Location } from "./location/location.ts";
import type { Deck, InfectionCard, PlayerCard } from "./cards/cards.ts";
import type { InfectionRate } from "./infection/infection.ts";

export const getNextTurnOrder = (turn: TurnOrder): TurnOrder => {
  // TODO Spend countless hours trying to get typescript to know
  //      it's still a turn order without replacing the runtime maths
  //      with exhaustive branching.
  return ((turn % 4) + 1) as TurnOrder;
};

export type TurnOrder = 1 | 2 | 3 | 4;

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
