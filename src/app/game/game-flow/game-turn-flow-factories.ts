import { Factory } from "fishery";
import { getRandomItem } from "../../random/random.ts";
import type { GameTurnFlow } from "./game-turn-flow.ts";
import { playerFactory } from "../player/player-factories.ts";
import { Player } from "../player/player.ts";

const flowTypes: GameTurnFlow["type"][] = [
  "exposure_check",
  "take_4_actions",
  "draw_2_cards",
  "infect_cities",
] as const;

export type GameFlowParams = {
  type: GameTurnFlow["type"];
  // Player supplied as a transient param because it is not
  // present on every branch of the GameFlow union.
  player: Player;
};

export const gameTurnFlowFactory = Factory.define<GameTurnFlow, GameFlowParams>(
  ({ transientParams: { type, player } }) => {
    type ??= getRandomItem(flowTypes);
    switch (type) {
      case "exposure_check":
        return {
          type,
          player: player || playerFactory.build(),
        };
      case "take_4_actions":
        return {
          type,
          player: player || playerFactory.build(),
          remainingActions: 4,
        };
      case "draw_2_cards":
        return {
          type,
          player: player || playerFactory.build(),
          remainingCards: 2,
        };
      case "infect_cities":
        return {
          type,
          player: player || playerFactory.build(),
          remainingCards: 2,
        };
    }
  },
);
