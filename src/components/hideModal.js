/**
 * Hides the userscript manager modal.
 */
export function hideModal() {
  console.log("Hiding userscript manager modal...");
  
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