import { describe, it, expect } from "vitest";
import { locationFactory, locationMapFactory } from "./location-factories.ts";
import { type Location, type LocationName, LocationNames, StaticLocations } from "./location.ts";

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

  it("reuses existing instances", () => {
    const initialLocation = locationFactory.build({ name: LocationNames.SAN_FRANCISCO, supplyCubes: 0 });
    const locationMap: Map<string, Location> = new Map([[initialLocation.name, initialLocation]]);

    expect(initialLocation.supplyCubes).toEqual(0);

    const newLocation = locationFactory.build(
      { name: initialLocation.name, supplyCubes: 2 },
      { transient: { locationMap } },
    );

    expect(initialLocation).toBeDefined();
    expect(newLocation).toBe(initialLocation);

    // Check the factory params have mutated the shared state
    expect(initialLocation.supplyCubes).toEqual(2);
    expect(newLocation.supplyCubes).toEqual(2);
  });

  it("adds new locations to the map", () => {
    const locationMap: Map<string, Location> = new Map();
    const location = locationFactory.build(undefined, { transient: { locationMap } });

    const mappedLocation = locationMap.get(location.name);
    expect(mappedLocation).toEqual(location);
  });
});

describe("location map factory", () => {
  it("creates all locations", () => {
    const locationMap = locationMapFactory.build();
    expect(locationMap.size).toEqual(Object.keys(StaticLocations).length);
  });

  it("creates requested locations", () => {
    const locationNames: LocationName[] = [LocationNames.SAN_FRANCISCO, LocationNames.CHICAGO];
    const locationMap = locationMapFactory.build(undefined, {
      transient: { locationNames },
    });

    expect(locationMap.size).toEqual(locationNames.length);
    for (const locationName of locationNames) {
      expect(locationMap.get(locationName)).toBeDefined();
    }
  });
});
