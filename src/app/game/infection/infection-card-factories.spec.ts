import { describe, it, expect } from "vitest";
import { locationFactory } from "../location/location-factories.ts";
import type { Location } from "../location/location.ts";
import { infectionCardFactory } from "./infection-card-factories.ts";

describe("infection card factory", () => {
  it("creates a infection card", () => {
    expect(() => infectionCardFactory.build()).not.toThrow();
  });

  it("reuses existing location reference", () => {
    const location = locationFactory.build();
    const locationMap: Map<string, Location> = new Map([[location.name, location]]);

    const card = infectionCardFactory.build({ location: { name: location.name } }, { transient: { locationMap } });

    expect(card.location).toBe(location);
  });
});
