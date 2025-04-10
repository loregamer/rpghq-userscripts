/**
 * Utility for consistent logging throughout the application
 * Prefixes all console outputs with a stylized RPGHQ Userscript Manager label
 */

/**
 * Log a message to the console with RPGHQ Userscript Manager prefix
 * @param {...any} args - Arguments to pass to console.log
 */
export function log(...args) {
  console.log(
    "%c[RPGHQ Userscript Manager]%c",
    "background-color: #3889ED; color: white; padding: 2px 6px; border-radius: 10px; font-weight: bold;",
    "",
    ...args,
  );
}

/**
 * Log a warning to the console with RPGHQ Userscript Manager prefix
 * @param {...any} args - Arguments to pass to console.warn
 */
export function warn(...args) {
  console.warn(
    "%c[RPGHQ Userscript Manager]%c",
    "background-color: #FFC107; color: black; padding: 2px 6px; border-radius: 10px; font-weight: bold;",
    "",
    ...args,
  );
}

/**
 * Log an error to the console with RPGHQ Userscript Manager prefix
 * @param {...any} args - Arguments to pass to console.error
 */
export function error(...args) {
  console.error(
    "%c[RPGHQ Userscript Manager]%c",
    "background-color: #F5575D; color: white; padding: 2px 6px; border-radius: 10px; font-weight: bold;",
    "",
    ...args,
  );
}

/**
 * Log debug information to the console with RPGHQ Userscript Manager prefix
 * Only logs if not in production environment
 * @param {...any} args - Arguments to pass to console.debug
 */
export function debug(...args) {
  console.debug(
    "%c[RPGHQ Userscript Manager]%c",
    "background-color: #00AA00; color: white; padding: 2px 6px; border-radius: 10px; font-weight: bold;",
    "",
    ...args,
  );
}
