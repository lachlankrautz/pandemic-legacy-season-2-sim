import React from "react";
import { render } from "ink";
import MainMenu from "./components/MainMenu.ts";

export type TuiRunner = {
  run: () => void;
};

export const makeTuiRunner = (): TuiRunner => ({
  run: (): void => {
    render(React.createElement(MainMenu, {}));
  },
});
