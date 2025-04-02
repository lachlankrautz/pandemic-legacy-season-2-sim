import React from "react";
import { Box, Newline, Text } from "ink";
import { type ForegroundColorName } from "chalk";
import type { Game } from "../../game/game.ts";
import { getSafeLocations, type Location } from "../../game/location/location.ts";
import type { PlayerCard } from "../../game/cards/cards.ts";
import type { Player } from "../../game/player/player.ts";
import { infectionRates } from "../../game/infection/infection.ts";

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

type CardTypeRank = {
  yellow: number;
  blue: number;
  black: number;
  none: number;
};

export const compareCards = (cards: PlayerCard[]) => {
  const cardTypeRank = cards.reduce(
    (cardTypeRank: CardTypeRank, card) => {
      if (card.type === "city") {
        cardTypeRank[card.location.colour]++;
      }
      return cardTypeRank;
    },
    {
      yellow: 0.1,
      black: 0.2,
      blue: 0.3,
      none: 0,
    },
  );

  return (a: PlayerCard, b: PlayerCard): number => {
    const aRank = a.type === "city" ? cardTypeRank[a.location.colour] : -1;
    const bRank = b.type === "city" ? cardTypeRank[b.location.colour] : -1;
    return bRank - aRank;
  };
};

export const LocationTable = ({ locations, safeLocations }: LocationTableProps): React.ReactNode => {
  locations.sort(compareLocations(safeLocations)).reverse();
  return (
    <Box key="location-table" flexDirection="column" width="100%">
      <Box key="headings">
        <Box width="20%">
          <Text>Supply/Plague</Text>
        </Box>
        <Box width="10%">
          <Text>Players</Text>
        </Box>
        <Box width="20%">
          <Text>City</Text>
        </Box>
        <Box width="50%">
          <Text>Adjacent</Text>
        </Box>
      </Box>

      {locations.map((location, index) => (
        <Box key={index}>
          <Box width="20%">
            <Text color="green">{Array.from({ length: location.plagueCubes }).map(() => "☣️")}</Text>
            <Text>{location.supplyCentre ? "🏥" : ""}</Text>
            <Text>{Array.from({ length: location.supplyCubes }).map(() => "📦")}</Text>
          </Box>
          <Box width="10%">
            <Text>{location.players.map((player) => `👤${player.name.charAt(0)}`)}</Text>
          </Box>
          <Box width="20%">
            <Text color={locationHealthColour(location, safeLocations)}>{location.name}</Text>
          </Box>
          <Box width="50%">
            {location.connections.map((connection, i) => (
              <Text key={i} color={locationHealthColour(connection.location, safeLocations)}>
                {connection.location.name},&nbsp;
              </Text>
            ))}
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

export type PlayerBlockProps = {
  player: Player;
  currentPlayerName: string;
};

export const PlayerBlock = ({ player, currentPlayerName }: PlayerBlockProps): React.ReactNode => {
  const sortedCards = [...player.cards].sort(compareCards(player.cards));
  return (
    <Box
      width="25%"
      padding={1}
      margin={1}
      borderColor={currentPlayerName === player.name ? "white" : "grey"}
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
        {sortedCards.map((card, index) => (
          <Text key={index} color={cardDisplayColour(card)}>
            - {card.displayName}
            <Newline />
          </Text>
        ))}
      </Text>
    </Box>
  );
};

const InfectionRatesDisplay = ({ ratePosition }: { ratePosition: number }): React.ReactNode => {
  return (
    <Box>
      <Text key="title">Infection Rate: </Text>
      {infectionRates.map((rate) =>
        rate.position === ratePosition ? (
          <Text color="green" key={rate.position}>
            {rate.cards}&nbsp;
          </Text>
        ) : (
          <Text key={rate.position} color="grey">
            {rate.cards}&nbsp;
          </Text>
        ),
      )}
    </Box>
  );
};

const GameDisplay = ({ gameState: { game } }: GameDisplayProps): React.ReactNode => {
  const safeLocations = getSafeLocations(game.infectionDeck);

  return (
    <Box key={"gameDisplay"} flexDirection="column" width="120">
      <Text key="epidemics">
        Epidemics: {game.epidemics}/{game.totalEpidemics}
      </Text>
      <InfectionRatesDisplay key="infectionRates" ratePosition={game.infectionRate.position}></InfectionRatesDisplay>
      <Text key="incidents">
        Incidents: <Text color={incidentsColour(game.incidents)}>{game.incidents}</Text>
      </Text>
      <Text key="player-turn">Player Turn: {game.turnNumber}</Text>
      <Text key="remaining-cards">Remaining player cards: {game.playerDeck.drawPile.length}</Text>
      <Text key="supply-centres">
        Created supply centres:
        {game.objectives.find((objective) => objective.type === "build_supply_centres")?.hasBuiltCount}
      </Text>
      <Box key={"players"} width="100%">
        {game.players
          .values()
          .toArray()
          .map((player, index) => (
            <PlayerBlock key={index} player={player} currentPlayerName={game.turnFlow.player.name}></PlayerBlock>
          ))}
      </Box>
      <Newline />
      <LocationTable locations={game.locations.values().toArray()} safeLocations={safeLocations}></LocationTable>
      <Newline />
      <Box width="100%" key="logWindow">
        <Text>
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
