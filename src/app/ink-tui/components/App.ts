import { type ReactNode, createElement, useState, Fragment } from "react";
import MainMenu from "./MainMenu.ts";
import GamePlayer from "./GamePlayer.ts";
import Options from "./Options.ts";
import { Box, Text } from "ink";

export type Page = "main" | "game" | "options";

const App = (): ReactNode => {
  const [page, navigate] = useState<Page>("main");

  let pageNode: ReactNode;
  switch (page) {
    case "main":
      pageNode = createElement(MainMenu, { navigate });
      break;
    case "game":
      pageNode = createElement(GamePlayer, { navigateBack: () => navigate("main") });
      break;
    case "options":
      pageNode = createElement(Options, { navigateBack: () => navigate("main") });
      break;
  }

  return createElement(Fragment, {}, [
    createElement(Text, { key: "title" }, "Pandemic Legacy Season 2"),
    createElement(Box, { key: "page" }, pageNode),
    createElement(Text, { key: "footer" }, "esc,q to quit"),
  ]);
};

export default App;
