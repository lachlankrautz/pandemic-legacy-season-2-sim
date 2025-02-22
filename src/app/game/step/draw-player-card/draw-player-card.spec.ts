import { describe, it, expect, vi } from "vitest";
import { gameOnDrawPlayerCardsFactory } from "../../game-factories.ts";
import { drawPlayerCardStepFactory } from "../step-factories.ts";
import { LocationNames } from "../../location/location.ts";
import { handleDrawPlayerCard } from "./draw-player-card.ts";

describe("draw player card", () => {
  it("ends the game if the draw pile is already empty", () => {
    const game = gameOnDrawPlayerCardsFactory.build({ turnFlow: { remainingCards: 2 } });
    const step = drawPlayerCardStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    expect(game.state.type).toEqual("playing");

    handleDrawPlayerCard({ game, step, gameLog });

    expect(game.state.type).toEqual("lost");
    if (game.state.type !== "lost") {
      throw new Error("narrowing type to match above assertion");
    }
    expect(game.state.cause).toContain("player deck is empty");
  });

  it("updates the remaining cards in turn flow", () => {
    const game = gameOnDrawPlayerCardsFactory.build(
      { turnFlow: { remainingCards: 2 } },
      {
        transient: {
          playerCardLocationNames: {
            [LocationNames.CHICAGO]: 1,
          },
        },
      },
    );
    const step = drawPlayerCardStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    const result = handleDrawPlayerCard({ game, step, gameLog });

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
    const game = gameOnDrawPlayerCardsFactory.build(
      { turnFlow: { remainingCards: 1 } },
      {
        transient: {
          playerCardLocationNames: {
            [LocationNames.CHICAGO]: 1,
          },
        },
      },
    );
    const step = drawPlayerCardStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    const result = handleDrawPlayerCard({ game, step, gameLog });

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
