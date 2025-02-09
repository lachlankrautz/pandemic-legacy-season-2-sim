import { it, describe, expect } from "vitest";
import React from "react";
import { render } from "ink-testing-library";
import MainMenu from "./MainMenu.ts";

describe("main menu", () => {
  it("displays menu items", () => {
    const { lastFrame } = render(React.createElement(MainMenu, {}, null));

    expect(lastFrame()).toContain("* Start Game *");
    expect(lastFrame()).toContain("Options");
    expect(lastFrame()).toContain("Exit");
  });

  it("navigates up and down", () => {
    //
  });
});
