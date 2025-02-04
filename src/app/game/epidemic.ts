import type { Game, InfectionCard } from "./game.ts";
import { shuffleArray } from "./random.js";

export type EpidemicResult = {
  infectCard: InfectionCard;
  cubesRemoved: number;
  previousDiscardPile: InfectionCard[];
};

export const epidemic = (game: Game): EpidemicResult => {
  // Draw a card from the bottom
  const infectCard = game.infectionDeck.drawPile.shift();
  if (infectCard === undefined) {
    throw new Error("Empty draw pile during epidemic not yet implemented");
  }

  // Remove all cubes at that location
  const cubesRemoved = infectCard.location.supplyCubes;
  infectCard.location.supplyCubes = 0;

  // Discard it
  game.infectionDeck.discardPile.push(infectCard);

  // Make a copy of the infection discard before the epidemic
  const previousDiscardPile = [...game.infectionDeck.discardPile];

  // Shuffle the discard and place on top
  const shuffledDiscard = shuffleArray(game.infectionDeck.discardPile);
  game.infectionDeck.discardPile = [];
  game.infectionDeck.drawPile.push(...shuffledDiscard);

  return {
    infectCard,
    cubesRemoved,
    previousDiscardPile,
  };
};
