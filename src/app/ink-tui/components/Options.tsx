import React from "react";
import { Text, useInput } from "ink";

export type OptionsProps = {
  navigateBack: () => void;
};

const Options = (props: OptionsProps): React.ReactNode => {
  useInput((input, key) => {
    if (key.escape || input === "q") {
      props.navigateBack();
    }
  });

  return <Text>Options (q: back)</Text>;
};

export default Options;
