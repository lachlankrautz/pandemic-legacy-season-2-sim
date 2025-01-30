import type { Repository } from "./repository.ts";
import type { Game } from "../game/game.ts";

export const fileRepository: Repository = {
  saveGame: (name: string, game: Game) => {
    //
  },
  loadGame: (name: string): Game => {
    //
  },
};
