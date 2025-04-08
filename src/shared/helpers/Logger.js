/**
 * @module helpers/Core/Logger
 * @description A simple console logger class with levels and context.
 */

// Define log levels
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4, // Disable all logs
};

// Determine log level (e.g., from settings or a global variable)
// Default to INFO for production, DEBUG for development maybe?
// For now, let's use INFO as default, but allow override via GM_config or similar later.
let currentLogLevel = LogLevel.INFO;

/**
 * Sets the global log level for all Logger instances.
 * @param {number} level - One of the LogLevel values.
 */
export function setGlobalLogLevel(level) {
  if (level >= LogLevel.DEBUG && level <= LogLevel.NONE) {
    currentLogLevel = level;
    console.log(
      `[Logger] Global log level set to ${Object.keys(LogLevel).find(
        (key) => LogLevel[key] === level
      )} (${level})`
    );
  } else {
    console.warn(`[Logger] Invalid log level specified: ${level}`);
  }
}

export class Logger {
  /**
   * Creates a new Logger instance.
   * @param {string} context - The context name to prepend to log messages (e.g., 'Notifications API').
   */
  constructor(context = "Default") {
    this.context = context;
  }

  _log(level, message, ...optionalParams) {
    if (level < currentLogLevel) {
      return; // Skip logging if below current level
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.context}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, ...optionalParams);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, ...optionalParams);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, ...optionalParams);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, ...optionalParams);
        break;
      default:
        console.log(prefix, message, ...optionalParams);
    }
  }

  /**
   * Logs a debug message.
   * @param {any} message - The primary message.
   * @param  {...any} optionalParams - Additional parameters to log.
   */
  debug(message, ...optionalParams) {
    this._log(LogLevel.DEBUG, message, ...optionalParams);
  }

  /**
   * Logs an info message.
   * @param {any} message - The primary message.
   * @param  {...any} optionalParams - Additional parameters to log.
   */
  info(message, ...optionalParams) {
    this._log(LogLevel.INFO, message, ...optionalParams);
  }

  /**
   * Logs a warning message.
   * @param {any} message - The primary message.
   * @param  {...any} optionalParams - Additional parameters to log.
   */
  warn(message, ...optionalParams) {
    this._log(LogLevel.WARN, message, ...optionalParams);
  }

  /**
   * Logs an error message.
   * @param {any} message - The primary message.
   * @param  {...any} optionalParams - Additional parameters to log.
   */
  error(message, ...optionalParams) {
    this._log(LogLevel.ERROR, message, ...optionalParams);
  }
}

// Example: Set log level based on a script setting or debug flag
// import { getSetting } from './SettingsManager'; // Hypothetical settings manager
// const debugMode = getSetting('global.debugMode', false);
// setGlobalLogLevel(debugMode ? LogLevel.DEBUG : LogLevel.INFO);
