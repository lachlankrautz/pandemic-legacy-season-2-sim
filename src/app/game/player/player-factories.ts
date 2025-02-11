import { Factory } from "fishery";
import { getRandomItem } from "../../random/random.ts";
import { PlayerNames } from "../start/new-game.ts";
import type { Player } from "./player.ts";
import { locationFactory } from "../location/location-factories.ts";
import { type Location, LocationNames } from "../location/location.ts";

export type PlayerParams = {
  locationName: string;
  locationMap: Map<string, Location>;
};

export const playerFactory = Factory.define<Player, PlayerParams>(
  ({ transientParams: { locationName, locationMap } }) => {
    locationName ??= getRandomItem(locationMap ? locationMap.keys().toArray() : Object.values(LocationNames));
    return {
      name: getRandomItem(Object.values(PlayerNames)),
      location: locationMap?.get(locationName) || locationFactory.build({ name: locationName }),
      turnOrder: getRandomItem([1, 2, 3, 4]),
      supplyCubes: 0,
      cards: [],
    };
  },
);

export type PlayerMapParams = {
  locationMap: Map<string, Location>;
};

export const playerMapFactory = Factory.define<Map<string, Player>, PlayerMapParams>(
  ({ transientParams: { locationMap } }) => {
    return new Map([
      [
        PlayerNames.HAMMOND,
        playerFactory.build(
          {
            name: PlayerNames.HAMMOND,
            turnOrder: 1,
          },
          { transient: locationMap ? { locationMap } : {} },
        ),
      ],
      [
        PlayerNames.DENJI,
        playerFactory.build(
          {
            name: PlayerNames.DENJI,
            turnOrder: 2,
          },
          { transient: locationMap ? { locationMap } : {} },
        ),
      ],
      [
        PlayerNames.ROBIN,
        playerFactory.build(
          {
            name: PlayerNames.ROBIN,
            turnOrder: 3,
          },
          { transient: locationMap ? { locationMap } : {} },
        ),
      ],
      [
        PlayerNames.JOEL_SMASHER,
        playerFactory.build(
          {
            name: PlayerNames.JOEL_SMASHER,
            turnOrder: 4,
          },
          { transient: locationMap ? { locationMap } : {} },
        ),
      ],
    ]);
  },
);
