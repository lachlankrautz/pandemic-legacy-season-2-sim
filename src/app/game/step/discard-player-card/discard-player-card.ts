import type { StepHandler } from "../step-handlers.ts";
import { HAND_LIMIT } from "../required-steps/required-steps.ts";
import type { TurnFlowType } from "../../game-flow/game-turn-flow.ts";
import { partitionOne } from "../../../../util/arrays.ts";

export const handleDiscardPlayerCard: StepHandler<TurnFlowType, "discard_player_card"> = ({ game, gameLog, step }) => {
  const player = game.turnFlow.player;
  if (player.cards.length <= HAND_LIMIT) {
    return {
      type: "no_effect",
      cause: `${player.name} only has ${player.cards.length} card(s)`,
    };
  }

  const [toDiscard, toKeep] = partitionOne(player.cards, (_, index) => index === step.cardIndex);

  if (toDiscard === undefined) {
    return {
      type: "no_effect",
      cause: `${player.name} does not have card index: ${step.cardIndex}`,
    };
  }

  player.cards = toKeep;
  game.playerDeck.discardPile.push(toDiscard);
  gameLog(`${player.name} discard ${toDiscard.displayName}`);

  return {
    type: "state_changed",
  };
};
