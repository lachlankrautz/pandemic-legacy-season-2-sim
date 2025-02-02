import { type Static, Type } from "@sinclair/typebox";
import { serializableActionSchema } from "./action-serialization.ts";
import type { Step } from "../game/game-steps.ts";

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

export const serializableStepToStep = (serializableStep: SerializableStep): Step => {
  return serializableStep;
};

export const stepToStepSerializableStep = (step: Step): SerializableStep => {
  return step;
};
