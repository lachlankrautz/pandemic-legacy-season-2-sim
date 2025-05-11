import React, { useState } from "react";
import { Box, useInput } from "ink";
import type { GameDriver } from "../../../game/step/game-steps.ts";
import GameDisplay from "./GameDisplay.tsx";
import { playGameTick } from "../../../bots/dumb-bot/dumb-bot.ts";
import type { Logger } from "../../../logging/logger.ts";

export type BotProps = {
  navigateBack: () => void;
  driver: GameDriver;
  logger: Logger;
};

const BotPlayer = ({ navigateBack, driver, logger }: BotProps): React.ReactNode => {
  const [gameState, updateGameState] = useState({ game: driver.getGame() });

  useInput((input, key) => {
    if (key.escape || input === "q") {
      navigateBack();
    }

    // next game tick
    if (key.return) {
      playGameTick(driver, logger);
      // Create new wrapping object to ensure a re-render with the updated game state
      updateGameState({ game: gameState.game });
    }
  });

  return (
    <Box key={"bot-driver"} flexDirection={"row"}>
      <GameDisplay key={"display"} gameState={gameState}></GameDisplay>
    </Box>
  );
};

export default BotPlayer;
