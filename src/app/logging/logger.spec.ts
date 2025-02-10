import { describe, it, expect } from "vitest";
import { makeLogger } from "./logger.ts";

describe("logger", () => {
  it("can make separate logger instances", () => {
    const logger = makeLogger();
    const logger2 = makeLogger();
    expect(logger).not.toEqual(logger2);
  });

  it("can log strings", () => {
    const logger = makeLogger();
    expect(() => logger.info("hello")).not.toThrow();
  });

  it("can log objects", () => {
    const logger = makeLogger();
    expect(() => logger.info({ message: "hello" })).not.toThrow();
  });

  it("can log errors", () => {
    const logger = makeLogger();
    expect(() => logger.error(new Error("hello"))).not.toThrow();
  });

  it("does not return anything", () => {
    const logger = makeLogger();
    // noinspection JSVoidFunctionReturnValueUsed
    const result: unknown = logger.info("hello");
    expect(result).toBeUndefined();
  });
});
