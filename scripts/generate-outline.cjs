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
const allowedTopLevelDirs = ['docs', 'scripts', 'src', 'tools']; // ADDED

// --- Phase 1: Pre-analyze all JS files ---
console.log("Analyzing JavaScript files...");
// Analyze JS files from allowed directories only? No, the current analysis is fine,
// it just builds a cache. Filtering happens during tree generation.
const jsFiles = glob.sync("**/*.js", {
  cwd: projectRoot,
  ignore: ignorePatterns,
  absolute: true, // Get absolute paths
  nodir: true, // Ensure we only get files
});

jsFiles.forEach((filePath) => {
  const normalizedPath = path.normalize(filePath);
  // Optimization: Only parse files within the allowed directories - Sticking with the original plan: analyze all, filter tree. Easier.

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const ast = parser.parse(content, {
      sourceType: "module",
      plugins: [],
      errorRecovery: true,
    });

    const functionsInFile = {};
    traverse(ast, {
      FunctionDeclaration(nodePath) {
        const functionName = nodePath.node.id ? nodePath.node.id.name : "[Anonymous FunctionDeclaration]";
        if (!functionsInFile[functionName]) functionsInFile[functionName] = { calls: new Set() };
        nodePath.traverse({
            CallExpression(innerPath) {
              let calledName = "";
              const callee = innerPath.node.callee;
              if (callee.type === "Identifier") calledName = callee.name;
              else if (callee.type === "MemberExpression" && callee.property.type === "Identifier") calledName = callee.property.name;
              if (calledName) functionsInFile[functionName].calls.add(calledName);
            }
        }, this);
      },
      VariableDeclarator(nodePath) {
        if (nodePath.node.id.type === "Identifier" && (nodePath.node.init?.type === "FunctionExpression" || nodePath.node.init?.type === "ArrowFunctionExpression")) {
          const functionName = nodePath.node.id.name;
          if (!functionsInFile[functionName]) functionsInFile[functionName] = { calls: new Set() };
          const functionBodyPath = nodePath.get("init.body");
          if (functionBodyPath) {
            functionBodyPath.traverse({
              CallExpression(innerPath) {
                let calledName = "";
                const callee = innerPath.node.callee;
                if (callee.type === "Identifier") calledName = callee.name;
                else if (callee.type === "MemberExpression" && callee.property.type === "Identifier") calledName = callee.property.name;
                if (calledName) functionsInFile[functionName].calls.add(calledName);
              }
            });
          }
        }
      },
    });

    if (Object.keys(functionsInFile).length > 0) {
      functionDataCache[normalizedPath] = functionsInFile;
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.warn(`Warning: Could not parse ${path.relative(projectRoot, filePath)}: ${err.message}`);
      functionDataCache[normalizedPath] = { error: `Syntax Error: ${err.message.split("\\n")[0]}` };
    }
  }
});
console.log(`Analyzed ${jsFiles.length} JS files. Found functions/data for ${Object.keys(functionDataCache).length}.`);

// --- Phase 2: Generate Directory Tree ---
console.log("Generating file tree...");
let markdownContent = `# Project Outline\n\n\`\`\`\n${path.basename(projectRoot)}\n`;

// MODIFIED FUNCTION
function generateTree(directoryPath, prefix = "", isRootLevel = false) {
  let entries;
  try {
    entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  } catch (error) {
    if (error.code !== "EPERM" && error.code !== "EACCES") {
      console.error(`Error reading directory ${directoryPath}: ${error.message}`);
    }
    return;
  }

  // Original filter based on ignorePatterns
  let filteredEntries = entries.filter((entry) => {
    const fullPath = path.join(directoryPath, entry.name);
    const relativePath = path.relative(projectRoot, fullPath).replace(/\\/g, "/");
    return !micromatch.isMatch(relativePath, ignorePatterns, { dot: true });
  });

  // ADDED: Filter top-level directories if at root
  if (isRootLevel) {
      filteredEntries = filteredEntries.filter(entry =>
          // Ensure it's a directory and its name is in the allowed list
          entry.isDirectory() && allowedTopLevelDirs.includes(entry.name)
      );
  }

  // Sort: directories first, then files, alphabetically
  filteredEntries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  filteredEntries.forEach((entry, index) => {
    const isLast = index === filteredEntries.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const childPrefix = prefix + (isLast ? "    " : "│   ");
    const fullPath = path.join(directoryPath, entry.name);
    const normalizedPath = path.normalize(fullPath);

    markdownContent += `${prefix}${connector}${entry.name}\n`;

    if (entry.isDirectory()) {
      // Pass isRootLevel as false for recursive calls
      generateTree(fullPath, childPrefix, false);
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".js") &&
      functionDataCache[normalizedPath]
    ) {
      const functionData = functionDataCache[normalizedPath];
      const funcIndent = childPrefix + " ".repeat(1);

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
                markdownContent += `${funcIndent}    - ${call}\n`;
              });
            }
          });
        }
      }
    }
  });
}

// Start tree generation from the root, filtering top-level
generateTree(projectRoot, "", true); // MODIFIED CALL

markdownContent += "\n```\n"; // Close markdown code block

// --- Phase 3: Write Output ---
try {
  fs.writeFileSync(outputFile, markdownContent);
  console.log(`Outline successfully generated at ${outputFile}`);
} catch (err) {
  console.error(`Error writing outline file ${outputFile}: ${err.message}`);
}
