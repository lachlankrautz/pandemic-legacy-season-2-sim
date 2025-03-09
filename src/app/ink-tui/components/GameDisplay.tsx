import React from "react";
import { Box, Text, Newline } from "ink";
import { type ForegroundColorName } from "chalk";
import type { Game } from "../../game/game.ts";
import { type Location, LocationNames } from "../../game/location/location.ts";
import type { Deck, InfectionCard, PlayerCard } from "../../game/cards/cards.ts";

export type LocationTableProps = {
  locations: Location[];
  safeLocations: Set<string>;
};

const cardDisplayColour = (card: PlayerCard): ForegroundColorName => {
  if (card.type !== "city") {
    return "white";
  }

  switch (card.location.colour) {
    case "black":
      return "grey";
    case "none":
      return "white";
    default:
      return card.location.colour;
  }
};

const locationHealthColour = (location: Location, safeLocations: Set<string>): ForegroundColorName => {
  if (location.type === "haven") {
    return "white";
  }

  if (safeLocations.has(location.name)) {
    return "grey";
  }

  if (location.supplyCubes >= 3) {
    return "green";
  } else if (location.supplyCubes > 0) {
    return "yellow";
  } else if (location.plagueCubes === 0) {
    return "magenta";
  } else {
    return "red";
  }
};

/**
 * A compareFn used to sort Locations taking into account:
 * - is the location in the injection deck
 * - plague cubes
 * - supply cubes
 * - haven/city
 * - name
 */
export const compareLocations =
  (safeLocations: Set<string>) =>
  (a: Location, b: Location): number => {
    if (!safeLocations.has(a.name) && !safeLocations.has(b.name)) {
      if (a.plagueCubes === b.plagueCubes) {
        if (a.supplyCubes === b.supplyCubes) {
          return a.name.localeCompare(b.name);
        }

        return a.supplyCubes - b.supplyCubes;
      }
      return a.plagueCubes - b.plagueCubes;
    } else {
      return !safeLocations.has(a.name) ? 1 : -1;
    }
  };

export const LocationTable = ({ locations, safeLocations }: LocationTableProps): React.ReactNode => {
  locations.sort(compareLocations(safeLocations)).reverse();
  return (
    <Box key="location-table" flexDirection="column" width="100%">
      <Box key="headings">
        <Box width="30%">
          <Text>Supply/Plague</Text>
        </Box>
        <Box width="20%">
          <Text>Players</Text>
        </Box>
        <Box width="50%">
          <Text>City</Text>
        </Box>
      </Box>

      {locations.map((location, index) => (
        <Box key={index}>
          <Box width="30%">
            <Text color="green">{Array.from({ length: location.plagueCubes }).map(() => "☣️")}</Text>
            <Text>{Array.from({ length: location.supplyCubes }).map(() => "📦")}</Text>
          </Box>
          <Box width="20%">
            <Text>{location.players.map(() => "👤")}</Text>
          </Box>
          <Box width="50%">
            <Text color={locationHealthColour(location, safeLocations)}>{location.name}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

const incidentsColour = (incidents: number): ForegroundColorName => {
  if (incidents > 5) {
    return "red";
  } else if (incidents > 2) {
    return "yellow";
  }

  return "white";
};

export type GameDisplayProps = {
  // Use a wrapper so a new object can be provided without altering the
  // actual game
  gameState: { game: Game };
};

/**
 * Safe locations are "not in play"; they do not appear in the injection deck
 * and do not need much protection.
 */
const getSafeLocations = (deck: Deck<InfectionCard>): Set<string> => {
  const inPlay = new Set([...deck.drawPile, ...deck.discardPile].map((card) => card.location.name));
  return new Set(Object.values(LocationNames).filter((name) => !inPlay.has(name)));
};

const GameDisplay = ({ gameState: { game } }: GameDisplayProps): React.ReactNode => {
  const safeLocations = getSafeLocations(game.infectionDeck);

  const playerCards = game.players
    .values()
    .toArray()
    .map((player, index) => {
      return (
        <Box
          key={index}
          width="25%"
          padding={1}
          margin={1}
          borderColor={game.turnFlow.player.name === player.name ? "white" : "grey"}
          borderStyle="bold"
        >
          <Text key={player.name}>
            Name: {player.name}
            <Newline />
            Location: {player.location.name}
            <Newline />
            Supply: {player.supplyCubes}
            <Newline />
            Cards:
            <Newline />
            {player.cards.map((card, index) => (
              <Text key={index} color={cardDisplayColour(card)}>
                - {card.displayName}
                <Newline />
              </Text>
            ))}
          </Text>
        </Box>
      );
    });

  return (
    <Box key={"gameDisplay"} flexDirection="column" width="120">
      <Text key="incidents">
        Incidents: <Text color={incidentsColour(game.incidents)}>{game.incidents}</Text>
      </Text>
      <Text key="player-turn">Player Turn: {game.turnNumber}</Text>
      <Text key="remaining-cards">Remaining player cards: {game.playerDeck.drawPile.length}</Text>
      <Text key="supply-centres">
        New supply centres:
        {game.objectives.find((objective) => objective.type === "build_supply_centres")?.hasBuiltCount}
      </Text>
      <Box key={"players"} width="100%">
        {playerCards}
      </Box>
      <Newline />
      <LocationTable locations={game.locations.values().toArray()} safeLocations={safeLocations}></LocationTable>
      <Newline />
      <Box width="100%" key="logWindow">
        <Text color="grey">
          Logs:
          <Newline />
          {game.gameLog.slice(game.gameLog.length - 10).join("\n")}
        </Text>
      </Box>
      <Newline />
    </Box>
  );
};

export default GameDisplay;
