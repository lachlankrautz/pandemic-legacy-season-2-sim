import { Factory } from "fishery";
import { getRandomItem } from "../../random/random.ts";
import type { GameTurnFlow } from "./game-turn-flow.ts";
import { playerFactory } from "../player/player-factories.ts";
import { Player } from "../player/player.ts";

const flowTypes: GameTurnFlow["type"][] = [
  "player_turn:exposure_check",
  "player_turn:take_4_actions",
  "player_turn:draw_2_cards",
  "player_turn:infect_cities",
] as const;

export type GameFlowParams = {
  type: GameTurnFlow["type"];
  // Player supplied as a transient param because it is not
  // present on every branch of the GameFlow union.
  player: Player;
};

export const gameFlowFactory = Factory.define<GameTurnFlow, GameFlowParams>(({ transientParams: { type, player } }) => {
  type ??= getRandomItem(flowTypes);
  switch (type) {
    case "player_turn:exposure_check":
      return {
        type,
        player: player || playerFactory.build(),
      };
    case "player_turn:take_4_actions":
      return {
        type,
        player: player || playerFactory.build(),
        remainingActions: 4,
      };
    case "player_turn:draw_2_cards":
      return {
        type,
        player: player || playerFactory.build(),
        remainingCards: 2,
      };
    case "player_turn:infect_cities":
      return {
        type,
        player: player || playerFactory.build(),
        remainingCards: 2,
      };
  }
});
