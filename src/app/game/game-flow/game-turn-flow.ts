import type { Player } from "../player/player.ts";
import type { Game } from "../game.ts";

export type GameOnType<TTurnFlowType extends TurnFlowType> = Game<TurnFlowOnType<TTurnFlowType>>;

export const isGameOnType = <TGameFlowType extends GameTurnFlow["type"]>(
  game: Game,
  type: TGameFlowType,
): game is GameOnType<TGameFlowType> => {
  return game.turnFlow.type === type;
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

export type TurnFlowType = GameTurnFlow["type"];

export type TurnFlowOnType<TTurnFlowType extends TurnFlowType> = Extract<GameTurnFlow, { type: TTurnFlowType }>;
