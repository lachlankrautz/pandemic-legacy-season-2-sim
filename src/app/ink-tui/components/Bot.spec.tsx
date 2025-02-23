import { it, describe, expect, vi } from "vitest";
import React from "react";
import { render } from "ink-testing-library";
import Bot from "./Bot.tsx";
import { makeGameDriver } from "../../game/step/game-steps.ts";
import { makeGame } from "../../game/start/new-game.ts";

describe("bot", () => {
  it("runs a game", () => {
    const driver = makeGameDriver(makeGame(), vi.fn());
    const { lastFrame } = render(<Bot driver={driver} navigateBack={() => undefined}></Bot>);

    expect(lastFrame()).toContain("Logs");
  });
});
