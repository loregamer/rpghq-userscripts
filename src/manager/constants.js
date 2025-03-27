// ===== Constants & URLs =====
const SCRIPT_BASE_PATH = "./scripts/";
const STORAGE_KEY = "rpghq_userscript_manager";

// ===== Execution Phases =====
const ExecutionPhase = {
  DOCUMENT_START: "document-start",
  DOCUMENT_READY: "document-ready",
  DOCUMENT_LOADED: "document-loaded",
  DOCUMENT_IDLE: "document-idle",
  CUSTOM_EVENT: "custom-event",
};
