import { describe, it, expect, vi } from "vitest";
import { takeAction, makeSupplies, makeSupplyCentre, dropSupplies, type DropSupplies } from "./actions.ts";
import { GameLog } from "../game-log/game-log.ts";
import { gameFactory } from "../game-factories.ts";
import { playerFactory } from "../player/player-factories.ts";
import { locationFactory } from "../location/location-factories.ts";
import { StaticLocations } from "../location/location.js";
import { playerCardFactory } from "../cards/player-card-factories.js";

const mockGameLog: GameLog = vi.fn();

describe("spend action points", () => {
  it("fails if no actions remain", () => {
    const game = gameFactory.build({ turnFlow: { type: "player_turn:take_4_actions", remainingActions: 0 } });

    const result = takeAction(game, { type: "move", isFree: false, toLocationName: "Somewhere" }, mockGameLog);
    expect(result).toEqual({ type: "no_effect", cause: "No actions remaining" });
  });
});

describe("move", () => {
  it("fails if locations are not connected", () => {
    const locationOne = locationFactory.build();
    const locationTwo = locationFactory.build();

    const player = playerFactory.build({ location: locationOne });
    const game = gameFactory.build({ turnFlow: { type: "player_turn:take_4_actions", player, remainingActions: 1 } });

    const result = takeAction(game, { type: "move", isFree: false, toLocationName: locationTwo.name }, mockGameLog);
    expect(result).toEqual({ type: "no_effect", cause: expect.stringContaining("Invalid move target") });
  });

  it("succeeds if locations are connected", () => {
    const locationOne = locationFactory.build();
    const locationTwo = locationFactory.build();
    locationOne.connections.push({
      type: "land",
      location: locationTwo,
    });
    const player = playerFactory.build({ location: locationOne });
    const game = gameFactory.build({
      turnFlow: { type: "player_turn:take_4_actions", player, remainingActions: 1 },
      // TODO make this automatically wired up in the factory
      locations: new Map([
        [locationOne.name, locationOne],
        [locationTwo.name, locationTwo],
      ]),
    });

    const result = takeAction(game, { type: "move", isFree: false, toLocationName: locationTwo.name }, mockGameLog);
    expect(result).toEqual({ type: "state_changed" });
    expect(player.location.name).toEqual(locationTwo.name);
  });
});

describe("make supplies", () => {
  it("increases player's supply cubes", () => {
    const player = playerFactory.build({ supplyCubes: 2 });
    makeSupplies(player, mockGameLog);
    expect(player.supplyCubes).toBe(3);
  });
});

describe("drop supplies", () => {
  it("fails if player does not have enough cubes", () => {
    const player = playerFactory.build({ supplyCubes: 1, location: { supplyCubes: 0 } });
    const action: DropSupplies = { type: "drop_supplies", isFree: false, supplyCubes: 2 };

    const result = dropSupplies(player, action, mockGameLog);

    expect(result).toEqual({
      type: "no_effect",
      cause: expect.stringContaining("cannot drop 2"),
    });
    expect(player.supplyCubes).toBe(1);
    expect(player.location.supplyCubes).toBe(0);
  });

  it("drops supply cubes successfully", () => {
    const player = playerFactory.build({ supplyCubes: 3, location: { supplyCubes: 0 } });
    const action: DropSupplies = { type: "drop_supplies", isFree: false, supplyCubes: 2 };

    dropSupplies(player, action, mockGameLog);

    expect(player.supplyCubes).toBe(1);
    expect(player.location.supplyCubes).toBe(2);
  });
});

describe("make supply centre", () => {
  it("fails if a supply centre already exists", () => {
    const player = playerFactory.build(undefined, { transient: { yellowCards: 5 } });
    player.location.supplyCentre = true;
    const game = gameFactory.build({ turnFlow: { type: "player_turn:take_4_actions" } }, { transient: { player } });

    const result = makeSupplyCentre(game, new Set([0, 1, 2, 3, 4]));
    expect(result).toEqual({
      type: "no_effect",
      cause: expect.stringContaining("already has a supply centre."),
    });
    expect(player.location.supplyCentre).toEqual(true);
    expect(player.cards).toHaveLength(5);
  });

  it("fails if not enough matching cards", () => {
    const location = locationFactory.build({ colour: "blue", supplyCentre: false });
    const player = playerFactory.build({ location }, { transient: { yellowCards: 5 } });
    const game = gameFactory.build({ turnFlow: { type: "player_turn:take_4_actions" } }, { transient: { player } });

    const result = makeSupplyCentre(game, new Set([0, 1, 2, 3, 4]));
    expect(result).toEqual({
      type: "no_effect",
      cause: expect.stringContaining("Not enough cards"),
    });
    expect(player.location.supplyCentre).toEqual(false);
    expect(player.cards).toHaveLength(5);
  });

  it("fails if not using current location card", () => {
    const [playerLocation, ...otherLocations] = Object.values(StaticLocations)
      .filter((location) => location.colour === "yellow")
      .map((location) => locationFactory.build({ ...location, supplyCentre: false }))
      .slice(0, 6);

    if (playerLocation === undefined) {
      throw new Error("Failed to create starting location");
    }

    const player = playerFactory.build({ location: playerLocation }, { transient: { cardCount: 0 } });
    player.cards = otherLocations.map((location) =>
      playerCardFactory.build({
        type: "city",
        location,
      }),
    );
    const game = gameFactory.build({ turnFlow: { type: "player_turn:take_4_actions" } }, { transient: { player } });

    const result = makeSupplyCentre(game, new Set([0, 1, 2, 3, 4]));
    expect(result).toEqual({
      type: "no_effect",
      cause: expect.stringContaining("must match the current location"),
    });
    expect(player.location.supplyCentre).toEqual(false);
    expect(player.cards).toHaveLength(5);
  });

  it("succeeds with 5 matching cards and the current location", () => {
    const [playerLocation, ...otherLocations] = Object.values(StaticLocations)
      .filter((location) => location.colour === "yellow")
      .map((location) => locationFactory.build({ ...location, supplyCentre: false }))
      .slice(0, 5);

    if (playerLocation === undefined) {
      throw new Error("Failed to create starting location");
    }

    const player = playerFactory.build({ location: playerLocation }, { transient: { cardCount: 0 } });
    player.cards = [playerLocation, ...otherLocations].map((location) =>
      playerCardFactory.build({
        type: "city",
        location,
      }),
    );
    const game = gameFactory.build({ turnFlow: { type: "player_turn:take_4_actions" } }, { transient: { player } });

    const result = makeSupplyCentre(game, new Set([0, 1, 2, 3, 4]));
    expect(result).toEqual({
      type: "state_changed",
    });
    expect(player.location.supplyCentre).toEqual(true);
    expect(player.cards).toHaveLength(0);
  });
});
