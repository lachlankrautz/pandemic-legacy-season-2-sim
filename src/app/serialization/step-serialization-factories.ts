import { Factory } from "fishery";
import type { SerializableStep } from "./step-serialization.ts";
import { getRandomItem } from "../random/random.ts";
import { PlayerNames } from "../game/start/new-game.ts";
import { serializableActionFactory } from "./action-serialization-factories.ts";
import type { Player } from "../game/player/player.ts";
import { faker } from "@faker-js/faker/locale/en";

export const stepTypes: SerializableStep["type"][] = [
  "player_action",
  "check_for_exposure",
  "discard_player_card",
  "draw_player_card",
  "draw_infection_card",
  "play_event_card",
] as const;

export type SerializableStepParams = {
  playerMap: Map<string, Player>;
};

export const serializableStepFactory = Factory.define<SerializableStep, SerializableStepParams>(
  ({ params: { type }, transientParams: { playerMap } }) => {
    type ??= getRandomItem(stepTypes);

    // Use names from players available in map
    const playerNames: string[] = playerMap ? playerMap.keys().toArray() : Object.values(PlayerNames);

    switch (type) {
      case "player_action":
        return {
          type: "player_action",
          playerName: getRandomItem(playerNames),
          action: serializableActionFactory.build(),
        };
      case "check_for_exposure":
        return {
          type: "check_for_exposure",
          playerName: getRandomItem(playerNames),
        };
      case "discard_player_card":
        return {
          type: "discard_player_card",
          playerName: getRandomItem(playerNames),
          cardIndex: faker.number.int({ min: 0, max: 10 }),
        };
      case "draw_player_card":
        return {
          type: "draw_player_card",
          playerName: getRandomItem(playerNames),
        };
      case "draw_infection_card":
        return {
          type: "draw_infection_card",
          playerName: getRandomItem(playerNames),
        };
      case "play_event_card":
        return {
          type: "play_event_card",
          playerName: getRandomItem(playerNames),
          TODO_defineComplexChoices: undefined,
        };
      case "resolve_epidemic":
        return {
          type: "resolve_epidemic",
          playerName: getRandomItem(playerNames),
        };
    }
  },
);
