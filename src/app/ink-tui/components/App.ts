import { type ReactNode, createElement, useState } from "react";
import MainMenu from "./MainMenu.ts";
import GamePlayer from "./GamePlayer.ts";
import Options from "./Options.ts";

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

  return pageNode;
};

export default App;
