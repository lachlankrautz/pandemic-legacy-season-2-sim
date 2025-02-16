import { describe, it, expect } from "vitest";
import { serializablePlayerFactory, serializablePlayerMapFactory } from "./player-serialization-factories.ts";
import { serializableLocationMapFactory } from "./location-serialization-factories.ts";

describe("serializable player factory", () => {
  it("creates a serializable player", () => {
    expect(() => serializablePlayerFactory.build()).not.toThrow();
  });

  it("creates a serializable player using existing locations", () => {
    const locationMap = serializableLocationMapFactory.build();
    expect(() => serializablePlayerFactory.build(undefined, { transient: { locationMap } })).not.toThrow();
  });
});

describe("serializable player map factory", () => {
  it("creates a serializable map player", () => {
    expect(() => serializablePlayerMapFactory.build()).not.toThrow();
  });
});
