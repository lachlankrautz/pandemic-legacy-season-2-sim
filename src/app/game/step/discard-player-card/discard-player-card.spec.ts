import { describe, it, expect, vi } from "vitest";
import type { GameLog } from "../../game-log/game-log.ts";
import { gameFactory } from "../../game-factories.ts";
import { playerFactory } from "../../player/player-factories.ts";
import { discardPlayerCardStepFactory } from "../step-factories.ts";
import { playerCardFactory } from "../../cards/player-card-factories.ts";
import { HAND_LIMIT } from "../required-steps/required-steps.ts";
import { handleDiscardPlayerCard } from "./discard-player-card.ts";

describe("discard player card", () => {
  it("no effect if player does not have excess cards", () => {
    const player = playerFactory.build({ cards: playerCardFactory.buildList(HAND_LIMIT) });
    const game = gameFactory.build({ players: new Map([[player.name, player]]) });
    const gameLog: GameLog = vi.fn();
    const step = discardPlayerCardStepFactory.build({ player });

    const result = handleDiscardPlayerCard({ game, gameLog, step });

    expect(result.type).toEqual("no_effect");
    if (result.type !== "no_effect") {
      throw new Error("narrowing type to match assertion");
    }
    expect(result.cause).toMatch(/only has [0-9]+ card\(s\)/);
  });

  it("no effect if the player does not have a card at that index", () => {
    const player = playerFactory.build({ cards: playerCardFactory.buildList(HAND_LIMIT + 1) });
    const game = gameFactory.build({ players: new Map([[player.name, player]]) });
    const gameLog: GameLog = vi.fn();
    const step = discardPlayerCardStepFactory.build({ player, cardIndex: 10 });

    const result = handleDiscardPlayerCard({ game, gameLog, step });

    expect(result.type).toEqual("no_effect");
    if (result.type !== "no_effect") {
      throw new Error("narrowing type to match assertion");
    }
    expect(result.cause).toMatch(/does not have card/);
  });

  it("discards player card", () => {
    const player = playerFactory.build({ cards: playerCardFactory.buildList(HAND_LIMIT + 1) });
    const card = player.cards[0];
    if (card === undefined) {
      throw new Error("test requires that the player must have a card to discard");
    }
    const game = gameFactory.build({ players: new Map([[player.name, player]]) });
    const gameLog: GameLog = vi.fn();
    const step = discardPlayerCardStepFactory.build({ player, cardIndex: 0 });

    const result = handleDiscardPlayerCard({ game, gameLog, step });

    expect(result.type).toEqual("state_changed");
    if (result.type !== "state_changed") {
      throw new Error("narrowing type to match assertion");
    }
    expect(player.cards.length).toEqual(HAND_LIMIT);
    expect(game.playerDeck.discardPile[game.playerDeck.discardPile.length - 1]).toBe(card);
  });
});
