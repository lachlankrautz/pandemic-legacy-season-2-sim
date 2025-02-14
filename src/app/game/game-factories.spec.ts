import { describe, it, expect } from "vitest";
import { gameFactory } from "./game-factories.ts";
import { playerFactory, playerMapFactory } from "./player/player-factories.ts";
import { links, type LocationName, LocationNames } from "./location/location.ts";

describe("game factory", () => {
  it("creates a game", () => {
    expect(() => gameFactory.build()).not.toThrow();
  });

  it("adds current turn player to players map", () => {
    const player = playerFactory.build();
    const game = gameFactory.build({ turnFlow: { player } });

    const mappedPlayer = game.players.get(player.name);

    expect(mappedPlayer).toBe(player);
  });

  it("adds default current turn player to players map", () => {
    const game = gameFactory.build();

    const currentPlayer = game.turnFlow.player;
    const mappedPlayer = game.players.get(currentPlayer.name);

    expect(currentPlayer).toBe(mappedPlayer);
  });

  it("picks a random turn player from the players map", () => {
    const players = playerMapFactory.build();
    const game = gameFactory.build({ players });

    const currentPlayer = game.turnFlow.player;
    const mappedPlayer = game.players.get(currentPlayer.name);

    expect(currentPlayer).toBe(mappedPlayer);
  });

  it("connects locations according to provided links", () => {
    const locationNames: LocationName[] = [LocationNames.SAN_FRANCISCO, LocationNames.CHICAGO];
    const game = gameFactory.build(
      { turnFlow: { player: { location: { name: LocationNames.SAN_FRANCISCO } } } },
      { transient: { links, locationNames } },
    );

    expect(game.locations.size).toEqual(2);

    const sanFran = game.locations.get(LocationNames.SAN_FRANCISCO);
    const chicago = game.locations.get(LocationNames.CHICAGO);

    expect(sanFran).toBeDefined();
    expect(chicago).toBeDefined();
    if (sanFran === undefined || chicago === undefined) {
      throw new Error("Narrowing types to reflect previous assertions");
    }

    expect(sanFran.connections.some((connection) => connection.location.name === LocationNames.CHICAGO)).toEqual(true);

    expect(chicago.connections.some((connection) => connection.location.name === LocationNames.SAN_FRANCISCO)).toEqual(
      true,
    );
  });

  it("creates requested player cards", () => {
    const game = gameFactory.build(undefined, {
      transient: {
        playerCardLocationNames: {
          [LocationNames.SAN_FRANCISCO]: 2,
          [LocationNames.CHICAGO]: 3,
        },
      },
    });

    expect(game.playerDeck.drawPile.length).toEqual(5);
    expect(
      game.playerDeck.drawPile.filter(
        (card) => card.type === "city" && card.location.name === LocationNames.SAN_FRANCISCO,
      ).length,
    ).toEqual(2);
    expect(
      game.playerDeck.drawPile.filter((card) => card.type === "city" && card.location.name === LocationNames.CHICAGO)
        .length,
    ).toEqual(3);
  });

  it("creates requested infection cards", () => {
    const game = gameFactory.build(undefined, {
      transient: {
        infectionCardLocationNames: {
          [LocationNames.SAN_FRANCISCO]: 2,
          [LocationNames.CHICAGO]: 3,
        },
      },
    });

    expect(game.infectionDeck.drawPile.length).toEqual(5);
    expect(
      game.infectionDeck.drawPile.filter((card) => card.location.name === LocationNames.SAN_FRANCISCO).length,
    ).toEqual(2);
    expect(game.infectionDeck.drawPile.filter((card) => card.location.name === LocationNames.CHICAGO).length).toEqual(
      3,
    );
  });
});
