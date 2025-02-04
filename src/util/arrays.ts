export const chunkArray = <T>(array: T[], size: number): T[][] => {
  if (size <= 0) {
    throw new Error("Chunk size must be greater than 0");
  }
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
};
