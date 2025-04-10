/**
 * Returns a user-friendly display name for script execution phases.
 * 
 * @param {string} phase - The execution phase identifier
 * @returns {string} - The formatted display name for the phase
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