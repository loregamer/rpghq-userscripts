/**
 * Customize a reaction notification
 * @param {Element} titleElement - The title element
 * @param {Element} block - The notification block
 */
export async function customizeReactionNotification(titleElement, block) {
  if (block.dataset.reactionCustomized === "true") return;

  // Apply container styling to the block
  Object.assign(block.style, NOTIFICATION_BLOCK_STYLE);

  // Move time element to bottom right
  const timeElement = block.querySelector(".notification-time");
  if (timeElement) {
    Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
  }

  const titleText = titleElement.innerHTML;
  const isUnread = block.href && block.href.includes("mark_notification");
  const postId = extractPostId(
    block.getAttribute("data-real-url") || block.href
  );
  if (!postId) return;

  const usernameElements = titleElement.querySelectorAll(
    ".username, .username-coloured"
  );
  const usernames = Array.from(usernameElements).map((el) =>
    el.textContent.trim()
  );
  const reactions = await fetchReactions(postId, isUnread);
  const filteredReactions = reactions.filter((reaction) =>
    usernames.includes(reaction.username)
  );
  const reactionHTML = formatReactions(filteredReactions);
  const isReactedTo = titleText.includes("reacted to a message you posted");

  if (isReactedTo) {
    titleElement.innerHTML = titleText.replace(
      /(have|has)\s+reacted.*$/,
      `<b style="color: #3889ED;">reacted</b> ${reactionHTML} to:`
    );
    const postContent = await fetchPostContent(postId);
    if (postContent) {
      const trimmedContent = postContent.trim();
      let referenceElement = block.querySelector(".notification-reference");

      if (!referenceElement) {
        referenceElement = createElement("span", {
          className: "notification-reference",
        });
        styleReference(referenceElement);
        titleElement.appendChild(document.createElement("br"));
        titleElement.appendChild(referenceElement);
      }

      // Always create the image/video preview div
      const mediaPreview = createElement("div", {
        className: "notification-image-preview",
      });

      // Check for video content first - only if the entire content is just a video tag
      if (
        (trimmedContent.startsWith("[webm]") &&
          trimmedContent.endsWith("[/webm]")) ||
        (trimmedContent.startsWith("[media]") &&
          trimmedContent.endsWith("[/media]"))
      ) {
        const videoData = extractVideoUrl(trimmedContent);
        if (videoData) {
          // Create video element for preview
          mediaPreview.innerHTML = `<video src="${videoData.url}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" loop muted autoplay></video>`;

          // If we have a video, remove any existing reference element and don't create a new one
          if (referenceElement) {
            referenceElement.remove();
          }
          titleElement.appendChild(mediaPreview);
        }
      }
      // If no video, check for image tag before any BBCode removal
      else if (
        (trimmedContent.startsWith("[img]") &&
          trimmedContent.endsWith("[/img]")) ||
        trimmedContent.match(/^\[img\s+[^=\]]+=[^\]]+\].*?\[\/img\]$/i)
      ) {
        let imageUrl;

        if (trimmedContent.startsWith("[img]")) {
          // Standard format
          imageUrl = trimmedContent.slice(5, -6).trim();
        } else {
          // Format with parameters
          const paramMatch = trimmedContent.match(
            /^\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]$/i
          );
          imageUrl = paramMatch[1].trim();
        }

        mediaPreview.innerHTML = `<img src="${imageUrl}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;">`;

        // If we have an image, remove any existing reference element and don't create a new one
        if (referenceElement) {
          referenceElement.remove();
        }
        titleElement.appendChild(mediaPreview);
      } else {
        // Only create/update reference element if there's no image or video
        if (referenceElement) {
          referenceElement.textContent = removeURLs(
            removeBBCode(postContent)
          );
          styleReference(referenceElement);
          referenceElement.insertAdjacentElement("afterend", mediaPreview);
        } else {
          referenceElement = createElement("span", {
            className: "notification-reference",
            textContent: removeURLs(removeBBCode(postContent)),
          });
          styleReference(referenceElement);
          titleElement.appendChild(document.createElement("br"));
          titleElement.appendChild(referenceElement);
          referenceElement.insertAdjacentElement("afterend", mediaPreview);
        }
      }
    }
  } else {
    titleElement.innerHTML = titleText.replace(
      /(have|has)\s+reacted.*$/,
      `<b style="color: #3889ED;">reacted</b> ${reactionHTML}`
    );
  }
  block.dataset.reactionCustomized = "true";
}