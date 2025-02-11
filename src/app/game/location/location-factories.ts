import { Factory } from "fishery";
import { type Location, LocationNames, StaticLocations } from "./location.ts";
import { getRandomItem } from "../../random/random.ts";

export type LocationParams = {
  name: string;
};

export const locationFactory = Factory.define<Location, LocationParams>(({ transientParams: { name } }) => {
  return {
    name: name || getRandomItem(Object.values(LocationNames)),
    type: getRandomItem(["haven", "port", "inland"]),
    colour: getRandomItem(["black", "blue", "yellow"]),
    supplyCubes: 0,
    plagueCubes: 0,
    supplyCentre: false,
    connections: [],
    players: [],
  };
});

export const locationMapFactory = Factory.define<Map<string, Location>>(() => {
  // TODO decide if linking the locations should happen here or elsewhere
  return new Map(
    Object.values(StaticLocations).map(({ name, type, colour }) => [
      name,
      {
        name,
        type,
        colour,
        supplyCentre: false,
        supplyCubes: 0,
        plagueCubes: 0,
        connections: [],
        players: [],
      },
    ]),
  );
});
