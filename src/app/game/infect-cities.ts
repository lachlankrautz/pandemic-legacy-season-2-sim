import { type Game, type GameLog, increaseGameInjectionRate, type Location, recordGameIncident } from "./game.ts";
import { shuffleArray } from "./random.ts";

const MAX_PLAGUE_CUBES = 3;

/**
 * If empty shuffle and up the infection rate.
 */
export const nextInfectionCardLocation = (game: Game, gameLog: GameLog): Location => {
  if (game.infectionDeck.drawPile.length === 0) {
    game.infectionDeck.drawPile = shuffleArray(game.infectionDeck.discardPile);
    game.infectionDeck.discardPile = [];
    gameLog("Reshuffled empty infection deck");

    increaseGameInjectionRate(game, gameLog);
  }

  const card = game.infectionDeck.drawPile.pop();
  if (card === undefined) {
    // This game is broken and can't be played.
    throw new Error("Infection deck cannot be empty!");
  }

  game.infectionDeck.discardPile.push(card);

  return card.location;
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
  infectionCardLocation: Location;
  cities: Record<string, InfectedCity | undefined>;
  maybeEnd: MaybeGameEnd;
};

export const drawInfectionCard = (game: Game, gameLog: GameLog): DrawInfectionCardResult => {
  const infectionCardLocation = nextInfectionCardLocation(game, gameLog);
  gameLog(`Drew an infection card: ${infectionCardLocation.name}`);

  const result: DrawInfectionCardResult = {
    infectionCardLocation,
    cities: {},
    maybeEnd: { type: "game_continues" },
  };

  infectCity(game, infectionCardLocation, result, gameLog);

  return result;
};

export type MaybeGameEnd =
  | {
      type: "game_over";
      cause: string;
    }
  | {
      type: "game_continues";
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
    result.maybeEnd = recordGameIncident(game, location, gameLog);
    return;
  }

  // Outbreak!
  cityResult.outbreak = true;
  for (const connection of location.connections) {
    infectCity(game, connection.location, result, gameLog);
    // Don't infect more cities if the game has already ended.
    if (result.maybeEnd.type === "game_over") {
      return;
    }
  }
};
