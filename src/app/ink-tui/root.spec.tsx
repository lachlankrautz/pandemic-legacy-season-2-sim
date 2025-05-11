import { it, describe, expect, vi } from "vitest";
import { render } from "ink";
import { makeLogger } from "../logging/logger.ts";
import { makeTuiRunner } from "./root.tsx";

vi.mock("ink");

describe("root", () => {
  it("creates the app", () => {
    const logger = makeLogger();
    const tuiRunner = makeTuiRunner(logger);

    expect(() => tuiRunner.run()).not.toThrow();
    expect(render).toHaveBeenCalled();
  });
});
