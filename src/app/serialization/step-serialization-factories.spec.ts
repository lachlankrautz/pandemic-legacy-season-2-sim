import { describe, it, expect } from "vitest";
import { serializableStepFactory, stepTypes } from "./step-serialization-factories.ts";
import { playerMapFactory } from "../game/player/player-factories.ts";

describe("serializable step factory", () => {
  it("creates a random serializable step", () => {
    expect(() => serializableStepFactory.build()).not.toThrow();
  });

  it("creates a random serializable step using existing players", () => {
    const playerMap = playerMapFactory.build();
    expect(() => serializableStepFactory.build(undefined, { transient: { playerMap } })).not.toThrow();
  });

  it.each(stepTypes)('creates serializable "%s"', (type) => {
    expect(() => serializableStepFactory.build({ type })).not.toThrow();
  });
});
