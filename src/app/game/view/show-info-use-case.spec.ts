import { describe, it, expect, vi, beforeEach } from "vitest";
import { showInfoTypes, showInfoUseCase } from "./show-info-use-case.ts";
import type { Repository } from "../../repository/repository.ts";
import { gameFactory } from "../game-factories.ts";
import { playerMapFactory } from "../player/player-factories.ts";

const loadGame = vi.fn();

const mockRepo: Repository = {
  loadGame,
  saveGame: vi.fn(),
};

describe("start game use case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(showInfoTypes)("shows info: %s", (type) => {
    const game = gameFactory.build({ players: playerMapFactory.build() });
    loadGame.mockImplementation(() => game);

    expect(() => showInfoUseCase(mockRepo, "test", type)).not.toThrow();
  });
});
