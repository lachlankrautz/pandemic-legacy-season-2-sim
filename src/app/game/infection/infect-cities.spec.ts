import { describe, it, expect, vi } from "vitest";
import { drawInfectionCard } from "./infect-cities.ts";
import { gameFactory } from "../game-factories.ts";
import type { GameLog } from "../game-log/game-log.ts";
import { links, LocationNames } from "../location/location.ts";

describe("infect cities", () => {
  it.each([1, 2, 3])("removes a supply cube if present", (cubes) => {
    const game = gameFactory.build(undefined, {
      transient: {
        infectionCardLocationNames: {
          [LocationNames.CHICAGO]: 1,
        },
        locationNames: [
          LocationNames.SAN_FRANCISCO,
          LocationNames.CHICAGO,
          LocationNames.ATLANTA,
          LocationNames.WASHINGTON,
          LocationNames.JACKSONVILLE,
          LocationNames.NEW_YORK,
        ],
        links,
      },
    });
    const gameLog: GameLog = vi.fn();

    const chicago = game.getLocation(LocationNames.CHICAGO);
    chicago.supplyCubes = cubes;
    const sanFran = game.getLocation(LocationNames.SAN_FRANCISCO);
    const atlanta = game.getLocation(LocationNames.ATLANTA);
    const washington = game.getLocation(LocationNames.WASHINGTON);
    const jacksonville = game.getLocation(LocationNames.JACKSONVILLE);
    const newYork = game.getLocation(LocationNames.NEW_YORK);

    drawInfectionCard(game, gameLog);

    expect(chicago.supplyCubes).toEqual(cubes - 1);
    expect(sanFran.supplyCubes).toEqual(0);
    expect(atlanta.supplyCubes).toEqual(0);
    expect(washington.supplyCubes).toEqual(0);
    expect(jacksonville.supplyCubes).toEqual(0);
    expect(newYork.supplyCubes).toEqual(0);
  });

  it("adds a plague cube if there are no supply cubes", () => {
    const game = gameFactory.build(undefined, {
      transient: {
        infectionCardLocationNames: {
          [LocationNames.CHICAGO]: 1,
        },
        locationNames: [
          LocationNames.SAN_FRANCISCO,
          LocationNames.CHICAGO,
          LocationNames.ATLANTA,
          LocationNames.WASHINGTON,
          LocationNames.JACKSONVILLE,
          LocationNames.NEW_YORK,
        ],
        links,
      },
    });
    const gameLog: GameLog = vi.fn();

    const chicago = game.getLocation(LocationNames.CHICAGO);
    const sanFran = game.getLocation(LocationNames.SAN_FRANCISCO);
    const atlanta = game.getLocation(LocationNames.ATLANTA);
    const washington = game.getLocation(LocationNames.WASHINGTON);
    const jacksonville = game.getLocation(LocationNames.JACKSONVILLE);
    const newYork = game.getLocation(LocationNames.NEW_YORK);

    expect(game.incidents).toEqual(0);

    drawInfectionCard(game, gameLog);

    expect(game.incidents).toEqual(1);

    expect(chicago.supplyCubes).toEqual(0);
    expect(sanFran.supplyCubes).toEqual(0);
    expect(atlanta.supplyCubes).toEqual(0);
    expect(washington.supplyCubes).toEqual(0);
    expect(jacksonville.supplyCubes).toEqual(0);
    expect(newYork.supplyCubes).toEqual(0);

    expect(chicago.plagueCubes).toEqual(1);
    expect(sanFran.plagueCubes).toEqual(0);
    expect(atlanta.plagueCubes).toEqual(0);
    expect(washington.plagueCubes).toEqual(0);
    expect(jacksonville.plagueCubes).toEqual(0);
    expect(newYork.plagueCubes).toEqual(0);
  });

  it("triggers an outbreak if there are 3 plague cubes", () => {
    const game = gameFactory.build(undefined, {
      transient: {
        infectionCardLocationNames: {
          [LocationNames.CHICAGO]: 1,
        },
        locationNames: [
          LocationNames.SAN_FRANCISCO,
          LocationNames.CHICAGO,
          LocationNames.ATLANTA,
          LocationNames.WASHINGTON,
          LocationNames.JACKSONVILLE,
          LocationNames.NEW_YORK,
        ],
        links,
      },
    });
    const gameLog: GameLog = vi.fn();

    const chicago = game.getLocation(LocationNames.CHICAGO);
    chicago.supplyCubes = 0;
    chicago.plagueCubes = 3;
    const sanFran = game.getLocation(LocationNames.SAN_FRANCISCO);
    sanFran.supplyCubes = 2;
    sanFran.plagueCubes = 0;
    const atlanta = game.getLocation(LocationNames.ATLANTA);
    const washington = game.getLocation(LocationNames.WASHINGTON);
    const jacksonville = game.getLocation(LocationNames.JACKSONVILLE);
    const newYork = game.getLocation(LocationNames.NEW_YORK);

    expect(game.incidents).toEqual(0);

    drawInfectionCard(game, gameLog);

    expect(game.incidents).toEqual(2);

    expect(chicago.supplyCubes).toEqual(0);
    expect(sanFran.supplyCubes).toEqual(1);
    expect(atlanta.supplyCubes).toEqual(0);
    expect(washington.supplyCubes).toEqual(0);
    expect(jacksonville.supplyCubes).toEqual(0);
    expect(newYork.supplyCubes).toEqual(0);

    expect(chicago.plagueCubes).toEqual(3);
    expect(sanFran.plagueCubes).toEqual(0);
    expect(atlanta.plagueCubes).toEqual(1);
    expect(washington.plagueCubes).toEqual(1);
    expect(jacksonville.plagueCubes).toEqual(0);
    expect(newYork.plagueCubes).toEqual(0);
  });

  it("outbreak that causes no plague cubes does not cause incident", () => {
    const game = gameFactory.build(undefined, {
      transient: {
        infectionCardLocationNames: {
          [LocationNames.CHICAGO]: 1,
        },
        locationNames: [LocationNames.SAN_FRANCISCO, LocationNames.CHICAGO],
        links,
      },
    });
    const gameLog: GameLog = vi.fn();

    const chicago = game.getLocation(LocationNames.CHICAGO);
    chicago.plagueCubes = 3;
    const sanFran = game.getLocation(LocationNames.SAN_FRANCISCO);
    sanFran.plagueCubes = 3;

    expect(game.incidents).toEqual(0);

    drawInfectionCard(game, gameLog);

    expect(game.incidents).toEqual(0);

    expect(chicago.supplyCubes).toEqual(0);
    expect(sanFran.supplyCubes).toEqual(0);

    expect(chicago.plagueCubes).toEqual(3);
    expect(sanFran.plagueCubes).toEqual(3);
  });

  it("outbreaks each location only once", () => {
    const game = gameFactory.build(undefined, {
      transient: {
        infectionCardLocationNames: {
          [LocationNames.CHICAGO]: 1,
        },
        locationNames: [
          LocationNames.SAN_FRANCISCO,
          LocationNames.CHICAGO,
          LocationNames.ATLANTA,
          LocationNames.WASHINGTON,
          LocationNames.JACKSONVILLE,
          LocationNames.NEW_YORK,
        ],
        links,
      },
    });
    const gameLog: GameLog = vi.fn();

    const chicago = game.getLocation(LocationNames.CHICAGO);
    chicago.plagueCubes = 3;
    const sanFran = game.getLocation(LocationNames.SAN_FRANCISCO);
    sanFran.plagueCubes = 2;
    const atlanta = game.getLocation(LocationNames.ATLANTA);
    atlanta.plagueCubes = 3;
    const washington = game.getLocation(LocationNames.WASHINGTON);
    washington.plagueCubes = 3;
    const jacksonville = game.getLocation(LocationNames.JACKSONVILLE);
    jacksonville.plagueCubes = 2;
    const newYork = game.getLocation(LocationNames.NEW_YORK);

    expect(game.incidents).toEqual(0);

    drawInfectionCard(game, gameLog);

    expect(game.incidents).toEqual(3);

    expect(chicago.supplyCubes).toEqual(0);
    expect(sanFran.supplyCubes).toEqual(0);
    expect(atlanta.supplyCubes).toEqual(0);
    expect(washington.supplyCubes).toEqual(0);
    expect(jacksonville.supplyCubes).toEqual(0);
    expect(newYork.supplyCubes).toEqual(0);

    expect(chicago.plagueCubes).toEqual(3);
    expect(sanFran.plagueCubes).toEqual(3);
    expect(atlanta.plagueCubes).toEqual(3);
    expect(washington.plagueCubes).toEqual(3);
    expect(jacksonville.plagueCubes).toEqual(3);
    expect(newYork.plagueCubes).toEqual(1);
  });
});
