import type { GameLog } from "../game-log/game-log.ts";
import { isStepOnType, type StepOnType, type StepResult, type StepType } from "./game-steps.ts";
import { handleCheckForExposure } from "./check-for-exposure/check-for-exposure.ts";
import { handlePlayerAction } from "./take-player-actions/take-player-actions.ts";
import { handleDrawPlayerCard } from "./draw-player-card/draw-player-card.ts";
import { handleDrawInfectionCard } from "./draw-infection-card/draw-infection-card.ts";
import { type GameOnType, isGameOnType, type TurnFlowType } from "../game-flow/game-turn-flow.ts";
import {
  mustDiscardExcessPlayerCards,
  mustPlayEpidemicCard,
  type RequiredStepRule,
} from "./required-steps/required-steps.ts";
import { handleResolveEpidemic } from "./resolve-epidemic/resolve-epidemic.ts";
import { handleDiscardPlayerCard } from "./discard-player-card/discard-player-card.ts";

export type StepHandlerInput<TFlowType extends TurnFlowType = TurnFlowType, TStepType extends StepType = StepType> = {
  game: GameOnType<TFlowType>;
  gameLog: GameLog;
  step: StepOnType<TStepType>;
};

export type ChainedStepHandler<TFlowType extends TurnFlowType = TurnFlowType, TStepType extends StepType = StepType> = (
  input: StepHandlerInput<TFlowType, TStepType>,
  next: StepHandler,
) => StepResult;

export type StepHandler<TFlowType extends TurnFlowType = TurnFlowType, TStepType extends StepType = StepType> = (
  input: StepHandlerInput<TFlowType, TStepType>,
) => StepResult;

/**
 * If the wrapped handler is a match pass input with narrowed type.
 */
export const handleTurnFlowStep = <
  TFlowType extends TurnFlowType = TurnFlowType,
  TStepType extends StepType = StepType,
>(
  flowType: TFlowType,
  stepType: TStepType,
  handler: StepHandler<TFlowType, TStepType>,
): ChainedStepHandler => {
  return ({ game, gameLog, step }, next) => {
    if (!isGameOnType(game, flowType)) {
      return next({ game, gameLog, step });
    }

    if (!isStepOnType(step, stepType)) {
      return next({ game, gameLog, step });
    }

    return handler({ game, gameLog, step });
  };
};

export const handleRequiredStep = <TStepType extends StepType>(
  rule: RequiredStepRule<TStepType>,
  handler: StepHandler<TurnFlowType, TStepType>,
): ChainedStepHandler => {
  return ({ game, gameLog, step }, next) => {
    const requiredStep = rule(game);

    // Step is not required
    if (requiredStep === undefined) {
      return next({ game, gameLog, step });
    }

    // Input step is invalid, only the required step is acceptable
    if (!isStepOnType(step, requiredStep.type)) {
      return {
        type: "no_effect",
        cause: `Cannot perform ${step.type}; step ${requiredStep.type} is required`,
      };
    }

    return handler({ game, gameLog, step });
  };
};

export const chainHandlers = (...handlers: ChainedStepHandler[]): StepHandler => {
  const unhandled: StepHandler = ({ game, step }) => {
    // TODO is this a cheat?
    //      should there actually be a null or should a step
    //      that matches no handlers never be sent in the first place?
    throw new Error(`Step type ${step.type} for game on turn flow ${game.turnFlow.type} not handled`);
  };

  return handlers
    .reverse()
    .reduce((next: StepHandler, handler: ChainedStepHandler) => (input) => handler(input, next), unhandled);
};

export const stepHandlers = chainHandlers(
  handleRequiredStep(mustPlayEpidemicCard, handleResolveEpidemic),
  handleRequiredStep(mustDiscardExcessPlayerCards, handleDiscardPlayerCard),
  handleTurnFlowStep("exposure_check", "check_for_exposure", handleCheckForExposure),
  handleTurnFlowStep("take_4_actions", "player_action", handlePlayerAction),
  handleTurnFlowStep("draw_2_cards", "draw_player_card", handleDrawPlayerCard),
  handleTurnFlowStep("infect_cities", "draw_infection_card", handleDrawInfectionCard),
);
