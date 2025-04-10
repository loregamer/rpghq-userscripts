const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "..",
  "dist",
  "rpghq-userscript-manager.user.js",
);
const loggerPath = path.join(__dirname, "..", "src", "utils", "logger.js"); // Path to the logger definition

console.log(`🔄 Replacing console calls in ${filePath}...`);

try {
  let content = fs.readFileSync(filePath, "utf8");
  const loggerContent = fs.readFileSync(loggerPath, "utf8");

  // Identify the lines defining the logger functions to avoid replacing console calls within them
  const loggerFunctionLines = new Set();
  const loggerLines = loggerContent.split("\n");
  let inFunction = false;
  let braceLevel = 0;
  loggerLines.forEach((line, index) => {
    if (
      line.includes("export function log(") ||
      line.includes("export function warn(") ||
      line.includes("export function error(") ||
      line.includes("export function debug(")
    ) {
      inFunction = true;
      braceLevel = 0; // Reset brace level for the new function
    }
    if (inFunction) {
      loggerFunctionLines.add(line.trim()); // Add the trimmed line content for easier matching
      if (line.includes("{")) braceLevel++;
      if (line.includes("}")) braceLevel--;
      if (braceLevel === 0 && line.trim() === "}") {
        inFunction = false;
      }
    }
  });

  // Add the specific console call lines from the logger to the exclusion set
  loggerFunctionLines.add("console.log(");
  loggerFunctionLines.add("console.warn(");
  loggerFunctionLines.add("console.error(");
  loggerFunctionLines.add("console.debug(");

  let lines = content.split("\n");
  let replacementsMade = 0;

  lines = lines.map((line) => {
    let modifiedLine = line;
    // Avoid replacing lines that are part of the logger definition itself
    if (loggerFunctionLines.has(line.trim().split(/\(|`/)[0] + "(")) {
      // Basic check: if the line starts with the console call pattern found within the logger file, skip it.
      // This is not foolproof for complex logger structures but works for the current one.
      return line;
    }

    // Replace console.log but not console.log itself within the logger
    if (
      modifiedLine.includes("console.log(") &&
      !modifiedLine.match(/console\.log\(\s*`%c\[RPGHQ USM\]%c/)
    ) {
      modifiedLine = modifiedLine.replace(
        /console\.log\(/g,
        "log('uncategorized', ",
      );
      replacementsMade++;
    }
    // Replace console.warn but not console.warn itself within the logger
    if (
      modifiedLine.includes("console.warn(") &&
      !modifiedLine.match(/console\.warn\(\s*`%c\[RPGHQ USM\]%c/)
    ) {
      modifiedLine = modifiedLine.replace(
        /console\.warn\(/g,
        "warn('uncategorized', ",
      );
      replacementsMade++;
    }
    // Replace console.error but not console.error itself within the logger
    if (
      modifiedLine.includes("console.error(") &&
      !modifiedLine.match(/console\.error\(\s*`%c\[RPGHQ USM\]%c/)
    ) {
      modifiedLine = modifiedLine.replace(
        /console\.error\(/g,
        "error('uncategorized', ",
      );
      replacementsMade++;
    }
    // Replace console.debug but not console.debug itself within the logger
    if (
      modifiedLine.includes("console.debug(") &&
      !modifiedLine.match(/console\.debug\(\s*`%c\[RPGHQ USM\]%c/)
    ) {
      modifiedLine = modifiedLine.replace(
        /console\.debug\(/g,
        "debug('uncategorized', ",
      );
      replacementsMade++;
    }
    return modifiedLine;
  });

  content = lines.join("\n");

  fs.writeFileSync(filePath, content, "utf8");
  console.log(
    `✅ Console calls replaced. ${replacementsMade} replacements made.`,
  );
} catch (error) {
  console.error("❌ Error processing file:", error);
  process.exit(1);
}
