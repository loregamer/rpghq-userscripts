/**
 * Logger utility for RPGHQ Userscripts
 */
export function logInfo(message) {
  console.log(
    "%c[RPGHQ USERSCRIPTS]%c " + message,
    "color: #2196F3; font-weight: bold;",
    "color: inherit;"
  );
}

export function logSuccess(message) {
  console.log(
    "%c[RPGHQ USERSCRIPTS]%c " + message,
    "color: #4CAF50; font-weight: bold;",
    "color: inherit;"
  );
}

export function logWarning(message) {
  console.warn(
    "%c[RPGHQ USERSCRIPTS]%c " + message,
    "color: #FFC107; font-weight: bold;",
    "color: inherit;"
  );
}

export function logError(message) {
  console.error(
    "%c[RPGHQ USERSCRIPTS]%c " + message,
    "color: #F44336; font-weight: bold;",
    "color: inherit;"
  );
}
