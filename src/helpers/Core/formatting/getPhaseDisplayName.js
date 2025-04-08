/**
 * Get the user-friendly name for an execution phase
 * @param {string} phase - The execution phase ID
 * @returns {string} - User-friendly name for the phase
 */
export function getPhaseDisplayName(phase) {
  if (!phase) return "Not specified";

  const phaseMap = {
    "document-start": "Document Start",
    "document-ready": "Document Ready",
    "document-loaded": "Document Loaded",
    "document-idle": "Document Idle",
    "custom-event": "Custom Event",
  };

  return phaseMap[phase] || phase;
}
