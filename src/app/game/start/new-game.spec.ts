import { describe, it, expect } from "vitest";
import { makeSerializableGame } from "./new-game.ts";
import { type SerializableGame, serializableGameSchema } from "../../serialization/game-serialization.ts";
import { Value } from "@sinclair/typebox/value";

describe("new game", () => {
  it("creates a valid new game", () => {
    const serializableGame: SerializableGame = makeSerializableGame();
    expect(serializableGame).toBeDefined();

    expect(() => Value.Parse(serializableGameSchema, serializableGame)).not.toThrow();
  });
});
