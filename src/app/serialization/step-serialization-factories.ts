import { Factory } from "fishery";
import type { SerializableStep } from "./step-serialization.ts";
import { getRandomItem } from "../random/random.ts";
import { PlayerNames } from "../game/start/new-game.ts";
import { serializableActionFactory } from "./action-serialization-factories.ts";
import type { Player } from "../game/player/player.ts";

export const stepTypes: SerializableStep["type"][] = [
  "player_action",
  "check_for_exposure",
  "discard_player_cards",
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
      case "discard_player_cards":
        return {
          type: "discard_player_cards",
          playerName: getRandomItem(playerNames),
          // TODO this should probably be hand indexes
          cardNames: [],
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
    }
  },
);
