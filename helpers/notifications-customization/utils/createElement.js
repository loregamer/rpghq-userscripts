/**
 * Create a DOM element with attributes and inner HTML
 * @param {string} tag - The HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string} innerHTML - Inner HTML content
 * @returns {Element} The created element
 */
export function createElement(tag, attributes = {}, innerHTML = "") {
  const element = document.createElement(tag);
  Object.assign(element, attributes);
  element.innerHTML = innerHTML;
  return element;
}