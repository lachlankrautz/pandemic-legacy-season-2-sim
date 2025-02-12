const notPlainPrototype = Object.create(Object.prototype);

/**
 * Non-plan object.
 *
 * Create an object with a technically but not functionally
 * different prototype to an object literal {}.
 * Libraries that do things like recursively
 * merge properties will leave these alone.
 */
export const np = <T extends object>(obj: T): T =>
  Object.create(notPlainPrototype, Object.getOwnPropertyDescriptors(obj));
