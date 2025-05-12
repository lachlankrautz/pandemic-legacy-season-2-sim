import { Player } from "../../../../game/player/player.ts";
import { UserRound } from "lucide-react";

interface PlayerIndicatorProps {
  player: Player;
}

export function PlayerIndicator({ player }: PlayerIndicatorProps) {
  return (
    <div className="flex flex-col items-center">
      <UserRound size={6} />
      <span className="text-[4px]">{player.name}</span>
    </div>
  );
}
