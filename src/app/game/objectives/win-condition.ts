import type { Game } from "../game.ts";
import { partition } from "../../../util/arrays.ts";
import type { GameLog } from "../game-log/game-log.ts";

// TODO change to be based off the game month
const REQUIRED_OBJECTIVE_COUNT = 1;

export const checkWinCondition = (game: Game, gameLog: GameLog): void => {
  const [completed, notCompleted] = partition(game.objectives, (objective) => objective.isCompleted);

  // All mandatory objectives must be completed
  if (notCompleted.some((objective) => objective.isMandatory)) {
    return;
  }

  // Not enough objectives completed
  if (completed.length < REQUIRED_OBJECTIVE_COUNT) {
    return;
  }

  game.state = {
    type: "won",
    // TODO add the completed objectives
  };
  gameLog(`Game is won!`);
};
