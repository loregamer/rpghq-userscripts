/**
 * Generates a list of <option> HTML elements for all execution phases.
 * 
 * @param {Array} executionPhases - Array of execution phase objects from manifest schema
 * @returns {string} - HTML string of <option> elements for execution phases
 */
export function getExecutionPhaseOptions(executionPhases) {
  return executionPhases
    .map((phase) => `<option value="${phase.id}">${phase.name}</option>`)
    .join("");
}