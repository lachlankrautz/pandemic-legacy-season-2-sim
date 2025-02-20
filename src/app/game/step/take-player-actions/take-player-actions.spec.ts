import { describe, it, expect, vi } from "vitest";
import { gameOnTakePlayerActionsFactory } from "../../game-factories.ts";
import { playerActionStepFactory } from "../step-factories.ts";
import { handlePlayerAction } from "./take-player-actions.ts";
import { locationMapFactory } from "../../location/location-factories.ts";

describe("take player actions", () => {
  it("reduces the remaining action count", () => {
    const locations = locationMapFactory.build();
    const game = gameOnTakePlayerActionsFactory.build({ locations });
    const step = playerActionStepFactory.build({ action: { type: "make_supplies" } });
    const gameLog = vi.fn();

    const result = handlePlayerAction(game, gameLog, step);

    expect(game.state.type).toEqual("playing");
    expect(result.type).toEqual("state_changed");
    if (result.type !== "state_changed") {
      throw new Error("narrowing type to match above assertion");
    }
    expect(result.nextGameFlow?.type).toEqual("take_4_actions");
    if (result.nextGameFlow?.type !== "take_4_actions") {
      throw new Error("narrowing type to match above assertion");
    }
    expect(result.nextGameFlow?.remainingActions).toEqual(3);
  });

  it("advances to draw player cards after all actions are taken", () => {
    const locations = locationMapFactory.build();
    const game = gameOnTakePlayerActionsFactory.build({ locations, turnFlow: { remainingActions: 1 } });
    const step = playerActionStepFactory.build({ action: { type: "make_supplies" } });
    const gameLog = vi.fn();

    const result = handlePlayerAction(game, gameLog, step);

    expect(game.state.type).toEqual("playing");
    expect(result.type).toEqual("state_changed");
    if (result.type !== "state_changed") {
      throw new Error("narrowing type to match above assertion");
    }
    expect(result.nextGameFlow?.type).toEqual("draw_2_cards");
    if (result.nextGameFlow?.type !== "draw_2_cards") {
      throw new Error("narrowing type to match above assertion");
    }
    expect(result.nextGameFlow?.remainingCards).toEqual(2);
  });
});
