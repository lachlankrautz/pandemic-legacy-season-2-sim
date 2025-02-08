import type { Game, GameFlowTurn, PlayerCard, PlayerCardSelection } from "./game.ts";
import { partition } from "../../util/arrays.ts";

export type UsingHandCards = {
  selected: PlayerCard[];
  remainder: PlayerCard[];
  discardUsed: () => void;
};

export const useHandCards = (game: Game<GameFlowTurn>, selection: PlayerCardSelection): UsingHandCards => {
  const player = game.gameFlow.player;

  const [selected, remainder] = partition(player.cards, (_, index) => selection.has(index));

  return {
    selected,
    remainder,
    discardUsed: () => {
      game.playerDeck.discardPile.push(...selected);
      player.cards = remainder;
      remainder.forEach((card) => game.gameLog.push(`${player.name} discarded ${card.displayName}`));
    },
  };
};
