import { describe, it, expect } from "vitest";
import { gameFactory } from "../game-factories.ts";
import { type GameFlowTurnDrawCards, isGameOnType } from "./game-turn-flow.ts";
import type { Game } from "../game.ts";

describe("is on game type", () => {
  it("narrows turn flow based on type", () => {
    const game = gameFactory.build({ turnFlow: { type: "take_4_actions" } });

    if (isGameOnType(game, "take_4_actions")) {
      // @ts-expect-error the type has been narrows to something else
      const wrongType: Game<GameFlowTurnDrawCards> = game;

      expect(wrongType.turnFlow.type).toEqual("take_4_actions");
    }
  });
});
