import type { Mapper } from "./game-serialization.ts";
import type { GameFlow, GetRequiredPlayer } from "../game/game.ts";
import { type Static, Type } from "@sinclair/typebox";

export const serializableGameFlowSchema = Type.Union([
  Type.Object({
    type: Type.Literal("game_won"),
  }),
  Type.Object({
    type: Type.Literal("game_over"),
    cause: Type.String(),
  }),
  Type.Object({
    type: Type.Literal("player_turn:exposure_check"),
    playerName: Type.String(),
  }),
  Type.Object({
    type: Type.Literal("player_turn:take_4_actions"),
    playerName: Type.String(),
    remainingActions: Type.Number({ minimum: 1, maximum: 4 }),
  }),
  Type.Object({
    type: Type.Literal("player_turn:draw_2_cards"),
    playerName: Type.String(),
    remainingCards: Type.Number({ minimum: 1, maximum: 2 }),
  }),
  Type.Object({
    type: Type.Literal("player_turn:infect_cities"),
    playerName: Type.String(),
    remainingCards: Type.Number({ minimum: 1, maximum: 5 }),
  }),
]);

export type SerializableGameFlow = Static<typeof serializableGameFlowSchema>;

export const makeGameFlowMapper = (getPlayer: GetRequiredPlayer): Mapper<GameFlow, SerializableGameFlow> => {
  return {
    toActual: (serializable): GameFlow => {
      switch (serializable.type) {
        case "player_turn:exposure_check":
          return {
            type: "player_turn:exposure_check",
            player: getPlayer(serializable.playerName),
          };
        case "player_turn:take_4_actions":
          return {
            type: "player_turn:take_4_actions",
            player: getPlayer(serializable.playerName),
            remainingActions: serializable.remainingActions,
          };
        case "player_turn:draw_2_cards":
          return {
            type: "player_turn:draw_2_cards",
            player: getPlayer(serializable.playerName),
            remainingCards: serializable.remainingCards,
          };
        case "player_turn:infect_cities":
          return {
            type: "player_turn:infect_cities",
            player: getPlayer(serializable.playerName),
            remainingCards: serializable.remainingCards,
          };
        default:
          return serializable;
      }
    },
    toSerializable: (actual): SerializableGameFlow => {
      switch (actual.type) {
        case "player_turn:exposure_check":
          return {
            type: "player_turn:exposure_check",
            playerName: actual.player.name,
          };
        case "player_turn:take_4_actions":
          return {
            type: "player_turn:take_4_actions",
            playerName: actual.player.name,
            remainingActions: actual.remainingActions,
          };
        case "player_turn:draw_2_cards":
          return {
            type: "player_turn:draw_2_cards",
            playerName: actual.player.name,
            remainingCards: actual.remainingCards,
          };
        case "player_turn:infect_cities":
          return {
            type: "player_turn:infect_cities",
            playerName: actual.player.name,
            remainingCards: actual.remainingCards,
          };
        default:
          return actual;
      }
    },
  };
};
