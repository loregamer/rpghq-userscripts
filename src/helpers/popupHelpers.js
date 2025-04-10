// src/helpers/popupHelpers.js
import { modalCore } from "../ui/modals/core/modalManager.js";
import { createScriptToggle } from "../ui/components/scriptToggle.js";
// Import the logic, not the function that adds the listener
import { handleInsertKeyPressLogic } from "./Core/ui/toggleModalWithInsertKey.js";
import { showScriptSettings } from "../ui/modals/settings/showScriptSettings.js";
// Import other UI/popup helpers here

// Define helper functions first
const _showModal = modalCore.showModal;
const _hideModal = modalCore.hideModal;

// Function to set up the Insert key listener
function setupInsertKeyListener() {
  // Add the listener, passing the correct show/hide functions
  document.addEventListener("keydown", (event) => {
    handleInsertKeyPressLogic(event, _showModal, _hideModal);
  });
}

export const popupHelpers = {
  showModal: _showModal,
  hideModal: _hideModal,
  loadTabContent: modalCore.loadTabContent,
  createScriptToggle: createScriptToggle,
  // Expose the function that sets up the listener
  toggleModalWithInsertKey: setupInsertKeyListener,
  showScriptSettings: showScriptSettings,
  // Add other popup/UI helpers as needed
};
