import { type Static, Type } from "@sinclair/typebox";
import type { Action } from "../game/action/actions.ts";
import type { Mapper } from "./game-serialization.ts";

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
  Type.Object({
    type: Type.Literal("make_supply_centre"),
    isFree: Type.Literal(false),
    cardSelection: Type.Array(
      Type.Union([
        Type.Literal(0),
        Type.Literal(1),
        Type.Literal(2),
        Type.Literal(3),
        Type.Literal(4),
        Type.Literal(5),
        Type.Literal(6),
      ]),
      { uniqueItems: true },
    ),
  }),
]);

export type SerializableAction = Static<typeof serializableActionSchema>;

export const makeActionMapper = (): Mapper<Action, SerializableAction> => ({
  toSerializable: (actual): SerializableAction => {
    switch (actual.type) {
      case "make_supply_centre":
        return {
          type: "make_supply_centre",
          isFree: actual.isFree,
          cardSelection: Array.from(actual.cardSelection.values()),
        };
      default:
        return actual;
    }
  },
  toActual: (serializable): Action => {
    switch (serializable.type) {
      case "make_supply_centre":
        return {
          type: "make_supply_centre",
          isFree: serializable.isFree,
          cardSelection: new Set(serializable.cardSelection),
        };
      default:
        return serializable;
    }
  },
});
