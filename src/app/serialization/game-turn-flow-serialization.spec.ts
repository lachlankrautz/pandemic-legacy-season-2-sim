import { describe, it, expect } from "vitest";
import { getMappedPlayer } from "../game/player/player.ts";
import { playerMapFactory } from "../game/player/player-factories.ts";
import { makeGameTurnFlowMapper } from "./game-turn-flow-serialization.ts";
import { flowTypes, serializableGameTurnFlowFactory } from "./game-turn-flow-serialization-factories.ts";
import { gameTurnFlowFactory } from "../game/game-flow/game-turn-flow-factories.ts";

describe("serializable game flow mapping", () => {
  it("fails to map type requiring unknown player", () => {
    const serializableGameFlow = serializableGameTurnFlowFactory.build({
      type: "draw_2_cards",
    });
    const mapper = makeGameTurnFlowMapper(getMappedPlayer(new Map()));
    expect(() => mapper.toActual(serializableGameFlow)).toThrow();
  });

  it("can map to actual using player map", () => {
    const playerMap = playerMapFactory.build();
    const serializableGameFlow = serializableGameTurnFlowFactory.build();
    const mapper = makeGameTurnFlowMapper(getMappedPlayer(playerMap));
    expect(() => mapper.toActual(serializableGameFlow)).not.toThrow();
  });
});

describe("game flow mapping", () => {
  it.each(flowTypes)("can map to serializable %s", (type) => {
    const gameFlow = gameTurnFlowFactory.build({ type });
    const mapper = makeGameTurnFlowMapper(getMappedPlayer(new Map()));
    expect(() => mapper.toSerializable(gameFlow)).not.toThrow();
  });
});
