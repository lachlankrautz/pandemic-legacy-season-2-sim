import { it, describe, expect, vi } from "vitest";
import React from "react";
import { render } from "ink-testing-library";
import Bot from "./Bot.tsx";
import { makeGameDriver } from "../../game/step/game-steps.ts";
import { makeGame } from "../../game/start/new-game.ts";
import { makeNullLogger } from "../../logging/logger.js";

describe("bot", () => {
  it("runs a game", () => {
    const logger = makeNullLogger();
    const driver = makeGameDriver(makeGame(), vi.fn());
    const { lastFrame } = render(<Bot driver={driver} logger={logger} navigateBack={() => undefined}></Bot>);

    expect(lastFrame()).toContain("Logs");
  });
});
