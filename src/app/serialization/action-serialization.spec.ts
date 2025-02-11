import { describe, it, expect } from "vitest";
import { makeActionMapper } from "./action-serialization.ts";
import { serializableActionFactory } from "./action-serialization-factories.ts";
import { actionFactory } from "../game/action/action-factories.ts";

describe("serializable action mapping", () => {
  it("can map to actual", () => {
    const serializableAction = serializableActionFactory.build();
    const mapper = makeActionMapper();
    expect(() => mapper.toActual(serializableAction)).not.toThrow();
  });
});

describe("action mapping", () => {
  it("can map to serializable", () => {
    const action = actionFactory.build();
    const mapper = makeActionMapper();
    expect(() => mapper.toSerializable(action)).not.toThrow();
  });
});
