#!/usr/bin/env node
// scripts/generate-release-notes.js

const fs = require("fs");
const {execSync} = require("child_process");

const version = process.env.VERSION;
if (!version) {
  console.error("VERSION environment variable not set.");
  process.exit(1);
}

// Get the previous tag using HEAD^ so we don't pick the current tag
function getPreviousTag() {
  try {
    return execSync("git describe --tags --abbrev=0 HEAD^", {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    console.error("Error getting previous tag:", error);
    process.exit(1);
  }
}

const previousTag = getPreviousTag();

// Get diff of CHANGELOG.md between previous tag and HEAD
let diffOutput;
try {
  diffOutput = execSync(`git diff ${previousTag} HEAD -- CHANGELOG.md`, {
    encoding: "utf8",
  });
} catch (error) {
  console.error("Error generating diff:", error);
  process.exit(1);
}

// Extract only added lines (skip diff metadata lines starting with '+++')
const addedLines = diffOutput
  .split("\n")
  .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
  .map((line) => line.substring(1)); // remove the leading '+'

// Build the release notes with a header line and the diff changes
const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
const header = `v${version} (${today})\n\n`;
const releaseBody = header + addedLines.join("\n") + "\n";

// Write to release-notes.md
fs.writeFileSync("release-notes.md", releaseBody, "utf8");
console.log(
  `Release notes generated from CHANGELOG diff between ${previousTag} and HEAD`
);
