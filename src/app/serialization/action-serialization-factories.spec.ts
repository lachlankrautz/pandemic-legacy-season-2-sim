import { describe, it, expect } from "vitest";
import { serializableActionFactory } from "./action-serialization-factories.ts";
import { LocationNames } from "../game/location/location.ts";
import { actionTypes } from "../game/action/actions.ts";

describe("serializable action factory", () => {
  it("creates a random serializable action", () => {
    expect(() => serializableActionFactory.build()).not.toThrow();
  });

  it("creates a random serializable action using existing location names", () => {
    const locationNames = [LocationNames.CHICAGO, LocationNames.CHICAGO];
    expect(() => serializableActionFactory.build(undefined, { transient: { locationNames } })).not.toThrow();
  });

  it.each(actionTypes)('creates serializable "%s"', (type) => {
    expect(() => serializableActionFactory.build({ type })).not.toThrow();
  });
});
