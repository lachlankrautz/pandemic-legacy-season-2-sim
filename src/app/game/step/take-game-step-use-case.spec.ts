import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeLogger } from "../../logging/logger.ts";
import type { Repository } from "../../repository/repository.ts";
import { gameFactory } from "../game-factories.ts";
import { takeGameStepUseCase } from "./take-game-step-use-case.ts";
import { serializableStepFactory } from "../../serialization/step-serialization-factories.ts";
import { playerMapFactory } from "../player/player-factories.ts";

const logger = makeLogger();

const mockRepo: Repository = {
  loadGame: () => gameFactory.build({ players: playerMapFactory.build() }),
  saveGame: vi.fn(),
};

describe("start game use case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TODO this test can actually fail trying to draw from an empty deck
  it("starts a new game", () => {
    const step = serializableStepFactory.build();

    expect(() => takeGameStepUseCase(logger, mockRepo, "test", step)).not.toThrow();
  });

  it("saves the game to file", () => {
    const step = serializableStepFactory.build();

    expect(() => takeGameStepUseCase(logger, mockRepo, "test", step)).not.toThrow();
    expect(mockRepo.saveGame).toHaveBeenCalledOnce();
  });
});
