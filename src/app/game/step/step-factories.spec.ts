import { describe, it, expect } from "vitest";
import { stepFactory } from "./step-factories.js";

describe("step factory", () => {
  it("creates a game step", () => {
    expect(() => stepFactory.build()).not.toThrow();
  });
});

// TODO individual factories for every branch of the step union
