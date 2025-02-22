import { takeAction } from "../../action/actions.ts";
import { type StepHandler } from "../step-handlers.ts";

export const handlePlayerAction: StepHandler<"take_4_actions", "player_action"> = ({ game, gameLog, step }) => {
  const result = takeAction(game, step.action, gameLog);

  if (result.type === "state_changed" && !step.action.isFree) {
    if (game.turnFlow.remainingActions <= 1) {
      gameLog(`All actions taken`);
      result.nextGameFlow = {
        type: "draw_2_cards",
        player: step.player,
        remainingCards: 2,
      };
    } else {
      const remainingActions = game.turnFlow.remainingActions - 1;
      result.nextGameFlow = {
        type: "take_4_actions",
        player: step.player,
        remainingActions,
      };
      gameLog(`${step.player.name} has ${remainingActions} action(s) remaining`);
    }
  }

  return result;
};
