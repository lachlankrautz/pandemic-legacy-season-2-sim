import { describe, it, expect, vi } from "vitest";
import { gameOnInfectCitiesFactory } from "../../game-factories.ts";
import { drawInfectionCardStepFactory } from "../step-factories.ts";
import { infectionCardFactory } from "../../infection/infection-card-factories.ts";
import { handleDrawInfectionCard } from "./draw-infection-card.ts";
import { LocationNames } from "../../location/location.ts";
import { playerMapFactory } from "../../player/player-factories.ts";

describe("draw infection card", () => {
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

    handleDrawInfectionCard({ game, gameLog, step });

    expect(game.state.type).toEqual("playing");
    expect(game.infectionRate.position).toEqual(2);
    expect(game.infectionDeck.drawPile.length).toEqual(9);
    expect(game.infectionDeck.discardPile.length).toEqual(1);
  });

  it("throws if both the draw and discard are empty", () => {
    const game = gameOnInfectCitiesFactory.build();
    const step = drawInfectionCardStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    expect(() => handleDrawInfectionCard({ game, gameLog, step })).toThrow(/deck.*empty/);
  });

  it("ends early if game end is triggered", () => {
    const game = gameOnInfectCitiesFactory.build(
      { incidents: 7, turnFlow: { remainingCards: 2 } },
      { transient: { infectionCardLocationNames: { [LocationNames.CHICAGO]: 1 } } },
    );
    const step = drawInfectionCardStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    const result = handleDrawInfectionCard({ game, gameLog, step });

    expect(game.state.type).toEqual("lost");
    expect(result.type).toEqual("state_changed");
    if (result.type !== "state_changed") {
      throw new Error("narrow type to match assertion");
    }
    expect(result.nextGameFlow).toBeUndefined();
  });

  it("reduces the remaining card count", () => {
    const game = gameOnInfectCitiesFactory.build(
      { turnFlow: { remainingCards: 2 } },
      { transient: { infectionCardLocationNames: { [LocationNames.CHICAGO]: 1 } } },
    );
    const chicago = game.getLocation(LocationNames.CHICAGO);
    chicago.supplyCubes = 1;
    const step = drawInfectionCardStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    const result = handleDrawInfectionCard({ game, gameLog, step });

    expect(game.incidents).toEqual(0);
    expect(game.state.type).toEqual("playing");
    expect(result.type).toEqual("state_changed");
    if (result.type !== "state_changed") {
      throw new Error("narrow type to match assertion");
    }
    expect(result.nextGameFlow?.type).toEqual("infect_cities");
    if (result.nextGameFlow?.type !== "infect_cities") {
      throw new Error("narrow type to match assertion");
    }
    expect(result.nextGameFlow?.remainingCards).toEqual(1);

    // Does not directly update the turnFlow
    // new state is in the response type
    expect(game.turnFlow.remainingCards).toEqual(2);
  });

  it("passes the turn after the last card", () => {
    const players = playerMapFactory.build();
    const game = gameOnInfectCitiesFactory.build(
      { turnFlow: { remainingCards: 1 }, players },
      { transient: { infectionCardLocationNames: { [LocationNames.CHICAGO]: 1 } } },
    );
    const chicago = game.getLocation(LocationNames.CHICAGO);
    chicago.supplyCubes = 1;
    const step = drawInfectionCardStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    const result = handleDrawInfectionCard({ game, gameLog, step });

    expect(game.incidents).toEqual(0);
    expect(game.state.type).toEqual("playing");
    expect(result.type).toEqual("state_changed");
    if (result.type !== "state_changed") {
      throw new Error("narrow type to match assertion");
    }
    expect(result.nextGameFlow?.type).toEqual("exposure_check");
    if (result.nextGameFlow?.type !== "exposure_check") {
      throw new Error("narrow type to match assertion");
    }
    expect(result.nextGameFlow?.player.name).not.toEqual(game.turnFlow.player.name);

    // Does not directly update the turnFlow
    // new state is in the response type
    expect(game.turnFlow.type).toEqual("infect_cities");
  });

  it("throws if there is no next player to pass to", () => {
    const game = gameOnInfectCitiesFactory.build(
      { turnFlow: { remainingCards: 1 } },
      { transient: { infectionCardLocationNames: { [LocationNames.CHICAGO]: 1 } } },
    );
    const chicago = game.getLocation(LocationNames.CHICAGO);
    chicago.supplyCubes = 1;
    const step = drawInfectionCardStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    expect(() => handleDrawInfectionCard({ game, gameLog, step })).toThrow(/find .* next player/);
  });
});
