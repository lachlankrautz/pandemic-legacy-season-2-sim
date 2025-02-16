import { Factory } from "fishery";
import type { SerializableGameTurnFlow } from "./game-turn-flow-serialization.ts";
import { getRandomItem } from "../random/random.ts";
import { PlayerNames } from "../game/start/new-game.ts";
import type { Player } from "../game/player/player.ts";

export const flowTypes = [
  "exposure_check",
  "take_4_actions",
  "draw_2_cards",
  "infect_cities",
] as const satisfies SerializableGameTurnFlow["type"][];

export type SerializableGameTurnFlowParams = {
  playerMap: Map<string, Player>;
};

export const serializableGameTurnFlowFactory = Factory.define<SerializableGameTurnFlow, SerializableGameTurnFlowParams>(
  ({ params: { type }, transientParams: { playerMap } }) => {
    type ??= getRandomItem(flowTypes);

    // Use names from players available in map
    const playerNames: string[] = playerMap ? playerMap.keys().toArray() : Object.values(PlayerNames);

    switch (type) {
      case "exposure_check":
        return {
          type,
          playerName: getRandomItem(playerNames),
        };
      case "take_4_actions":
        return {
          type,
          playerName: getRandomItem(playerNames),
          remainingActions: 4,
        };
      case "draw_2_cards":
        return {
          type,
          playerName: getRandomItem(playerNames),
          remainingCards: 2,
        };
      case "infect_cities":
        return {
          type,
          playerName: getRandomItem(playerNames),
          remainingCards: 2,
        };
    }
  },
);
