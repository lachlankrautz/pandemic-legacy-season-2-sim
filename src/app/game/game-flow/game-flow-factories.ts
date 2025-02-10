import { Factory } from "fishery";
import { getRandomItem } from "../../random/random.ts";
import type { GameFlow } from "./game-flow.ts";
import { playerFactory } from "../player/player-factories.js";

const flowTypes: GameFlow["type"][] = [
  "game_over",
  "game_won",
  "player_turn:exposure_check",
  "player_turn:take_4_actions",
  "player_turn:draw_2_cards",
  "player_turn:infect_cities",
] as const;

const causes: string[] = ["player deck exhausted", "too many incidents"];

export type GameFlowParams = {
  type: GameFlow["type"];
};

export const gameFlowFactory = Factory.define<GameFlow, GameFlowParams>(({ transientParams: { type } }) => {
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
        player: playerFactory.build(),
      };
    case "player_turn:take_4_actions":
      return {
        type,
        player: playerFactory.build(),
        remainingActions: 4,
      };
    case "player_turn:draw_2_cards":
      return {
        type,
        player: playerFactory.build(),
        remainingCards: 2,
      };
    case "player_turn:infect_cities":
      return {
        type,
        player: playerFactory.build(),
        remainingCards: 2,
      };
  }
});
