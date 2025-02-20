import { describe, it, expect } from "vitest";
import { stepFactory } from "./step-factories.ts";
import { stepTypes } from "./game-steps.ts";

describe("step factory", () => {
  it.each(stepTypes)("creates a game step %s", (type) => {
    expect(() => stepFactory.build({ type })).not.toThrow();
  });
});
