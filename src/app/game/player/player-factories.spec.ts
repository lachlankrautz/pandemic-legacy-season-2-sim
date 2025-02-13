import { describe, it, expect } from "vitest";
import { playerFactory, playerMapFactory } from "./player-factories.ts";

describe("player factory", () => {
  it("creates a player", () => {
    expect(() => playerFactory.build()).not.toThrow();
  });
});

describe("player map factory", () => {
  it("creates 4 players", () => {
    const playerMap = playerMapFactory.build();
    expect(playerMap.size).toEqual(4);
  });

  it("sets unique turn orders", () => {
    const playerMap = playerMapFactory.build();
    const turnOrderSet = new Set(playerMap.values().map((player) => player.turnOrder));
    expect(turnOrderSet.size).toEqual(4);
  });

  it("sets unique player names", () => {
    const playerMap = playerMapFactory.build();
    const names = new Set(playerMap.values().map((player) => player.name));
    expect(names.size).toEqual(4);
  });
});
