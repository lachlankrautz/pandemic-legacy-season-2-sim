import { it, describe, expect } from "vitest";
import { render } from "ink-testing-library";
import MainMenu from "./MainMenu.tsx";

describe("main menu", () => {
  it("displays menu items", () => {
    const { lastFrame } = render(<MainMenu navigate={() => undefined}></MainMenu>);

    expect(lastFrame()).toContain("Start Game");
    expect(lastFrame()).toContain("Options");
    expect(lastFrame()).toContain("Exit");
  });

  it("navigates up and down", () => {
    //
  });
});
