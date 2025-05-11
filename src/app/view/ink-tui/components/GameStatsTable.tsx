import React from "react";
import { Box, Text } from "ink";
import type { Game } from "../../../game/game.ts";
import { infectionRates } from "../../../game/infection/infection.ts";
import { BoxForm } from "./BoxForm.tsx";

const InfectionRatesDisplay = ({ ratePosition }: { ratePosition: number }): React.ReactNode => {
  return (
    <Box>
      {infectionRates.map((rate) =>
        rate.position === ratePosition ? (
          <Text color="green" key={rate.position}>
            {rate.cards}&nbsp;
          </Text>
        ) : (
          <Text key={rate.position} color="grey">
            {rate.cards}&nbsp;
          </Text>
        ),
      )}
    </Box>
  );
};

export type GameStatsTableProps = {
  game: Game;
};

export const GameStatsTable = ({ game }: GameStatsTableProps): React.ReactNode => {
  return (
    <BoxForm
      colWidthsPercentage={[20, 80]}
      rows={[
        [
          <Text key="1">Epidemics:</Text>,
          <Text key="2">
            {game.epidemics}/{game.totalEpidemics}
          </Text>,
        ],
        [
          <Text key="title">Infection Rate:</Text>,
          <InfectionRatesDisplay
            key="infectionRates"
            ratePosition={game.infectionRate.position}
          ></InfectionRatesDisplay>,
        ],
        [
          <Text key="title">Incidents:</Text>,
          <Text key="incidents">
            {Array.from({ length: 8 }).map((_, index) => (index < game.incidents ? "🟩" : "⬜"))}
          </Text>,
        ],
        [<Text key="title">Player Turn:</Text>, <Text key="player-turn">{game.turnNumber}</Text>],
        [
          <Text key="title">Remaining player cards:</Text>,
          <Text key="remaining-cards">{game.playerDeck.drawPile.length}</Text>,
        ],
        [
          <Text key="title">Created supply centres:</Text>,
          <Text key="supply-centres">
            {game.objectives.find((objective) => objective.type === "build_supply_centres")?.hasBuiltCount}
          </Text>,
        ],
      ]}
    ></BoxForm>
  );
};
