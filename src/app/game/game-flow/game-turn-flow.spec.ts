import { describe, it, expect } from "vitest";
import { gameFactory } from "../game-factories.ts";
import { type GameFlowTurnDrawCards, inGameFlow } from "./game-turn-flow.ts";
import type { Game } from "../game.ts";

describe("in game flow", () => {
  it("narrows type based on prefix", () => {
    const game = gameFactory.build({ turnFlow: { type: "take_4_actions" } });

    if (inGameFlow(game, "take_4")) {
      // @ts-expect-error the type has been narrows to something else
      const wrongType: Game<GameFlowTurnDrawCards> = game;

      expect(wrongType.turnFlow.type).toEqual("take_4_actions");
    }
  });
});
