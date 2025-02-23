import type { Step } from "./step/game-steps.ts";
import type { GetRequiredPlayer, Player } from "./player/player.ts";
import type { GameTurnFlow } from "./game-flow/game-turn-flow.ts";
import type { GetRequiredLocation, Location } from "./location/location.ts";
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

export type Objective = ConnectCitiesObjective | BuildSupplyCentresObjective;

export type BuildSupplyCentresObjective = {
  type: "build_supply_centres";
  hasBuiltCount: number;
  mustBuildCount: number;
  isCompleted: boolean;
  isMandatory: boolean;
};

export type ConnectCitiesObjective = {
  type: "connect_cities";
  hasConnectedCount: number;
  mustConnectCount: number;
  isCompleted: boolean;
  isMandatory: boolean;
};

export type Month = {
  name: string;
  supplies: number;
};

export const TURN_ACTION_COUNT: number = 4;

export type GameState =
  | { type: "not_started" }
  | { type: "playing" }
  | { type: "won" }
  | { type: "lost"; cause: string };

export type Game<TFlow extends GameTurnFlow = GameTurnFlow> = {
  turnFlow: TFlow;
  locations: Map<string, Location>;
  players: Map<string, Player>;
  objectives: Objective[];
  month: Month;
  bonusSupplies: number;
  playerDeck: Deck<PlayerCard>;
  infectionDeck: Deck<InfectionCard>;
  infectionRate: InfectionRate;
  incidents: number;
  state: GameState;
  stepHistory: Step[];
  gameLog: string[];
  getPlayer: GetRequiredPlayer;
  getLocation: GetRequiredLocation;
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
