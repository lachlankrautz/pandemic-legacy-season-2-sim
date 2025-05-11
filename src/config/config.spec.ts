import { describe, it, expect } from "vitest";
import { parseEnvToConfig } from "./config.ts";
import path from "path";
import * as fs from "node:fs";

describe("config", () => {
  it("requires nothing to be set", () => {
    const config = parseEnvToConfig({});
    expect(config).toBeDefined();
  });

  it("defines seed if provided", () => {
    const seed = "random-seed";
    const config = parseEnvToConfig({ SEED: seed });
    expect(config).toBeDefined();
    expect(config.seed).toEqual(seed);
  });

  it("locates the saves dir", () => {
    const config = parseEnvToConfig({});
    const readmeContent = fs.readFileSync(path.resolve(config.saveDir, "README.md"), "utf-8");
    expect(readmeContent).toBeTruthy();
    expect(readmeContent).toContain("save files");
  });
});
