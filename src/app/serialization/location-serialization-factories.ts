import { Factory } from "fishery";
import type { SerializableLocation } from "./game-serialization.ts";
import { getRandomItem } from "../random/random.ts";
import { LocationNames, StaticLocations } from "../game/location/location.ts";

export type SerializableLocationParams = {
  name: string;
};

export const serializableLocationFactory = Factory.define<SerializableLocation, SerializableLocationParams>(
  ({ transientParams: { name } }) => {
    return {
      name: name || getRandomItem(Object.values(LocationNames)),
      type: getRandomItem(["haven", "port", "inland"]),
      colour: getRandomItem(["black", "blue", "yellow"]),
      coordinates: [0, 0],
      supplyCubes: 0,
      plagueCubes: 0,
      supplyCentre: false,
      connections: [],
      players: [],
    };
  },
);

export const serializableLocationMapFactory = Factory.define<Map<string, SerializableLocation>>(() => {
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
        coordinates: [0, 0],
        players: [],
      },
    ]),
  );
});
