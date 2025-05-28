import { log, warn, error } from "../utils/logger.js";

export function testScript() {
  // This actual functionality will remain
  const result = performCalculation();

  return result;
}

function performCalculation() {
  // Some actual logic
  return 42;
}

// Multiline console call
