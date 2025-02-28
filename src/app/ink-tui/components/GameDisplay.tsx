import React from "react";
import { Box, Text, Newline } from "ink";
import type { Game } from "../../game/game.ts";
import type { Location } from "../../game/location/location.ts";
import { type ForegroundColorName } from "chalk";

export type LocationTableProps = {
  locations: Location[];
};

/**
 * A compareFn used to sort Locations first by plague, then supply,
 * then finally by name.
 */
export const compareLocations = (a: Location, b: Location): number => {
  if (a.plagueCubes === b.plagueCubes) {
    if (a.supplyCubes === b.supplyCubes) {
      return a.name.localeCompare(b.name);
    }

    return a.supplyCubes - b.supplyCubes;
  }
  return a.plagueCubes - b.plagueCubes;
};

export const LocationTable = ({ locations }: LocationTableProps): React.ReactNode => {
  locations.sort(compareLocations).reverse();
  return (
    <Box key="location-table" flexDirection="column" width="100%">
      <Box key="headings">
        <Box width="80%">
          <Text>City</Text>
        </Box>

        <Box width="20%">
          <Text color={"gray"}>Supply</Text>
        </Box>

        <Box width="20%">
          <Text color={"green"}>Plague</Text>
        </Box>
      </Box>

      {locations.map((location, index) => (
        <Box key={index}>
          <Box width="80%">
            <Text>{location.name}</Text>
          </Box>

          <Box width="20%">
            <Text color={"gray"}>{location.supplyCubes}</Text>
          </Box>

          <Box width="20%">
            <Text color={"green"}>{location.plagueCubes}</Text>
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

const GameDisplay = ({ gameState: { game } }: GameDisplayProps): React.ReactNode => {
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
              <Text key={index} color={card.type === "city" ? card.location.colour : "grey"}>
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
        <Newline />
      </Text>
      <Box key={"players"} width="100%">
        {playerCards}
      </Box>
      <Newline />
      <LocationTable locations={game.locations.values().toArray()}></LocationTable>
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
