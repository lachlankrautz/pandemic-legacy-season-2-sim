import { describe, it, expect, vi, afterEach } from "vitest";
import type { GameLog } from "../../game-log/game-log.ts";
import { gameFactory } from "../../game-factories.ts";
import { playerFactory } from "../../player/player-factories.ts";
import { resolveEpidemicStepFactory } from "../step-factories.ts";
import { handleResolveEpidemic } from "./resolve-epidemic.ts";
import { playerCardFactory } from "../../cards/player-card-factories.ts";
import { epidemic } from "../../infection/epidemic.ts";
import { LocationNames } from "../../location/location.ts";

vi.mock("../../infection/epidemic.ts", { spy: true });

describe("resolve epidemic step", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("no effect if current player does not have an epidemic card", () => {
    const player = playerFactory.build({ cards: [] });
    const game = gameFactory.build({ players: new Map([[player.name, player]]) });
    const gameLog: GameLog = vi.fn();
    const step = resolveEpidemicStepFactory.build({ player });

    const result = handleResolveEpidemic({ game, gameLog, step });

    expect(result.type).toEqual("no_effect");
    if (result.type !== "no_effect") {
      throw new Error("narrowing type to match assertion");
    }
    expect(result.cause).toMatch(/epidemic card/);
  });

  it("resolves the epidemic", () => {
    const player = playerFactory.build({ cards: [playerCardFactory.build({ type: "epidemic" })] });
    const game = gameFactory.build(
      { players: new Map([[player.name, player]]) },
      {
        transient: {
          infectionCardLocationNames: {
            [LocationNames.CHICAGO]: 1,
          },
        },
      },
    );
    const initialInfectionRate = game.infectionRate.position;
    const gameLog: GameLog = vi.fn();
    const step = resolveEpidemicStepFactory.build({ player });

    const result = handleResolveEpidemic({ game, gameLog, step });

    expect(game.infectionRate.position).toEqual(initialInfectionRate + 1);
    expect(result.type).toEqual("state_changed");
    if (result.type !== "state_changed") {
      throw new Error("narrowing type to match assertion");
    }
    expect(epidemic).toHaveBeenCalled();
  });

  it("discards player epidemic card", () => {
    const player = playerFactory.build({ cards: [playerCardFactory.build({ type: "epidemic" })] });
    const game = gameFactory.build(
      { players: new Map([[player.name, player]]) },
      {
        transient: {
          infectionCardLocationNames: {
            [LocationNames.CHICAGO]: 1,
          },
        },
      },
    );
    const gameLog: GameLog = vi.fn();
    const step = resolveEpidemicStepFactory.build({ player });

    expect(game.playerDeck.discardPile[game.playerDeck.discardPile.length - 1]?.type).not.toEqual("epidemic");

    handleResolveEpidemic({ game, gameLog, step });

    expect(player.cards.length).toEqual(0);
    expect(game.playerDeck.discardPile[game.playerDeck.discardPile.length - 1]?.type).toEqual("epidemic");
  });
});
