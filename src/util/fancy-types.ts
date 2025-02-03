export const typeStartsWith = <TDiscriminator extends string, TPrefix extends string>(
  union: { type: TDiscriminator },
  prefix: TPrefix,
): union is { type: Extract<TDiscriminator, `${TPrefix}${string}`> } => union.type.startsWith(prefix);
