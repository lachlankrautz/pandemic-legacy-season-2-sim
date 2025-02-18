import type { GameLog } from "../game-log/game-log.ts";
import { isStepOnType, type StepOnType, type StepResult, type StepType } from "./game-steps.ts";
import { handleCheckForExposure } from "./check-for-exposure/check-for-exposure.ts";
import { handlePlayerAction } from "./take-player-actions/take-player-actions.ts";
import { handleDrawPlayerCard } from "./draw-player-card/draw-player-card.ts";
import { handleDrawInfectionCard } from "./draw-infection-card/draw-infection-card.ts";
import { type GameOnType, isGameOnType, type TurnFlowType } from "../game-flow/game-turn-flow.ts";

export type StepHandler<TFlowType extends TurnFlowType = TurnFlowType, TStepType extends StepType = StepType> = (
  game: GameOnType<TFlowType>,
  gameLog: GameLog,
  step: StepOnType<TStepType>,
) => StepResult;

export type StepHandlers = Record<StepType, StepHandler>;

export const handleStepTiming = <TFlowType extends TurnFlowType = TurnFlowType, TStepType extends StepType = StepType>(
  flowType: TFlowType,
  stepType: TStepType,
  handler: StepHandler<TFlowType, TStepType>,
): StepHandler => {
  return (game, gameLog, step) => {
    if (!isGameOnType(game, flowType)) {
      return {
        type: "no_effect",
        cause: "Wrong game turn flow",
      };
    }

    if (!isStepOnType(step, stepType)) {
      return {
        type: "no_effect",
        cause: "Wrong step type for handler",
      };
    }

    return handler(game, gameLog, step);
  };
};

export const stepHandlers: Pick<
  StepHandlers,
  "check_for_exposure" | "player_action" | "draw_player_card" | "draw_infection_card"
> = {
  ["check_for_exposure"]: handleStepTiming("exposure_check", "check_for_exposure", handleCheckForExposure),
  ["player_action"]: handleStepTiming("take_4_actions", "player_action", handlePlayerAction),
  ["draw_player_card"]: handleStepTiming("draw_2_cards", "draw_player_card", handleDrawPlayerCard),
  ["draw_infection_card"]: handleStepTiming("infect_cities", "draw_infection_card", handleDrawInfectionCard),
  // ["play_event_card"]: () => undefined,
  // ["discard_player_cards"]: () => undefined,
};
