/**
 * Customize a private message notification
 * @param {Element} titleElement - The title element
 * @param {Element} block - The notification block
 */
export function customizePrivateMessageNotification(titleElement, block) {
  // Apply container styling to the block
  Object.assign(block.style, NOTIFICATION_BLOCK_STYLE);

  // Move time element to bottom right
  const timeElement = block.querySelector(".notification-time");
  if (timeElement) {
    Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
  }

  const subject = block
    .querySelector(".notification-reference")
    ?.textContent.trim()
    .replace(/^"(.*)"$/, "$1");
  if (subject === "Board warning issued") {
    titleElement.innerHTML = titleElement.innerHTML
      .replace(
        /<strong>Private Message<\/strong>/,
        '<strong style="color: #D31141;">Board warning issued</strong>'
      )
      .replace(/from/, "by")
      .replace(/:$/, "");
    block.querySelector(".notification-reference")?.remove();
  }
}