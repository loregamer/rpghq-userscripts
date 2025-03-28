/**
 * Apply reference styling to an element
 * @param {Element} element - The element to style
 */
export function styleReference(element) {
  Object.assign(element.style, REFERENCE_STYLE);
}