import type { Repository } from "./repository.ts";
import type { Game } from "../game/game.ts";
import { getConfig } from "../../config/config.ts";
import * as fs from "node:fs";
import path from "node:path";
import type { Logger } from "../logging/logger.ts";
import { deserializeGame, serializeGame } from "../serialization/game-serialization.ts";

const getSaveFilePath = (name: string): string => {
  return path.resolve(getConfig().saveDir, `${name}.sav.json`);
};

export const makeFileRepository = (logger: Logger): Repository => ({
  loadGame: (name: string): Game | never => {
    const fileName = getSaveFilePath(name);
    logger.debug(`loading game from file: ${path.basename(fileName)}`);

    let save;
    try {
      save = fs.readFileSync(fileName, "utf-8");
    } catch (error: unknown) {
      throw new Error(`Failed to load game from file: ${fileName}`, { cause: error });
    }

    return deserializeGame(save);
  },
  saveGame: (name: string, game: Game): void => {
    const save = serializeGame(game);

    const fileName = getSaveFilePath(name);
    logger.debug(`saving game to file: ${path.basename(fileName)}`);

    try {
      fs.writeFileSync(fileName, save, "utf-8");
    } catch (error: unknown) {
      throw new Error(`Failed to save game to file: ${fileName}`, { cause: error });
    }
  },
});
