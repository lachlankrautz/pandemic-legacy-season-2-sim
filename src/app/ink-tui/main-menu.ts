import React, { useState, useEffect } from "react";
import { render, Text } from "ink";

const Counter = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((previousCounter) => previousCounter + 1);
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return React.createElement(Text, { color: "green" }, `${counter} wow what a cool counter`);
};

export type TuiRunner = {
  run: () => void;
};

export const makeTuiRunner = (): TuiRunner => ({
  run: (): void => {
    render(React.createElement(Counter));
  },
});
