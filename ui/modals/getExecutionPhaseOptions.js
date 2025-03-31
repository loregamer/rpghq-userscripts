/**
 * Get execution phase options for the filter dropdown
 * @returns {string} - HTML options for execution phases
 */
function getExecutionPhaseOptions() {
  return MANIFEST.schema.executionPhases.map(phase => 
    `<option value="${phase.id}">${phase.name}</option>`
  ).join('');
}

// Export the function
if (typeof module !== 'undefined') {
  module.exports = getExecutionPhaseOptions;
}
