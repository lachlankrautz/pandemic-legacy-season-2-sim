import { describe, it, expect } from "vitest";
import { makeStepMapper } from "./step-serialization.ts";
import { getMappedPlayer } from "../game/player/player.ts";
import { makeActionMapper } from "./action-serialization.ts";
import { serializableStepFactory } from "./step-serialization-factories.ts";
import { stepFactory } from "../game/step/step-factories.ts";
import { playerMapFactory } from "../game/player/player-factories.ts";
import { stepTypes } from "../game/step/game-steps.ts";

describe("serializable step mapping", () => {
  it("fails to map unknown player", () => {
    const serializableStep = serializableStepFactory.build();
    const mapper = makeStepMapper(getMappedPlayer(new Map()), makeActionMapper());
    expect(() => mapper.toActual(serializableStep)).toThrow();
  });

  it("can map to actual using player map", () => {
    const playerMap = playerMapFactory.build();
    const serializableStep = serializableStepFactory.build();
    const mapper = makeStepMapper(getMappedPlayer(playerMap), makeActionMapper());
    expect(() => mapper.toActual(serializableStep)).not.toThrow();
  });
});

describe("step mapping", () => {
  it.each(stepTypes)('can map to serializable: "%s"', (stepType) => {
    const step = stepFactory.build({ type: stepType });
    const mapper = makeStepMapper(getMappedPlayer(new Map()), makeActionMapper());
    expect(() => mapper.toSerializable(step)).not.toThrow();
  });
});
