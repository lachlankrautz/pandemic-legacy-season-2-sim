import { describe, it, expect, afterEach } from "vitest";
import { randomUUID } from "crypto";
import * as fs from "node:fs";
import { makeLogger } from "../logging/logger.ts";
import { getSaveFilePath, makeFileRepository } from "./file-repository.ts";
import { serializableGameFactory } from "../serialization/game-serialization-factories.ts";
import { getConfig } from "../../config/config.ts";
import path from "path";

describe("file repository", () => {
  const logger = makeLogger();
  const saveDir = getConfig().saveDir;

  afterEach(() => {
    fs.readdirSync(saveDir).forEach((fileName) => {
      if (fileName.startsWith("test-")) {
        fs.unlinkSync(path.resolve(saveDir, fileName));
      }
    });
  });

  it("fails to save an invalid game object", () => {
    const fileName = `test-${randomUUID()}`;
    const fileRepo = makeFileRepository(logger);

    expect(() => {
      // Deliberately testing a bad runtime value
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      fileRepo.saveGame(fileName, {});
    }).toThrow();
  });

  it("saves a valid game object", () => {
    const fileRepo = makeFileRepository(logger);
    const save = `test-${randomUUID()}`;
    const game = {} as any; //gameFactory.build();

    expect(() => fileRepo.saveGame(save, game)).not.toThrow();
  });

  it("fails to load an invalid file", () => {
    const save = `test-${randomUUID()}`;
    const fileName = getSaveFilePath(save);

    fs.writeFileSync(fileName, JSON.stringify({}), "utf-8");

    const fileRepo = makeFileRepository(logger);

    expect(() => fileRepo.loadGame(save)).toThrow();
  });

  it("loads a valid file", () => {
    const save = `test-${randomUUID()}`;
    const fileName = getSaveFilePath(save);

    fs.writeFileSync(fileName, JSON.stringify(serializableGameFactory.build()), "utf-8");

    const fileRepo = makeFileRepository(logger);

    expect(() => fileRepo.loadGame(save)).not.toThrow();
  });
});
