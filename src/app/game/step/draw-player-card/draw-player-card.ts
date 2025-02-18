import { cardDisplayName } from "../../location/location.ts";
import { epidemic } from "../../infection/epidemic.ts";
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

  if (playerCard.type === "epidemic") {
    epidemic(game, gameLog);
  } else {
    step.player.cards.push(playerCard);
  }

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
    game.turnFlow.remainingCards--;
    gameLog(`${step.player.name} has ${game.turnFlow.remainingCards} player card(s) remaining`);
  }

  return result;
};
