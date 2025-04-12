// @prettier-ignore
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const micromatch = require("micromatch");

const projectRoot = path.join(__dirname, "..");
const outputFile = path.join(projectRoot, "OUTLINE.md");
const ignorePatterns = [
  "node_modules/**",
  ".git/**",
  ".cursor/**",
  "dist/**",
  "**/lib/**",
  "**/*.min.js",
  "OUTLINE.md", // Don't include the outline itself
];
const functionDataCache = {}; // Cache for { absolutePath: { funcName: { calls: Set<string> } } }

// --- Phase 1: Pre-analyze all JS files ---
console.log("Analyzing JavaScript files...");
const jsFiles = glob.sync("**/*.js", {
  cwd: projectRoot,
  ignore: ignorePatterns,
  absolute: true, // Get absolute paths
  nodir: true, // Ensure we only get files
});

jsFiles.forEach((filePath) => {
  const normalizedPath = path.normalize(filePath);
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const ast = parser.parse(content, {
      sourceType: "module", // Assuming ES Modules in src, adjust if needed
      plugins: [], // Add necessary babel plugins for your syntax if any
      errorRecovery: true, // Try to parse even with minor errors
    });

    const functionsInFile = {};
    traverse(ast, {
      // Handles: function funcName() { ... }
      FunctionDeclaration(nodePath) {
        // Use nodePath to avoid conflict with 'path' module
        const functionName = nodePath.node.id
          ? nodePath.node.id.name
          : "[Anonymous FunctionDeclaration]";
        if (!functionsInFile[functionName])
          functionsInFile[functionName] = { calls: new Set() };
        nodePath.traverse(
          {
            CallExpression(innerPath) {
              let calledName = "";
              const callee = innerPath.node.callee;
              if (callee.type === "Identifier") {
                calledName = callee.name;
              } else if (
                callee.type === "MemberExpression" &&
                callee.property.type === "Identifier"
              ) {
                calledName = callee.property.name; // Captures obj.method()
              }
              // Add more complex callee checks if needed (e.g., this.method())
              if (calledName) {
                functionsInFile[functionName].calls.add(calledName);
              }
            },
          },
          this
        ); // Pass parent scope if needed, or manage scope explicitly
      },
      // Handles: const funcName = function() { ... }; const funcName = () => { ... }; etc.
      VariableDeclarator(nodePath) {
        if (
          nodePath.node.id.type === "Identifier" &&
          (nodePath.node.init?.type === "FunctionExpression" ||
            nodePath.node.init?.type === "ArrowFunctionExpression")
        ) {
          const functionName = nodePath.node.id.name;
          if (!functionsInFile[functionName])
            functionsInFile[functionName] = { calls: new Set() };

          // Traverse within the function's body/scope
          const functionBodyPath = nodePath.get("init.body");
          if (functionBodyPath) {
            functionBodyPath.traverse({
              CallExpression(innerPath) {
                let calledName = "";
                const callee = innerPath.node.callee;
                if (callee.type === "Identifier") {
                  calledName = callee.name;
                } else if (
                  callee.type === "MemberExpression" &&
                  callee.property.type === "Identifier"
                ) {
                  calledName = callee.property.name;
                }
                if (calledName) {
                  functionsInFile[functionName].calls.add(calledName);
                }
              },
            });
          }
        }
      },
      // TODO: Add ClassMethod visitor if needed
    });

    if (Object.keys(functionsInFile).length > 0) {
      functionDataCache[normalizedPath] = functionsInFile;
    }
  } catch (err) {
    // Log only syntax errors during parsing phase
    if (err instanceof SyntaxError) {
      console.warn(
        `Warning: Could not parse ${path.relative(projectRoot, filePath)}: ${err.message}`
      );
      functionDataCache[normalizedPath] = {
        error: `Syntax Error: ${err.message.split("\\n")[0]}`,
      }; // Store concise error
    } else {
      // Optionally log other errors if needed for debugging, but they can be noisy
      // console.warn(`Warning: Problem processing ${path.relative(projectRoot, filePath)}: ${err.message}`);
    }
  }
});
console.log(
  `Analyzed ${jsFiles.length} JS files. Found functions/data for ${Object.keys(functionDataCache).length}.`
);

// --- Phase 2: Generate Directory Tree ---
console.log("Generating file tree...");
// Use path.basename for cleaner root display
let markdownContent = `# Project Outline\n\n\`\`\`\n${path.basename(projectRoot)}\n`;

function generateTree(directoryPath, prefix = "") {
  let entries;
  try {
    entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  } catch (error) {
    // Silently ignore permission errors, log others
    if (error.code !== "EPERM" && error.code !== "EACCES") {
      console.error(
        `Error reading directory ${directoryPath}: ${error.message}`
      );
    }
    return;
  }

  const filteredEntries = entries.filter((entry) => {
    const fullPath = path.join(directoryPath, entry.name);
    const relativePath = path
      .relative(projectRoot, fullPath)
      .replace(/\\/g, "/"); // Use forward slashes for matching
    // Micromatch expects forward slashes
    return !micromatch.isMatch(relativePath, ignorePatterns, { dot: true });
  });

  // Sort: directories first, then files, alphabetically
  filteredEntries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  filteredEntries.forEach((entry, index) => {
    const isLast = index === filteredEntries.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const childPrefix = prefix + (isLast ? "    " : "│   "); // Spaces for indentation
    const fullPath = path.join(directoryPath, entry.name);
    const normalizedPath = path.normalize(fullPath); // Normalize for cache lookup

    markdownContent += `${prefix}${connector}${entry.name}\n`; // Use actual newline

    if (entry.isDirectory()) {
      generateTree(fullPath, childPrefix);
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".js") &&
      functionDataCache[normalizedPath]
    ) {
      const functionData = functionDataCache[normalizedPath];

      // Indent function details using the childPrefix
      const funcIndent = childPrefix + " ".repeat(1); // Add a space after the tree lines

      if (functionData.error) {
        markdownContent += `${funcIndent}(Error parsing: ${functionData.error})\n`;
      } else {
        const functionNames = Object.keys(functionData).sort();
        if (functionNames.length > 0) {
          functionNames.forEach((funcName) => {
            markdownContent += `${funcIndent}└─> **${funcName}**\n`;
            const calls = Array.from(functionData[funcName].calls).sort();
            if (calls.length > 0) {
              calls.forEach((call) => {
                // Indent calls further
                markdownContent += `${funcIndent}    - ${call}\n`;
              });
            }
          });
        }
        // Optionally add a note if a JS file was parsed but no functions found
        // else { markdownContent += `${funcIndent}(No functions found)\n`; }
      }
    }
    // Add a blank line after directories or JS files with details for spacing? Maybe not needed.
    // if (entry.isDirectory() || (entry.isFile() && entry.name.endsWith('.js') && functionDataCache[normalizedPath])) {
    //     markdownContent += `${childPrefix}\n`;
    // }
  });
}

// Start tree generation from the root
generateTree(projectRoot);

markdownContent += "\n```\n"; // Close markdown code block

// --- Phase 3: Write Output ---
try {
  fs.writeFileSync(outputFile, markdownContent);
  console.log(`Outline successfully generated at ${outputFile}`);
} catch (err) {
  console.error(`Error writing outline file ${outputFile}: ${err.message}`);
}
