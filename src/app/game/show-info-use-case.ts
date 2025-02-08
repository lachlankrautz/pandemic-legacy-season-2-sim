import type { Repository } from "../repository/repository.ts";
import { type Game, type Location, type Player } from "./game.ts";
import Table from "cli-table";

export type ShowInfo = "all" | "locations" | "players";

export const showInfoUseCase = (repo: Repository, fileName: string, showInfo: ShowInfo): string => {
  const game: Game = repo.loadGame(fileName);

  switch (showInfo) {
    case "all":
      return showAll(game) + "\n";
    case "locations":
      return game.locations
        .values()
        .map((location) => `${location.name}: ${location.supplyCubes} supply, ${location.plagueCubes} plague\n`)
        .toArray()
        .join("");
    case "players":
      return game.players.values().map(showPlayer).toArray().join("\n");
  }
};

const showAll = (game: Game): string => {
  return `Pandemic Legacy Season 2
Month: ${game.month.name}

Objectives:
${game.objectives.map((objective) => ` - ${objective.name}\n`).join("")}
Players:

${game.players
  .values()
  .map((player) => showPlayer(player))
  .toArray()
  .join("\n")}
Locations:

${showLocations(game.locations.values().toArray())}
`;
};

const showLocations = (locations: Location[]): string => {
  const table = new Table({
    head: ["Supplies", "Plague", "Name", "Colour"],
    rows: locations.map((location) => [
      `${location.supplyCubes > 0 ? location.supplyCubes : ""}`,
      `${location.plagueCubes > 0 ? location.plagueCubes : ""}`,
      location.name,
      location.colour === "none" ? "" : location.colour.charAt(0).toUpperCase() + location.colour.slice(1),
    ]),
  });
  return table.toString();
};

const showPlayer = (player: Player): string => {
  return `${player.name}
Hand:
${player.cards.map((card, index) => `[${index}] ${card.displayName}\n`).join("")}`;
};
