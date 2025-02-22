import { type StepHandler } from "../step-handlers.ts";
import { partitionOne } from "../../../../util/arrays.ts";
import { epidemic } from "../../infection/epidemic.js";

export const handleResolveEpidemic: StepHandler = ({ game, gameLog }) => {
  const [epidemicCard, remainingCards] = partitionOne(game.turnFlow.player.cards, (card) => card.type === "epidemic");
  if (epidemicCard === undefined) {
    return {
      type: "no_effect",
      cause: "player does not have an epidemic card to resolve",
    };
  }

  epidemic(game, gameLog);

  game.turnFlow.player.cards = remainingCards;
  game.playerDeck.discardPile.push(epidemicCard);

  return {
    type: "state_changed",
  };
};
