import { describe, it, expect } from "vitest";
import { boostrapCli } from "./bootstrap.js";

describe("boostrap", () => {
  it("builds with no arguments", () => {
    const runner = boostrapCli();
    expect(runner).toBeDefined();
  });
});
