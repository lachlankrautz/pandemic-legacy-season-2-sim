import { type ReactNode, useState, createElement } from "react";
import { Box, Text, useApp, useInput } from "ink";
import type { Page } from "./App.ts";

type ItemProps = {
  key: string;
  text: string;
  handler: () => void;
};

export type MainMenuProps = {
  navigate: (page: Page) => void;
};

const MainMenu = (props: MainMenuProps): ReactNode => {
  const { exit } = useApp();

  const items: ItemProps[] = [
    {
      key: "start",
      text: "Start Game",
      handler: () => props.navigate("game"),
    },
    {
      key: "options",
      text: "Options",
      handler: () => props.navigate("options"),
    },
    {
      key: "exit",
      text: "Exit",
      handler: exit,
    },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedItem = items.find((_, index) => index === selectedIndex);

  useInput((input, key) => {
    if (key.escape || input === "q") {
      exit();
    }

    if (key.downArrow || input === "j") {
      setSelectedIndex((selectedIndex + 1) % items.length);
    }

    if (key.upArrow || input === "k") {
      setSelectedIndex((items.length + selectedIndex - 1) % items.length);
    }

    if (key.return) {
      selectedItem?.handler();
    }
  });

  return createElement(
    Box,
    { flexDirection: "column", width: 50 },
    items.map((item, index) => {
      return createElement(
        Box,
        {
          key: item.key,
          borderStyle: "round",
          borderColor: selectedIndex === index ? "green" : "black",
          justifyContent: "center",
        },
        createElement(Text, {}, item.text),
      );
    }),
  );
};

export default MainMenu;
