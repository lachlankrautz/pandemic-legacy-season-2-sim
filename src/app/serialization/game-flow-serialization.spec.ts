import { describe, it, expect } from "vitest";
import { getMappedPlayer } from "../game/player/player.ts";
import { playerMapFactory } from "../game/player/player-factories.ts";
import { makeGameFlowMapper } from "./game-flow-serialization.ts";
import { serializableGameFlowFactory } from "./game-flow-serialization-factories.ts";
import { gameFlowFactory } from "../game/game-flow/game-flow-factories.ts";

describe("serializable game flow mapping", () => {
  it("can map type not requiring a player", () => {
    const serializableGameFlow = serializableGameFlowFactory.build({
      type: "game_won",
    });
    const mapper = makeGameFlowMapper(getMappedPlayer(new Map()));
    expect(() => mapper.toActual(serializableGameFlow)).not.toThrow();
  });

  it("fails to map type requiring unknown player", () => {
    const serializableGameFlow = serializableGameFlowFactory.build({
      type: "player_turn:draw_2_cards",
    });
    const mapper = makeGameFlowMapper(getMappedPlayer(new Map()));
    expect(() => mapper.toActual(serializableGameFlow)).toThrow();
  });

  it("can map to actual using player map", () => {
    const playerMap = playerMapFactory.build();
    const serializableGameFlow = serializableGameFlowFactory.build();
    const mapper = makeGameFlowMapper(getMappedPlayer(playerMap));
    expect(() => mapper.toActual(serializableGameFlow)).not.toThrow();
  });
});

describe("game flow mapping", () => {
  it("can map to serializable", () => {
    const gameFlow = gameFlowFactory.build();
    const mapper = makeGameFlowMapper(getMappedPlayer(new Map()));
    expect(() => mapper.toSerializable(gameFlow)).not.toThrow();
  });
});
