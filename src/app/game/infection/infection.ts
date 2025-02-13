import type { Location } from "../location/location.ts";
import type { GameLog } from "../game-log/game-log.ts";
import type { Game } from "../game.ts";

export const GAME_MAX_INCIDENTS = 8;

export const infectionRates = [
  {
    position: 1,
    cards: 2,
  },
  {
    position: 2,
    cards: 2,
  },
  {
    position: 3,
    cards: 2,
  },
  {
    position: 4,
    cards: 3,
  },
  {
    position: 5,
    cards: 3,
  },
  {
    position: 6,
    cards: 4,
  },
  {
    position: 7,
    cards: 4,
  },
  {
    position: 8,
    cards: 5,
  },
] as const satisfies { position: number; cards: number }[];

export const increaseGameInfectionRate = (game: Game, gameLog: GameLog): void => {
  game.infectionRate = getIncreasedInfectionRate(game.infectionRate);
  gameLog(`Moved infection rate to position ${game.infectionRate.position}, ${game.infectionRate.cards} cards`);
};

export const getIncreasedInfectionRate = (infectionRate: InfectionRate): InfectionRate => {
  const nextPosition = Math.min(infectionRate.position + 1, 8);
  const nextRate = infectionRates.find((rate) => rate.position === nextPosition);
  if (nextRate === undefined) {
    throw new Error("Missing infection rate", { cause: { position: nextPosition } });
  }
  return nextRate;
};

export type InfectionRate = (typeof infectionRates)[number];

export const recordGameIncident = (game: Game, location: Location, gameLog: GameLog): void => {
  game.incidents = Math.min(GAME_MAX_INCIDENTS, game.incidents + 1);
  gameLog(`Infection at ${location.name} added a plague cube, it now has ${location.plagueCubes}`);
  gameLog(`Incident count at ${game.incidents}`);
  if (game.incidents >= GAME_MAX_INCIDENTS) {
    gameLog(`Game Over: Too many incidents.`);
    game.state = {
      type: "lost",
      cause: "Too many incidents.",
    };
  }
};
