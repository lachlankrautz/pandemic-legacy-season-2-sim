import { type ReactNode, useState } from "react";
import { Box, useInput } from "ink";
import type { GameDriver } from "../../game/step/game-steps.ts";
import GameDisplay from "./GameDisplay.tsx";
import { playGameTick } from "../../bots/dumb-bot/dumb-bot.ts";

export type BotProps = {
  navigateBack: () => void;
  driver: GameDriver;
};

const BotPlayer = ({ navigateBack, driver }: BotProps): ReactNode => {
  const [gameState, updateGameState] = useState({ game: driver.getGame() });

  useInput((input, key) => {
    if (key.escape || input === "q") {
      navigateBack();
    }

    // next game tick
    if (key.return) {
      playGameTick(driver);
      // Create new wrapping object to ensure a re-render with the updated game state
      updateGameState({ game: gameState.game });
    }
  });

  return (
    <Box key={"bot-driver"} flexDirection={"row"} height={40} width={120}>
      <GameDisplay key={"display"} gameState={gameState}></GameDisplay>
    </Box>
  );
};

export default BotPlayer;
