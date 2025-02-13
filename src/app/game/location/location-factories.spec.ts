import { describe, it, expect } from "vitest";
import { locationFactory, locationMapFactory } from "./location-factories.ts";
import { StaticLocations } from "./location.ts";

describe("location factory", () => {
  it("creates a location", () => {
    expect(() => locationFactory.build()).not.toThrow();
  });

  it("matches static location data", () => {
    const staticLocation = StaticLocations.Atlanta;
    const location = locationFactory.build({ name: staticLocation.name });

    expect(location.type).toEqual(staticLocation.type);
    expect(location.name).toEqual(staticLocation.name);
    expect(location.colour).toEqual(staticLocation.colour);
  });
});

describe("location map factory", () => {
  it("creates all locations", () => {
    const locationMap = locationMapFactory.build();
    expect(locationMap.size).toEqual(Object.keys(StaticLocations).length);
  });
});
