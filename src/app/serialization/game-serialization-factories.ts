import { Factory } from "fishery";
import type { SerializableGame } from "./game-serialization.ts";
import type { SerializableGameFlow } from "./game-flow-serialization.ts";
import { serializableGameFlowFactory } from "./game-flow-serialization-factories.ts";
import { getRandomItem } from "../random/random.js";
import { LocationNames } from "../game/location/location.js";
import { serializableLocationMapFactory } from "./location-serialization-factories.js";
import { serializablePlayerMapFactory } from "./player-serialization-factories.js";

export type SerializableGameParams = {
  flowType: SerializableGameFlow["type"];
};

// TODO think about how to specify what locations are in the game
//      how that affects the player and infection deck
//      how we ensure that links are created.

// TODO migrate the new game creation logic to here and reuse all
//      the connectors etc

export const serializableGameFactory = Factory.define<SerializableGame, SerializableGameParams>(
  ({ transientParams: { flowType } }) => {
    return {
      gameFlow: serializableGameFlowFactory.build({}, { transient: flowType ? { type: flowType } : {} }),
      // TODO shouldn't make everything by default
      locations: serializableLocationMapFactory.build().values().toArray(),
      players: serializablePlayerMapFactory.build().values().toArray(),
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
        drawPile: [
          // TODO this is probably not good enough
          //      factory params should specify which names to use
          //      to seed all the decks
          {
            locationName: getRandomItem(Object.values(LocationNames)),
          },
        ],
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
