import { describe, it, expect, vi } from "vitest";
import { getIncreasedInfectionRate, increaseGameInfectionRate, recordGameIncident } from "./infection.ts";
import { gameFactory } from "../game-factories.ts";
import type { GameLog } from "../game-log/game-log.ts";
import { locationFactory } from "../location/location-factories.ts";

describe("infection rate", () => {
  it("increases infection rate", () => {
    expect(getIncreasedInfectionRate({ position: 1, cards: 2 })).toEqual({ position: 2, cards: 2 });
    expect(getIncreasedInfectionRate({ position: 3, cards: 2 })).toEqual({ position: 4, cards: 3 });
  });

  it("caps the infection rate at 5 cards", () => {
    expect(getIncreasedInfectionRate({ position: 8, cards: 5 })).toEqual({ position: 8, cards: 5 });
  });

  it("updates the game infection rate", () => {
    const game = gameFactory.build({ infectionRate: { position: 1, cards: 2 } });
    const gameLog: GameLog = vi.fn();

    expect(game.infectionRate.position).toEqual(1);

    increaseGameInfectionRate(game, gameLog);

    expect(game.infectionRate.position).toEqual(2);
  });

  it("records increase in game log", () => {
    const game = gameFactory.build();
    const gameLog: GameLog = vi.fn();

    increaseGameInfectionRate(game, gameLog);

    expect(gameLog).toHaveBeenCalledWith(expect.stringContaining("infection rate"));
  });
});

describe("incidents", () => {
  it("updates the incident count", () => {
    const location = locationFactory.build();
    const game = gameFactory.build({ incidents: 0, locations: new Map([[location.name, location]]) });
    const gameLog: GameLog = vi.fn();

    expect(game.incidents).toEqual(0);

    recordGameIncident(game, location, gameLog);

    expect(game.incidents).toEqual(1);
  });

  it("caps at 8 incidents", () => {
    const location = locationFactory.build();
    const game = gameFactory.build({ incidents: 8, locations: new Map([[location.name, location]]) });
    const gameLog: GameLog = vi.fn();

    expect(game.incidents).toEqual(8);

    recordGameIncident(game, location, gameLog);

    expect(game.incidents).toEqual(8);
  });

  it("triggers game over at 8", () => {
    const location = locationFactory.build();
    const game = gameFactory.build({ incidents: 7, locations: new Map([[location.name, location]]) });
    const gameLog: GameLog = vi.fn();

    expect(game.incidents).toEqual(7);

    recordGameIncident(game, location, gameLog);

    expect(game.incidents).toEqual(8);
    expect(game.state.type).toEqual("lost");
    if (game.state.type !== "lost") {
      throw new Error("narrow type to match previous expect");
    }
    expect(game.state.cause).toContain("incidents");
  });

  it("records game over to game log", () => {
    const location = locationFactory.build();
    const game = gameFactory.build({ incidents: 7, locations: new Map([[location.name, location]]) });
    const gameLog: GameLog = vi.fn();

    recordGameIncident(game, location, gameLog);

    expect(gameLog).toHaveBeenCalledWith(expect.stringContaining("Game Over"));
  });
});
