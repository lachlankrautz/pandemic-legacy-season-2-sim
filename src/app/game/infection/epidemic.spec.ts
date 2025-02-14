import { describe, it, expect, vi } from "vitest";
import { gameFactory } from "../game-factories.ts";
import type { GameLog } from "../game-log/game-log.ts";
import { epidemic } from "./epidemic.ts";
import { LocationNames } from "../location/location.ts";
import { infectionCardFactory } from "./infection-card-factories.ts";
import { locationMapFactory } from "../location/location-factories.ts";

describe("epidemic", () => {
  it("removes all supply cubes at bottom location", () => {
    const locationMap = locationMapFactory.build(undefined, {
      transient: {
        locationNames: [LocationNames.CHICAGO, LocationNames.SAN_FRANCISCO, LocationNames.LAGOS],
      },
    });

    const bottomCard = infectionCardFactory.build(
      {
        location: {
          name: LocationNames.LAGOS,
          supplyCubes: 4,
        },
      },
      { transient: { locationMap } },
    );
    const game = gameFactory.build(
      {
        locations: locationMap,
        infectionRate: {
          position: 1,
          cards: 2,
        },
        infectionDeck: {
          drawPile: [bottomCard, ...infectionCardFactory.buildList(5)],
          discardPile: infectionCardFactory.buildList(5),
        },
      },
      {
        transient: { shuffleGameDecks: false },
      },
    );
    const gameLog: GameLog = vi.fn();
    const lagos = game.getLocation(LocationNames.LAGOS);

    const initialDraw = [...game.infectionDeck.drawPile];
    const initialDiscard = [...game.infectionDeck.discardPile];

    const result = epidemic(game, gameLog);

    // Increase
    //  - infection rate increased
    expect(game.infectionRate.position).toEqual(2);

    // Infect
    //  - Remove all supply cubes from bottom card location
    //  - Discard bottom card (wow this is hard to prove happened)
    expect(lagos.supplyCubes).toEqual(0);
    expect(result.cubesRemoved).toEqual(4);

    // Intensify
    //  - Shuffle discard deck (also hard to prove)
    //  - Place discard cards on top of draw deck (try to prove everything here)
    expect(game.infectionDeck.drawPile.length).toEqual(initialDraw.length + initialDiscard.length);
    expect(game.infectionDeck.discardPile.length).toEqual(0);
    // bottom card is on top before shuffling
    const expectedTopCards = [...initialDiscard, bottomCard];
    const topCards = game.infectionDeck.drawPile.slice(game.infectionDeck.drawPile.length - expectedTopCards.length);
    // Order should have changed (this could randomly fail if shuffling randomly hit the exact same order)
    // These would match if the shuffle step was skipped
    expect(expectedTopCards).not.toEqual(topCards);
    for (const expectedCard of expectedTopCards) {
      expect(topCards.some((topCard) => topCard === expectedCard)).toEqual(true);
    }
  });
});
