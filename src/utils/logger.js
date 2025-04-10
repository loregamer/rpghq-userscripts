/**
 * Utility for consistent logging throughout the application
 * Prefixes all console outputs with a stylized RPGHQ Userscript Manager label
 */

// Helper to guess if a context string is a script ID (simple check)
// Assumes script IDs are camelCase or lowercase and contain no spaces.
function isLikelyScriptId(str) {
  return typeof str === "string" && /^[a-z]+(?:[A-Z][a-z]*)*$/.test(str);
}

/**
 * Log a message to the console with RPGHQ Userscript Manager prefix and optional context
 * @param {string} [context] - Optional context/scriptId string
 * @param {...any} args - Arguments to pass to console.log
 */
export function log(context, ...args) {
  const managerStyle =
    "background-color: #C62D51; color: white; padding: 2px 6px; border-radius: 10px; font-weight: bold;";
  const contextStyle =
    "background-color: #89a6cf; color: white; padding: 1px 4px; border-radius: 8px; font-size: 0.9em; margin-left: 4px;";

  if (typeof context === "string") {
    if (isLikelyScriptId(context)) {
      // Context looks like a script ID, show both bubbles
      console.log(
        `%c[RPGHQ USM]%c %c[${context}]%c`,
        managerStyle,
        "", // Reset style after manager bubble
        contextStyle,
        "", // Reset style after context bubble
        ...args
      );
    } else {
      // Context is a string but not a script ID, treat as part of message
      console.log(
        "%c[RPGHQ USM]%c",
        managerStyle,
        "", // Reset style
        context,
        ...args // Pass context and the rest as message parts
      );
    }
  } else {
    // If first arg isn't a string, assume it's part of the message and no context is provided
    console.log(
      "%c[RPGHQ USM]%c",
      managerStyle,
      "", // Reset style
      context,
      ...args // Pass the first arg (originally context) and the rest as message parts
    );
  }
}

/**
 * Log a warning to the console with RPGHQ Userscript Manager prefix and optional context
 * @param {string} [context] - Optional context/scriptId string
 * @param {...any} args - Arguments to pass to console.warn
 */
export function warn(context, ...args) {
  const managerStyle =
    "background-color: #FFC107; color: black; padding: 2px 6px; border-radius: 10px; font-weight: bold;";
  const contextStyle =
    "background-color: #6c757d; color: white; padding: 1px 4px; border-radius: 8px; font-size: 0.9em; margin-left: 4px;";

  if (typeof context === "string") {
    if (isLikelyScriptId(context)) {
      // Context looks like a script ID, show both bubbles
      console.warn(
        `%c[RPGHQ USM]%c %c[${context}]%c`,
        managerStyle,
        "", // Reset style after manager bubble
        contextStyle,
        "", // Reset style after context bubble
        ...args
      );
    } else {
      // Context is a string but not a script ID, treat as part of message
      console.warn(
        "%c[RPGHQ USM]%c",
        managerStyle,
        "", // Reset style
        context,
        ...args // Pass context and the rest as message parts
      );
    }
  } else {
    // If first arg isn't a string, assume it's part of the message and no context is provided
    console.warn(
      "%c[RPGHQ USM]%c",
      managerStyle,
      "", // Reset style
      context,
      ...args // Pass the first arg (originally context) and the rest as message parts
    );
  }
}

/**
 * Log an error to the console with RPGHQ Userscript Manager prefix and optional context
 * @param {string} [context] - Optional context/scriptId string
 * @param {...any} args - Arguments to pass to console.error
 */
export function error(context, ...args) {
  const managerStyle =
    "background-color: #F5575D; color: white; padding: 2px 6px; border-radius: 10px; font-weight: bold;";
  const contextStyle =
    "background-color: #6c757d; color: white; padding: 1px 4px; border-radius: 8px; font-size: 0.9em; margin-left: 4px;";

  if (typeof context === "string") {
    if (isLikelyScriptId(context)) {
      // Context looks like a script ID, show both bubbles
      console.error(
        `%c[RPGHQ USM]%c %c[${context}]%c`,
        managerStyle,
        "", // Reset style after manager bubble
        contextStyle,
        "", // Reset style after context bubble
        ...args
      );
    } else {
      // Context is a string but not a script ID, treat as part of message
      console.error(
        "%c[RPGHQ USM]%c",
        managerStyle,
        "", // Reset style
        context,
        ...args // Pass context and the rest as message parts
      );
    }
  } else {
    // If first arg isn't a string, assume it's part of the message and no context is provided
    console.error(
      "%c[RPGHQ USM]%c",
      managerStyle,
      "", // Reset style
      context,
      ...args // Pass the first arg (originally context) and the rest as message parts
    );
  }
}

/**
 * Log debug information to the console with RPGHQ Userscript Manager prefix and optional context
 * Only logs if not in production environment
 * @param {string} [context] - Optional context/scriptId string
 * @param {...any} args - Arguments to pass to console.debug
 */
export function debug(context, ...args) {
  // Consider adding a check here if debug logging is globally enabled
  const managerStyle =
    "background-color: #00AA00; color: white; padding: 2px 6px; border-radius: 10px; font-weight: bold;";
  const contextStyle =
    "background-color: #6c757d; color: white; padding: 1px 4px; border-radius: 8px; font-size: 0.9em; margin-left: 4px;";

  if (typeof context === "string") {
    if (isLikelyScriptId(context)) {
      // Context looks like a script ID, show both bubbles
      console.debug(
        `%c[RPGHQ USM]%c %c[${context}]%c`,
        managerStyle,
        "", // Reset style after manager bubble
        contextStyle,
        "", // Reset style after context bubble
        ...args
      );
    } else {
      // Context is a string but not a script ID, treat as part of message
      console.debug(
        "%c[RPGHQ USM]%c",
        managerStyle,
        "", // Reset style
        context,
        ...args // Pass context and the rest as message parts
      );
    }
  } else {
    // If first arg isn't a string, assume it's part of the message and no context is provided
    console.debug(
      "%c[RPGHQ USM]%c",
      managerStyle,
      "", // Reset style
      context,
      ...args // Pass the first arg (originally context) and the rest as message parts
    );
  }
}
