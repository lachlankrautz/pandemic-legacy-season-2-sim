import { Factory } from "fishery";
import { getRandomItem } from "../../random/random.ts";
import type {
  CheckExposureStep,
  DiscardPlayerCardStep,
  DrawInfectionCardStep,
  DrawPlayerCardStep,
  PlayerActionStep,
  PlayEventCardStep,
  ResolveEpidemicStep,
  Step,
} from "./game-steps.ts";
import { actionFactory } from "../action/action-factories.ts";
import { playerFactory } from "../player/player-factories.ts";
import { faker } from "@faker-js/faker/locale/en";

const stepTypes: Step["type"][] = [
  "player_action",
  "check_for_exposure",
  "discard_player_card",
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

export const discardPlayerCardStepFactory = Factory.define<DiscardPlayerCardStep>(({ params }) => {
  const player = playerFactory.build(params.player);
  return {
    type: "discard_player_card",
    player,
    cardIndex: faker.number.int({ min: 0, max: 10 }),
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

export const resolveEpidemicStepFactory = Factory.define<ResolveEpidemicStep>(({ params }) => {
  const player = playerFactory.build(params.player);
  return {
    type: "resolve_epidemic",
    player,
  };
});

export const stepFactory = Factory.define<Step>(({ params }) => {
  params.type ??= getRandomItem(stepTypes);
  switch (params.type) {
    case "player_action":
      return playerActionStepFactory.build(params);
    case "check_for_exposure":
      return checkForExposureStepFactory.build(params);
    case "discard_player_card":
      return discardPlayerCardStepFactory.build(params);
    case "draw_player_card":
      return drawPlayerCardStepFactory.build(params);
    case "draw_infection_card":
      return drawInfectionCardStepFactory.build(params);
    case "play_event_card":
      return playEventCardStepFactory.build(params);
    case "resolve_epidemic":
      return resolveEpidemicStepFactory.build(params);
  }
});
