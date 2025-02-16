import { describe, it, expect, vi } from "vitest";
import { gameFactory } from "../../game-factories.ts";
import { takeGameStep } from "../game-steps.ts";
import { stepFactory } from "../step-factories.ts";

describe("draw player card", () => {
  it("ends the game if the draw pile is already empty", () => {
    const game = gameFactory.build({ turnFlow: { type: "draw_2_cards", remainingCards: 2 } });
    const step = stepFactory.build({ type: "draw_player_card", player: game.turnFlow.player });
    const gameLog = vi.fn();

    expect(game.state.type).toEqual("playing");

    takeGameStep(game, step, gameLog);

    expect(game.state.type).toEqual("lost");
    if (game.state.type !== "lost") {
      throw new Error("narrowing type to match above assertion");
    }
    expect(game.state.cause).toContain("player deck is empty");
  });
});
