import { Factory } from "fishery";
import { gameFlowFactory } from "./game-flow/game-flow-factories.ts";
import type { Game } from "./game.ts";
import type { GameFlow } from "./game-flow/game-flow.ts";

export type GameParams = {
  flowType: GameFlow["type"];
};

export const gameFactory = Factory.define<Game, GameParams>(({ transientParams: { flowType } }) => {
  return {
    gameFlow: gameFlowFactory.build({}, { transient: flowType ? { type: flowType } : {} }),
    locations: new Map(),
    players: new Map(),
    objectives: [],
    month: {
      name: "March",
      supplies: 27,
    },
    bonusSupplies: 15,
    playerDeck: {
      drawPile: [],
      discardPile: [],
    },
    infectionDeck: {
      drawPile: [],
      discardPile: [],
    },
    infectionRate: {
      position: 1,
      cards: 2,
    },
    incidents: 0,
    state: "playing",
    stepHistory: [],
    gameLog: [],
  };
});
