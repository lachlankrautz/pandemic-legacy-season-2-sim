import { describe, it, expect } from "vitest";
import { makeLogger } from "../logging/logger.ts";
import { makeFileRepository } from "./file-repository.ts";
import { randomUUID } from "crypto";

describe("file repository", () => {
  const logger = makeLogger();

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
    // TODO implement
  });

  it("fails to load an invalid file", () => {
    // TODO implement
  });

  it("loads a valid file", () => {
    // TODO implement
  });
});
