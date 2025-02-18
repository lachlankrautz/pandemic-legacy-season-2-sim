import { Factory } from "fishery";
import {
  drawPlayerCardsTurnFlowFactory,
  exposureCheckTurnFlowFactory,
  gameTurnFlowFactory,
  infectCitiesTurnFlowFactory,
  takePlayerActionsTurnFlowFactory,
} from "./game-flow/game-turn-flow-factories.ts";
import type { Connection, Game } from "./game.ts";
import { getRandomItem, shuffleArray } from "../random/random.ts";
import { getMappedLocation, type LocationName } from "./location/location.ts";
import { locationMapFactory } from "./location/location-factories.ts";
import { playerCardFactory } from "./cards/player-card-factories.ts";
import { infectionCardFactory } from "./infection/infection-card-factories.ts";
import { getMappedPlayer } from "./player/player.ts";
import { type GameOnType } from "./game-flow/game-turn-flow.ts";

export type GameParams = {
  lost: boolean;
  locationNames: LocationName[];
  links: [LocationName, LocationName][];
  infectionCardLocationNames: Record<string, number>;
  playerCardLocationNames: Record<string, number>;
  shuffleGameDecks: boolean;
};

const causes: string[] = ["player deck exhausted", "too many incidents"];

const prepareGame =
  (
    providedTurnPlayer: boolean,
    { links, infectionCardLocationNames, playerCardLocationNames, shuffleGameDecks }: Partial<GameParams>,
  ) =>
  (game: Game) => {
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

    // Create requested player city cards and push them to the deck
    // Create them in the `afterBuild` step so that the final map
    // of locations can be passed down to ensure shared objects
    // are referenced and not recreated.
    Object.entries(playerCardLocationNames || {})
      .map(([locationName, cardCount]) =>
        playerCardFactory.buildList(
          cardCount,
          {
            type: "city",
            location: { name: locationName },
          },
          // Reuse existing locations
          { transient: { locationMap: game.locations } },
        ),
      )
      .forEach((playerCards) => game.playerDeck.drawPile.push(...playerCards));

    // Create requested infection cards and push them to the deck
    // Create them in the `afterBuild` step so that the final map
    // of locations can be passed down to ensure shared objects
    // are referenced and not recreated.
    Object.entries(infectionCardLocationNames || {})
      .map(([locationName, cardCount]) =>
        infectionCardFactory.buildList(
          cardCount,
          {
            location: { name: locationName },
          },
          // Reuse existing locations
          { transient: { locationMap: game.locations } },
        ),
      )
      .forEach((infectionCards) => game.infectionDeck.drawPile.push(...infectionCards));

    if (shuffleGameDecks) {
      game.playerDeck.drawPile = shuffleArray(game.playerDeck.drawPile);
      game.playerDeck.discardPile = shuffleArray(game.playerDeck.discardPile);
      game.infectionDeck.drawPile = shuffleArray(game.infectionDeck.drawPile);
      game.infectionDeck.discardPile = shuffleArray(game.infectionDeck.discardPile);
    }

    game.getPlayer = getMappedPlayer(game.players);
    game.getLocation = getMappedLocation(game.locations);
  };

export const partialGame = Factory.define<Omit<Game, "turnFlow">, GameParams>(({ transientParams }) => {
  const { lost, locationNames } = transientParams;

  return {
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
    getPlayer: () => {
      throw new Error("valid implementation added in afterBuild step");
    },
    getLocation: () => {
      throw new Error("valid implementation added in afterBuild step");
    },
  };
});

export const gameOnExposureCheckFactory = Factory.define<GameOnType<"exposure_check">, GameParams>(
  ({ params, transientParams, afterBuild }) => {
    const providedTurnPlayer = params.turnFlow?.player !== undefined;
    afterBuild(prepareGame(providedTurnPlayer, transientParams));
    const { turnFlow, ...partialParams } = params;
    return {
      turnFlow: exposureCheckTurnFlowFactory.build(turnFlow),
      ...partialGame.build(partialParams, { transient: transientParams }),
    };
  },
);

export const gameOnTakePlayerActionsFactory = Factory.define<GameOnType<"take_4_actions">, GameParams>(
  ({ params, transientParams, afterBuild }) => {
    const providedTurnPlayer = params.turnFlow?.player !== undefined;
    afterBuild(prepareGame(providedTurnPlayer, transientParams));
    const { turnFlow, ...partialParams } = params;
    return {
      turnFlow: takePlayerActionsTurnFlowFactory.build(turnFlow),
      ...partialGame.build(partialParams, { transient: transientParams }),
    };
  },
);

export const gameOnDrawPlayerCardsFactory = Factory.define<GameOnType<"draw_2_cards">, GameParams>(
  ({ params, transientParams, afterBuild }) => {
    const providedTurnPlayer = params.turnFlow?.player !== undefined;
    afterBuild(prepareGame(providedTurnPlayer, transientParams));
    const { turnFlow, ...partialParams } = params;
    return {
      turnFlow: drawPlayerCardsTurnFlowFactory.build(turnFlow),
      ...partialGame.build(partialParams, { transient: transientParams }),
    };
  },
);

export const gameOnInfectCitiesFactory = Factory.define<GameOnType<"infect_cities">, GameParams>(
  ({ params, transientParams, afterBuild }) => {
    const providedTurnPlayer = params.turnFlow?.player !== undefined;
    afterBuild(prepareGame(providedTurnPlayer, transientParams));
    const { turnFlow, ...partialParams } = params;
    return {
      turnFlow: infectCitiesTurnFlowFactory.build(turnFlow),
      ...partialGame.build(partialParams, { transient: transientParams }),
    };
  },
);

export const gameFactory = Factory.define<Game, GameParams>(({ params, transientParams, afterBuild }) => {
  const providedTurnPlayer = params.turnFlow?.player !== undefined;
  afterBuild(prepareGame(providedTurnPlayer, transientParams));
  const { turnFlow, ...partialParams } = params;
  return {
    turnFlow: gameTurnFlowFactory.build(turnFlow),
    ...partialGame.build(partialParams, { transient: transientParams }),
  };
});
