import { cardDisplayName } from "../../location/location.ts";
import { StepHandler } from "../step-handlers.ts";
import type { StepResult } from "../game-steps.ts";

export const handleDrawPlayerCard: StepHandler<"draw_2_cards", "draw_player_card"> = (game, gameLog, step) => {
  const playerCard = game.playerDeck.drawPile.pop();

  // Players ran out of time.
  if (playerCard === undefined) {
    gameLog("Game Over: Unable to draw card, player deck is empty.");
    game.state = {
      type: "lost",
      cause: "Unable to draw card, player deck is empty.",
    };
    return { type: "state_changed" };
  }
  gameLog(`${step.player.name} received ${cardDisplayName(playerCard)} card`);

  const result: StepResult = {
    type: "state_changed",
  };

  if (game.turnFlow.remainingCards <= 1) {
    result.nextGameFlow = {
      type: "infect_cities",
      player: step.player,
      remainingCards: game.infectionRate.cards,
    };
  } else {
    const remainingCards = game.turnFlow.remainingCards - 1;
    result.nextGameFlow = {
      type: "draw_2_cards",
      player: step.player,
      remainingCards: remainingCards,
    };
    gameLog(`${step.player.name} has ${remainingCards} player card(s) remaining`);
  }

  return result;
};
