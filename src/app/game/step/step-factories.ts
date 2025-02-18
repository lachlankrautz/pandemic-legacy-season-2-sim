import { Factory } from "fishery";
import { getRandomItem } from "../../random/random.ts";
import type {
  CheckExposureStep,
  DiscardPlayerCardsStep,
  DrawInfectionCardStep,
  DrawPlayerCardStep,
  PlayerActionStep,
  PlayEventCardStep,
  Step,
} from "./game-steps.ts";
import { actionFactory } from "../action/action-factories.ts";
import { playerFactory } from "../player/player-factories.ts";

const stepTypes: Step["type"][] = [
  "player_action",
  "check_for_exposure",
  "discard_player_cards",
  "draw_player_card",
  "draw_infection_card",
  "play_event_card",
] as const;

// export type StepParams = {
// };

export const playerActionStepFactory = Factory.define<PlayerActionStep>(({ params }) => {
  const player = playerFactory.build(params.player);
  return {
    type: "player_action",
    player,
    action: actionFactory.build(params.action),
  };
});

export const checkForExposureStepFactory = Factory.define<CheckExposureStep>(({ params }) => {
  const player = playerFactory.build(params.player);
  return {
    type: "check_for_exposure",
    player,
  };
});

export const discardPlayerCardsStepFactory = Factory.define<DiscardPlayerCardsStep>(({ params }) => {
  const player = playerFactory.build(params.player);
  return {
    type: "discard_player_cards",
    player,
    // TODO this should probably be hand indexes
    cardNames: [],
  };
});

export const drawPlayerCardStepFactory = Factory.define<DrawPlayerCardStep>(({ params }) => {
  const player = playerFactory.build(params.player);
  return {
    type: "draw_player_card",
    player,
  };
});

export const drawInfectionCardStepFactory = Factory.define<DrawInfectionCardStep>(({ params }) => {
  const player = playerFactory.build(params.player);
  return {
    type: "draw_infection_card",
    player,
  };
});

export const playEventCardStepFactory = Factory.define<PlayEventCardStep>(({ params }) => {
  const player = playerFactory.build(params.player);
  return {
    type: "play_event_card",
    player,
    TODO_defineComplexChoices: undefined,
  };
});

export const stepFactory = Factory.define<Step>(({ params }) => {
  params.type ??= getRandomItem(stepTypes);
  switch (params.type) {
    case "player_action":
      return playerActionStepFactory.build(params);
    case "check_for_exposure":
      return checkForExposureStepFactory.build(params);
    case "discard_player_cards":
      return discardPlayerCardsStepFactory.build(params);
    case "draw_player_card":
      return drawPlayerCardStepFactory.build(params);
    case "draw_infection_card":
      return drawInfectionCardStepFactory.build(params);
    case "play_event_card":
      return playEventCardStepFactory.build(params);
  }
});
