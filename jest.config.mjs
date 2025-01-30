/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 *
 * @type {import('jest').Config}
 */
const config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/iac/", "/dist/"],
  modulePathIgnorePatterns: ["/dist/"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/iac/", "/dist/"],
  transform: {
    "^.+\\.tsx?$": "@swc/jest",
  },
  testTimeout: 10000,
};

process.env.TZ = "UTC";

export default config;
