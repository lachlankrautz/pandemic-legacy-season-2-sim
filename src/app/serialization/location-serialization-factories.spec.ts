import { describe, it, expect } from "vitest";
import { serializableLocationFactory, serializableLocationMapFactory } from "./location-serialization-factories.ts";

describe("serializable location factory", () => {
  it("creates a serializable location", () => {
    expect(() => serializableLocationFactory.build()).not.toThrow();
  });
});

describe("serializable location map factory", () => {
  it("creates a serializable map location", () => {
    expect(() => serializableLocationMapFactory.build()).not.toThrow();
  });
});
