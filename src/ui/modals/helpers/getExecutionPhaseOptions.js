import { MANIFEST } from '../../../data/MANIFEST.js';

/**
 * Get execution phase options for the filter dropdown
 * @returns {string} - HTML options for execution phases
 */
export function getExecutionPhaseOptions() {
  return MANIFEST.schema.executionPhases
    .map((phase) => `<option value="${phase.id}">${phase.name}</option>`)
    .join("");
}
