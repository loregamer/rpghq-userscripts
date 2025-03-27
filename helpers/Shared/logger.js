/**
 * Logger utility for RPGHQ Userscripts
 */
function logInfo(message) {
  console.log('%c[RPGHQ USERSCRIPTS]%c ' + message, 'color: #2196F3; font-weight: bold;', 'color: inherit;');
}

function logSuccess(message) {
  console.log('%c[RPGHQ USERSCRIPTS]%c ' + message, 'color: #4CAF50; font-weight: bold;', 'color: inherit;');
}

function logWarning(message) {
  console.warn('%c[RPGHQ USERSCRIPTS]%c ' + message, 'color: #FFC107; font-weight: bold;', 'color: inherit;');
}

function logError(message) {
  console.error('%c[RPGHQ USERSCRIPTS]%c ' + message, 'color: #F44336; font-weight: bold;', 'color: inherit;');
}

// Export the functions
if (typeof module !== 'undefined') {
  module.exports = {
    logInfo,
    logSuccess,
    logWarning,
    logError
  };
}