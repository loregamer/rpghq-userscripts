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
const definedFunctionNames = new Set();
const functionDefinitionLocations = new Map(); // ADDED: Map<funcName, Set<absolutePath>>
const allowedTopLevelDirs = ['docs', 'scripts', 'src', 'tools'];

// --- Phase 1: Pre-analyze all JS files ---
console.log("Analyzing JavaScript files...");
const jsFiles = glob.sync("**/*.js", {
  cwd: projectRoot,
  ignore: ignorePatterns,
  absolute: true,
  nodir: true,
});

jsFiles.forEach((filePath) => {
  const normalizedPath = path.normalize(filePath);
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
        definedFunctionNames.add(functionName);
        // ADDED: Store definition location
        if (!functionDefinitionLocations.has(functionName)) {
            functionDefinitionLocations.set(functionName, new Set());
        }
        functionDefinitionLocations.get(functionName).add(normalizedPath);
        // END ADDED
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
          definedFunctionNames.add(functionName);
          // ADDED: Store definition location
          if (!functionDefinitionLocations.has(functionName)) {
              functionDefinitionLocations.set(functionName, new Set());
          }
          functionDefinitionLocations.get(functionName).add(normalizedPath);
          // END ADDED
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
console.log(`Analyzed ${jsFiles.length} JS files. Found functions/data for ${Object.keys(functionDataCache).length}. Defined functions: ${definedFunctionNames.size}`);

// --- Phase 2: Generate Directory Tree ---
console.log("Generating file tree...");
let markdownContent = `# Project Outline\n\n\`\`\`\n${path.basename(projectRoot)}\n`;

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

  let filteredEntries = entries.filter((entry) => {
    const fullPath = path.join(directoryPath, entry.name);
    const relativePath = path.relative(projectRoot, fullPath).replace(/\\/g, "/");
    return !micromatch.isMatch(relativePath, ignorePatterns, { dot: true });
  });

  if (isRootLevel) {
      filteredEntries = filteredEntries.filter(entry =>
          entry.isDirectory() && allowedTopLevelDirs.includes(entry.name)
      );
  }

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
      generateTree(fullPath, childPrefix, false);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".js") || entry.name.endsWith(".cjs")) &&
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
            const projectCalls = Array.from(functionData[funcName].calls)
                                     .filter(call => definedFunctionNames.has(call))
                                     .sort();

            markdownContent += `${funcIndent}└─> **${funcName}**\n`;
            if (projectCalls.length > 0) {
              projectCalls.forEach((call) => {
                let locationString = "";
                const locations = functionDefinitionLocations.get(call);
                if (locations && locations.size > 0) {
                  // MODIFIED: Get relative paths and join
                  const relativePaths = Array.from(locations)
                                            .map(loc => path.relative(projectRoot, loc).replace(/\\/g, "/"))
                                            .sort(); // Sort relative paths for consistency
                  locationString = ` (from ${relativePaths.join(", ")})`;
                }
                markdownContent += `${funcIndent}    └─> ${call}${locationString}\n`;
              });
            }
          });
        }
      }
    }
  });
}

generateTree(projectRoot, "", true);

markdownContent += "\n```\n";

// --- Phase 3: Write Output ---
try {
  fs.writeFileSync(outputFile, markdownContent);
  console.log(`Outline successfully generated at ${outputFile}`);
} catch (err) {
  console.error(`Error writing outline file ${outputFile}: ${err.message}`);
}
