import { describe, it, expect } from "vitest";
import { playerCardFactory, playerCardsHandFactory } from "./player-card-factories.ts";

describe("player card factory", () => {
  it("creates a player card", () => {
    expect(() => playerCardFactory.build()).not.toThrow();
  });

  it("display name matches specified type", () => {
    const card = playerCardFactory.build({ type: "epidemic" });

    expect(card.type).toEqual("epidemic");
    expect(card.displayName).toEqual("Epidemic");
  });
});

describe("player cards hand factory", () => {
  it("creates a hand of player cards", () => {
    expect(() => playerCardsHandFactory.build()).not.toThrow();
  });

  it("creates requested coloured cards", () => {
    const hand = playerCardsHandFactory.build(undefined, { transient: { yellowCards: 5 } });

    expect(hand.length).toEqual(5);
    expect(hand.every((card) => card.type === "city" && card.location.colour === "yellow")).toEqual(true);
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
