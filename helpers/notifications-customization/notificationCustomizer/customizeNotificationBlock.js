/**
 * Customize a notification block
 * @param {Element} block - The notification block
 */
export async function customizeNotificationBlock(block) {
  if (block.dataset.customized === "true") return;

  // Apply container styling to the block
  Object.assign(block.style, NOTIFICATION_BLOCK_STYLE);

  const notificationText = block.querySelector(".notification_text");
  if (!notificationText) return;

  // Move time element to bottom right
  const timeElement = block.querySelector(".notification-time");
  if (timeElement) {
    Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
  }

  const titleElement = notificationText.querySelector(
    ".notification-title"
  );

  if (titleElement) {
    let titleText = titleElement.innerHTML;
    if (titleText.includes("You were mentioned by")) {
      await customizeMentionNotification(block);
    } else if (titleText.includes("reacted to a message you posted")) {
      await customizeReactionNotification(titleElement, block);
    } else if (titleText.includes("Private Message")) {
      customizePrivateMessageNotification(titleElement, block);
    } else if (titleText.includes("Report closed")) {
      titleElement.innerHTML = titleText.replace(
        /Report closed/,
        '<strong style="color: #f58c05;">Report closed</strong>'
      );
    } else if (titleText.includes("Post approval")) {
      titleElement.innerHTML = titleText.replace(
        /<strong>Post approval<\/strong>/,
        '<strong style="color: #00AA00;">Post approval</strong>'
      );
    }

    const referenceElement = notificationText.querySelector(
      ".notification-reference"
    );
    if (
      referenceElement &&
      (titleText.includes("<strong>Reply</strong>") ||
        titleText.includes("<strong>Quoted</strong>"))
    ) {
      const threadTitle = referenceElement.textContent
        .trim()
        .replace(/^"|"$/g, "");
      titleElement.innerHTML = titleElement.innerHTML.replace(
        /in(?:\stopic)?:/,
        `<span style="font-size: 0.85em; padding: 0 0.25px;">in</span> <strong>${threadTitle}</strong>:`
      );

      // Update the existing reference element with loading state
      referenceElement.textContent = "Loading...";
      styleReference(referenceElement);

      // Queue the content fetch
      queuePostContentFetch(
        block.getAttribute("data-real-url") || block.href,
        referenceElement
      );
    }

    // Apply text resizing to all notifications
    titleElement.innerHTML = titleElement.innerHTML
      .replace(
        /\b(by|and|in|from)\b(?!-)/g,
        '<span style="font-size: 0.85em; padding: 0 0.25px;">$1</span>'
      )
      .replace(
        /<strong>Quoted<\/strong>/,
        '<strong style="color: #FF4A66;">Quoted</strong>'
      )
      .replace(
        /<strong>Reply<\/strong>/,
        '<strong style="color: #95DB00;">Reply</strong>'
      );
  }

  const referenceElement = block.querySelector(".notification-reference");
  if (referenceElement) {
    styleReference(referenceElement);
  }

  block.querySelectorAll(".username-coloured").forEach((el) => {
    el.classList.replace("username-coloured", "username");
    el.style.color = "";
  });

  block.dataset.customized = "true";
}