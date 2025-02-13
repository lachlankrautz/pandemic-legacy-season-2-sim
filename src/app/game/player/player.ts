import type { TurnOrder } from "../game.ts";
import type { Location } from "../location/location.ts";
import type { PlayerCard } from "../cards/cards.ts";

export type GetRequiredPlayer = (name: string) => Player | never;

export const getMappedPlayer = (map: Map<string, Player>) => (name: string) => {
  const player = map.get(name);
  if (player === undefined) {
    throw new Error(`Player not found: ${name}`);
  }
  return player;
};

export type Player = {
  name: string;
  location: Location;
  turnOrder: TurnOrder;
  supplyCubes: number;
  cards: PlayerCard[];
};
