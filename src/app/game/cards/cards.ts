import type { Game } from "../game.ts";
import { partition } from "../../../util/arrays.ts";
import type { CityColour, Location } from "../location/location.ts";

export type Deck<T> = {
  drawPile: T[];
  discardPile: T[];
};
export type PlayerCard =
  | CityPlayerCard
  | PortableAntiviralLabPlayerCard
  | EpidemicPlayerCard
  | EventPlayerCard
  | ProduceSuppliesPlayerCard;

export type CityPlayerCard<TColour extends CityColour = CityColour> = {
  type: "city";
  displayName: string;
  location: Location<TColour>;
};

export type ProduceSuppliesPlayerCard = {
  type: "produce_supplies";
  displayName: string;
};

export type PortableAntiviralLabPlayerCard = {
  type: "portable_antiviral_lab";
  displayName: string;
};

export type EpidemicPlayerCard = {
  type: "epidemic";
  displayName: string;
};

export type EventPlayerCard = {
  type: "event";
  name: string;
  displayName: string;
};

export type InfectionCard = {
  location: Location;
};

/**
 * Hand limit of 7 applies at all times so playing cards
 * will always use index 0-6.
 */
export type HandCardNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PlayerCardSelection = Set<HandCardNumber>;

export type GameCardUse = Pick<Game, "turnFlow" | "playerDeck" | "gameLog">;

export type UsingHandCards = {
  selected: PlayerCard[];
  remainder: PlayerCard[];
  discardUsed: () => void;
};

export const consumeHandCards = (game: GameCardUse, selection: PlayerCardSelection): UsingHandCards => {
  const player = game.turnFlow.player;

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
