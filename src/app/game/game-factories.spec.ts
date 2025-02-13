import { describe, it, expect } from "vitest";
import { gameFactory } from "./game-factories.ts";

describe("game factory", () => {
  it("creates a game", () => {
    expect(() => gameFactory.build()).not.toThrow();
  });

  // TODO test for the consistency that's lacking e.g. locations mapped
});
