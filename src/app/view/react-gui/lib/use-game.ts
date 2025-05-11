import { useCallback, useState } from "react";
import { makeStep } from "../../../bots/dumb-bot/dumb-bot.ts";
import { GameLog, makeGameLog } from "../../../game/game-log/game-log.ts";
import { makeGame } from "../../../game/start/new-game.ts";
import { makeGameDriver } from "../../../game/step/game-steps.ts";
import { Logger } from "../../../logging/logger.ts";

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
  }, [game]);

  return {
    gameState,
    resetGame,
    playNextGameTick,
  };
}
