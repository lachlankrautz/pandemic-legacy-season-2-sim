import { type StepHandler } from "../step-handlers.ts";
import { drawInfectionCard } from "../../infection/infect-cities.ts";
import { getNextTurnOrder } from "../../game.ts";
import type { StepResult } from "../game-steps.ts";

export const handleDrawInfectionCard: StepHandler<"infect_cities", "draw_infection_card"> = ({
  game,
  gameLog,
  step,
}) => {
  drawInfectionCard(game, gameLog);
  if (game.state.type !== "playing") {
    return { type: "state_changed" };
  }

  const result: StepResult = {
    type: "state_changed",
  };

  if (game.turnFlow.remainingCards <= 1) {
    const nextTurnOrder = getNextTurnOrder(game.turnFlow.player.turnOrder);
    const nextPlayer = Array.from(game.players.values()).find((player) => player.turnOrder === nextTurnOrder);
    if (nextPlayer === undefined) {
      throw new Error("Unable to find the next player in turn order");
    }
    gameLog(`Turn passed to ${game.turnFlow.player.name}`);
    result.nextGameFlow = {
      type: "exposure_check",
      player: nextPlayer,
    };
  } else {
    const remainingCards = game.turnFlow.remainingCards - 1;
    result.nextGameFlow = {
      type: "infect_cities",
      player: game.turnFlow.player,
      remainingCards,
    };
    gameLog(`${step.player.name} has ${remainingCards} infection card(s) remaining`);
  }

  return result;
};
