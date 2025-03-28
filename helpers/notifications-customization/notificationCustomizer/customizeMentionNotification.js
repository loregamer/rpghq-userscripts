/**
 * Customize a mention notification
 * @param {Element} notificationBlock - The notification block
 */
export async function customizeMentionNotification(notificationBlock) {
  // Apply container styling to the block
  Object.assign(notificationBlock.style, NOTIFICATION_BLOCK_STYLE);

  const notificationText =
    notificationBlock.querySelector(".notification_text");
  const titleElement = notificationText.querySelector(
    ".notification-title"
  );
  const originalHTML = titleElement.innerHTML;
  const usernameElements = titleElement.querySelectorAll(
    ".username, .username-coloured"
  );
  const usernames = Array.from(usernameElements)
    .map((el) => el.outerHTML)
    .join(", ");

  const parts = originalHTML.split("<br>in ");
  let topicName = parts.length > 1 ? parts[1].trim() : "Unknown Topic";

  titleElement.innerHTML = `
    <b style="color: #FFC107;">Mentioned</b> by ${usernames} in <b>${topicName}</b>
  `;

  // Create or update reference element for post content
  let referenceElement = notificationBlock.querySelector(
    ".notification-reference"
  );
  if (!referenceElement) {
    referenceElement = createElement("span", {
      className: "notification-reference",
      textContent: "Loading...",
    });
    styleReference(referenceElement);
    titleElement.appendChild(document.createElement("br"));
    titleElement.appendChild(referenceElement);
  }

  // Queue the content fetch
  queuePostContentFetch(
    notificationBlock.getAttribute("data-real-url") ||
      notificationBlock.href,
    referenceElement
  );

  // Move time element to bottom right
  const timeElement = notificationText.querySelector(".notification-time");
  if (timeElement) {
    Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
  }
}