import { it, describe, expect } from "vitest";
import React from "react";
import { render } from "ink-testing-library";
import Options from "./Options.tsx";

describe("options", () => {
  it("displays options", () => {
    const { lastFrame } = render(<Options navigateBack={() => undefined}></Options>);

    expect(lastFrame()).toContain("Options");
  });
});
