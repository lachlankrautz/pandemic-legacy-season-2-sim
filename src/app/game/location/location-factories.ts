import { Factory } from "fishery";
import {
  type CityColour,
  isLocationName,
  type Location,
  type LocationName,
  type StaticLocation,
  StaticLocations,
} from "./location.ts";
import { getRandomItem } from "../../random/random.ts";
import { np } from "../../../util/non-plain-objects.ts";

// export type LocationParams = {
// };

const getStaticLocation = (
  name: string | undefined,
  type: Location["type"] | undefined,
  colour: CityColour | undefined,
): StaticLocation => {
  if (name !== undefined && isLocationName(name)) {
    return StaticLocations[name];
  }

  if (colour !== undefined) {
    return getRandomItem(Object.values(StaticLocations).filter((location) => location.colour === colour));
  }

  if (type !== undefined) {
    return getRandomItem(Object.values(StaticLocations).filter((location) => location.type === type));
  }

  return getRandomItem(Object.values(StaticLocations));
};

export const locationFactory = Factory.define<Location>(({ params: { name, type, colour } }) => {
  const staticLocation = getStaticLocation(name, type, colour);

  // Using `np` to prevent recursive merges.
  // Locations are referenced by many objects and need to not
  // be replaced with new objects.
  return np({
    name: staticLocation.name,
    type: staticLocation.type,
    colour: staticLocation.colour,
    supplyCubes: 0,
    plagueCubes: 0,
    supplyCentre: false,
    connections: [],
    players: [],
  });
});

export type LocationMapFactoryParams = {
  locationNames: LocationName[];
};

export const locationMapFactory = Factory.define<Map<string, Location>, LocationMapFactoryParams>(
  ({ transientParams: { locationNames } }) => {
    return new Map(
      Object.values(StaticLocations)
        .filter(({ name }) => locationNames === undefined || locationNames.includes(name))
        .map(({ name, type, colour }) => [
          name,
          locationFactory.build({
            name,
            type,
            colour,
          }),
        ]),
    );
  },
);
