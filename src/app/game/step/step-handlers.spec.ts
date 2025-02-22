import { describe, it, expect, vi } from "vitest";
import { gameOnExposureCheckFactory } from "../game-factories.ts";
import { handleTurnFlowStep, type StepHandler } from "./step-handlers.ts";
import type { Game } from "../game.ts";
import type { Step, StepResult } from "./game-steps.ts";
import { checkForExposureStepFactory } from "./step-factories.ts";

describe("turn flow step handler", async () => {
  it("ignores step when the turn flow is wrong", () => {
    const game: Game = gameOnExposureCheckFactory.build();
    const step: Step = checkForExposureStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    const handler: StepHandler = vi.fn();
    const next: StepHandler = vi.fn((): StepResult => ({ type: "no_effect", cause: "test" }));

    const result = handleTurnFlowStep("take_4_actions", "check_for_exposure", handler)({ game, gameLog, step }, next);

    expect(next).toHaveBeenCalled();
    expect(result.type).toEqual("no_effect");
    if (result.type !== "no_effect") {
      throw new Error("narrowing type to match above assertion");
    }
    expect(result.cause).toMatch(/test/);
  });

  it("ignores step that does not match handler", () => {
    const game: Game = gameOnExposureCheckFactory.build();
    const step: Step = checkForExposureStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    const handler: StepHandler = vi.fn();
    const next: StepHandler = vi.fn((): StepResult => ({ type: "no_effect", cause: "test" }));

    const result = handleTurnFlowStep("exposure_check", "player_action", handler)({ game, gameLog, step }, next);

    expect(next).toHaveBeenCalled();
    expect(result.type).toEqual("no_effect");
    if (result.type !== "no_effect") {
      throw new Error("narrowing type to match above assertion");
    }
    expect(result.cause).toMatch(/test/);
  });

  it("delegates to handler when turn flow and step type match", () => {
    const game: Game = gameOnExposureCheckFactory.build();
    const step: Step = checkForExposureStepFactory.build({ player: game.turnFlow.player });
    const gameLog = vi.fn();

    const handler: StepHandler = vi.fn();
    const next: StepHandler = vi.fn((): StepResult => ({ type: "no_effect", cause: "test" }));

    handleTurnFlowStep("exposure_check", "check_for_exposure", handler)({ game, gameLog, step }, next);

    expect(next).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalledWith({ game, gameLog, step });
  });
});
