import React, { Fragment, useState } from "react";
import { Text } from "ink";

type ItemProps = {
  key: string;
  text: string;
};

const MainMenu = () => {
  const items: ItemProps[] = [
    {
      key: "start",
      text: "Start Game",
    },
    {
      key: "options",
      text: "Options",
    },
    {
      key: "exit",
      text: "Exit",
    },
  ];
  const [selectedIndex] = useState(0);

  return React.createElement(
    Fragment,
    {},
    items.map((item, index) =>
      React.createElement(Text, { key: item.key }, selectedIndex === index ? `* ${item.text} *` : `  ${item.text}  `),
    ),
  );
};

export default MainMenu;
