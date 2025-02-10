import { Factory } from "fishery";
import type { SerializableAction } from "./action-serialization.ts";
import { LocationNames } from "../game/game.ts";
import { getRandomItem } from "../random/random.ts";
import { faker } from "@faker-js/faker/locale/en";

export type SerializableActionParams = {
  type: SerializableAction["type"];
  locationNames: string[];
};

export const serializableActionFactory = Factory.define<SerializableAction, SerializableActionParams>(
  ({ transientParams: { type, locationNames } }) => {
    type ??= getRandomItem(["move", "make_supplies", "drop_supplies", "make_supply_centre"]);

    switch (type) {
      case "move":
        return {
          type: "move",
          isFree: false,
          toLocationName: getRandomItem(locationNames || Object.values(LocationNames)),
        };
      case "drop_supplies":
        return {
          type: "drop_supplies",
          isFree: false,
          supplyCubes: faker.number.int({ min: 1, max: 3 }),
        };
      case "make_supplies":
        return {
          type: "make_supplies",
          isFree: false,
        };
      case "make_supply_centre":
        return {
          type: "make_supply_centre",
          isFree: false,
          // TODO figure out how to faker a random set respecting the hand index
          cardSelection: [0, 1, 2, 3, 4],
        };
    }
  },
);
