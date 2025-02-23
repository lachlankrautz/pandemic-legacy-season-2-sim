import { checkSupplyCentres } from "./create-supply-centres.ts";
import { checkWinCondition } from "./win-condition.ts";
import type { StepResult } from "../step/game-steps.ts";
import type { Game } from "../game.ts";
import type { GameLog } from "../game-log/game-log.ts";

export const checkObjectives = (game: Game, gameLog: GameLog, result: StepResult): void => {
  if (result.type === "no_effect") {
    return;
  }

  for (const objective of game.objectives) {
    if (objective.type === "build_supply_centres") {
      checkSupplyCentres(objective, gameLog, result);
    }
  }

  checkWinCondition(game, gameLog);
};
