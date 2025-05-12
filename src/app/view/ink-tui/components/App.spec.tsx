import { it, describe, expect } from "vitest";
import { render } from "ink-testing-library";
import { makeLogger } from "../../../logging/logger.ts";
import App from "./App.tsx";

describe("app", () => {
  it("displays the app", () => {
    const { lastFrame } = render(<App logger={makeLogger()}></App>);

    expect(lastFrame()).toContain("Pandemic");
  });
});
