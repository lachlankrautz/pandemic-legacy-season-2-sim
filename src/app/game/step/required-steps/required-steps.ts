import { type StepType } from "../game-steps.ts";
import type { Game } from "../../game.ts";

export const HAND_LIMIT = 7;

export type RequiredStep<TStepType extends StepType> = {
  type: TStepType;
};

export type RequiredStepRule<TStepType extends StepType> = (game: Game) => RequiredStep<TStepType> | undefined;

export const mustPlayEpidemicCard: RequiredStepRule<"resolve_epidemic"> = (game) => {
  if (game.players.values().some((player) => player.cards.some((card) => card.type === "epidemic"))) {
    return {
      type: "resolve_epidemic",
    };
  }

  return;
};

export const mustDiscardExcessPlayerCards: RequiredStepRule<"discard_player_card"> = (game) => {
  if (game.players.values().some((player) => player.cards.length > HAND_LIMIT)) {
    return {
      type: "discard_player_card",
    };
  }

  return;
};
