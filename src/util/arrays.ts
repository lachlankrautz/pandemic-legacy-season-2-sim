export const chunkArray = <T>(array: T[], size: number): T[][] => {
  if (size <= 0) {
    throw new Error("Chunk size must be greater than 0");
  }
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
};

export const partition = <T>(array: T[], predicate: (item: T, index: number) => boolean): [T[], T[]] => {
  const pass: T[] = [];
  const fail: T[] = [];
  array.forEach((item, index) => {
    (predicate(item, index) ? pass : fail).push(item);
  });
  return [pass, fail];
};

export const partitionOne = <T>(array: T[], predicate: (item: T, index: number) => boolean): [T | undefined, T[]] => {
  let pass: T | undefined;
  const fail: T[] = [];

  array.forEach((item, index) => {
    if (!predicate(item, index)) {
      fail.push(item);
    } else {
      predicate = () => false;
      pass = item;
    }
  });

  return [pass, fail];
};
