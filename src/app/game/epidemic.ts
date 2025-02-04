import { type Game, type GameLog, increaseGameInjectionRate, type InfectionCard } from "./game.ts";
import { shuffleArray } from "./random.ts";

export type EpidemicResult = {
  infectCard: InfectionCard;
  cubesRemoved: number;
  previousDiscardPile: InfectionCard[];
};

export const epidemic = (game: Game, gameLog: GameLog): EpidemicResult => {
  // Increase
  increaseGameInjectionRate(game, gameLog);

  // Draw a card from the bottom
  const infectCard = game.infectionDeck.drawPile.shift();
  if (infectCard === undefined) {
    throw new Error("Empty draw pile during epidemic not yet implemented");
  }

  // Remove all cubes at that location
  const cubesRemoved = infectCard.location.supplyCubes;
  infectCard.location.supplyCubes = 0;
  gameLog(`Epidemic at ${infectCard.location.name} removed ${cubesRemoved} supply cubes, 0 cubes remain.`);

  // Discard it
  game.infectionDeck.discardPile.push(infectCard);

  // Make a copy of the infection discard before the epidemic
  const previousDiscardPile = [...game.infectionDeck.discardPile];

  // Shuffle the discard and place on top
  const shuffledDiscard = shuffleArray(game.infectionDeck.discardPile);
  game.infectionDeck.discardPile = [];
  game.infectionDeck.drawPile.push(...shuffledDiscard);

  gameLog(`Intensified the infection deck, ${previousDiscardPile.length} card(s) added on top of the draw deck`);

  return {
    infectCard,
    cubesRemoved,
    previousDiscardPile,
  };
};
