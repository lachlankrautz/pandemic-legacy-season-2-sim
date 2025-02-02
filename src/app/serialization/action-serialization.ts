import { Type } from "@sinclair/typebox";

export const serializableActionSchema = Type.Union([
  Type.Object({
    type: Type.Literal("move"),
    isFree: Type.Boolean(),
    toLocationName: Type.String(),
  }),
  Type.Object({
    type: Type.Literal("make_supplies"),
    isFree: Type.Literal(false),
  }),
  Type.Object({
    type: Type.Literal("drop_supplies"),
    isFree: Type.Literal(false),
    supplyCubes: Type.Number(),
  }),
]);
