import type { Repository } from "./repository.ts";
import type { Game } from "../game/game.ts";
import { deserializeGame, serializeGame } from "../game/serialization.ts";
import { getConfig } from "../../config/config.ts";
import * as fs from "node:fs";
import path from "node:path";
import type { Logger } from "../logging/logger.ts";

const getSaveFilePath = (name: string): string => {
  return path.resolve(getConfig().saveDir, `${name}.sav.json`);
};

export const makeFileRepository = (logger: Logger): Repository => ({
  saveGame: (name: string, game: Game): void => {
    const save = serializeGame(game);

    const fileName = getSaveFilePath(name);
    logger.info(`saving game to file: ${path.basename(fileName)}`);

    fs.writeFileSync(fileName, save, "utf-8");
  },
  loadGame: (name: string): Game | never => {
    const fileName = getSaveFilePath(name);
    logger.info(`loading game from file: ${fileName}`);

    const save = fs.readFileSync(fileName, "utf-8");
    return deserializeGame(save);
  },
});
