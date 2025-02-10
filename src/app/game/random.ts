export const shuffleArray = <T>(array: T[]): T[] => {
  // Make a copy to ensure the original array is unchanged.
  const shuffled = [...array];

  const length = shuffled.length;
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Guys settle down; we know those indexes have values.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
