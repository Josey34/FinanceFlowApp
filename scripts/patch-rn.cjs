// @ts-check
// Postinstall script: patches react-native's entry point for vitest compatibility.
// React Native ships ESM with Flow types that Node.js cannot parse.
// This replaces the entry with a string-host mock for test-renderer compatibility.

const fs = require("fs");
const path = require("path");

const target = path.resolve(
  __dirname,
  "..",
  "node_modules",
  "react-native",
  "index.js"
);

const mock = path.resolve(__dirname, "rn-mock.js");

if (fs.existsSync(target) && !fs.readFileSync(target, "utf-8").includes("rn-mock")) {
  const content = fs.readFileSync(mock, "utf-8");
  fs.writeFileSync(target, content);
  console.log("✓ Patched react-native/index.js for vitest compatibility");
} else if (!fs.existsSync(target)) {
  console.warn("⚠ react-native not found, skipping patch");
}
