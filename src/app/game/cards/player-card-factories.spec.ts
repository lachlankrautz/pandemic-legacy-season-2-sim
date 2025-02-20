import { describe, it, expect } from "vitest";
import { playerCardFactory, playerCardsHandFactory } from "./player-card-factories.ts";
import { locationFactory } from "../location/location-factories.ts";
import type { Location } from "../location/location.ts";

describe("player card factory", () => {
  it("creates a player card", () => {
    expect(() => playerCardFactory.build()).not.toThrow();
  });

  it("display name matches specified type", () => {
    const card = playerCardFactory.build({ type: "epidemic" });

    expect(card.type).toEqual("epidemic");
    expect(card.displayName).toEqual("Epidemic");
  });

  it("reuses existing location reference", () => {
    const location = locationFactory.build();
    const locationMap: Map<string, Location> = new Map([[location.name, location]]);

    const card = playerCardFactory.build(
      { type: "city", location: { name: location.name } },
      { transient: { locationMap } },
    );

    expect(card.type).toEqual("city");
    if (card.type !== "city") {
      throw new Error("narrow type to match previous assertion");
    }
    expect(card.location).toBe(location);
  });
});

describe("player cards hand factory", () => {
  it("creates a hand of player cards", () => {
    expect(() => playerCardsHandFactory.build()).not.toThrow();
  });

  it.each([
    {
      transient: { yellowCards: 5 },
      colour: "yellow",
    },
    {
      transient: { blueCards: 5 },
      colour: "blue",
    },
    {
      transient: { blackCards: 5 },
      colour: "black",
    },
  ])("creates requested coloured cards", ({ colour, transient }) => {
    const hand = playerCardsHandFactory.build(undefined, { transient });

    expect(hand.length).toEqual(5);
    expect(hand.every((card) => card.type === "city" && card.location.colour === colour)).toEqual(true);
  });

  it("creates a starting hand of 2", () => {
    const hand = playerCardsHandFactory.build(undefined, { transient: { startingHand: true } });

    expect(hand.length).toEqual(2);
  });

  it("fills to requested hand size", () => {
    const hand = playerCardsHandFactory.build(undefined, { transient: { yellowCards: 5, count: 7 } });
    const yellowCards = hand.filter((card) => card.type === "city" && card.location.colour === "yellow");

    expect(hand.length).toEqual(7);
    expect(yellowCards.length).toBeGreaterThanOrEqual(5);
  });
});
