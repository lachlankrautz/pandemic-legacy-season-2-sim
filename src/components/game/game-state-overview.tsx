import { Game } from "@/app/game/game";
import { Progress } from "../ui/progress";
import { infectionRates } from "@/app/game/infection/infection";
import { cn } from "@/lib/utils";

interface GameStateOverviewProps {
  game: Game;
}

export function GameStateOverview({ game }: GameStateOverviewProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <span className="text-neutral-400">Player Turn: </span>
        <span>{game.turnNumber}</span>
      </div>

      <div className="w-[240px]">
        <div className="flex gap-2">
          <span className="text-neutral-400">Incidents:</span>
          <div>
            <span
              className={cn("font-semibold", {
                "text-yellow-500": game.incidents >= 6 && game.incidents < 8,
                "text-red-500": game.incidents === 8,
              })}
            >
              {game.incidents}
            </span>
            /8
          </div>
        </div>
        <div className="mt-1">
          <Progress value={(game.incidents / 8) * 100} className="w-full" />
        </div>
      </div>
      <div className="w-[240px]">
        <div>
          <span className="text-neutral-400">Epidemics: </span>
          <span className="font-semibold">{game.epidemics}</span>/7
        </div>
        <div className="mt-1">
          <Progress value={(game.epidemics / 7) * 100} className="w-full" />
        </div>
      </div>

      <div className="flex gap-0.5">
        <div className="text-neutral-400">Infection Rate:</div>
        <ol className="flex gap-0.5">
          {infectionRates.map((rate) => (
            <li key={rate.position}>
              <span className={cn({ ["font-semibold text-green-700"]: rate.position === game.infectionRate.position })}>
                {rate.cards}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex gap-1">
        <span className="text-neutral-400">Remaining Player Cards:</span>
        <span className="font-semibold">{game.playerDeck.drawPile.length}</span>
      </div>
      <div className="flex gap-1">
        <span className="text-neutral-400">Build Supply Centers:</span>
        <span className="font-semibold">
          {game.objectives.find((objective) => objective.type === "build_supply_centres")?.hasBuiltCount}
        </span>
      </div>
    </div>
  );
}
