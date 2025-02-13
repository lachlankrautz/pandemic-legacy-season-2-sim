import { describe, it, expect } from "vitest";
import { playerFactory } from "../player/player-factories.ts";
import { gameFactory } from "../game-factories.ts";
import { type PlayerCardSelection, useHandCards } from "./cards.ts";

describe("use player cards", () => {
  it("moves cards from hand to discard", () => {
    const handSize = 7;
    const player = playerFactory.build(undefined, { transient: { yellowCards: 5, cardCount: handSize } });
    const game = gameFactory.build({ turnFlow: { player } });

    const initialGameDiscardSize = game.playerDeck.discardPile.length;
    const selection: PlayerCardSelection = new Set([0, 1, 2, 3, 4]);

    const { selected, remainder, discardUsed } = useHandCards(game, selection);

    // Selects the appropriate cards
    expect(selected.length).toEqual(selection.size);
    expect(remainder.length).toEqual(handSize - selection.size);

    // No cards moved yet
    expect(player.cards.length).toEqual(handSize);
    expect(game.playerDeck.discardPile.length).toEqual(initialGameDiscardSize);

    discardUsed();

    // Card moved from hand to discard
    expect(player.cards.length).toEqual(handSize - selection.size);
    expect(game.playerDeck.discardPile.length).toEqual(initialGameDiscardSize + selection.size);
  });
});
