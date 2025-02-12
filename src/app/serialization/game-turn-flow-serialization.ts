import type { Mapper } from "./game-serialization.ts";
import { type Static, Type } from "@sinclair/typebox";
import type { GetRequiredPlayer } from "../game/player/player.ts";
import type { GameTurnFlow } from "../game/game-flow/game-turn-flow.ts";

export const serializableGameTurnFlowSchema = Type.Union([
  Type.Object({
    type: Type.Literal("exposure_check"),
    playerName: Type.String(),
  }),
  Type.Object({
    type: Type.Literal("take_4_actions"),
    playerName: Type.String(),
    remainingActions: Type.Number({ minimum: 1, maximum: 4 }),
  }),
  Type.Object({
    type: Type.Literal("draw_2_cards"),
    playerName: Type.String(),
    remainingCards: Type.Number({ minimum: 1, maximum: 2 }),
  }),
  Type.Object({
    type: Type.Literal("infect_cities"),
    playerName: Type.String(),
    remainingCards: Type.Number({ minimum: 1, maximum: 5 }),
  }),
]);

export type SerializableGameTurnFlow = Static<typeof serializableGameTurnFlowSchema>;

export const makeGameTurnFlowMapper = (
  getPlayer: GetRequiredPlayer,
): Mapper<GameTurnFlow, SerializableGameTurnFlow> => {
  return {
    toActual: (serializable): GameTurnFlow => {
      switch (serializable.type) {
        case "exposure_check":
          return {
            type: "exposure_check",
            player: getPlayer(serializable.playerName),
          };
        case "take_4_actions":
          return {
            type: "take_4_actions",
            player: getPlayer(serializable.playerName),
            remainingActions: serializable.remainingActions,
          };
        case "draw_2_cards":
          return {
            type: "draw_2_cards",
            player: getPlayer(serializable.playerName),
            remainingCards: serializable.remainingCards,
          };
        case "infect_cities":
          return {
            type: "infect_cities",
            player: getPlayer(serializable.playerName),
            remainingCards: serializable.remainingCards,
          };
        default:
          return serializable;
      }
    },
    toSerializable: (actual): SerializableGameTurnFlow => {
      switch (actual.type) {
        case "exposure_check":
          return {
            type: "exposure_check",
            playerName: actual.player.name,
          };
        case "take_4_actions":
          return {
            type: "take_4_actions",
            playerName: actual.player.name,
            remainingActions: actual.remainingActions,
          };
        case "draw_2_cards":
          return {
            type: "draw_2_cards",
            playerName: actual.player.name,
            remainingCards: actual.remainingCards,
          };
        case "infect_cities":
          return {
            type: "infect_cities",
            playerName: actual.player.name,
            remainingCards: actual.remainingCards,
          };
        default:
          return actual;
      }
    },
  };
};
