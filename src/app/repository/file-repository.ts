import type { Repository } from "./repository.ts";
import type { Game } from "../game/game.ts";
import { deserializeGame, serializeGame } from "../game/serialization.ts";
import { getConfig } from "../../config/config.ts";
import * as fs from "node:fs";
import path from "node:path";

const getSaveFilePath = (name: string): string => {
  return path.resolve(getConfig().saveDir, `${name}.sav.json`);
};

export const fileRepository: Repository = {
  saveGame: (name: string, game: Game): void => {
    const save = serializeGame(game);
    fs.writeFileSync(getSaveFilePath(name), save, "utf-8");
  },
  loadGame: (name: string): Game | never => {
    const save = fs.readFileSync(getSaveFilePath(name), "utf-8");
    return deserializeGame(save);
  },
};
