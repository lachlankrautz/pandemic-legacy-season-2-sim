import { Factory } from "fishery";
import { getRandomItem } from "../../random/random.ts";
import type { Step } from "./game-steps.ts";
import { actionFactory } from "../action/action-factories.ts";
import { PlayerNames } from "../start/new-game.ts";
import type { Player } from "../player/player.ts";
import { LocationNames } from "../location/location.ts";

const stepTypes: Step["type"][] = [
  "player_action",
  "check_for_exposure",
  "discard_player_cards",
  "draw_player_card",
  "draw_infection_card",
  "play_event_card",
] as const;

export type StepParams = {
  player: Player;
};

export const stepFactory = Factory.define<Step, StepParams>(({ params: { type }, transientParams: { player } }) => {
  type ??= getRandomItem(stepTypes);

  // TODO this needs to be remade so that
  //      new locations are created from an enum
  //      that ensures name, colour and type match up
  player ??= {
    name: getRandomItem(Object.values(PlayerNames)),
    location: {
      name: getRandomItem(Object.values(LocationNames)),
      type: "inland",
      colour: "yellow",
      supplyCubes: 0,
      plagueCubes: 0,
      supplyCentre: false,
      connections: [],
      players: [],
    },
    turnOrder: getRandomItem([1, 2, 3, 4]),
    supplyCubes: 0,
    cards: [],
  };

  switch (type) {
    case "player_action":
      return {
        type: "player_action",
        player,
        action: actionFactory.build(),
      };
    case "check_for_exposure":
      return {
        type: "check_for_exposure",
        player,
      };
    case "discard_player_cards":
      return {
        type: "discard_player_cards",
        player,
        // TODO this should probably be hand indexes
        cardNames: [],
      };
    case "draw_player_card":
      return {
        type: "draw_player_card",
        player,
      };
    case "draw_infection_card":
      return {
        type: "draw_infection_card",
        player,
      };
    case "play_event_card":
      return {
        type: "play_event_card",
        player,
        TODO_defineComplexChoices: undefined,
      };
  }
});
