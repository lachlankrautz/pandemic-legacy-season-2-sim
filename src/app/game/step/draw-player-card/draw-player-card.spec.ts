import { describe, it, expect, vi } from "vitest";
import { gameFactory } from "../../game-factories.ts";
import { takeGameStep } from "../game-steps.ts";
import { stepFactory } from "../step-factories.ts";
import { LocationNames } from "../../location/location.js";

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

  it("updates the remaining cards in turn flow", () => {
    const game = gameFactory.build(
      { turnFlow: { type: "draw_2_cards", remainingCards: 2 } },
      {
        transient: {
          playerCardLocationNames: {
            [LocationNames.CHICAGO]: 1,
          },
        },
      },
    );
    const step = stepFactory.build({ type: "draw_player_card", player: game.turnFlow.player });
    const gameLog = vi.fn();

    const result = takeGameStep(game, step, gameLog);

    expect(game.state.type).toEqual("playing");
    expect(result.type).toEqual("state_changed");
    if (result.type !== "state_changed") {
      throw new Error("narrowing type to match above assertion");
    }
    expect(result.nextGameFlow?.type).toEqual("draw_2_cards");
    if (result.nextGameFlow?.type !== "draw_2_cards") {
      throw new Error("narrowing type to match above assertion");
    }
    expect(result.nextGameFlow?.remainingCards).toEqual(1);
  });

  it("advances to infect cities after all cards are drawn", () => {
    const game = gameFactory.build(
      { turnFlow: { type: "draw_2_cards", remainingCards: 1 } },
      {
        transient: {
          playerCardLocationNames: {
            [LocationNames.CHICAGO]: 1,
          },
        },
      },
    );
    const step = stepFactory.build({ type: "draw_player_card", player: game.turnFlow.player });
    const gameLog = vi.fn();

    const result = takeGameStep(game, step, gameLog);

    expect(game.state.type).toEqual("playing");
    expect(result.type).toEqual("state_changed");
    if (result.type !== "state_changed") {
      throw new Error("narrowing type to match above assertion");
    }
    expect(result.nextGameFlow?.type).toEqual("infect_cities");
    if (result.nextGameFlow?.type !== "infect_cities") {
      throw new Error("narrowing type to match above assertion");
    }
    expect(result.nextGameFlow?.remainingCards).toEqual(2);
  });
});
