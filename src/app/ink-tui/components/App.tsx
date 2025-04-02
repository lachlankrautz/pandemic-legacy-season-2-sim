import React, { useState } from "react";
import MainMenu from "./MainMenu.tsx";
import GamePlayer from "./GamePlayer.tsx";
import Options from "./Options.tsx";
import { Box, Newline, Text } from "ink";
import Bot from "./Bot.tsx";
import { makeGame } from "../../game/start/new-game.ts";
import { type GameDriver, makeGameDriver } from "../../game/step/game-steps.ts";
import { makeGameLog } from "../../game/game-log/game-log.ts";
import { type Logger } from "../../logging/logger.ts";

export type Page = "main" | "game" | "options" | "bot";

const newGameDriver = (logger: Logger): GameDriver => {
  const game = makeGame();
  const gameLog = makeGameLog(game, logger);
  return makeGameDriver(game, gameLog);
};

export type AppProps = {
  logger: Logger;
  command?: "bot" | undefined;
};

const App = ({ command, logger }: AppProps): React.ReactNode => {
  const [page, navigate] = useState<Page>(command || "main");
  const [driver] = useState(() => newGameDriver(logger));

  let pageNode: React.ReactNode;
  switch (page) {
    case "main":
      pageNode = <MainMenu key={"main"} navigate={navigate}></MainMenu>;
      break;
    case "game":
      pageNode = <GamePlayer key={"game"} navigateBack={() => navigate("main")}></GamePlayer>;
      break;
    case "options":
      pageNode = <Options key={"options"} navigateBack={() => navigate("main")}></Options>;
      break;
    case "bot":
      pageNode = <Bot key={"bot"} driver={driver} logger={logger} navigateBack={() => navigate("main")}></Bot>;
      break;
    default:
      throw new Error("Unknown page");
  }

  return (
    <>
      <Text key={"title"}>Pandemic Legacy Season 2</Text>
      <Newline />
      <Box key={"page"}>{pageNode}</Box>
      <Text key={"footer"} dimColor={true}>
        esc,q to quit
      </Text>
    </>
  );
};

export default App;
