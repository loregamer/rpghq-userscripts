/**
 * Hide the modal
 */
export function hideModal() {
  const modal = document.getElementById("mod-manager-modal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }

  // Hide any open settings modal
  const settingsModal = document.getElementById("script-settings-modal");
  if (settingsModal) {
    settingsModal.style.display = "none";
  }
}
