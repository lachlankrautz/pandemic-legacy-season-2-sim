import { describe, it, expect } from "vitest";
import { locationFactory } from "./location-factories.ts";
import { getMappedLocation } from "./location.ts";

describe("get mapped location", () => {
  it("load a location from the map", () => {
    const location = locationFactory.build();
    const getPlayer = getMappedLocation(new Map([[location.name, location]]));

    expect(() => {
      const mappedPlayer = getPlayer(location.name);
      expect(location).toBe(mappedPlayer);
    }).not.toThrow();
  });

  it("throw when no location is found", () => {
    const location = locationFactory.build();
    const getPlayer = getMappedLocation(new Map());

    expect(() => getPlayer(location.name)).toThrow();
  });
});
