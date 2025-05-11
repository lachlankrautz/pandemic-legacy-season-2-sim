import { render } from "ink";
import React from "react";
import App from "./components/App.tsx";
import type { Logger } from "../../logging/logger.ts";

export type TuiRunner = {
  run: (command?: "bot" | undefined) => void;
};

export const makeTuiRunner = (logger: Logger): TuiRunner => ({
  run: (command: "bot" | undefined): void => {
    render(<App logger={logger} command={command}></App>);
  },
});
