// G:/Modding/_Github/HQ-Userscripts/src/ui/modals/core/modalManager.js
import { showModal as _showModal } from "./showModal.js";
import { hideModal as _hideModal } from "./hideModal.js";
import { loadTabContent as _loadTabContent } from "./loadTabContent.js";

/**
 * Core functions for managing the main userscript manager modal.
 */
export const modalCore = {
  showModal: () => _showModal(_hideModal, _loadTabContent),
  hideModal: _hideModal,
  loadTabContent: _loadTabContent,
};

// Re-wire internal calls within showModal to use the new object structure
// This requires modifying showModal.js AFTER modalManager.js is created and imported elsewhere.
// For now, we assume external calls will use modalCore.hideModal() etc.
// We might need to adjust showModal.js later if direct calls like hideModal() cause issues.
