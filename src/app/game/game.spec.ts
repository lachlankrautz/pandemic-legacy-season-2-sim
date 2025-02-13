import { describe, it, expect } from "vitest";
import { getEpidemicCardCount, getNextTurnOrder } from "./game.ts";

describe("next turn order", () => {
  it("gets the next turn order", () => {
    expect(getNextTurnOrder(1)).toEqual(2);
    expect(getNextTurnOrder(2)).toEqual(3);
    expect(getNextTurnOrder(3)).toEqual(4);
    expect(getNextTurnOrder(4)).toEqual(1);
  });
});

describe("epidemic card count", () => {
  it("gets the right number of epidemic cards", () => {
    expect(getEpidemicCardCount(45)).toEqual(7);
    expect(getEpidemicCardCount(64)).toEqual(10);
  });
});
