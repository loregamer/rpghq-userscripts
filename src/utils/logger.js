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
    "color: #3889ED; font-weight: bold",
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
    "color: #FFC107; font-weight: bold",
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
    "color: #F5575D; font-weight: bold",
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
    "color: #00AA00; font-weight: bold",
    "",
    ...args,
  );
}
