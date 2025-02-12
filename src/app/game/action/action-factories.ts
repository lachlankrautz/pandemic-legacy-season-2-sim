import { Factory } from "fishery";
import { getRandomItem } from "../../random/random.ts";
import { faker } from "@faker-js/faker/locale/en";
import { Action, type DropSupplies, type MakeSupplies, type MakeSupplyCentre, type Move } from "./actions.ts";
import { LocationNames } from "../location/location.ts";

export type ActionParams = {
  type: Action["type"];
  locationNames: string[];
};

export const moveActionFactory = Factory.define<Move, Omit<ActionParams, "type">>(
  ({ transientParams: { locationNames } }) => {
    return {
      type: "move",
      isFree: false,
      toLocationName: getRandomItem(locationNames || Object.values(LocationNames)),
    };
  },
);

export const makeSuppliesActionFactory = Factory.define<MakeSupplies, Omit<ActionParams, "type" | "locationNames">>(
  () => {
    return {
      type: "make_supplies",
      isFree: false,
    };
  },
);

export const dropSuppliesActionFactory = Factory.define<DropSupplies, Omit<ActionParams, "type">>(() => {
  return {
    type: "drop_supplies",
    isFree: false,
    supplyCubes: faker.number.int({ min: 1, max: 3 }),
  };
});

export const makeSupplyCentreActionFactory = Factory.define<MakeSupplyCentre, Omit<ActionParams, "type">>(() => {
  return {
    type: "make_supply_centre",
    isFree: false,
    // TODO figure out how to faker a random set respecting the hand index
    cardSelection: new Set([0, 1, 2, 3, 4]),
  };
});

export const actionFactory = Factory.define<Action, ActionParams>(({ transientParams: { type, locationNames } }) => {
  type ??= getRandomItem(["move", "make_supplies", "drop_supplies", "make_supply_centre"]);

  switch (type) {
    case "move":
      return moveActionFactory.build(undefined, { transient: { ...(locationNames ? { locationNames } : {}) } });
    case "drop_supplies":
      return dropSuppliesActionFactory.build();
    case "make_supplies":
      return makeSuppliesActionFactory.build();
    case "make_supply_centre":
      return makeSupplyCentreActionFactory.build();
  }
});
