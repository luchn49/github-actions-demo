#!/usr/bin/env node
// scripts/extract-release-notes.js

const fs = require("fs");
const {execSync} = require("child_process");

// Get version from environment variable
const version = process.env.VERSION;
if (!version) {
  console.error("VERSION environment variable is not set.");
  process.exit(1);
}

const CHANGELOG_FILE = "./CHANGELOG.md";
const OUTPUT_FILE = "./release-notes.md";

// Read the changelog file
const content = fs.readFileSync(CHANGELOG_FILE, "utf8");
const lines = content.split("\n");

// Find the line number of the version header "## 1.7.0" (exact match)
let startLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === `## ${version}`) {
    startLine = i;
    break;
  }
}
if (startLine === -1) {
  console.error(`Header "## ${version}" not found in ${CHANGELOG_FILE}`);
  process.exit(1);
}

// Find the next header after the version header to know where the section ends
let endLine = lines.length;
for (let i = startLine + 1; i < lines.length; i++) {
  if (/^##\s/.test(lines[i])) {
    endLine = i;
    break;
  }
}

// Extract the section after the header (skip the header itself)
const sectionLines = lines.slice(startLine + 1, endLine);

// Function to get the short commit hash for a specific line number in the file
function getCommitHashForLine(lineNumber) {
  try {
    const cmd = `git blame -L ${lineNumber},${lineNumber} --line-porcelain ${changelogFile}`;
    const result = execSync(cmd, {encoding: "utf8"});
    const match = result.match(/^commit (\w+)/m);
    if (match) {
      return match[1].substring(0, 7);
    }
  } catch (error) {
    console.error(`Error running git blame on line ${lineNumber}: ${error}`);
  }
  return null;
}

// Process each line in the section, and for bullet lines, append the commit hash
const processedLines = sectionLines.map((line, idx) => {
  // The original file line number (1-indexed)
  const originalLineNumber = startLine + 1 + idx + 1;
  if (/^\s*-\s+/.test(line)) {
    const hash = getCommitHashForLine(originalLineNumber);
    return hash ? `${line} (${hash})` : line;
  }
  return line;
});

// Create the final release notes text
const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
// Header format: "v1.7.0 (2025-03-15)"
const header = `v${version} (${today})\n\n`;
const finalOutput = header + processedLines.join("\n") + "\n";

// Write the release notes to output file
fs.writeFileSync(OUTPUT_FILE, finalOutput, "utf8");
console.log(`Release notes written to ${OUTPUT_FILE}`);
