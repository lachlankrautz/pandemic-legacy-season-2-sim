import { it, describe, expect } from "vitest";
import React from "react";
import { Text } from "ink";

describe("actions", () => {
  it("behaves", () => {
    const element = React.createElement(Text, {}, null);
    expect(element).toBeTruthy();
  });
});
