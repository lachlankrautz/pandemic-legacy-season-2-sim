import type { ChangedStepResult } from "../step/game-steps.ts";
import type { BuildSupplyCentresObjective } from "../game.ts";
import type { GameLog } from "../game-log/game-log.ts";

export const checkSupplyCentres = (
  objective: BuildSupplyCentresObjective,
  gameLog: GameLog,
  result: ChangedStepResult,
): void => {
  if (result.builtSupplyCentre) {
    objective.hasBuiltCount++;
  }

  if (objective.mustBuildCount <= objective.hasBuiltCount) {
    objective.isCompleted = true;
    gameLog(`${objective.type} is completed`);
  }
};
