/**
 * @module helpers/Core/Utils
 * @description General utility functions.
 */

/**
 * Creates a promise that resolves after a specified delay.
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates a simple debounce function.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The debounce delay in milliseconds.
 * @param {boolean} immediate - If true, trigger the function immediately before the timeout.
 * @returns {Function} The debounced function.
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const context = this;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/**
 * Generates a simple throttle function.
 * Limits the execution of a function to once every `wait` milliseconds.
 * @param {Function} func - The function to throttle.
 * @param {number} wait - The throttle interval in milliseconds.
 * @returns {Function} The throttled function.
 */
export function throttle(func, wait) {
  let timeout = null;
  let lastArgs = null;
  let lastThis = null;
  let trailingCallScheduled = false;

  function throttled(...args) {
    lastArgs = args;
    lastThis = this;

    if (!timeout) {
      func.apply(lastThis, lastArgs);
      timeout = setTimeout(() => {
        timeout = null;
        if (trailingCallScheduled) {
          throttled.apply(lastThis, lastArgs);
          trailingCallScheduled = false;
        }
      }, wait);
    } else {
      trailingCallScheduled = true;
    }
  }

  return throttled;
}

/**
 * Escapes HTML special characters in a string.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
export function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Removes duplicates from an array.
 * @template T
 * @param {T[]} arr - The input array.
 * @returns {T[]} A new array with unique elements.
 */
export function uniqueArray(arr) {
  return [...new Set(arr)];
}
