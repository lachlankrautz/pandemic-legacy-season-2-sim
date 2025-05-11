import { describe, it, expect } from "vitest";
import { shuffleArray } from "./random.ts";

describe("shuffle array", () => {
  it("creates changed array without affecting original", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const newArraySameValue = [...input];

    // Just a sanity check to reassure that
    // new objects with the same values are
    // considered equal.
    //
    // It is technically possible for this to shuffle into
    // the exact same order and fail the test.
    expect(input).toEqual(newArraySameValue);

    const shuffled = shuffleArray(input);

    expect(input).not.toEqual(shuffled);
  });
});
