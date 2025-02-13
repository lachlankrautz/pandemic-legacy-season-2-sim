import { Factory } from "fishery";
import { gameTurnFlowFactory } from "./game-flow/game-turn-flow-factories.ts";
import type { Connection, Game } from "./game.ts";
import { getRandomItem } from "../random/random.ts";
import { type LocationName } from "./location/location.ts";
import { locationMapFactory } from "./location/location-factories.js";

export type GameParams = {
  lost: boolean;
  locationNames: LocationName[];
  links: [LocationName, LocationName][];
};

const causes: string[] = ["player deck exhausted", "too many incidents"];

export const gameFactory = Factory.define<Game, GameParams>(
  ({ params, transientParams: { lost, links, locationNames }, afterBuild }) => {
    const providedTurnPlayer = params.turnFlow?.player !== undefined;

    afterBuild((game) => {
      // Add current player to players if not present
      const currentPlayer = game.turnFlow.player;
      if (game.players.get(currentPlayer.name) === undefined) {
        if (game.players.size >= 4) {
          throw new Error("Unable to add current player to players list - too many players");
        }
        const mappedPlayer = game.players.get(currentPlayer.name);
        if (mappedPlayer !== undefined && currentPlayer !== mappedPlayer) {
          throw new Error("Unable to add current player to players list - duplicate player name found");
        }
        game.players.set(currentPlayer.name, currentPlayer);
      }

      // If a player wasn't provided for turn order take one from the map
      if (!providedTurnPlayer) {
        const firstMapPlayer = game.players.values().toArray().shift();
        if (firstMapPlayer) {
          game.turnFlow.player = firstMapPlayer;
        }
      }

      game.players.values().map((mappedPlayer) => {
        const mapLocation = game.locations.get(mappedPlayer.location.name);
        // Ensure player locations are added to the game state.
        if (!mapLocation) {
          game.locations.set(mappedPlayer.location.name, mappedPlayer.location);
        } else if (mapLocation === mappedPlayer.location) {
          throw new Error("Player location exists in game but isn't the same object - broken references could occur");
        }

        // Ensure players are added to their current locations
        if (!mappedPlayer.location.players.some((locationPlayer) => locationPlayer === mappedPlayer)) {
          mappedPlayer.location.players.push(mappedPlayer);
        }
      });

      // Create connections between locations based on provided links
      if (links !== undefined) {
        for (const [from, to] of links) {
          const fromLocation = game.locations.get(from);
          const toLocation = game.locations.get(to);

          // Ignore links for missing locations, they are not needed
          if (fromLocation === undefined || toLocation === undefined) {
            continue;
          }

          const connectionType: Connection["type"] =
            fromLocation.type === "inland" || toLocation.type === "inland" ? "land" : "sea";

          // Create connection if not found
          if (!fromLocation.connections.some((connection) => connection.location === toLocation)) {
            fromLocation.connections.push({
              location: toLocation,
              type: connectionType,
            });
          }

          // Create reverse connection if not found
          if (!toLocation.connections.some((connection) => connection.location === fromLocation)) {
            toLocation.connections.push({
              location: fromLocation,
              type: connectionType,
            });
          }
        }
      }
    });

    return {
      turnFlow: gameTurnFlowFactory.build(),
      locations: locationNames ? locationMapFactory.build(undefined, { transient: { locationNames } }) : new Map(),
      players: new Map(),
      objectives: [],
      month: {
        name: "March",
        supplies: 27,
      },
      bonusSupplies: 15,
      playerDeck: {
        drawPile: [],
        discardPile: [],
      },
      infectionDeck: {
        drawPile: [],
        discardPile: [],
      },
      infectionRate: {
        position: 1,
        cards: 2,
      },
      incidents: 0,
      state: lost ? { type: "lost", cause: getRandomItem(causes) } : { type: "playing" },
      stepHistory: [],
      gameLog: [],
    };
  },
);
