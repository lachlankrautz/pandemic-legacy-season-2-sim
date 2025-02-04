import {
  type Game,
  type GameLog,
  getIncreasedInfectionRate,
  type InfectionCard,
  type Location,
  recordGameIncident,
} from "./game.ts";
import { shuffleArray } from "./random.ts";

const MAX_PLAGUE_CUBES = 3;

/**
 * If empty shuffle and up the infection rate.
 */
export const nextInfectionCard = (game: Game, gameLog: GameLog): InfectionCard => {
  if (game.infectionDeck.discardPile.length === 0) {
    game.infectionDeck.drawPile = shuffleArray(game.infectionDeck.discardPile);
    game.infectionDeck.discardPile = [];
    gameLog("Reshuffled empty infection deck");

    game.infectionRate = getIncreasedInfectionRate(game.infectionRate);
    gameLog(`Moved infection rate to position ${game.infectionRate.position}, ${game.infectionRate.cards} cards`);
  }

  const card = game.infectionDeck.drawPile.pop();
  if (card === undefined) {
    // This game is broken and can't be played.
    throw new Error("Infection deck cannot be empty!");
  }

  return card;
};

export type InfectedCity = {
  location: Location;
  supplyCubesRemoved: number;
  plagueCubesAdded: number;
  outbreak: boolean;
};

export const newInfectedCity = (location: Location): InfectedCity => ({
  location,
  supplyCubesRemoved: 0,
  plagueCubesAdded: 0,
  outbreak: false,
});

export type DrawInfectionCardResult = {
  card: InfectionCard;
  cities: Record<string, InfectedCity | undefined>;
};

export const drawInfectionCard = (game: Game, gameLog: GameLog): DrawInfectionCardResult => {
  const card = nextInfectionCard(game, gameLog);

  const result: DrawInfectionCardResult = {
    card,
    cities: {},
  };

  infectCity(game, card.location, result, gameLog);

  return result;
};

export const infectCity = (game: Game, location: Location, result: DrawInfectionCardResult, gameLog: GameLog): void => {
  const cityResult = (result.cities[location.name] ??= newInfectedCity(location));

  // Each city can only outbreak once in a single infection chain.
  if (cityResult.outbreak) {
    return;
  }

  // Use supply cubes
  if (location.supplyCubes < 0) {
    location.supplyCubes--;
    cityResult.supplyCubesRemoved++;
    gameLog(`Infection at ${location.name} removed a supply cube, ${location.supplyCubes} cube(s) remain.`);
    return;
  }

  // Add a plague cube
  if (location.plagueCubes < MAX_PLAGUE_CUBES) {
    location.plagueCubes++;
    cityResult.plagueCubesAdded++;
    recordGameIncident(game, location, gameLog);
    return;
  }

  // Outbreak!
  cityResult.outbreak = true;
  for (const connection of location.connections) {
    infectCity(game, connection.location, result, gameLog);

    // Don't infect more cities if the game has already ended.
    if (game.gameFlow.type === "game_over") {
      return;
    }
  }
};
