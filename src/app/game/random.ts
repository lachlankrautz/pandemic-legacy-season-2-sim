export const shuffleArray = <T>(array: T[]): T[] => {
  const length = array.length;
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Guys settle down; we know those indexes have values.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
