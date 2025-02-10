import { Factory } from "fishery";
import type { SerializableStep } from "./step-serialization.ts";
import { getRandomItem } from "../random/random.ts";
import { PlayerNames } from "../game/start/new-game.ts";
import { serializableActionFactory } from "./action-serialization-factories.ts";

const stepTypes: SerializableStep["type"][] = [
  "player_action",
  "check_for_exposure",
  "discard_player_cards",
  "draw_player_card",
  "draw_infection_card",
  "play_event_card",
] as const;

export type SerializableStepParams = {
  type: SerializableStep["type"];
};

export const serializableStepFactory = Factory.define<SerializableStep, SerializableStepParams>(
  ({ transientParams: { type } }) => {
    type ??= getRandomItem(stepTypes);
    switch (type) {
      case "player_action":
        return {
          type: "player_action",
          playerName: getRandomItem(Object.values(PlayerNames)),
          action: serializableActionFactory.build(),
        };
      case "check_for_exposure":
        return {
          type: "check_for_exposure",
          playerName: getRandomItem(Object.values(PlayerNames)),
        };
      case "discard_player_cards":
        return {
          type: "discard_player_cards",
          playerName: getRandomItem(Object.values(PlayerNames)),
          // TODO this should probably be hand indexes
          cardNames: [],
        };
      case "draw_player_card":
        return {
          type: "draw_player_card",
          playerName: getRandomItem(Object.values(PlayerNames)),
        };
      case "draw_infection_card":
        return {
          type: "draw_infection_card",
          playerName: getRandomItem(Object.values(PlayerNames)),
        };
      case "play_event_card":
        return {
          type: "play_event_card",
          playerName: getRandomItem(Object.values(PlayerNames)),
          TODO_defineComplexChoices: undefined,
        };
    }
  },
);
