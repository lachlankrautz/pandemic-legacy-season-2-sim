import { Factory } from "fishery";
import type { SerializableGame } from "./game-serialization.ts";
import type { SerializableGameFlow } from "./game-flow-serialization.ts";
import { serializableGameFlowFactory } from "./game-flow-serialization-factories.js";

export type SerializableGameParams = {
  flowType: SerializableGameFlow["type"];
};

export const serializableGameFactory = Factory.define<SerializableGame, SerializableGameParams>(
  ({ transientParams: { flowType } }) => {
    return {
      gameFlow: serializableGameFlowFactory.build({}, { transient: flowType ? { type: flowType } : {} }),
      locations: [],
      players: [],
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
  },
);
