import { Factory } from "fishery";
import { getRandomItem } from "../../random/random.ts";
import { PlayerNames } from "../start/new-game.ts";
import type { Player } from "./player.ts";
import { locationFactory } from "../location/location-factories.ts";
import { type Location, LocationNames } from "../location/location.ts";
import { playerCardsHandFactory, type PlayerCardsHandParams } from "../cards/player-card-factories.ts";
import { np } from "../../../util/non-plain-objects.ts";

export type PlayerParams = {
  locationName: string;
  locationMap: Map<string, Location>;
  startingHand: true;
  yellowCards: number;
  blackCards: number;
  blueCards: number;
  cardCount: number;
};

const playerParamsToCardHand = (params: Partial<PlayerParams>): Partial<PlayerCardsHandParams> => {
  const cardsParams: Partial<PlayerCardsHandParams> = {};

  if (params.startingHand) {
    cardsParams.startingHand = params.startingHand;
  }

  if (params.yellowCards !== undefined) {
    cardsParams.yellowCards = params.yellowCards;
  }

  if (params.blackCards !== undefined) {
    cardsParams.blackCards = params.blackCards;
  }

  if (params.blueCards !== undefined) {
    cardsParams.blueCards = params.blueCards;
  }

  if (params.cardCount !== undefined) {
    cardsParams.count = params.cardCount;
  }

  return cardsParams;
};

export const playerFactory = Factory.define<Player, PlayerParams>(({ transientParams }) => {
  const { locationMap } = transientParams;

  const locationName =
    transientParams.locationName ||
    getRandomItem(locationMap ? locationMap.keys().toArray() : Object.values(LocationNames));

  // Using `np` to prevent recursive merges.
  // Players are referenced by many objects and need to not
  // be replaced with new objects.
  return np({
    name: getRandomItem(Object.values(PlayerNames)),
    location: locationMap?.get(locationName) || locationFactory.build({ name: locationName }),
    turnOrder: getRandomItem([1, 2, 3, 4]),
    supplyCubes: 0,
    cards: playerCardsHandFactory.build(undefined, {
      transient: playerParamsToCardHand(transientParams),
    }),
  });
});

export type PlayerMapParams = {
  startingHand: true;
  locationMap: Map<string, Location>;
};

export const playerMapFactory = Factory.define<Map<string, Player>, PlayerMapParams>(({ transientParams }) => {
  return new Map([
    [
      PlayerNames.HAMMOND,
      playerFactory.build(
        {
          name: PlayerNames.HAMMOND,
          turnOrder: 1,
        },
        { transient: transientParams },
      ),
    ],
    [
      PlayerNames.DENJI,
      playerFactory.build(
        {
          name: PlayerNames.DENJI,
          turnOrder: 2,
        },
        { transient: transientParams },
      ),
    ],
    [
      PlayerNames.ROBIN,
      playerFactory.build(
        {
          name: PlayerNames.ROBIN,
          turnOrder: 3,
        },
        { transient: transientParams },
      ),
    ],
    [
      PlayerNames.JOEL_SMASHER,
      playerFactory.build(
        {
          name: PlayerNames.JOEL_SMASHER,
          turnOrder: 4,
        },
        { transient: transientParams },
      ),
    ],
  ]);
});
