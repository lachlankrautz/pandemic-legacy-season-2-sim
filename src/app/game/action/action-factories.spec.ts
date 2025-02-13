import { describe, it, expect } from "vitest";
import {
  actionFactory,
  dropSuppliesActionFactory,
  makeSuppliesActionFactory,
  makeSupplyCentreActionFactory,
  moveActionFactory,
} from "./action-factories.ts";

describe("action factory", () => {
  it("creates an action", () => {
    expect(() => actionFactory.build()).not.toThrow();
  });
});

describe("move action factory", () => {
  it("creates a move action", () => {
    expect(() => moveActionFactory.build()).not.toThrow();
  });
});

describe("make supplies action factory", () => {
  it("creates a make supplies action", () => {
    expect(() => makeSuppliesActionFactory.build()).not.toThrow();
  });
});

describe("drop supplies action factory", () => {
  it("creates a drop supplies action", () => {
    expect(() => dropSuppliesActionFactory.build()).not.toThrow();
  });
});

describe("make supply centre action factory", () => {
  it("creates a make supply centre action", () => {
    expect(() => makeSupplyCentreActionFactory.build()).not.toThrow();
  });
});
