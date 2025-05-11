import { it, describe, expect } from "vitest";
import React from "react";
import { render } from "ink-testing-library";
import GamePlayer from "./GamePlayer.tsx";

describe("game player", () => {
  it("displays game", () => {
    const { lastFrame } = render(<GamePlayer navigateBack={() => undefined}></GamePlayer>);

    expect(lastFrame()).toContain("game");
  });
});
