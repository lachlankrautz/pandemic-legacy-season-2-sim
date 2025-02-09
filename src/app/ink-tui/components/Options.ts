import { createElement, type ReactNode } from "react";
import { Text, useInput } from "ink";

export type OptionsProps = {
  navigateBack: () => void;
};

const Options = (props: OptionsProps): ReactNode => {
  useInput((input, key) => {
    if (key.escape || key.backspace || input === "q") {
      props.navigateBack();
    }
  });

  return createElement(Text, {}, "Options");
};

export default Options;
