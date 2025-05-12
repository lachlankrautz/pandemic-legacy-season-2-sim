import { it, describe, expect } from "vitest";
import { render } from "ink-testing-library";
import GameDisplay from "./GameDisplay.tsx";
import { makeGame } from "../../../game/start/new-game.ts";

describe("game display", () => {
  it("displays game", () => {
    const { lastFrame } = render(<GameDisplay gameState={{ game: makeGame() }}></GameDisplay>);

    expect(lastFrame()).toContain("Logs");
  });
});
