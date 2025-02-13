import { describe, it, expect } from "vitest";
import { playerFactory } from "./player-factories.ts";
import { getMappedPlayer } from "./player.ts";

describe("get mapped player", () => {
  it("load a player from the map", () => {
    const player = playerFactory.build();
    const getPlayer = getMappedPlayer(new Map([[player.name, player]]));

    expect(() => {
      const mappedPlayer = getPlayer(player.name);
      expect(player).toBe(mappedPlayer);
    }).not.toThrow();
  });

  it("throw when no player is found", () => {
    const player = playerFactory.build();
    const getPlayer = getMappedPlayer(new Map());

    expect(() => getPlayer(player.name)).toThrow();
  });
});
