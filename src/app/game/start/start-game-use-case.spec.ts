import { describe, it, expect, vi, beforeEach } from "vitest";
import { startGameUseCase } from "./start-game-use-case.ts";
import { makeLogger } from "../../logging/logger.ts";
import type { Repository } from "../../repository/repository.ts";

const logger = makeLogger();

const mockRepo: Repository = {
  loadGame: vi.fn(),
  saveGame: vi.fn(),
};

describe("start game use case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts a new game", () => {
    expect(() => startGameUseCase(logger, mockRepo, "test")).not.toThrow();
  });

  it("saves the game to file", () => {
    startGameUseCase(logger, mockRepo, "test");

    expect(mockRepo.saveGame).toHaveBeenCalledOnce();
  });
});
