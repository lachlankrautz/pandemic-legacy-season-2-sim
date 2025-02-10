import { Factory } from "fishery";
import type { SerializableGameFlow } from "./game-flow-serialization.ts";
import { getRandomItem } from "../random/random.ts";
import { PlayerNames } from "../game/new-game.ts";

const flowTypes: SerializableGameFlow["type"][] = [
  "game_over",
  "game_won",
  "player_turn:exposure_check",
  "player_turn:take_4_actions",
  "player_turn:draw_2_cards",
  "player_turn:infect_cities",
] as const;

const causes: string[] = ["player deck exhausted", "too many incidents"];

export type SerializableGameFlowParams = {
  type: SerializableGameFlow["type"];
};

export const serializableGameFlowFactory = Factory.define<SerializableGameFlow, SerializableGameFlowParams>(
  ({ transientParams: { type } }) => {
    type ??= getRandomItem(flowTypes);
    switch (type) {
      case "game_won":
        return {
          type,
        };
      case "game_over":
        return {
          type,
          cause: getRandomItem(causes),
        };
      case "player_turn:exposure_check":
        return {
          type,
          playerName: getRandomItem(Object.values(PlayerNames)),
        };
      case "player_turn:take_4_actions":
        return {
          type,
          playerName: getRandomItem(Object.values(PlayerNames)),
          remainingActions: 4,
        };
      case "player_turn:draw_2_cards":
        return {
          type,
          playerName: getRandomItem(Object.values(PlayerNames)),
          remainingCards: 2,
        };
      case "player_turn:infect_cities":
        return {
          type,
          playerName: getRandomItem(Object.values(PlayerNames)),
          remainingCards: 2,
        };
    }
  },
);
