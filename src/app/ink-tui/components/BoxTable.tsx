import React from "react";
import { Box, Text } from "ink";

export type BoxTableProps = {
  colWidthsPercentage: number[];
  headings?: string[];
  rows: React.ReactNode[][];
};

export const BoxTable = ({ colWidthsPercentage, headings, rows }: BoxTableProps): React.ReactNode => {
  return (
    <Box flexDirection="column" width="100%">
      {headings !== undefined && (
        <Box key="headings">
          {headings.map((heading, colIndex) => (
            <Box key={colIndex} width={`${colWidthsPercentage[colIndex]}%`}>
              <Text>{heading}</Text>
            </Box>
          ))}
        </Box>
      )}
      {rows.map((row, rowIndex) => (
        <Box key={rowIndex}>
          {row.map((cell, colIndex) => (
            <Box key={colIndex} width={`${colWidthsPercentage[colIndex]}%`}>
              {cell}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};
