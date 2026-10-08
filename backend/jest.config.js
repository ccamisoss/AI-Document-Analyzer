import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset({
  tsconfig: {
    // The app emits ESM (nodenext). Jest still loads tests with require(),
    // so compile the test run to CommonJS.
    module: "commonjs",
    moduleResolution: "node",
    verbatimModuleSyntax: false,
  },
}).transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  // Source imports use the .js extension required by nodenext.
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  setupFiles: ["<rootDir>/src/__tests__/setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/src/__tests__/setup.ts"],
};
