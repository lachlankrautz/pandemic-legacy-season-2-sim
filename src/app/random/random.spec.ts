import { describe, it, expect } from "vitest";
import { shuffleArray } from "./random.ts";

describe("shuffle array", () => {
  it("creates changed array without affecting original", () => {
    const input = [1, 2, 3, 4, 5];
    const newArraySameValue = [...input];

    // Just a sanity check to reassure that
    // new objects with the same values are
    // considered equal.
    expect(input).toEqual(newArraySameValue);

    const shuffled = shuffleArray(input);

    expect(input).not.toEqual(shuffled);
  });
});
