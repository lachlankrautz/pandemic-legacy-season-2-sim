import { describe, it, expect } from "vitest";
import { gameTurnFlowFactory } from "./game-turn-flow-factories.ts";

describe("game turn flow factory", () => {
  it("creates a game turn flow", () => {
    expect(() => gameTurnFlowFactory.build()).not.toThrow();
  });
});
