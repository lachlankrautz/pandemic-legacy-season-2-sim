import type { Game } from "../game/game.ts";

export type Repository = {
  saveGame: (name: string, game: Game) => void;
  loadGame: (name: string) => Game;
};
