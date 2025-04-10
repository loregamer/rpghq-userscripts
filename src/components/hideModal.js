/**
 * Hides the userscript manager modal.
 */
import { log } from "../utils/logger.js";
export function hideModal() {
  const modal = document.getElementById("mod-manager-modal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = ""; // Restore scrolling
  }

  // Hide any open settings modal
  const settingsModal = document.getElementById("script-settings-modal");
  if (settingsModal) {
    settingsModal.style.display = "none";
  }
}
