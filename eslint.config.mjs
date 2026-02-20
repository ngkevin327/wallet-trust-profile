import base from "./packages/config/eslint.config.mjs";

const nodeGlobals = {
  console: "readonly",
  process: "readonly",
  fetch: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  Buffer: "readonly",
  __dirname: "readonly",
  __filename: "readonly",
  module: "readonly",
  require: "readonly",
};

export default [
  ...base,
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: nodeGlobals },
  },
];
