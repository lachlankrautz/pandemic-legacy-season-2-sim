import { Player } from "@/app/game/player/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { GameCardCard } from "./game-card";

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const emptySupplyCubeSlots = 8 - player.supplyCubes;
  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>{player.name}</CardTitle>
        <CardDescription>📍{player.location.name}</CardDescription>
      </CardHeader>
      <CardContent>
        {new Array(player.supplyCubes).fill("📦").join("")}
        <span className="opacity-30">{new Array(emptySupplyCubeSlots).fill("📦").join("")}</span>
        <ul className="grid grid-cols-4 gap-0.5 text-[0.5rem] mt-2">
          {player.cards.map((card, index) => (
            <GameCardCard key={index} card={card} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
