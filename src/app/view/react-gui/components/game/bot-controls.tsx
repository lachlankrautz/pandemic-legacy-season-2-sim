import { useEffect, useState } from "react";
import { Button } from "../ui/button.tsx";
import { AlertCircle, PauseIcon, PlayIcon } from "lucide-react";
import { GameState } from "../../../../game/game.ts";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert.tsx";

interface BotControlsProps {
  gameState: GameState;
  takeNextTurn: () => void;
  resetGame?: () => void;
}

export function BotControls({ gameState, takeNextTurn, resetGame }: BotControlsProps) {
  const [autoPlay, setAutoPlay] = useState(false);

  const gameIsOver = gameState.type === "won" || gameState.type === "lost";

  useEffect(() => {
    if (autoPlay && gameState.type === "playing") {
      const interval = setInterval(() => {
        takeNextTurn();
      }, 50);

      return () => clearInterval(interval);
    }
  }, [takeNextTurn, gameState, autoPlay]);

  useEffect(() => {
    if (gameIsOver) {
      setAutoPlay(false);
    }
  }, [gameIsOver]);

  return (
    <div>
      <div>
        <ol className="flex gap-1">
          {gameState.type == "lost" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>The Game is lost</AlertTitle>
              <AlertDescription>
                The game is over because your bot is too stupid. Reset the game to try again.
              </AlertDescription>
            </Alert>
          )}
          {!autoPlay && !gameIsOver && (
            <Button onClick={() => setAutoPlay(true)}>
              <PlayIcon /> Autoplay
            </Button>
          )}
          {autoPlay && !gameIsOver && (
            <Button onClick={() => setAutoPlay(false)}>
              <PauseIcon /> Autoplay
            </Button>
          )}

          <Button variant="destructive" onClick={resetGame}>
            Reset Game
          </Button>
        </ol>
      </div>
    </div>
  );
}
