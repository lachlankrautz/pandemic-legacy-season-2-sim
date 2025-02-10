export type Discriminated<T extends string = string> = {
  type: T;
};

export const typeStartsWith = <TDiscriminator extends string, TPrefix extends string>(
  union: Discriminated<TDiscriminator>,
  prefix: TPrefix,
): union is { type: Extract<TDiscriminator, `${TPrefix}${string}`> } => union.type.startsWith(prefix);
