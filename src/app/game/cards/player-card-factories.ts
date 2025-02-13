import { Factory } from "fishery";
import { faker } from "@faker-js/faker/locale/en";
import type { PlayerCard } from "./cards.ts";
import { getRandomItem } from "../../random/random.ts";
import { type Location, type StaticLocation } from "../location/location.ts";
import { locationFactory } from "../location/location-factories.ts";

const types: PlayerCard["type"][] = ["city", "produce_supplies", "portable_antiviral_lab", "epidemic", "event"];

const eventNames: string[] = [
  "Strategic Reserves",
  "Topaz Experimental Vaccine",
  "Extended Forecast",
  "Extended Time",
  "One Quiet Night",
  "Resilient Population",
  "Dispersal",
  "Drastic Measures",
  "Team Bravo",
  "Data Transfer",
  "It Worked The First Time",
  "Airlift",
  "Hidden Stockpile",
];

export type PlayerCardParams = {
  type: PlayerCard["type"];
  locationMap: Map<string, Location>;
  staticLocation: Partial<StaticLocation>;
};

export const playerCardFactory = Factory.define<PlayerCard, PlayerCardParams>(
  ({ params: { type }, transientParams: { locationMap, staticLocation } }) => {
    type ??= getRandomItem(types);
    let eventName: string;
    let location: Location;
    switch (type) {
      case "city":
        location = locationFactory.build(staticLocation, {
          transient: {
            ...(locationMap ? { locationMap } : {}),
          },
        });
        return {
          type,
          displayName: `City: ${location.name}`,
          location,
        };

      case "produce_supplies":
        return {
          type,
          displayName: "Produce Supplies",
        };

      case "portable_antiviral_lab":
        return {
          type,
          displayName: "Portable antiviral Lab",
        };

      case "event":
        eventName = getRandomItem(eventNames);
        return {
          type,
          name: eventName,
          displayName: eventName,
        };

      case "epidemic":
        return {
          type,
          displayName: "Epidemic",
        };
    }
  },
);

/**
 * Some properties are mutually exclusive e.g. startingHand and count.
 * Properties are listed in priority order; the higher property
 * will override the lower.
 */
export type PlayerCardsHandParams = {
  // TODO draw matching cards from the draw pile if defined
  drawPile: PlayerCard[];

  startingHand: true;
  yellowCards: number;
  blackCards: number;
  blueCards: number;

  count: number;
};

export const playerCardsHandFactory = Factory.define<PlayerCard[], PlayerCardsHandParams>(
  ({ transientParams: { startingHand, yellowCards, blackCards, blueCards, count } }) => {
    if (startingHand) {
      return playerCardFactory.buildList(2);
    }

    const cards: PlayerCard[] = [];

    if (yellowCards) {
      cards.push(
        ...playerCardFactory.buildList(
          yellowCards,
          { type: "city" },
          { transient: { staticLocation: { colour: "yellow" } } },
        ),
      );
    }

    if (blackCards) {
      cards.push(
        ...playerCardFactory.buildList(
          blackCards,
          { type: "city" },
          { transient: { staticLocation: { colour: "black" } } },
        ),
      );
    }

    if (blueCards) {
      cards.push(
        ...playerCardFactory.buildList(
          blueCards,
          { type: "city" },
          { transient: { staticLocation: { colour: "blue" } } },
        ),
      );
    }

    // Ensure the minimum count has been reached
    if (count && cards.length < count) {
      cards.push(...playerCardFactory.buildList(count - cards.length));
    }

    // Add some random cards if nothing was specified
    if (count === undefined && cards.length === 0) {
      cards.push(...playerCardFactory.buildList(faker.number.int({ min: 1, max: 7 })));
    }

    return cards;
  },
);
