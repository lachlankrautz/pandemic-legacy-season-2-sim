import type { StepHandler } from "../step-handlers.ts";

export const handleCheckForExposure: StepHandler<"exposure_check", "check_for_exposure"> = (game, gameLog, step) => {
  gameLog(`${step.player.name} checked for exposure`);
  return {
    type: "state_changed",
    nextGameFlow: {
      type: "take_4_actions",
      player: game.turnFlow.player,
      remainingActions: 4,
    },
  };
};
