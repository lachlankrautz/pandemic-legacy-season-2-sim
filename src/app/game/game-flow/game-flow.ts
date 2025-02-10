import type { Player } from "../player/player.ts";
import type { Game } from "../game.ts";

export const inGameFlow = <TPrefix extends string>(
  game: Game,
  prefix: TPrefix,
): game is Game<Extract<GameFlow, { type: `${TPrefix}${string}` }>> => {
  return game.gameFlow.type.startsWith(prefix);
};

export type GameFlowWon = { type: "game_won" };

export type GameFlowOver = { type: "game_over"; cause: string };

export type GameFlowTurnExposureCheck = {
  type: "player_turn:exposure_check";
  player: Player;
};

export type GameFlowTurnTakeActions = {
  type: "player_turn:take_4_actions";
  player: Player;
  remainingActions: number;
};

export type GameFlowTurnDrawCards = {
  type: "player_turn:draw_2_cards";
  player: Player;
  remainingCards: number;
};

export type GameFlowTurnInfectCities = {
  type: "player_turn:infect_cities";
  player: Player;
  remainingCards: number;
};

export type GameFlowTurn =
  | GameFlowTurnExposureCheck
  | GameFlowTurnTakeActions
  | GameFlowTurnDrawCards
  | GameFlowTurnInfectCities;

export type GameFlow = GameFlowWon | GameFlowOver | GameFlowTurn;
