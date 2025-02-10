import { describe, it, expect } from "vitest";
import { typeStartsWith } from "./fancy-types.ts";

type Union =
  | { type: "one_one" }
  | { type: "one_two" }
  | { type: "one_three" }
  | { type: "two_one" }
  | { type: "two_two" }
  | { type: "two_three" };

type Ones = { type: "one_one" } | { type: "one_two" } | { type: "one_three" };

type Twos = { type: "two_one" } | { type: "two_two" } | { type: "two_three" };

describe("discriminated unions", () => {
  it("narrows a type based on prefix", () => {
    const demo: Union = { type: "one_one" };

    if (typeStartsWith(demo, "one_")) {
      const one: Ones = demo;
      expect(one).toBeTruthy();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const two: Twos = demo;
      expect(two).toBeTruthy();
    }

    expect(true).toBeTruthy();
  });
});
