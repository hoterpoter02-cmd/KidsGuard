const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  roots: ["<rootDir>/src/tests"],
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!src/**/index.{ts,js}",
    "!src/**/*.d.ts",
  ],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
};
