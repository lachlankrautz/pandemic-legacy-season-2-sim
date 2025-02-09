import { createElement } from "react";
import { render } from "ink";
import App from "./components/App.ts";

export type TuiRunner = {
  run: () => void;
};

export const makeTuiRunner = (): TuiRunner => ({
  run: (): void => {
    render(createElement(App, {}));
  },
});
