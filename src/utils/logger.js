/**
 * Utility for consistent logging throughout the application
 * Prefixes all console outputs with a stylized RPGHQ Userscript Manager label
 */

/**
 * Log a message to the console with RPGHQ Userscript Manager prefix
 * @param {...any} args - Arguments to pass to console.log
 */
export function log(...args) {}

/**
 * Log a warning to the console with RPGHQ Userscript Manager prefix
 * @param {...any} args - Arguments to pass to console.warn
 */
export function warn(...args) {}

/**
 * Log an error to the console with RPGHQ Userscript Manager prefix
 * @param {...any} args - Arguments to pass to console.error
 */
export function error(...args) {}

/**
 * Log debug information to the console with RPGHQ Userscript Manager prefix
 * Only logs if not in production environment
 * @param {...any} args - Arguments to pass to console.debug
 */
export function debug(...args) {}
