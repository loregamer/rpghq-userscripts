/**
 * Logic to handle the Insert key press for toggling the modal.
 * This function should be bound to the correct modal show/hide context when used as a listener.
 * @param {KeyboardEvent} event - The keyboard event.
 * @param {function} showFunc - The function to call to show the modal.
 * @param {function} hideFunc - The function to call to hide the modal.
 */
export function handleInsertKeyPressLogic(event, showFunc, hideFunc) {
  // Check if the Insert key was pressed and no input field is focused
  if (
    event.key === "Insert" &&
    !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)
  ) {
    event.preventDefault(); // Prevent default Insert key behavior (like overtype)
    const modal = document.getElementById("mod-manager-modal");
    // Check if the modal exists and is currently hidden or doesn't exist yet
    if (!modal || modal.style.display === "none") {
      showFunc();
    } else {
      hideFunc();
    }
  }
}
