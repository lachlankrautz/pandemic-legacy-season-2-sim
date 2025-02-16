import { describe, it, expect } from "vitest";
import { flowTypes, serializableGameTurnFlowFactory } from "./game-turn-flow-serialization-factories.ts";
import { playerMapFactory } from "../game/player/player-factories.ts";

describe("serializable turn flow factory", () => {
  it("creates a random serializable turn flow", () => {
    expect(() => serializableGameTurnFlowFactory.build()).not.toThrow();
  });

  it("creates a random serializable turn flow using existing players", () => {
    const playerMap = playerMapFactory.build();
    expect(() => serializableGameTurnFlowFactory.build(undefined, { transient: { playerMap } })).not.toThrow();
  });

  it.each(flowTypes)('creates serializable "%s"', (type) => {
    expect(() => serializableGameTurnFlowFactory.build({ type })).not.toThrow();
  });
});
