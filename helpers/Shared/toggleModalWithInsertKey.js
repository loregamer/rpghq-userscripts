/**
 * Toggle the modal visibility when the Insert key is pressed
 */
function toggleModalWithInsertKey(e) {
  // Check if the key pressed is Insert (key code 45)
  if (e.keyCode === 45) {
    // Prevent default behavior
    e.preventDefault();
    
    // Check if the modal is currently visible
    const modal = document.getElementById("mod-manager-modal");
    if (modal && modal.style.display === "block") {
      // If visible, hide it
      hideModal();
    } else {
      // If not visible, show it
      showModal();
    }
  }
}

// Export the function for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = toggleModalWithInsertKey;
}