import { type Static, Type } from "@sinclair/typebox";
import { type SerializableAction, serializableActionSchema } from "./action-serialization.ts";
import type { Step } from "../game/game-steps.ts";
import type { Mapper } from "./game-serialization.ts";
import type { Action } from "../game/actions.ts";
import type { GetRequiredPlayer } from "../game/game.ts";

export const serializableStepSchema = Type.Union([
  Type.Object({
    type: Type.Literal("check_for_exposure"),
    playerName: Type.String(),
  }),
  Type.Object({
    type: Type.Literal("player_action"),
    playerName: Type.String(),
    action: serializableActionSchema,
  }),
  Type.Object({
    type: Type.Literal("draw_player_card"),
    playerName: Type.String(),
  }),
  Type.Object({
    type: Type.Literal("draw_infection_card"),
    playerName: Type.String(),
  }),
  Type.Object({
    type: Type.Literal("play_event_card"),
    playerName: Type.String(),
    TODO_defineComplexChoices: Type.Unknown(),
  }),
  Type.Object({
    type: Type.Literal("discard_player_cards"),
    playerName: Type.String(),
    cardNames: Type.Array(Type.String()),
  }),
]);

export type SerializableStep = Static<typeof serializableStepSchema>;

export const makeStepMapper = (
  getPlayer: GetRequiredPlayer,
  actionMapper: Mapper<Action, SerializableAction>,
): Mapper<Step, SerializableStep> => ({
  toSerializable: (actual): SerializableStep => {
    switch (actual.type) {
      case "player_action":
        return {
          type: "player_action",
          playerName: actual.player.name,
          action: actionMapper.toSerializable(actual.action),
        };
      case "check_for_exposure":
        return {
          type: "check_for_exposure",
          playerName: actual.player.name,
        };
      case "discard_player_cards":
        return {
          type: "discard_player_cards",
          playerName: actual.player.name,
          // TODO this should probably be hand indexes
          cardNames: actual.cardNames,
        };
      case "draw_player_card":
        return {
          type: "draw_player_card",
          playerName: actual.player.name,
        };
      case "draw_infection_card":
        return {
          type: "draw_infection_card",
          playerName: actual.player.name,
        };
      case "play_event_card":
        return {
          type: "play_event_card",
          playerName: actual.player.name,
          TODO_defineComplexChoices: actual.TODO_defineComplexChoices,
        };
    }
  },
  toActual: (serializable): Step => {
    switch (serializable.type) {
      case "player_action":
        return {
          type: "player_action",
          player: getPlayer(serializable.playerName),
          action: actionMapper.toActual(serializable.action),
        };
      case "check_for_exposure":
        return {
          type: "check_for_exposure",
          player: getPlayer(serializable.playerName),
        };
      case "discard_player_cards":
        return {
          type: "discard_player_cards",
          player: getPlayer(serializable.playerName),
          // TODO this should probably be hand indexes
          cardNames: serializable.cardNames,
        };
      case "draw_player_card":
        return {
          type: "draw_player_card",
          player: getPlayer(serializable.playerName),
        };
      case "draw_infection_card":
        return {
          type: "draw_infection_card",
          player: getPlayer(serializable.playerName),
        };
      case "play_event_card":
        return {
          type: "play_event_card",
          player: getPlayer(serializable.playerName),
          TODO_defineComplexChoices: serializable.TODO_defineComplexChoices,
        };
    }
  },
});
