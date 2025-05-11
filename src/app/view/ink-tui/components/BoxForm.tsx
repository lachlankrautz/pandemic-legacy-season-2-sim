import React from "react";
import { Box } from "ink";

export type BoxFormProps = {
  colWidthsPercentage?: [number, number];
  rows: [React.ReactNode, React.ReactNode][];
};

export const BoxForm = ({ colWidthsPercentage, rows }: BoxFormProps): React.ReactNode => {
  const [headingWidth, valueWidth] = colWidthsPercentage === undefined ? [50, 50] : colWidthsPercentage;

  return (
    <Box flexDirection="column" width="100%">
      {rows.map(([heading, value], rowIndex) => (
        <Box key={rowIndex}>
          <Box key="heading" width={`${headingWidth}%`}>
            {heading}
          </Box>
          <Box key="value" width={`${valueWidth}%`}>
            {value}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
