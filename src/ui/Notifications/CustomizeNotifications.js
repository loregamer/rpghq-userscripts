/**
 * @module ui/Notifications/CustomizeNotifications
 * @description Handles the visual customization of notification elements in the panel and on the notifications page.
 */

import {
  fetchReactions,
  fetchPostContent,
} from "../../helpers/Notifications/API.js";
import {
  removeBBCode,
  removeURLs,
  extractPostIdFromUrl,
  isSingleImageTag,
  extractFirstImageUrl,
  isSingleVideoTag,
  extractFirstVideoUrl,
} from "../../helpers/Notifications/ContentParsing.js";
import {
  NOTIFICATION_BLOCK_STYLE,
  NOTIFICATION_TIME_STYLE,
  NOTIFICATIONS_PAGE_TIME_STYLE,
  REFERENCE_STYLE,
  REACTION_SPAN_STYLE,
  REACTION_IMAGE_STYLE,
  COLOR_REACTED,
  COLOR_MENTIONED,
  COLOR_QUOTED,
  COLOR_REPLY,
  COLOR_WARNING,
  COLOR_REPORT_CLOSED,
  COLOR_POST_APPROVAL,
  SUBTLE_TEXT_STYLE,
} from "../../helpers/Notifications/Constants.js";
import { createElement, applyStyle } from "../../helpers/Core/DOMUtils.js"; // Assuming DOM utility functions exist
import { formatUsernames } from "../../helpers/Core/Formatting.js"; // Assuming username formatting exists
import { Logger } from "../../helpers/Core/Logger.js";

const log = new Logger("Notifications UI");

// --- Internal Helper Functions ---

/**
 * Formats an array of reaction objects into an HTML string.
 * @param {Array} reactions - Array of reaction objects { image, name, username }.
 * @returns {string} HTML string representing the reactions.
 */
function formatReactionsHTML(reactions) {
  if (!reactions || reactions.length === 0) return "";

  const reactionImages = reactions
    .map((reaction) => {
      // Basic sanitation
      const safeUsername =
        reaction.username?.replace(/["&<>]/g, "") || "unknown";
      const safeName = reaction.name?.replace(/["&<>]/g, "") || "reaction";
      const safeImage = reaction.image?.startsWith("https://")
        ? reaction.image
        : "";

      if (!safeImage) return ""; // Don't render if image URL is invalid

      const img = createElement("img", {
        src: safeImage,
        alt: safeName,
        title: `${safeUsername}: ${safeName}`,
        "reaction-username": safeUsername, // Custom attribute from original script
      });
      applyStyle(img, REACTION_IMAGE_STYLE);
      return img.outerHTML;
    })
    .join("");

  const span = createElement("span");
  applyStyle(span, REACTION_SPAN_STYLE);
  span.innerHTML = reactionImages;
  return span.outerHTML;
}

/**
 * Creates or updates the reference element displaying post content.
 * @param {HTMLElement} titleElement - The notification title element.
 * @param {HTMLElement} blockElement - The main notification block element.
 * @param {string|null} content - The post content (or null if not available).
 * @param {boolean} isLoading - Whether content is still loading.
 */
function updateReferenceElement(
  titleElement,
  blockElement,
  content,
  isLoading = false
) {
  let referenceElement = blockElement.querySelector(".notification-reference");

  if (!referenceElement) {
    referenceElement = createElement("span", {
      className: "notification-reference",
    });
    titleElement.appendChild(createElement("br"));
    titleElement.appendChild(referenceElement);
  }

  if (isLoading) {
    referenceElement.textContent = "Loading content...";
  } else if (content === null) {
    referenceElement.textContent = "Content unavailable"; // Indicate fetch failure or empty content
  } else if (content) {
    const cleanedText = removeURLs(removeBBCode(content));
    referenceElement.textContent = cleanedText;
  } else {
    referenceElement.textContent = ""; // Clear if empty string content
  }

  applyStyle(referenceElement, REFERENCE_STYLE);
}

/**
 * Creates a media preview element (image or video).
 * @param {string} type - 'image' or 'video'.
 * @param {string} url - The URL of the media.
 * @returns {HTMLElement|null} The preview element or null.
 */
function createMediaPreview(type, url) {
  if (!url) return null;

  const commonStyle = {
    maxWidth: "100px",
    maxHeight: "60px",
    borderRadius: "3px",
    marginTop: "4px",
    display: "block", // Ensure it takes block space
  };

  let element;
  if (type === "image") {
    element = createElement("img", { src: url });
    applyStyle(element, commonStyle);
  } else if (type === "video") {
    element = createElement("video", {
      src: url,
      loop: true,
      muted: true,
      autoplay: true,
    });
    applyStyle(element, commonStyle);
  } else {
    return null;
  }

  const container = createElement("div", {
    className: "notification-media-preview",
  });
  container.appendChild(element);
  return container;
}

/**
 * Applies common styling and structure to a notification block.
 * @param {HTMLElement} block - The notification block element (usually an <a> tag).
 * @param {boolean} isOnNotificationsPage - True if on the dedicated notifications page.
 */
function applyCommonBlockStyling(block, isOnNotificationsPage = false) {
  applyStyle(block, NOTIFICATION_BLOCK_STYLE);

  const timeElement = block.querySelector(".notification-time");
  if (timeElement) {
    const timeStyle = isOnNotificationsPage
      ? NOTIFICATIONS_PAGE_TIME_STYLE
      : NOTIFICATION_TIME_STYLE;
    applyStyle(timeElement, timeStyle);
  }

  // Ensure `data-real-url` exists for consistent post ID extraction
  if (!block.dataset.realUrl && block.href) {
    block.dataset.realUrl = block.href;
  }

  // Standardize username elements (remove -coloured class if present)
  block.querySelectorAll(".username-coloured").forEach((el) => {
    el.classList.replace("username-coloured", "username");
    el.style.color = ""; // Remove inline color style if any
  });
}

/**
 * Applies subtle styling to common words like 'by', 'and', 'in', 'from'.
 * @param {string} html - Input HTML string.
 * @returns {string} HTML string with subtle styling applied.
 */
function applySubtleTextStyles(html) {
  const span = createElement("span");
  applyStyle(span, SUBTLE_TEXT_STYLE);
  return html.replace(/\b(by|and|in|from)\b(?!-)/g, (match) => {
    span.textContent = match;
    return span.outerHTML;
  });
}

// --- Specific Notification Type Customizers ---

/**
 * Customizes notifications about reactions.
 * @param {HTMLElement} titleElement - The notification title element.
 * @param {HTMLElement} block - The notification block element.
 */
async function customizeReactionNotification(titleElement, block) {
  log.debug("Customizing reaction notification");
  const isUnread = block.href && block.href.includes("mark_notification");
  const postId = extractPostIdFromUrl(block.dataset.realUrl);
  if (!postId) return;

  try {
    // Fetch reactions and post content concurrently
    const [reactions, postContent] = await Promise.all([
      fetchReactions(postId, isUnread),
      fetchPostContent(postId),
    ]);

    const usernameElements = titleElement.querySelectorAll(".username");
    const reactingUsernames = Array.from(usernameElements).map((el) =>
      el.textContent.trim()
    );

    // Filter fetched reactions to only include those by users mentioned in the title
    const filteredReactions = reactions.filter((reaction) =>
      reactingUsernames.includes(reaction.username)
    );
    const reactionHTML = formatReactionsHTML(filteredReactions);

    // Update title text
    const verb = reactingUsernames.length > 1 ? "have" : "has";
    const verbColor = COLOR_REACTED;
    const formattedUsernames = formatUsernames(Array.from(usernameElements)); // Use core helper

    titleElement.innerHTML = titleElement.innerHTML.replace(
      /(?:have|has)\s+reacted.*$/,
      `${verb} <b style="color: ${verbColor};">reacted</b> ${reactionHTML} to:`
    );

    // Handle content preview (reference or media)
    let referenceElement = block.querySelector(".notification-reference");
    let mediaPreviewElement = block.querySelector(
      ".notification-media-preview"
    );

    // Clear existing previews before adding new ones
    referenceElement?.remove();
    mediaPreviewElement?.remove();

    let addedPreview = false;
    if (postContent) {
      const trimmedContent = postContent.trim();

      if (isSingleVideoTag(trimmedContent)) {
        const videoData = extractFirstVideoUrl(trimmedContent);
        const preview = createMediaPreview("video", videoData?.url);
        if (preview) {
          titleElement.appendChild(preview);
          addedPreview = true;
        }
      } else if (isSingleImageTag(trimmedContent)) {
        const imageUrl = extractFirstImageUrl(trimmedContent);
        const preview = createMediaPreview("image", imageUrl);
        if (preview) {
          titleElement.appendChild(preview);
          addedPreview = true;
        }
      }
    }

    // If no media preview was added, add/update the text reference
    if (!addedPreview) {
      updateReferenceElement(titleElement, block, postContent, false);
    }
  } catch (error) {
    log.error(
      `Error customizing reaction notification for post ${postId}:`,
      error
    );
    // Add basic reaction icons even if content fetch fails?
    const fallbackReactions = formatReactionsHTML(
      reactingUsernames.map((u) => ({
        username: u,
        name: "reaction",
        image: "",
      }))
    ); // Placeholder
    titleElement.innerHTML = titleElement.innerHTML.replace(
      /(?:have|has)\s+reacted.*$/,
      `${verb} <b style="color: ${verbColor};">reacted</b> ${fallbackReactions} to:`
    );
  }
}

/**
 * Customizes notifications about mentions.
 * @param {HTMLElement} titleElement - The notification title element.
 * @param {HTMLElement} block - The notification block element.
 */
async function customizeMentionNotification(titleElement, block) {
  log.debug("Customizing mention notification");
  const postId = extractPostIdFromUrl(block.dataset.realUrl);
  if (!postId) return;

  const usernameElements = titleElement.querySelectorAll(".username");
  const formattedUsernames = formatUsernames(Array.from(usernameElements));

  // Extract topic name if possible
  const originalHTML = titleElement.innerHTML;
  const parts = originalHTML.split("<br>in ");
  let topicName =
    parts.length > 1 ? parts[1].trim().split(":")[0] : "Unknown Topic"; // Attempt to clean up topic
  topicName = topicName.replace(/<[^>]+>/g, ""); // Strip any remaining HTML tags

  // Update title text
  titleElement.innerHTML = `
        <b style="color: ${COLOR_MENTIONED};">Mentioned</b> by ${formattedUsernames}
        ${applySubtleTextStyles("in")} <b>${topicName}</b>:
    `;

  // Show loading state for reference initially
  updateReferenceElement(titleElement, block, null, true);

  // Fetch and display content reference
  try {
    const postContent = await fetchPostContent(postId);
    updateReferenceElement(titleElement, block, postContent, false);
  } catch (error) {
    log.error(
      `Error fetching content for mention notification post ${postId}:`,
      error
    );
    updateReferenceElement(titleElement, block, null, false); // Show unavailable
  }
}

/**
 * Customizes notifications about private messages.
 * @param {HTMLElement} titleElement - The notification title element.
 * @param {HTMLElement} block - The notification block element.
 */
function customizePrivateMessageNotification(titleElement, block) {
  log.debug("Customizing private message notification");
  const subjectElement = block.querySelector(".notification-reference");
  const subject = subjectElement?.textContent.trim().replace(/^"(.*)"$/, "$1");

  if (subject === "Board warning issued") {
    titleElement.innerHTML = titleElement.innerHTML
      .replace(
        /<strong>Private Message<\/strong>/,
        `<strong style="color: ${COLOR_WARNING};">Board warning issued</strong>`
      )
      .replace(/from/, applySubtleTextStyles("by"))
      .replace(/:$/, "");
    subjectElement?.remove(); // Remove the redundant subject line
  } else {
    // Generic PM styling (if any needed beyond standard)
  }
}

/**
 * Customizes notifications about replies or quotes.
 * @param {HTMLElement} titleElement - The notification title element.
 * @param {HTMLElement} block - The notification block element.
 * @param {'Reply'|'Quoted'} type - The type of notification.
 */
async function customizeReplyQuoteNotification(titleElement, block, type) {
  log.debug(`Customizing ${type} notification`);
  const postId = extractPostIdFromUrl(block.dataset.realUrl);
  if (!postId) return;

  const referenceElement = block.querySelector(".notification-reference");
  const originalTitleHTML = titleElement.innerHTML;

  // Update strong tag color
  const color = type === "Reply" ? COLOR_REPLY : COLOR_QUOTED;
  titleElement.innerHTML = originalTitleHTML.replace(
    `<strong>${type}</strong>`,
    `<strong style="color: ${color};">${type}</strong>`
  );

  // Extract and format topic title from reference if available
  if (referenceElement) {
    const threadTitle = referenceElement.textContent
      .trim()
      .replace(/^"|"$/g, "");
    titleElement.innerHTML = titleElement.innerHTML.replace(
      /in(?:\stopic)?:/,
      `${applySubtleTextStyles("in")} <strong>${threadTitle}</strong>:`
    );
    // Set reference to loading state initially
    updateReferenceElement(titleElement, block, null, true);
  } else {
    // If no reference element, ensure the colon is added for consistency
    if (!titleElement.innerHTML.endsWith(":")) {
      titleElement.innerHTML += ":";
    }
    // Create a loading state reference element
    updateReferenceElement(titleElement, block, null, true);
  }

  // Fetch and display content reference
  try {
    const postContent = await fetchPostContent(postId);
    updateReferenceElement(titleElement, block, postContent, false);
  } catch (error) {
    log.error(
      `Error fetching content for ${type} notification post ${postId}:`,
      error
    );
    updateReferenceElement(titleElement, block, null, false); // Show unavailable
  }
}

/**
 * Customizes generic notification types like report closed or post approval.
 * @param {HTMLElement} titleElement - The notification title element.
 * @param {string} titleText - Original innerHTML of the title.
 */
function customizeGenericNotification(titleElement, titleText) {
  log.debug("Customizing generic notification");
  if (titleText.includes("Report closed")) {
    titleElement.innerHTML = titleText.replace(
      /Report closed/,
      `<strong style="color: ${COLOR_REPORT_CLOSED};">Report closed</strong>`
    );
  } else if (titleText.includes("Post approval")) {
    titleElement.innerHTML = titleText.replace(
      /<strong>Post approval<\/strong>/,
      `<strong style="color: ${COLOR_POST_APPROVAL};">Post approval</strong>`
    );
  }
  // Add more generic types here if needed
}

// --- Main Customization Logic ---

/**
 * Customizes a single notification block element.
 * Determines the notification type and calls the appropriate specific customizer.
 * @param {HTMLElement} block - The notification block element.
 * @param {boolean} isOnNotificationsPage - Whether the block is on the main notifications page.
 */
async function customizeNotificationBlock(
  block,
  isOnNotificationsPage = false
) {
  if (block.dataset.customized === "true") {
    log.debug("Skipping already customized block", block);
    return; // Already processed
  }

  log.debug("Applying common styling to block", block);
  applyCommonBlockStyling(block, isOnNotificationsPage);

  const titleElement = block.querySelector(".notification-title");
  if (!titleElement) {
    log.warn("Could not find title element in notification block", block);
    block.dataset.customized = "true"; // Mark as processed even if title missing
    return;
  }

  const originalTitleHTML = titleElement.innerHTML;
  let customizedByType = false;

  try {
    if (originalTitleHTML.includes("reacted to a message you posted")) {
      await customizeReactionNotification(titleElement, block);
      customizedByType = true;
    } else if (originalTitleHTML.includes("You were mentioned by")) {
      await customizeMentionNotification(titleElement, block);
      customizedByType = true;
    } else if (originalTitleHTML.includes("<strong>Reply</strong>")) {
      await customizeReplyQuoteNotification(titleElement, block, "Reply");
      customizedByType = true;
    } else if (originalTitleHTML.includes("<strong>Quoted</strong>")) {
      await customizeReplyQuoteNotification(titleElement, block, "Quoted");
      customizedByType = true;
    } else if (originalTitleHTML.includes("Private Message")) {
      customizePrivateMessageNotification(titleElement, block);
      customizedByType = true;
    } else {
      // Handle generic types only if not handled above
      customizeGenericNotification(titleElement, originalTitleHTML);
    }

    // Apply subtle text styling globally after specific changes
    if (titleElement.innerHTML) {
      // Check if element still exists
      titleElement.innerHTML = applySubtleTextStyles(titleElement.innerHTML);
    }
  } catch (error) {
    log.error("Error during notification block customization:", error, block);
    // Restore original title on error?
    // titleElement.innerHTML = originalTitleHTML;
  }

  block.dataset.customized = "true";
  log.debug("Finished customizing block", block);
}

/**
 * Customizes all notification blocks within a given container (e.g., dropdown panel or page).
 * @param {HTMLElement|Document} container - The element containing notification blocks.
 * @param {string} selector - CSS selector for the notification blocks.
 * @param {boolean} isOnNotificationsPage - Whether the container is the main notifications page.
 */
export function customizeNotificationsContainer(
  container,
  selector = ".notification-block",
  isOnNotificationsPage = false
) {
  log.info(
    `Customizing notifications in container: ${container.nodeName}, page: ${isOnNotificationsPage}`
  );
  const blocks = container.querySelectorAll(selector);
  log.debug(
    `Found ${blocks.length} notification blocks using selector: ${selector}`
  );

  if (blocks.length === 0) return;

  // Use Promise.allSettled to process all blocks even if some fail
  const promises = Array.from(blocks).map((block) =>
    customizeNotificationBlock(block, isOnNotificationsPage)
  );

  Promise.allSettled(promises).then((results) => {
    const fulfilled = results.filter((r) => r.status === "fulfilled").length;
    const rejected = results.filter((r) => r.status === "rejected").length;
    log.info(
      `Finished customizing notifications container. Success: ${fulfilled}, Failed: ${rejected}`
    );
    if (rejected > 0) {
      results
        .filter((r) => r.status === "rejected")
        .forEach((rej) => {
          log.warn("Customization failure reason:", rej.reason);
        });
    }
  });
}
