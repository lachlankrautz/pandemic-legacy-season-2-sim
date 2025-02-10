import { Factory } from "fishery";
import { getRandomItem } from "../../random/random.ts";
import { PlayerNames } from "../start/new-game.ts";
import type { Player } from "./player.ts";
import { locationFactory } from "../location/location-factories.ts";

export type PlayerParams = {
  name: string;
};

export const playerFactory = Factory.define<Player, PlayerParams>(({ transientParams: { name } }) => {
  return {
    name: name || getRandomItem(Object.values(PlayerNames)),
    location: locationFactory.build(),
    turnOrder: getRandomItem([1, 2, 3, 4]),
    supplyCubes: 0,
    cards: [],
  };
});
