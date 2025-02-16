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
  it.each([
    { playerCards: 30, epidemics: 5 },
    { playerCards: 40, epidemics: 6 },
    { playerCards: 50, epidemics: 7 },
    { playerCards: 55, epidemics: 8 },
    { playerCards: 60, epidemics: 9 },
    { playerCards: 65, epidemics: 10 },
  ])("gets the right number of epidemics for $playerCards players cards", ({ playerCards, epidemics }) => {
    expect(getEpidemicCardCount(playerCards)).toEqual(epidemics);
  });
});
