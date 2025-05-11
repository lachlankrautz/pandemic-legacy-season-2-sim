import React from "react";
import { CityPlayerCard, EventPlayerCard, PlayerCard } from "../../../../game/cards/cards.ts";
import { cn } from "../../lib/utils.ts";
import { ComponentProps } from "react";

interface GameCardProps {
  card: PlayerCard;
}

export function GameCardCard({ card }: GameCardProps) {
  if (card.type === "city") {
    return <CityCard card={card} />;
  }

  if (card.type === "event") {
    return <EventCard card={card} />;
  }

  if (card.type === "portable_antiviral_lab") {
    return (
      <BaseCard>
        <h2 className="font-semibold">{card.displayName}</h2>
      </BaseCard>
    );
  }

  if (card.type === "produce_supplies") {
    return (
      <BaseCard className="bg-blue-800! text-neutral-50">
        <h2 className="font-semibold">{card.displayName}</h2>
      </BaseCard>
    );
  }

  if (card.type === "epidemic") {
    return (
      <BaseCard className="bg-lime-600! text-neutral-50">
        <h2 className="font-semibold">{card.displayName}</h2>
      </BaseCard>
    );
  }

  console.error("Unknown card type", card);
}

interface CityCardProps {
  card: CityPlayerCard;
}

function CityCard({ card }: CityCardProps) {
  return (
    <BaseCard
      className={cn({
        "bg-blue-500! text-neutral-50": card.location.colour === "blue",
        "bg-yellow-500! text-neutral-50": card.location.colour === "yellow",
        "bg-neutral-950! text-neutral-50": card.location.colour === "black",
      })}
    >
      <h2 className="font-semibold">{card.location.name}</h2>
    </BaseCard>
  );
}

interface EventCardProps {
  card: EventPlayerCard;
}

function EventCard({ card }: EventCardProps) {
  return (
    <BaseCard>
      <h2 className="font-semibold">{card.displayName}</h2>
    </BaseCard>
  );
}

function BaseCard({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} className={cn(className, "flex flex-col rounded-lg bg-neutral-200 p-2 aspect-[2/3]")}>
      {children}
    </div>
  );
}
