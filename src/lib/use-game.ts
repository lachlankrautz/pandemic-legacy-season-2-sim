import { makeStep } from "@/app/bots/dumb-bot/dumb-bot";
import { GameLog, makeGameLog } from "@/app/game/game-log/game-log";
import { makeGame } from "@/app/game/start/new-game";
import { makeGameDriver } from "@/app/game/step/game-steps";
import { Logger } from "@/app/logging/logger";
import { useCallback, useState } from "react";

const logger: Logger = {
  setLevel: () => {},
  isDebugEnabled: () => false,
  info: (...args) => {
    console.log(...args);
  },
  warn: (...args) => {
    console.warn(...args);
  },
  debug: (...args) => {
    console.debug(...args);
  },
  error: (...args) => {
    console.error(...args);
  },
};

export function useGame() {
  const [game, setGame] = useState(makeGame());
  const [gameLog, setGameLog] = useState<GameLog>(() => makeGameLog(game, logger));
  const [driver, setDriver] = useState(makeGameDriver(game, gameLog));

  const [gameState, setGameState] = useState({ game: driver.getGame() });

  const playNextGameTick = useCallback(() => {
    const game = driver.getGame();
    const step = makeStep(game, game.turnFlow.player, logger);

    driver.takeStep(step);

    setGameState({ game: game });
  }, [driver, setGameState]);

  const resetGame = useCallback(() => {
    const newGame = makeGame();
    const newGameLog = makeGameLog(game, logger);
    const newDriver = makeGameDriver(newGame, newGameLog);

    setGame(newGame);
    setGameLog(newGameLog);
    setDriver(newDriver);
    setGameState({ game: newDriver.getGame() });
  }, []);

  return {
    gameState,
    resetGame,
    playNextGameTick,
  };
}
