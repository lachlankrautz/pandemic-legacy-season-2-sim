import { describe, it, expect, vi } from "vitest";
import { gameOnInfectCitiesFactory } from "../../game-factories.ts";
import { drawInfectionCardStepFactory } from "../step-factories.ts";
import { infectionCardFactory } from "../../infection/infection-card-factories.ts";
import { handleDrawInfectionCard } from "./draw-infection-card.ts";

describe("draw player card", () => {
  it("increases the infection rate if the deck is empty", () => {
    const game = gameOnInfectCitiesFactory.build({
      infectionDeck: {
        drawPile: [],
        discardPile: infectionCardFactory.buildList(10),
      },
    });
    const step = drawInfectionCardStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    expect(game.state.type).toEqual("playing");
    expect(game.infectionRate.position).toEqual(1);

    handleDrawInfectionCard(game, gameLog, step);

    expect(game.state.type).toEqual("playing");
    expect(game.infectionRate.position).toEqual(2);
    expect(game.infectionDeck.drawPile.length).toEqual(9);
    expect(game.infectionDeck.discardPile.length).toEqual(1);
  });
});
