import { describe, it, expect } from "vitest";
import { serializableGameFactory } from "./game-serialization-factories.ts";
import { gameFactory } from "../game/game-factories.ts";
import { makeGameMapper } from "./game-serialization.ts";
import { playerMapFactory } from "../game/player/player-factories.ts";
import { locationMapFactory } from "../game/location/location-factories.ts";

describe("serializable game mapping", () => {
  it("can map to actual", () => {
    const locationMap = locationMapFactory.build();
    const playerMap = playerMapFactory.build(undefined, { transient: { locationMap } });
    const serializableGame = serializableGameFactory.build();
    const mapper = makeGameMapper(locationMap, playerMap);
    expect(() => mapper.toActual(serializableGame)).not.toThrow();
  });
});

describe("game mapping", () => {
  it("can map to serializable", () => {
    const game = gameFactory.build();
    const mapper = makeGameMapper();
    expect(() => mapper.toSerializable(game)).not.toThrow();
  });
});
