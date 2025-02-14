import { describe, it, expect, vi } from "vitest";
import { gameFactory } from "../../game-factories.ts";
import { stepFactory } from "../step-factories.ts";
import { takeGameStep } from "../game-steps.ts";
import { infectionCardFactory } from "../../infection/infection-card-factories.ts";

describe("draw player card", () => {
  it("increases the infection rate if the deck is empty", () => {
    const game = gameFactory.build({
      turnFlow: {
        type: "infect_cities",
        remainingCards: 2,
      },
      infectionDeck: {
        drawPile: [],
        discardPile: infectionCardFactory.buildList(10),
      },
    });
    const step = stepFactory.build({ type: "draw_infection_card", player: game.turnFlow.player });
    const gameLog = vi.fn();

    expect(game.state.type).toEqual("playing");
    expect(game.infectionRate.position).toEqual(1);

    takeGameStep(game, step, gameLog);

    expect(game.state.type).toEqual("playing");
    expect(game.infectionRate.position).toEqual(2);
    expect(game.infectionDeck.drawPile.length).toEqual(9);
    expect(game.infectionDeck.discardPile.length).toEqual(1);
  });
});
