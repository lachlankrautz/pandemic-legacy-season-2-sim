import type { Player } from "../player/player.ts";
import type { Game } from "../game.ts";

export const inGameFlow = <TPrefix extends string>(
  game: Game,
  prefix: TPrefix,
): game is Game<Extract<GameTurnFlow, { type: `${TPrefix}${string}` }>> => {
  return game.turnFlow.type.startsWith(prefix);
};

export type GameFlowTurnExposureCheck = {
  type: "exposure_check";
  player: Player;
};

export type GameFlowTurnTakeActions = {
  type: "take_4_actions";
  player: Player;
  remainingActions: number;
};

export type GameFlowTurnDrawCards = {
  type: "draw_2_cards";
  player: Player;
  remainingCards: number;
};

export type GameFlowTurnInfectCities = {
  type: "infect_cities";
  player: Player;
  remainingCards: number;
};

export type GameTurnFlow =
  | GameFlowTurnExposureCheck
  | GameFlowTurnTakeActions
  | GameFlowTurnDrawCards
  | GameFlowTurnInfectCities;
