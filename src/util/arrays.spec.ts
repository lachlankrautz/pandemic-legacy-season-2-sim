import { describe, it, expect } from "vitest";
import { chunkArray, partition, partitionOne } from "./arrays.ts";

describe("chunk", () => {
  it("divides an array into smaller chunks", () => {
    const input = [1, 2, 3, 4, 5, 6, 7];
    const chunks = chunkArray(input, 2);
    expect(chunks).toEqual([[1, 2], [3, 4], [5, 6], [7]]);
  });

  it("throws with invalid chunk size", () => {
    const input = [1, 2, 3, 4, 5, 6, 7];
    expect(() => chunkArray(input, 0)).toThrow();
  });
});

describe("partition", () => {
  it("partitions hits and misses into separate arrays", () => {
    const input = [1, 2, 3, 4, 5];
    const [hits, misses] = partition(input, (number) => number < 3);
    expect(hits).toEqual([1, 2]);
    expect(misses).toEqual([3, 4, 5]);
  });
});

describe("partition one", () => {
  it("partitions the remainder of an array with a single hit", () => {
    const input = [1, 2, 3, 4, 5];
    const [hit, misses] = partitionOne(input, (number) => number < 3);
    expect(hit).toEqual(1);
    expect(misses).toEqual([2, 3, 4, 5]);
  });
});
