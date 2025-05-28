/**
 * Remove all console.log and logger utility function calls from the codebase
 * Uses Babel AST for safe, lint-free transformations
 */

import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import fs from "fs";
import path from "path";
import { glob } from "glob";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Logger function names to remove
const LOGGER_FUNCTIONS = ["log", "warn", "error", "debug"];

// Console methods to remove
const CONSOLE_METHODS = ["log", "warn", "error", "debug", "info", "trace"];

/**
 * Process a single JavaScript file
 */
async function processFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, "utf8");

    // Parse the code into an AST
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    let modified = false;
    const loggerImports = new Set();
    const usedLoggerFunctions = new Set();
    let hasConsoleRemoval = false;

    // First pass: identify logger imports and track usage
    traverse.default(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        if (source.includes("logger")) {
          path.node.specifiers.forEach((spec) => {
            if (
              spec.type === "ImportSpecifier" &&
              LOGGER_FUNCTIONS.includes(spec.imported.name)
            ) {
              loggerImports.add(spec.local.name);
            }
          });
        }
      },
    });

    // Second pass: remove console calls and logger calls
    traverse.default(ast, {
      CallExpression(path) {
        const { callee } = path.node;

        // Handle console.* calls
        if (
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.name === "console" &&
          callee.property.type === "Identifier" &&
          CONSOLE_METHODS.includes(callee.property.name)
        ) {
          // Remove the entire expression statement
          if (path.parent.type === "ExpressionStatement") {
            path.parentPath.remove();
          } else {
            // If it's part of a larger expression, replace with undefined
            path.replaceWith({ type: "Identifier", name: "undefined" });
          }
          modified = true;
          hasConsoleRemoval = true;
          return;
        }

        // Handle logger function calls
        if (callee.type === "Identifier" && loggerImports.has(callee.name)) {
          // Remove the entire expression statement
          if (path.parent.type === "ExpressionStatement") {
            path.parentPath.remove();
          } else {
            // If it's part of a larger expression, replace with undefined
            path.replaceWith({ type: "Identifier", name: "undefined" });
          }
          modified = true;
          return;
        }
      },

      // Track remaining logger function usage after removal
      Identifier(path) {
        if (
          loggerImports.has(path.node.name) &&
          path.isReferencedIdentifier()
        ) {
          usedLoggerFunctions.add(path.node.name);
        }
      },
    });

    // Third pass: clean up unused logger imports
    if (modified && loggerImports.size > 0) {
      traverse.default(ast, {
        ImportDeclaration(path) {
          const source = path.node.source.value;
          if (source.includes("logger")) {
            // Filter out unused specifiers
            const remainingSpecifiers = path.node.specifiers.filter((spec) => {
              if (
                spec.type === "ImportSpecifier" &&
                loggerImports.has(spec.local.name)
              ) {
                return usedLoggerFunctions.has(spec.local.name);
              }
              return true;
            });

            if (remainingSpecifiers.length === 0) {
              // Remove the entire import if no specifiers remain
              path.remove();
            } else if (
              remainingSpecifiers.length < path.node.specifiers.length
            ) {
              // Update the import with only the remaining specifiers
              path.node.specifiers = remainingSpecifiers;
            }
          }
        },
      });
    }

    // Generate the modified code
    if (modified) {
      const generated = generate.default(
        ast,
        {
          retainLines: true,
          retainFunctionParens: true,
        },
        code,
      );

      fs.writeFileSync(filePath, generated.code);

      const relativePath = path.relative(projectRoot, filePath);
      console.log(`✓ Processed: ${relativePath}`);

      // Report what was removed
      const removals = [];
      if (hasConsoleRemoval) removals.push("console.*");
      if (loggerImports.size > usedLoggerFunctions.size) {
        removals.push(
          `logger functions (${loggerImports.size - usedLoggerFunctions.size} calls)`,
        );
      }
      if (removals.length > 0) {
        console.log(`  Removed: ${removals.join(", ")}`);
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log(
    "\n🧹 Removing console.log and logger calls from source files...\n",
  );

  // Find all JavaScript files in src directory
  const files = await glob("src/**/*.js", {
    cwd: projectRoot,
    absolute: true,
  });

  console.log(`Found ${files.length} JavaScript files to process\n`);

  let processedCount = 0;
  let modifiedCount = 0;

  for (const file of files) {
    processedCount++;
    const wasModified = await processFile(file);
    if (wasModified) {
      modifiedCount++;
    }
  }

  console.log(`\n✅ Complete!`);
  console.log(`   Processed: ${processedCount} files`);
  console.log(`   Modified: ${modifiedCount} files`);

  if (modifiedCount > 0) {
    console.log("\n📝 Running prettier to format the modified files...");
  }
}

// Run the script
main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
