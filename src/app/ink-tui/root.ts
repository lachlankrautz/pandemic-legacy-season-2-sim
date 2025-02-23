import { createElement } from "react";
import { render } from "ink";
import App from "./components/App.tsx";
import type { Logger } from "../logging/logger.ts";

export type TuiRunner = {
  run: () => void;
};

export const makeTuiRunner = (logger: Logger): TuiRunner => ({
  run: (): void => {
    render(createElement(App, { logger }));
  },
});
