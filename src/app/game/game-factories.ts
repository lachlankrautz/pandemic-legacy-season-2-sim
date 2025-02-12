import { Factory } from "fishery";
import { gameFlowFactory } from "./game-flow/game-flow-factories.ts";
import type { Game } from "./game.ts";
import type { GameTurnFlow } from "./game-flow/game-turn-flow.ts";
import type { Player } from "./player/player.ts";
import type { Location } from "./location/location.ts";
import { getRandomItem } from "../random/random.ts";

export type GameParams = {
  turnFlowType: GameTurnFlow["type"];
  player: Player;
  playerMap: Map<string, Player>;
  locationMap: Map<string, Location>;
  lost: boolean;
};

const causes: string[] = ["player deck exhausted", "too many incidents"];

export const gameFactory = Factory.define<Game, GameParams>(
  ({ transientParams: { turnFlowType, player, playerMap, locationMap, lost } }) => {
    playerMap ??= new Map();
    locationMap ??= new Map();

    // Merge supplied player into game
    if (player !== undefined) {
      if (playerMap.has(player.name)) {
        // This would likely break existing references to game
        // objects e.g. locations with player(s) present
        throw new Error("Cannot overwrite existing player");
      }
      playerMap.set(player.name, player);

      if (locationMap.has(player.location.name)) {
        // This would likely break existing references to game
        // objects e.g. locations with player(s) present
        throw new Error("Cannot overwrite existing location");
      }
      locationMap.set(player.location.name, player.location);
    }

    return {
      turnFlow: gameFlowFactory.build(
        {},
        {
          transient: {
            ...(turnFlowType ? { type: turnFlowType } : {}),
            ...(player ? { player: player } : {}),
          },
        },
      ),
      locations: locationMap,
      players: playerMap,
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
      state: lost ? { type: "lost", cause: getRandomItem(causes) } : { type: "playing" },
      stepHistory: [],
      gameLog: [],
    };
  },
);
