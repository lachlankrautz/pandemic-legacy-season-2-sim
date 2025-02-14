import { Factory } from "fishery";
import { type Location } from "../location/location.ts";
import { locationFactory } from "../location/location-factories.ts";
import type { InfectionCard } from "../cards/cards.ts";

export type InfectionCardParams = {
  locationMap: Map<string, Location>;
};

export const infectionCardFactory = Factory.define<InfectionCard, InfectionCardParams>(
  ({ params, transientParams: { locationMap } }) => {
    return {
      location: locationFactory.build(params?.location, {
        transient: {
          ...(locationMap ? { locationMap } : {}),
        },
      }),
    };
  },
);
