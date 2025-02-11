import { Factory } from "fishery";
import { type SerializableLocation, type SerializablePlayer } from "./game-serialization.ts";
import { getRandomItem } from "../random/random.ts";
import { PlayerNames } from "../game/start/new-game.ts";
import { LocationNames } from "../game/location/location.ts";

export type SerializablePlayerParams = {
  locationMap: Map<string, SerializableLocation>;
};

export const serializablePlayerFactory = Factory.define<SerializablePlayer, SerializablePlayerParams>(
  ({ transientParams: { locationMap } }) => {
    return {
      name: getRandomItem(Object.values(PlayerNames)),
      locationName: getRandomItem(locationMap ? locationMap.keys().toArray() : Object.values(LocationNames)),
      turnOrder: getRandomItem([1, 2, 3, 4]),
      supplyCubes: 0,
      cards: [],
    };
  },
);

export type SerializablePlayerMapParams = {
  locationMap: Map<string, SerializableLocation>;
};

export const serializablePlayerMapFactory = Factory.define<
  Map<string, SerializablePlayer>,
  SerializablePlayerMapParams
>(({ transientParams: { locationMap } }) => {
  return new Map([
    [
      PlayerNames.HAMMOND,
      serializablePlayerFactory.build(
        {
          name: PlayerNames.HAMMOND,
          turnOrder: 1,
        },
        { transient: locationMap ? { locationMap } : {} },
      ),
    ],
    [
      PlayerNames.DENJI,
      serializablePlayerFactory.build(
        {
          name: PlayerNames.DENJI,
          turnOrder: 2,
        },
        { transient: locationMap ? { locationMap } : {} },
      ),
    ],
    [
      PlayerNames.ROBIN,
      serializablePlayerFactory.build(
        {
          name: PlayerNames.ROBIN,
          turnOrder: 3,
        },
        { transient: locationMap ? { locationMap } : {} },
      ),
    ],
    [
      PlayerNames.JOEL_SMASHER,
      serializablePlayerFactory.build(
        {
          name: PlayerNames.JOEL_SMASHER,
          turnOrder: 4,
        },
        { transient: locationMap ? { locationMap } : {} },
      ),
    ],
  ]);
});
