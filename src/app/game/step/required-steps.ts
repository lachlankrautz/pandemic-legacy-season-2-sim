import { Step, type StepType } from "./game-steps.ts";
import type { Game } from "../game.ts";

export type RequiredStep<TStepType extends StepType = StepType> = {
  type: TStepType;
};

export type RequiredStepRule<TStepType extends StepType = StepType> = (
  game: Game,
) => RequiredStep<TStepType> | undefined;

export const mustPlayEpidemicCard: RequiredStepRule = (game) => {
  if (game.players.values().some((player) => player.cards.some((card) => card.type === "epidemic"))) {
    return {
      type: "resolve_epidemic",
    };
  }

  return;
};

const rules: RequiredStepRule[] = [mustPlayEpidemicCard];

export const getRequiredSteps = (game: Game): RequiredStep[] => {
  return rules.map((rule) => rule(game)).filter(Boolean);
};

export const isLegalStep = (requiredSteps: RequiredStep[], step: Step): boolean => {
  return requiredSteps.some((requiredStep) => requiredStep.type === step.type);
};
