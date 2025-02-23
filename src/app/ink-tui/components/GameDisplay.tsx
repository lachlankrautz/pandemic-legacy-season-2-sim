import React from "react";
import { Box, Text } from "ink";
import type { Game } from "../../game/game.ts";

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
        <Box key={index}>
          <Text key={player.name}>Name: {player.name}</Text>
        </Box>
      );
    });

  // const locationData: { name: string; supply: number; plague: number }[] = game.locations
  //   .values()
  //   .toArray()
  //   .map((location) => ({
  //     name: location.name,
  //     supply: location.supplyCubes,
  //     plague: location.plagueCubes,
  //   }));

  return (
    <Box key={"gameDisplay"} flexDirection={"row"}>
      <Box key={"players"} flexDirection={"column"}>
        {playerCards}
      </Box>
      <Box
        key={"logWindow"}
        // minHeight: 6,
        // height: 6,
        // minWidth: 120,
        borderStyle={"single"}
      >
        <Text>Logs:\n{game.gameLog.slice(game.gameLog.length - 5).join("\n")}`)</Text>
      </Box>
    </Box>
  );
};

export default GameDisplay;
