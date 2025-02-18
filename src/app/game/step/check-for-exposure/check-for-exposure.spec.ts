import { describe, it, expect, vi } from "vitest";
import { checkForExposureStepFactory } from "../step-factories.ts";
import { handleCheckForExposure } from "./check-for-exposure.ts";
import { gameOnExposureCheckFactory } from "../../game-factories.ts";
import type { GameLog } from "../../game-log/game-log.ts";

describe("check for exposure", () => {
  it("advances to the next turn flow", () => {
    const game = gameOnExposureCheckFactory.build({ turnFlow: { type: "exposure_check" } });
    const gameLog: GameLog = vi.fn();
    const step = checkForExposureStepFactory.build({ type: "check_for_exposure" });

    const result = handleCheckForExposure(game, gameLog, step);

    expect(result.type).toEqual("state_changed");
    if (result.type !== "state_changed") {
      throw new Error("narrow type for remaining tests");
    }

    expect(result.nextGameFlow?.type).toEqual("take_4_actions");
  });
});
