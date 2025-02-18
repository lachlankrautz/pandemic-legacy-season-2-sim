import { Factory } from "fishery";
import { getRandomItem } from "../../random/random.ts";
import type {
  GameFlowTurnDrawCards,
  GameFlowTurnExposureCheck,
  GameFlowTurnInfectCities,
  GameFlowTurnTakeActions,
  GameTurnFlow,
} from "./game-turn-flow.ts";
import { playerFactory } from "../player/player-factories.ts";
import { Player } from "../player/player.ts";
import type { Game } from "../game.ts";

const flowTypes: GameTurnFlow["type"][] = [
  "exposure_check",
  "take_4_actions",
  "draw_2_cards",
  "infect_cities",
] as const;

export type GameFlowParams = {
  game: Game;
  playerMap: Map<string, Player>;
};

export const exposureCheckTurnFlowFactory = Factory.define<GameFlowTurnExposureCheck, GameFlowParams>(({ params }) => {
  return {
    type: "exposure_check",
    player: playerFactory.build(params.player),
  };
});

export const takePlayerActionsTurnFlowFactory = Factory.define<GameFlowTurnTakeActions, GameFlowParams>(
  ({ params }) => {
    return {
      type: "take_4_actions",
      player: playerFactory.build(params.player),
      remainingActions: 4,
    };
  },
);

export const drawPlayerCardsTurnFlowFactory = Factory.define<GameFlowTurnDrawCards, GameFlowParams>(({ params }) => {
  return {
    type: "draw_2_cards",
    player: playerFactory.build(params.player),
    remainingCards: 2,
  };
});

export const infectCitiesTurnFlowFactory = Factory.define<GameFlowTurnInfectCities, GameFlowParams>(({ params }) => {
  return {
    type: "infect_cities",
    player: playerFactory.build(params.player),
    remainingCards: 2,
  };
});

export const gameTurnFlowFactory = Factory.define<GameTurnFlow, GameFlowParams>(({ params }) => {
  params.type ??= getRandomItem(flowTypes);
  switch (params.type) {
    case "exposure_check":
      return exposureCheckTurnFlowFactory.build(params);
    case "take_4_actions":
      return takePlayerActionsTurnFlowFactory.build(params);
    case "draw_2_cards":
      return drawPlayerCardsTurnFlowFactory.build(params);
    case "infect_cities":
      return infectCitiesTurnFlowFactory.build(params);
  }
});
