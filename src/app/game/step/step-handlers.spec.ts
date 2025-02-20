import { describe, it, expect, vi } from "vitest";
import { gameOnExposureCheckFactory } from "../game-factories.ts";
import { handleStepTiming, type StepHandler } from "./step-handlers.ts";
import type { Game } from "../game.ts";
import type { Step } from "./game-steps.ts";
import { checkForExposureStepFactory } from "./step-factories.ts";

describe("step handlers", async () => {
  it("ignores step when the turn flow is wrong", () => {
    const game: Game = gameOnExposureCheckFactory.build();
    const step: Step = checkForExposureStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    const handler: StepHandler = vi.fn();

    const result = handleStepTiming("take_4_actions", "check_for_exposure", handler)(game, gameLog, step);

    expect(result.type).toEqual("no_effect");
    if (result.type !== "no_effect") {
      throw new Error("narrowing type to match above assertion");
    }
    expect(result.cause).toMatch(/game turn flow/);
  });

  it("ignores step that does not match handler", () => {
    const game: Game = gameOnExposureCheckFactory.build();
    const step: Step = checkForExposureStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    const handler: StepHandler = vi.fn();

    const result = handleStepTiming("exposure_check", "player_action", handler)(game, gameLog, step);

    expect(result.type).toEqual("no_effect");
    if (result.type !== "no_effect") {
      throw new Error("narrowing type to match above assertion");
    }
    expect(result.cause).toMatch(/step type/);
  });

  it("delegates to handler when turn flow and step type match", () => {
    const game: Game = gameOnExposureCheckFactory.build();
    const step: Step = checkForExposureStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    const handler: StepHandler = vi.fn();

    handleStepTiming("exposure_check", "check_for_exposure", handler)(game, gameLog, step);

    expect(handler).toHaveBeenCalledWith(game, gameLog, step);
  });
});
