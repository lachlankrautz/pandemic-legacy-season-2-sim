import React from "react";
import { PlayerCard } from "./components/game/player-card.tsx";
import { WorldMap } from "./components/game/world-map.tsx";
import { GameStateOverview } from "./components/game/game-state-overview.tsx";
import { BotControls } from "./components/game/bot-controls.tsx";
import { useGame } from "./lib/use-game.ts";

function App() {
  const { gameState, playNextGameTick, resetGame } = useGame();

  return (
    <div className="relative w-screen h-screen overflow-clip">
      <WorldMap locations={gameState.game.locations.values().toArray()} />

      <div className="absolute top-2 left-2">
        <GameStateOverview game={gameState.game} />
      </div>

      <div className="absolute top-2 right-2">
        <ol className="flex flex-col gap-2">
          {gameState.game.players.values().map((player) => (
            <li key={player.name}>
              <PlayerCard player={player} />
            </li>
          ))}
        </ol>
      </div>

      <div className="absolute bottom-2 left-2">
        <BotControls gameState={gameState.game.state} takeNextTurn={playNextGameTick} resetGame={resetGame} />
      </div>
    </div>
  );
}

export default App;
