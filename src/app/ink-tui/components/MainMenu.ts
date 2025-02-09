import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";

type ItemProps = {
  key: string;
  text: string;
  handler: () => void;
};

const MainMenu = () => {
  const { exit } = useApp();

  const items: ItemProps[] = [
    {
      key: "start",
      text: "Start Game",
      handler: () => undefined,
    },
    {
      key: "options",
      text: "Options",
      handler: () => undefined,
    },
    {
      key: "exit",
      text: "Exit",
      handler: exit,
    },
  ];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedItem = items.find((_, index) => index === selectedIndex);
  if (selectedItem === undefined) {
    throw new Error("Unable to determine selected item", { cause: { index: selectedItem } });
  }

  useInput((input, key) => {
    if (input === "q") {
      exit();
    }

    if (key.downArrow || input === "j") {
      setSelectedIndex((selectedIndex + 1) % items.length);
    }

    if (key.upArrow || input === "k") {
      setSelectedIndex((items.length + selectedIndex - 1) % items.length);
    }

    if (key.return) {
      selectedItem.handler();
    }
  });

  return React.createElement(
    Box,
    {},
    items.map((item, index) => {
      return React.createElement(
        Box,
        {
          key: item.key,
          borderStyle: "round",
          borderColor: selectedIndex === index ? "green" : "black",
        },
        React.createElement(Text, {}, item.text),
      );
    }),
  );
};

export default MainMenu;
