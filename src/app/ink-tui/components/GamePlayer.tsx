import React, { createElement } from "react";
import { Text, useInput } from "ink";

export type GamePlayerProps = {
  navigateBack: () => void;
};

const GamePlayer = (props: GamePlayerProps): React.ReactNode => {
  useInput((input, key) => {
    if (key.escape || input === "q") {
      props.navigateBack();
    }
  });

  return createElement(Text, {}, "game (q: back)");
};

export default GamePlayer;
