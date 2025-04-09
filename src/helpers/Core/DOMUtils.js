/**
 * @module helpers/Core/DOMUtils
 * @description General utility functions for DOM manipulation.
 */

/**
 * Creates an HTML element with specified attributes and inner HTML.
 * @param {string} tag - The HTML tag name (e.g., 'div', 'span').
 * @param {Object} [attributes={}] - An object containing element attributes (e.g., { className: 'my-class', id: 'my-id' }).
 * @param {string} [innerHTML=''] - The inner HTML content for the element.
 * @returns {HTMLElement} The created HTML element.
 */
export function createElement(tag, attributes = {}, innerHTML = "") {
  const element = document.createElement(tag);
  for (const key in attributes) {
    if (Object.hasOwnProperty.call(attributes, key)) {
      // Handle className separately for convenience
      if (key === "className") {
        element.className = attributes[key];
      } else if (key.startsWith("data-")) {
        // Use dataset for data attributes
        element.dataset[key.substring(5)] = attributes[key];
      } else {
        element.setAttribute(key, attributes[key]);
      }
    }
  }
  if (innerHTML) {
    element.innerHTML = innerHTML;
  }
  return element;
}

/**
 * Applies multiple CSS styles to an element.
 * @param {HTMLElement} element - The element to style.
 * @param {Object} styles - An object where keys are CSS property names (camelCase) and values are the property values.
 */
export function applyStyle(element, styles) {
  if (!element || !styles) return;
  for (const property in styles) {
    if (Object.hasOwnProperty.call(styles, property)) {
      element.style[property] = styles[property];
    }
  }
}

/**
 * Removes all child nodes from an element.
 * @param {HTMLElement} element - The element to clear.
 */
export function clearElement(element) {
  if (!element) return;
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Inserts an element after a reference element.
 * @param {Node} newNode - The node to insert.
 * @param {Node} referenceNode - The node after which to insert.
 */
export function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

/**
 * Finds the closest ancestor element matching a selector.
 * Similar to element.closest(), but works in environments where it might be missing.
 * @param {Element} element - The starting element.
 * @param {string} selector - The CSS selector to match.
 * @returns {Element|null} The matching ancestor or null.
 */
export function findClosest(element, selector) {
  if (!element) return null;
  if (element.closest) {
    return element.closest(selector);
  }
  // Basic polyfill if closest is not available
  let el = element;
  while (el) {
    if (el.matches && el.matches(selector)) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}
