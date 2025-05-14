// RPGHQ - Notification Improver
/**
 * Adds smileys to reacted notifs, adds colors, idk just makes em cooler I guess
 * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
 * License: MIT
 *
 * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/notifications.md for documentation
 */

let _getScriptSetting = () => undefined; // Placeholder

export function init({ getScriptSetting }) {
  _getScriptSetting = getScriptSetting; // Store the passed function

  GM_addStyle(`
    .dropdown-extended a.mark_read {
      background-color: #18202A;
    }
  `);
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const referenceBackgroundColor = _getScriptSetting(
    "notifications",
    "referenceBackgroundColor",
    "rgba(23, 27, 36, 0.5)",
  );
  const referenceTextColor = _getScriptSetting(
    "notifications",
    "referenceTextColor",
    "#ffffff",
  );
  const timestampColor = _getScriptSetting(
    "notifications",
    "timestampColor",
    "#888888",
  );

  const REFERENCE_STYLE = {
    display: "inline-block",
    background: referenceBackgroundColor,
    color: referenceTextColor,
    padding: "2px 4px",
    borderRadius: "2px",
    zIndex: "-1",
    maxWidth: "98%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
  const FETCH_DELAY = 500; // Add delay between fetches

  // Add notification block container style
  const NOTIFICATION_BLOCK_STYLE = {
    position: "relative",
    paddingBottom: "20px", // Make room for the timestamp
  };

  // Add notification time style
  const NOTIFICATION_TIME_STYLE = {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    fontSize: "0.85em",
    color: timestampColor,
  };

  // Add notification time style for notification page
  const NOTIFICATIONS_TIME_STYLE = {
    position: "absolute",
    bottom: "2px",
    left: "2px",
    fontSize: "0.85em",
    color: "#888",
  };

  // --- Utility Functions ---
  const Utils = {
    createElement: (tag, attributes = {}, innerHTML = "") => {
      const element = document.createElement(tag);
      Object.assign(element, attributes);
      element.innerHTML = innerHTML;
      return element;
    },

    formatReactions: (reactions) => {
      return `<span style="display: inline-flex; margin-left: 2px; vertical-align: middle;">
          ${reactions
            .map(
              (reaction) => `
            <img src="${reaction.image}" alt="${reaction.name}" title="${reaction.username}: ${reaction.name}" 
                 reaction-username="${reaction.username}"
                 style="height: 1em !important; width: auto !important; vertical-align: middle !important; margin-right: 2px !important;">
          `,
            )
            .join("")}
        </span>`;
    },

    styleReference: (element) => {
      Object.assign(element.style, REFERENCE_STYLE);
    },

    extractPostId: (url) => {
      const match = (url || "").match(/p=(\d+)/);
      return match ? match[1] : null;
    },

    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

    cleanupPostContent: (content) => {
      // 1. Normalize any [quote="..."] tags to [quote=...]
      content = content.replace(/\[quote="([^"]+)"\]/g, "[quote=$1]");

      // 2. Remove ONLY the first occurrence of an opening quote tag.
      const firstOpenIdx = content.indexOf("[quote=");
      if (firstOpenIdx !== -1) {
        const firstCloseBracket = content.indexOf("]", firstOpenIdx);
        if (firstCloseBracket !== -1) {
          // Remove the tag from [quote= ... ]
          content =
            content.slice(0, firstOpenIdx) +
            content.slice(firstCloseBracket + 1);
        }
      }

      // 3. Remove ONLY the last occurrence of a closing quote tag.
      const lastCloseIdx = content.lastIndexOf("[/quote]");
      if (lastCloseIdx !== -1) {
        // Remove that closing tag (8 characters long).
        content =
          content.slice(0, lastCloseIdx) + content.slice(lastCloseIdx + 8);
      }

      // 4. Aggressively remove any inner quote blocks.
      content = Utils.aggressiveRemoveInnerQuotes(content);

      return content.trim();
    },

    aggressiveRemoveInnerQuotes: (text) => {
      let result = "";
      let i = 0;
      let depth = 0;

      while (i < text.length) {
        // Check for an opening quote tag.
        if (text.startsWith("[quote=", i)) {
          depth++;
          const endBracket = text.indexOf("]", i);
          if (endBracket === -1) {
            // Malformed tag; break out.
            break;
          }
          i = endBracket + 1;
          continue;
        }

        // Check for a closing quote tag.
        if (text.startsWith("[/quote]", i)) {
          if (depth > 0) {
            depth--;
          }
          i += 8; // Skip "[/quote]"
          continue;
        }

        // Only append characters that are NOT inside a quote block.
        if (depth === 0) {
          result += text[i];
        }
        i++;
      }

      return result;
    },

    removeBBCode: (text) => {
      // Remove all BBCode tags
      let result = text
        // Remove color tags
        .replace(/\[color=[^\]]*\](.*?)\[\/color\]/gi, "$1")
        // Remove size tags
        .replace(/\[size=[^\]]*\](.*?)\[\/size\]/gi, "$1")
        // Remove bold tags
        .replace(/\[b\](.*?)\[\/b\]/gi, "$1")
        // Remove italic tags
        .replace(/\[i\](.*?)\[\/i\]/gi, "$1")
        // Remove underline tags
        .replace(/\[u\](.*?)\[\/u\]/gi, "$1")
        // Remove strike tags
        .replace(/\[s\](.*?)\[\/s\]/gi, "$1")
        // Remove url tags with attributes
        .replace(/\[url=[^\]]*\](.*?)\[\/url\]/gi, "$1")
        // Remove simple url tags
        .replace(/\[url\](.*?)\[\/url\]/gi, "$1")
        // Remove img tags with parameters
        .replace(/\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]/gi, "")
        // Remove simple img tags
        .replace(/\[img\](.*?)\[\/img\]/gi, "")
        // Remove media tags
        .replace(/\[media\](.*?)\[\/media\]/gi, "")
        .replace(/\[webm\](.*?)\[\/webm\]/gi, "")
        // Remove code tags
        .replace(/\[code\](.*?)\[\/code\]/gi, "$1")
        // Remove list tags
        .replace(/\[list\](.*?)\[\/list\]/gi, "$1")
        .replace(/\[\*\]/gi, "")
        // Remove quote tags (in case any remain)
        .replace(/\[quote(?:=[^\]]*?)?\](.*?)\[\/quote\]/gi, "")
        // Remove any remaining BBCode tags
        .replace(/\[[^\]]*\]/g, "")
        // Normalize whitespace
        .replace(/\s+/g, " ")
        .trim();

      return result;
    },

    removeURLs: (text) => {
      // Remove URLs with various protocols (http, https, ftp)
      return (
        text
          .replace(/(?:https?|ftp):\/\/[\n\S]+/gi, "")
          // Remove www. URLs
          .replace(/www\.[^\s]+/gi, "")
          // Clean up any double spaces created by URL removal
          .replace(/\s+/g, " ")
          .trim()
      );
    },

    extractSingleImageUrl: (text) => {
      console.log("Extracting image URL from text:", text);

      // If the entire text is just an image tag, extract it
      const trimmedText = text.trim();
      console.log("Trimmed text:", trimmedText);

      // Handle standard [img]url[/img] format
      if (trimmedText.startsWith("[img]") && trimmedText.endsWith("[/img]")) {
        console.log("Text is a single image tag");
        const url = trimmedText.slice(5, -6).trim();
        console.log("Extracted URL:", url);
        return url;
      }

      // Handle [img size=X]url[/img] format with parameters
      const paramImgMatch = trimmedText.match(
        /^\[img\s+([^=\]]+)=([^\]]+)\](.*?)\[\/img\]$/i,
      );
      if (paramImgMatch) {
        console.log("Text is a single image tag with parameters");
        const url = paramImgMatch[3].trim();
        console.log("Extracted URL:", url);
        return url;
      }

      // Find all image tags (both with and without parameters)
      const imageUrls = text.match(
        /\[img(?:\s+[^=\]]+=[^\]]+)?\](.*?)\[\/img\]/gi,
      );
      console.log("Found image tags:", imageUrls);

      if (imageUrls && imageUrls.length > 0) {
        console.log("Using first image tag");
        // Extract URL from the first image tag, handling both formats
        const firstTag = imageUrls[0];
        let url;

        if (firstTag.startsWith("[img]")) {
          // Standard format
          url = firstTag.replace(/\[img\](.*?)\[\/img\]/i, "$1").trim();
        } else {
          // Format with parameters
          url = firstTag
            .replace(/\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]/i, "$1")
            .trim();
        }

        console.log("Extracted URL:", url);
        return url;
      }

      console.log("No valid image URL found");
      return null;
    },

    extractVideoUrl: (text) => {
      console.log("Extracting video URL from text:", text);
      const trimmedText = text.trim();

      // Handle [webm] tags
      if (trimmedText.startsWith("[webm]") && trimmedText.endsWith("[/webm]")) {
        console.log("Text is a single webm tag");
        const url = trimmedText.slice(6, -7).trim();
        console.log("Extracted webm URL:", url);
        return { url, type: "webm" };
      }

      // Handle [media] tags
      if (
        trimmedText.startsWith("[media]") &&
        trimmedText.endsWith("[/media]")
      ) {
        console.log("Text is a single media tag");
        const url = trimmedText.slice(7, -8).trim();
        console.log("Extracted media URL:", url);
        return { url, type: "media" };
      }

      // Find all video tags
      const webmMatch = text.match(/\[webm\](.*?)\[\/webm\]/i);
      if (webmMatch) {
        console.log("Found webm tag");
        return { url: webmMatch[1].trim(), type: "webm" };
      }

      const mediaMatch = text.match(/\[media\](.*?)\[\/media\]/i);
      if (mediaMatch) {
        console.log("Found media tag");
        return { url: mediaMatch[1].trim(), type: "media" };
      }

      console.log("No valid video URL found");
      return null;
    },
  };

  // --- Storage Helpers ---
  const Storage = {
    getStoredReactions: (postId) => {
      const storedData = GM_getValue(`reactions_${postId}`);
      if (storedData) {
        const { reactions, timestamp } = JSON.parse(storedData);
        if (Date.now() - timestamp < ONE_DAY) return reactions;
        GM_deleteValue(`reactions_${postId}`);
      }
      return null;
    },

    storeReactions: (postId, reactions) => {
      GM_setValue(
        `reactions_${postId}`,
        JSON.stringify({ reactions, timestamp: Date.now() }),
      );
    },

    getStoredPostContent: (postId) => {
      const storedData = GM_getValue(`post_content_${postId}`);
      if (storedData) {
        const { content, timestamp } = JSON.parse(storedData);
        if (Date.now() - timestamp < ONE_DAY) return content;
        GM_deleteValue(`post_content_${postId}`);
      }
      return null;
    },

    storePostContent: (postId, content) => {
      GM_setValue(
        `post_content_${postId}`,
        JSON.stringify({ content, timestamp: Date.now() }),
      );
    },

    cleanupStorage: () => {
      const lastCleanup = GM_getValue("last_storage_cleanup", 0);
      const now = Date.now();

      // Only cleanup if it's been more than 24 hours since last cleanup
      if (now - lastCleanup >= ONE_DAY) {
        // Update last cleanup timestamp
        GM_setValue("last_storage_cleanup", now);
      }
    },
  };

  // --- Reaction Handling ---
  const ReactionHandler = {
    fetchReactions: async (postId, isUnread) => {
      if (!isUnread) {
        const storedReactions = Storage.getStoredReactions(postId);
        if (storedReactions) return storedReactions;
      }
      try {
        const response = await fetch(
          `https://rpghq.org/forums/reactions?mode=view&post=${postId}`,
          {
            method: "POST",
            headers: {
              accept: "application/json, text/javascript, */*; q=0.01",
              "x-requested-with": "XMLHttpRequest",
            },
            credentials: "include",
          },
        );
        const data = await response.json();
        const doc = new DOMParser().parseFromString(
          data.htmlContent,
          "text/html",
        );
        const reactions = Array.from(
          doc.querySelectorAll('.tab-content[data-id="0"] li'),
        ).map((li) => ({
          username: li.querySelector(".cbb-helper-text a").textContent,
          image: li.querySelector(".reaction-image").src,
          name: li.querySelector(".reaction-image").alt,
        }));

        Storage.storeReactions(postId, reactions);
        return reactions;
      } catch (error) {
        console.error("Error fetching reactions:", error);
        return [];
      }
    },

    fetchPostContent: async (postId) => {
      const cachedContent = Storage.getStoredPostContent(postId);
      if (cachedContent) return cachedContent;

      try {
        const response = await fetch(
          `https://rpghq.org/forums/posting.php?mode=quote&p=${postId}`,
          {
            headers: { "X-Requested-With": "XMLHttpRequest" },
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = text;
        const messageArea = tempDiv.querySelector("#message");
        if (!messageArea) throw new Error("Could not find message content");

        let content = Utils.cleanupPostContent(messageArea.value);
        Storage.storePostContent(postId, content);
        return content;
      } catch (error) {
        console.error("Error fetching post content:", error);
        return null;
      }
    },
  };

  // --- Notification Customization ---
  const NotificationCustomizer = {
    async customizeReactionNotification(titleElement, block) {
      if (block.dataset.reactionCustomized === "true") return;

      // Get settings
      const enableColors = _getScriptSetting(
        "notifications",
        "enableNotificationColors",
        true,
      );
      const enableSmileys = _getScriptSetting(
        "notifications",
        "enableReactionSmileys",
        true,
      );
      const enableImagePreview = _getScriptSetting(
        "notifications",
        "enableImagePreviews",
        true,
      );
      const enableVideoPreview = _getScriptSetting(
        "notifications",
        "enableVideoPreviews",
        false,
      );

      const reactionColorSetting = _getScriptSetting(
        "notifications",
        "reactionColor",
        "#3889ED", // Default value if setting not found
      );

      // Apply container styling (assuming base style already applied by caller)
      // Object.assign(block.style, NOTIFICATION_BLOCK_STYLE);

      // Move time element (assuming done by caller)
      // const timeElement = block.querySelector(".notification-time");
      // if (timeElement) {
      //   Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
      // }

      const titleText = titleElement.innerHTML;
      const parentLi = block.closest("li");
      const isUnread = parentLi ? parentLi.classList.contains("bg2") : true;
      const postId = Utils.extractPostId(
        block.getAttribute("data-real-url") || block.href,
      );
      if (!postId) return;

      const usernameElements = titleElement.querySelectorAll(
        ".username, .username-coloured",
      );
      const usernames = Array.from(usernameElements).map((el) =>
        el.textContent.trim(),
      );

      let reactionHTML = "";
      if (enableSmileys) {
        const reactions = await ReactionHandler.fetchReactions(
          postId,
          isUnread,
        );
        const filteredReactions = reactions.filter((reaction) =>
          usernames.includes(reaction.username),
        );
        reactionHTML = Utils.formatReactions(filteredReactions);
      } else {
        // If smileys disabled, maybe show a simple count or just the word 'reacted'?
        // For now, just show the action verb.
      }

      const isReactedTo = titleText.includes("reacted to a message you posted");
      let reactionVerb;

      // Apply color only if enabled
      if (enableColors) {
        reactionVerb = `<b style="color: ${reactionColorSetting};">reacted</b>`;
      } else {
        reactionVerb = `<b>reacted</b>`;
      }

      if (isReactedTo) {
        // Update title with reaction info
        titleElement.innerHTML = titleText.replace(
          /(have|has)\s+reacted.*$/,
          `${reactionVerb} ${reactionHTML} to:`,
        );

        // Fetch content for preview (only if a preview type is enabled)
        if (enableImagePreview || enableVideoPreview) {
          const postContent = await ReactionHandler.fetchPostContent(postId);
          if (postContent) {
            const trimmedContent = postContent.trim();
            let referenceElement = block.querySelector(
              ".notification-reference",
            );
            const mediaPreviewContainer = Utils.createElement("div", {
              className: "notification-media-preview",
            });

            let mediaFound = false;

            // Check for video first
            if (
              enableVideoPreview &&
              ((trimmedContent.startsWith("[webm]") &&
                trimmedContent.endsWith("[/webm]")) ||
                (trimmedContent.startsWith("[media]") &&
                  trimmedContent.endsWith("[/media]")))
            ) {
              const videoData = Utils.extractVideoUrl(trimmedContent);
              if (videoData) {
                mediaPreviewContainer.innerHTML = `<video src="${videoData.url}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" loop muted autoplay title="Video Preview (click to pause)"></video>`;
                mediaFound = true;
              }
            }

            // If no video or video preview disabled, check for image
            if (
              !mediaFound &&
              enableImagePreview &&
              ((trimmedContent.startsWith("[img]") &&
                trimmedContent.endsWith("[/img]")) ||
                trimmedContent.match(/^\[img\s+[^=\]]+=[^\]]+\].*?\[\/img\]$/i))
            ) {
              let imageUrl;
              if (trimmedContent.startsWith("[img]")) {
                imageUrl = trimmedContent.slice(5, -6).trim();
              } else {
                const paramMatch = trimmedContent.match(
                  /^\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]$/i,
                );
                imageUrl = paramMatch ? paramMatch[1].trim() : null;
              }
              if (imageUrl) {
                mediaPreviewContainer.innerHTML = `<img src="${imageUrl}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" title="Image Preview">`;
                mediaFound = true;
              }
            }

            // Handle placement of preview/reference
            if (mediaFound) {
              // If media found, remove placeholder and add preview
              if (referenceElement) {
                referenceElement.remove();
              }
              titleElement.appendChild(mediaPreviewContainer);
            } else {
              // No media preview shown, ensure reference element exists and show text
              if (!referenceElement) {
                referenceElement = Utils.createElement("span", {
                  className: "notification-reference",
                });
                titleElement.appendChild(document.createElement("br"));
                titleElement.appendChild(referenceElement);
              }
              referenceElement.textContent = Utils.removeURLs(
                Utils.removeBBCode(postContent),
              );
              Utils.styleReference(referenceElement);
              // Ensure media container isn't added if empty
              mediaPreviewContainer.remove();
            }
          }
        }
        // If no previews enabled, ensure reference element is handled if it exists
        else {
          const referenceElement = block.querySelector(
            ".notification-reference",
          );
          if (referenceElement) {
            // If previews disabled, just remove the loading placeholder?
            // Or fetch content anyway to show text? Let's fetch for text.
            const postContent = await ReactionHandler.fetchPostContent(postId);
            if (postContent) {
              referenceElement.textContent = Utils.removeURLs(
                Utils.removeBBCode(postContent),
              );
              Utils.styleReference(referenceElement);
            } else {
              referenceElement.remove(); // Remove if fetch fails
            }
          }
        }
      } else {
        // Handle cases like "X, Y, and Z reacted to your post in Topic T"
        titleElement.innerHTML = titleText.replace(
          /(have|has)\s+reacted.*$/,
          `${reactionVerb} ${reactionHTML}`,
        );
      }
      block.dataset.reactionCustomized = "true";
    },

    async customizeMentionNotification(notificationBlock) {
      // Get settings
      const enableColors = _getScriptSetting(
        "notifications",
        "enableNotificationColors",
        true,
      );
      const mentionColorSetting = _getScriptSetting(
        "notifications",
        "mentionColor",
        "#FFC107", // Default value
      );

      // Apply container styling to the block
      Object.assign(notificationBlock.style, NOTIFICATION_BLOCK_STYLE);

      const notificationText =
        notificationBlock.querySelector(".notification_text");
      const titleElement = notificationText.querySelector(
        ".notification-title",
      );
      const originalHTML = titleElement.innerHTML;
      const usernameElements = titleElement.querySelectorAll(
        ".username, .username-coloured",
      );
      const usernames = Array.from(usernameElements)
        .map((el) => el.outerHTML)
        .join(", ");

      const parts = originalHTML.split("<br>in ");
      let topicName = parts.length > 1 ? parts[1].trim() : "Unknown Topic";

      // Apply color only if enabled
      if (enableColors) {
        titleElement.innerHTML = `
          <b style="color: ${mentionColorSetting};">Mentioned</b> by ${usernames} in <b>${topicName}</b>
        `;
      } else {
        titleElement.innerHTML = `
          <b>Mentioned</b> by ${usernames} in <b>${topicName}</b>
        `;
      }

      // Create or update reference element for post content
      let referenceElement = notificationBlock.querySelector(
        ".notification-reference",
      );
      if (!referenceElement) {
        referenceElement = Utils.createElement("span", {
          className: "notification-reference",
          textContent: "Loading...",
        });
        Utils.styleReference(referenceElement);
        titleElement.appendChild(document.createElement("br"));
        titleElement.appendChild(referenceElement);
      }

      // Queue the content fetch
      this.queuePostContentFetch(
        notificationBlock.getAttribute("data-real-url") ||
          notificationBlock.href,
        referenceElement,
      );

      // Move time element to bottom right
      const timeElement = notificationText.querySelector(".notification-time");
      if (timeElement) {
        Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
      }
    },

    customizePrivateMessageNotification(titleElement, block) {
      // Get settings
      const enableColors = _getScriptSetting(
        "notifications",
        "enableNotificationColors",
        true,
      );
      const resizeFillers = _getScriptSetting(
        "notifications",
        "resizeFillerWords",
        true,
      );
      const warningColorSetting = _getScriptSetting(
        "notifications",
        "warningColor",
        "#D31141", // Default value
      );

      // Apply container styling to the block
      Object.assign(block.style, NOTIFICATION_BLOCK_STYLE);

      // Move time element to bottom right
      const timeElement = block.querySelector(".notification-time");
      if (timeElement) {
        Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
      }

      let currentHtml = titleElement.innerHTML;
      const subject = block
        .querySelector(".notification-reference")
        ?.textContent.trim()
        .replace(/^"(.*)"$/, "$1");

      if (subject === "Board warning issued") {
        if (enableColors) {
          currentHtml = currentHtml
            .replace(
              /<strong>Private Message<\/strong>/,
              `<strong style="color: ${warningColorSetting};">Board warning issued</strong>`,
            )
            .replace(/from/, "by")
            .replace(/:$/, "");
        } else {
          currentHtml = currentHtml
            .replace(
              /<strong>Private Message<\/strong>/,
              `<strong>Board warning issued</strong>`,
            )
            .replace(/from/, "by")
            .replace(/:$/, "");
        }
        block.querySelector(".notification-reference")?.remove();
      }

      // Apply filler word resizing if enabled and not already done
      if (!block.dataset.fillerResized && resizeFillers) {
        currentHtml = currentHtml.replace(
          /\b(by|and|in|from)\b(?!-)/g,
          '<span style="font-size: 0.85em; padding: 0 0.25px;">$1</span>',
        );
        block.dataset.fillerResized = true; // Mark as resized
      }

      // Update the title element's HTML
      titleElement.innerHTML = currentHtml;
    },

    async customizeNotificationBlock(block) {
      // Get settings
      const enableColors = _getScriptSetting(
        "notifications",
        "enableNotificationColors",
        true,
      );
      const resizeFillers = _getScriptSetting(
        "notifications",
        "resizeFillerWords",
        true,
      );
      const quoteColorSetting = _getScriptSetting(
        "notifications",
        "quoteColor",
        "#1E90FF", // Default: DodgerBlue
      );
      const replyColorSetting = _getScriptSetting(
        "notifications",
        "replyColor",
        "#FF69B4", // Default: HotPink
      );
      const reactionColorSetting = _getScriptSetting(
        "notifications",
        "reactionColor",
        "#3889ED", // Default: phpBB blue
      );
      const mentionColorSetting = _getScriptSetting(
        "notifications",
        "mentionColor",
        "#FFC107", // Default: Amber
      );
      const editColorSetting = _getScriptSetting(
        "notifications",
        "editColor",
        "#8A2BE2", // Default: BlueViolet
      );
      const approvalColorSetting = _getScriptSetting(
        "notifications",
        "approvalColor",
        "#00AA00", // Default: Green
      );
      const reportColorSetting = _getScriptSetting(
        "notifications",
        "reportColor",
        "#f58c05", // Default: Orange
      );
      const warningColorSetting = _getScriptSetting(
        "notifications",
        "warningColor",
        "#D31141", // Default: Red
      );
      const readNotificationOpacity = _getScriptSetting(
        "notifications",
        "readOpacity",
        0.8, // Default: 80% opacity
      );
      const readTintColorSetting = _getScriptSetting(
        "notifications",
        "readTintColor",
        "rgba(0, 0, 0, 0.05)", // Default: 5% opaque black
      );

      // Apply base container styling
      Object.assign(block.style, NOTIFICATION_BLOCK_STYLE);

      const notificationText = block.querySelector(".notification_text");
      if (!notificationText) return;

      // --- Determine Read/Unread state based on parent li class ---
      const parentLi = block.closest("li");
      const isRead = parentLi ? !parentLi.classList.contains("bg2") : false; // Consider read if parent li doesn't have bg2

      if (isRead) {
        // Check if we should hide read notifications
        const hideReadNotifications = _getScriptSetting(
          "notifications", // Script ID as first parameter
          "hideReadNotifications",
          false,
        );

        if (hideReadNotifications && parentLi) {
          // Hide read notifications if the setting is enabled
          parentLi.style.display = "none";
        } else {
          // Otherwise apply the opacity/tint settings
          block.style.opacity = readNotificationOpacity;
          block.style.backgroundColor = readTintColorSetting;
        }
      } else {
        // Explicitly reset opacity and background for unread items
        block.style.opacity = "";
        block.style.backgroundColor = "";
      }
      // --- End Read/Unread state check ---

      // Move time element to bottom right
      const timeElement = block.querySelector(".notification-time");
      if (timeElement) {
        Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
      }

      let titleElement = notificationText.querySelector(".notification-title");
      if (!titleElement) return; // Need a title element to proceed

      let titleText = titleElement.innerHTML; // Initialize titleText
      let currentHtml = titleText; // Initialize currentHtml with the initial title text
      let notificationType = "default"; // Determine type

      // Determine notification type and potentially call specialized handlers
      if (titleText.includes("You were mentioned by")) {
        notificationType = "mention";
        await this.customizeMentionNotification(block);
        currentHtml = titleElement.innerHTML; // Update currentHtml after potential modification
      } else if (titleText.includes("reacted to")) {
        notificationType = "reaction";
        await this.customizeReactionNotification(titleElement, block);
        currentHtml = titleElement.innerHTML; // Update currentHtml after potential modification
      } else if (titleText.includes("Private Message")) {
        notificationType = "pm";
        this.customizePrivateMessageNotification(titleElement, block);
        currentHtml = titleElement.innerHTML; // Re-check currentHtml
        if (titleElement.innerHTML.includes("Board warning issued")) {
          // Use titleElement.innerHTML for check
          notificationType = "warning";
        }
      } else if (titleText.includes("Report closed")) {
        notificationType = "report";
        if (enableColors) {
          currentHtml = titleText.replace(
            /Report closed/,
            `<strong style="color: ${reportColorSetting};">Report closed</strong>`,
          );
        }
      } else if (titleText.includes("Post approval")) {
        notificationType = "approval";
        if (enableColors) {
          currentHtml = titleText.replace(
            /<strong>Post approval<\/strong>/,
            `<strong style="color: ${approvalColorSetting};">Post approval</strong>`,
          );
        }
      } else if (titleText.includes("<strong>Quoted</strong>")) {
        notificationType = "quote";
        // currentHtml already holds the initial text, which is correct here
      } else if (titleText.includes("<strong>Reply</strong>")) {
        notificationType = "reply";
        // currentHtml already holds the initial text, which is correct here
      } else if (titleText.includes("edited a message")) {
        notificationType = "edit";
        if (enableColors) {
          currentHtml = titleText.replace(
            /edited a message you posted/,
            `<strong style="color: ${editColorSetting};">edited</strong> a message you posted`,
          );
        }
      }
      // IMPORTANT: After this block, `currentHtml` holds the base HTML before reply/quote modifications

      // Handle previews for Reply/Quote (this part modifies titleElement.innerHTML directly)
      let referenceElement = notificationText.querySelector(
        ".notification-reference",
      );
      if (
        referenceElement &&
        (notificationType === "reply" || notificationType === "quote")
      ) {
        const threadTitle = referenceElement.textContent
          .trim()
          .replace(/^"|"$/g, "");

        // Update title structure IN PLACE
        // Start with the potentially colored/modified currentHtml
        let updatedTitle = currentHtml.replace(
          /in(?:\stopic)?:/,
          `<span style="font-size: 0.85em; padding: 0 0.25px;">in</span> <strong>${threadTitle}</strong>:`,
        );
        titleElement.innerHTML = updatedTitle; // Apply this structural change

        // Update the reference element
        referenceElement.textContent = "Loading...";
        Utils.styleReference(referenceElement); // Apply reference style

        // Queue fetch
        this.queuePostContentFetch(
          block.getAttribute("data-real-url") || block.href,
          referenceElement,
        );

        // Re-fetch HTML after potential in-place modification for reply/quote
        currentHtml = titleElement.innerHTML;
      } else {
        // If not reply/quote, ensure titleElement reflects currentHtml before styling
        titleElement.innerHTML = currentHtml;
      }

      // Apply text resizing *first*, only if not already done
      if (!block.dataset.fillerResized && resizeFillers) {
        currentHtml = currentHtml.replace(
          /\b(by|and|in|from)\b(?!-)/g,
          '<span style="font-size: 0.85em; padding: 0 0.25px;">$1</span>',
        );
        block.dataset.fillerResized = true; // Mark as resized
      }

      // Apply keyword coloring ONLY if enableColors is true
      if (enableColors) {
        const quoteColor = quoteColorSetting;
        const replyColor = replyColorSetting;
        const editColor = editColorSetting;
        const approvalColor = approvalColorSetting;
        const reportColor = reportColorSetting;
        // Reaction, Mention, Warning handled earlier or within their functions

        // Re-apply coloring systematically based on notificationType
        // This ensures colors are applied correctly even after resizing/structural changes
        switch (notificationType) {
          case "quote":
            currentHtml = currentHtml.replace(
              /<strong>Quoted<\/strong>/,
              `<strong style="color: ${quoteColor};">Quoted</strong>`,
            );
            break;
          case "reply":
            currentHtml = currentHtml.replace(
              /<strong>Reply<\/strong>/,
              `<strong style="color: ${replyColor};">Reply</strong>`,
            );
            break;
          case "edit":
            // Make sure we're replacing the correct pattern, potentially already styled
            currentHtml = currentHtml.replace(
              /(<strong(?: style="color: [^;]+;")?>edited<\/strong>|edited) a message/,
              `<strong style="color: ${editColor};">edited</strong> a message`,
            );
            break;
          case "approval":
            currentHtml = currentHtml.replace(
              /(<strong(?: style="color: [^;]+;")?>Post approval<\/strong>|<strong>Post approval<\/strong>)/,
              `<strong style="color: ${approvalColor};">Post approval</strong>`,
            );
            break;
          case "report":
            currentHtml = currentHtml.replace(
              /(<strong(?: style="color: [^;]+;")?>Report closed<\/strong>|Report closed)/,
              `<strong style="color: ${reportColor};">Report closed</strong>`,
            );
            break;
          // Reaction, Mention, Warning colors should be handled by their respective functions
          // or the initial assignment if `enableColors` was false initially.
        }
      } else {
        // If colors are disabled, remove any potentially pre-existing color styles
        currentHtml = currentHtml
          .replace(/<b style="color: [^;]+;">/g, "<b>")
          .replace(/<strong style="color: [^;]+;">/g, "<strong>");
      }

      // Apply the final HTML
      titleElement.innerHTML = currentHtml;

      // Ensure reference styling is applied (if element exists)
      referenceElement = block.querySelector(".notification-reference"); // Re-query in case it was added/removed
      if (referenceElement) {
        Utils.styleReference(referenceElement);
      }

      // Standardize username class and remove inline color
      block.querySelectorAll(".username-coloured").forEach((el) => {
        el.classList.replace("username-coloured", "username");
        el.style.color = "";
      });

      block.dataset.customized = "true";
    },

    customizeNotificationPanel() {
      // Get the setting for hiding read notifications
      const hideReadNotifications = _getScriptSetting(
        "notifications",
        "hideReadNotifications",
        false,
      );

      // First customize all notification blocks
      const notificationBlocks = document.querySelectorAll(
        ".notification-block, a.notification-block",
      );
      notificationBlocks.forEach(
        NotificationCustomizer.customizeNotificationBlock.bind(
          NotificationCustomizer,
        ),
      );

      // If hiding read notifications is enabled, check if all are hidden
      if (hideReadNotifications) {
        // Find the dropdown container
        const dropdownContents = document.querySelector(
          ".dropdown-extended .dropdown-contents",
        );

        if (dropdownContents) {
          // Wait a bit for any removals to be complete
          setTimeout(() => {
            // Get all notification items
            const allLiElements = dropdownContents.querySelectorAll("li");
            const visibleNotifications = Array.from(allLiElements).filter(
              (li) =>
                !li.classList.contains("no-notifications-message") &&
                li.style.display !== "none",
            );

            // Remove any existing "no notifications" message
            const existingMessage = dropdownContents.querySelector(
              ".no-notifications-message",
            );
            if (existingMessage) {
              existingMessage.remove();
            }

            // If all notifications are hidden or there are none, show the message
            if (visibleNotifications.length === 0) {
              const emptyUl = dropdownContents.querySelector("ul");

              if (emptyUl) {
                const messageElement = document.createElement("li");
                messageElement.className = "no-notifications-message";
                messageElement.style.textAlign = "center";
                messageElement.style.padding = "10px";
                messageElement.style.color = "#888";
                messageElement.style.fontSize = "0.9em";
                messageElement.style.fontStyle = "italic";
                messageElement.style.display = ""; // Ensure it's visible
                messageElement.textContent = "No new notifications";

                // Insert at the top of the list
                emptyUl.insertBefore(messageElement, emptyUl.firstChild);
              }
            }
          }, 10); // Small delay to allow DOM changes to complete
        }
      }
    },

    customizeNotificationPage() {
      // Get settings needed for this page
      const enableColors = _getScriptSetting(
        "notifications",
        "enableNotificationColors",
        true,
      );

      // Get the setting for hiding read notifications
      const hideReadNotifications = _getScriptSetting(
        "notifications",
        "hideReadNotifications",
        false,
      );

      const rawColorsJson = _getScriptSetting(
        "notifications",
        "notificationColors",
        "{}",
      );
      let notificationColors = {};
      try {
        notificationColors = JSON.parse(rawColorsJson);
      } catch (e) {
        console.error("Invalid JSON in notificationColors setting:", e);
        notificationColors = { default: "#ffffff" }; // Fallback
      }
      const enableSmileys = _getScriptSetting(
        "notifications",
        "enableReactionSmileys",
      );
      const resizeFillers = _getScriptSetting(
        "notifications",
        "resizeFillerWords",
        true,
      );
      const quoteColorSetting = _getScriptSetting(
        "notifications",
        "quoteColor",
        "#F5575D",
      );
      const replyColorSetting = _getScriptSetting(
        "notifications",
        "replyColor",
        "#2E8B57",
      );
      const reactionColorSetting = _getScriptSetting(
        "notifications",
        "reactionColor",
        "#3889ED",
      );
      const mentionColorSetting = _getScriptSetting(
        "notifications",
        "mentionColor",
        "#FFC107",
      );
      const editColorSetting = _getScriptSetting(
        "notifications",
        "editColor",
        "#8A2BE2", // Default value
      );
      const approvalColorSetting = _getScriptSetting(
        "notifications",
        "approvalColor",
        "#00AA00", // Default value
      );
      const reportColorSetting = _getScriptSetting(
        "notifications",
        "reportColor",
        "#f58c05", // Default value
      );
      const warningColorSetting = _getScriptSetting(
        "notifications",
        "warningColor",
        "#D31141", // Default value
      );
      const defaultColorSetting = _getScriptSetting(
        "notifications",
        "defaultColor",
        "#ffffff", // Default value
      );
      const referenceBackgroundColorSetting = _getScriptSetting(
        "notifications",
        "referenceBackgroundColor",
        "rgba(23, 27, 36, 0.5)",
      );
      const referenceTextColorSetting = _getScriptSetting(
        "notifications",
        "referenceTextColor",
        "#ffffff",
      );
      const readNotificationOpacity = _getScriptSetting(
        "notifications",
        "readOpacity",
        0.8, // Default: 80% opacity
      );
      const readTintColorSetting = _getScriptSetting(
        "notifications",
        "readTintColor",
        "rgba(0, 0, 0, 0.05)", // Default: 5% opaque black
      );

      // Define colors (get from settings or use defaults)
      const colors = enableColors ? notificationColors : {};
      const quoteColor = quoteColorSetting; // Use the specific setting
      const replyColor = replyColorSetting;
      const reactionColor = reactionColorSetting;
      const mentionColor = mentionColorSetting;
      const editColor = editColorSetting;
      const approvalColor = approvalColorSetting;
      const reportColor = reportColorSetting;
      const warningColor = warningColorSetting;
      const defaultColor = defaultColorSetting;
      const referenceBackgroundColor = referenceBackgroundColorSetting;
      const referenceTextColor = referenceTextColorSetting;

      document.querySelectorAll(".cplist .row").forEach(async (row) => {
        if (row.dataset.customized === "true") return;

        row.style.position = "relative";
        row.style.paddingBottom = "20px"; // Make room for timestamp

        const timeElement = row.querySelector(".notifications_time");
        if (timeElement) {
          Object.assign(timeElement.style, NOTIFICATIONS_TIME_STYLE);
        }

        const notificationBlock = row.querySelector(".notifications");
        const anchorElement = notificationBlock?.querySelector("a");

        if (!anchorElement) {
          row.dataset.customized = "true"; // Mark as processed even if no anchor
          return;
        }

        const titleElement = anchorElement.querySelector(
          ".notifications_title",
        );
        if (!titleElement) {
          row.dataset.customized = "true"; // Mark as processed even if no title
          return;
        }

        // Determine if read (no mark_notification link)
        const isRead = !(
          anchorElement.href && anchorElement.href.includes("mark_notification")
        );
        if (isRead) {
          // Check if we should hide read notifications
          const hideReadNotifications = _getScriptSetting(
            "notifications", // Script ID as first parameter
            "hideReadNotifications",
            false,
          );

          if (hideReadNotifications) {
            // Hide read notifications if the setting is enabled
            row.style.display = "none";
          } else {
            // Otherwise apply the opacity/tint settings
            row.style.opacity = readNotificationOpacity;
            row.style.backgroundColor = readTintColorSetting; // Apply tint
          }
        }

        let originalTitleHTML = titleElement.innerHTML;
        let notificationType = "default";
        let newHtmlContent = ""; // Store the final HTML for the anchor
        let placeholderElement; // Store ref to placeholder for fetch later

        // Helper for styling keywords
        const styleKeyword = (keyword, color) =>
          enableColors
            ? `<strong style="color: ${color};">${keyword}</strong>`
            : `<strong>${keyword}</strong>`;
        const styleFiller = (word) =>
          `<span style="font-size: 0.85em; padding: 0 0.25px;">${word}</span>`;

        // --- Mention Handling ---
        if (originalTitleHTML.includes("You were mentioned by")) {
          notificationType = "mention";
          const parts = originalTitleHTML.split("<br>");
          if (parts.length === 2) {
            let mentionText = parts[0] + " " + parts[1];
            // Apply filler styling first if enabled
            if (resizeFillers) {
              mentionText = mentionText.replace(
                /\b(by|in)\b(?!-)/g,
                styleFiller("$1"),
              );
            }

            const referenceStyle = `background: ${referenceBackgroundColor}; color: ${referenceTextColor}; padding: 2px 4px; border-radius: 2px; margin-top: 5px;`;
            newHtmlContent = `
              <div class="notification-block">
                <div class="notification-title">${styleKeyword("Mentioned", mentionColor)} ${mentionText.substring(mentionText.indexOf(resizeFillers ? styleFiller("by") : "by"))}</div>
                <div class="notification-reference" style="${referenceStyle}">
                  Loading...
                </div>
              </div>
            `;
            anchorElement.innerHTML = newHtmlContent; // Update DOM to find placeholder
            placeholderElement = anchorElement.querySelector(
              ".notification-reference",
            );
          } else {
            // Fallback if format unexpected
            newHtmlContent = originalTitleHTML; // Keep original if parsing fails
          }
        }
        // --- Reaction Handling ---
        else if (originalTitleHTML.includes("reacted to")) {
          notificationType = "reaction";
          const usernameElements = Array.from(
            titleElement.querySelectorAll(".username, .username-coloured"),
          );
          const usernames = usernameElements.map((el) => el.textContent.trim());
          const postId = Utils.extractPostId(anchorElement.href);

          if (postId) {
            let reactionHTML = "";
            if (enableSmileys) {
              const reactions = await ReactionHandler.fetchReactions(
                postId,
                false,
              );
              const filteredReactions = reactions.filter((r) =>
                usernames.includes(r.username),
              );
              reactionHTML = Utils.formatReactions(filteredReactions);
            }

            const firstUsernameHTML =
              usernameElements.length > 0 ? usernameElements[0].outerHTML : "";
            const firstPart = originalTitleHTML.substring(
              0,
              originalTitleHTML.indexOf(firstUsernameHTML),
            );

            // Format usernames with styled fillers
            let formattedUsernames;
            const smallAnd = resizeFillers ? styleFiller("and") : "and";
            if (usernameElements.length === 1) {
              formattedUsernames = usernameElements[0].outerHTML;
            } else if (usernameElements.length === 2) {
              formattedUsernames = `${usernameElements[0].outerHTML} ${smallAnd} ${usernameElements[1].outerHTML}`;
            } else if (usernameElements.length > 2) {
              formattedUsernames =
                usernameElements
                  .slice(0, -1)
                  .map((el) => el.outerHTML)
                  .join(", ") +
                `, ${smallAnd} ${usernameElements[usernameElements.length - 1].outerHTML}`;
            } else {
              formattedUsernames = "Someone"; // Fallback
            }

            const reactionVerb = styleKeyword("reacted", reactionColor);
            const finalTitle = `${firstPart}${formattedUsernames} ${reactionVerb} ${reactionHTML} to:`;

            const referenceStyle = `background: ${referenceBackgroundColor}; color: ${referenceTextColor}; padding: 2px 4px; border-radius: 2px; margin-top: 5px;`;
            newHtmlContent = `
              <div class="notification-block">
                <div class="notification-title">${finalTitle}</div>
                <div class="notification-reference" style="${referenceStyle}">
                  Loading...
                </div>
              </div>
            `;
            anchorElement.innerHTML = newHtmlContent; // Update DOM
            placeholderElement = anchorElement.querySelector(
              ".notification-reference",
            );
          } else {
            newHtmlContent = originalTitleHTML; // Keep original if no postId
          }
        }
        // --- Other Notification Types (Quote, Reply, Edit, Approval, Report) ---
        else {
          const lastQuoteMatch = originalTitleHTML.match(/"([^"]*)"$/);
          let baseTitleText = originalTitleHTML;
          let referenceText = "Loading..."; // Default for placeholder

          // Determine type and adjust base title
          if (originalTitleHTML.includes("<strong>Quoted</strong>")) {
            notificationType = "quote";
            // Keep the quote in the title for 'Quoted' notifications
            referenceText = lastQuoteMatch
              ? `"${lastQuoteMatch[1]}"`
              : "Loading...";
          } else {
            // For other types, remove the trailing quote from the title if present
            if (lastQuoteMatch) {
              baseTitleText = originalTitleHTML.replace(/"[^"]*"$/, "").trim();
              referenceText = `"${lastQuoteMatch[1]}"`; // Use the extracted quote for the reference initially
            }

            if (originalTitleHTML.includes("<strong>Reply</strong>")) {
              notificationType = "reply";
            } else if (originalTitleHTML.includes("edited a message")) {
              notificationType = "edit";
            } else if (originalTitleHTML.includes("Post approval")) {
              notificationType = "approval";
            } else if (originalTitleHTML.includes("Report closed")) {
              notificationType = "report";
            } else if (originalTitleHTML.includes("Private Message")) {
              // Basic PM handling, could be expanded like in customizeNotificationBlock
              notificationType = "pm";
              const subjectMatch = originalTitleHTML.match(
                /<strong>Private Message<\/strong>(?: from [^:]+):? "?([^"]*)"?/,
              );
              if (subjectMatch && subjectMatch[1] === "Board warning issued") {
                notificationType = "warning";
                baseTitleText = originalTitleHTML
                  .replace(
                    /<strong>Private Message<\/strong>/,
                    styleKeyword("Board warning issued", warningColor),
                  )
                  .replace(/from/, "by")
                  .replace(/:$/, "")
                  .replace(/"[^"]*"$/, "")
                  .trim();
                referenceText = null; // No reference for warnings
              } else {
                baseTitleText = originalTitleHTML
                  .replace(
                    /<strong>Private Message<\/strong>/,
                    styleKeyword("Private Message", defaultColor),
                  )
                  .replace(/"[^"]*"$/, "")
                  .trim();
              }
            }
          }

          // Apply keyword styling based on determined type
          let styledTitle = baseTitleText;
          switch (notificationType) {
            case "quote":
              styledTitle = styledTitle.replace(
                /<strong>Quoted<\/strong>/,
                styleKeyword("Quoted", quoteColor),
              );
              break;
            case "reply":
              styledTitle = styledTitle.replace(
                /<strong>Reply<\/strong>/,
                styleKeyword("Reply", replyColor),
              );
              break;
            case "edit":
              styledTitle = styledTitle.replace(
                /edited a message/,
                `${styleKeyword("edited", editColor)} a message`,
              );
              break;
            case "approval":
              styledTitle = styledTitle.replace(
                /<strong>Post approval<\/strong>/,
                styleKeyword("Post approval", approvalColor),
              );
              break;
            case "report":
              styledTitle = styledTitle.replace(
                /Report closed/,
                styleKeyword("Report closed", reportColor),
              );
              break;
            // Warning already styled if detected
            // PM default styling handled above
          }

          // Apply filler styling if enabled
          if (resizeFillers) {
            styledTitle = styledTitle.replace(
              /\b(by|and|in|from)\b(?!-)/g,
              styleFiller("$1"),
            );
          }

          // Construct HTML
          const referenceStyle = `background: ${referenceBackgroundColor}; color: ${referenceTextColor}; padding: 2px 4px; border-radius: 2px; margin-top: 5px;`;
          newHtmlContent = `
            <div class="notification-block">
              <div class="notification-title">${styledTitle}</div>
              ${
                referenceText !== null // Only add reference div if needed
                  ? `<div class="notification-reference" style="${referenceStyle}">
                ${referenceText}
              </div>`
                  : ""
              }
            </div>
          `;
          anchorElement.innerHTML = newHtmlContent; // Update DOM
          if (referenceText !== null) {
            placeholderElement = anchorElement.querySelector(
              ".notification-reference",
            );
          }
        }

        // --- Post-Processing ---

        // Queue content fetch if a placeholder exists
        if (
          placeholderElement &&
          placeholderElement.textContent.includes("Loading...")
        ) {
          // Check if the placeholder already has content (e.g., extracted quote)
          const alreadyHasContent =
            !placeholderElement.textContent.includes("Loading...");
          if (!alreadyHasContent) {
            NotificationCustomizer.queuePostContentFetch(
              anchorElement.href,
              placeholderElement,
            );
          } else {
            // If it already has text content (like a quote), style it
            Utils.styleReference(placeholderElement);
          }
        }

        // Apply background color to the row if enabled and NOT already tinted as read
        if (enableColors && !isRead) {
          const color = notificationColors[notificationType] || defaultColor;
          row.style.backgroundColor = color;
        }

        // Convert username-coloured to username and remove inline style
        anchorElement.querySelectorAll(".username-coloured").forEach((el) => {
          el.classList.replace("username-coloured", "username");
          el.style.color = ""; // Remove inline color style if any
        });

        row.dataset.customized = "true";
      });

      // If hiding read notifications is enabled, check if all are hidden
      if (hideReadNotifications) {
        // Wait a bit for any removals to be complete
        setTimeout(() => {
          // Check if we have a notification list
          const notificationList = document.querySelector(".notification_list");

          if (notificationList) {
            // Get all notification rows that are not hidden or our message
            const visibleRows = Array.from(
              notificationList.querySelectorAll("div.row"),
            ).filter(
              (row) =>
                !row.classList.contains("no-notifications-page-message") &&
                row.style.display !== "none",
            );

            // Remove any existing "no notifications" message
            const existingMessage = document.querySelector(
              ".no-notifications-page-message",
            );
            if (existingMessage) {
              existingMessage.remove();
            }

            // If all notifications are hidden or there are none, show the message
            if (visibleRows.length === 0) {
              const messageElement = document.createElement("div");
              messageElement.className = "no-notifications-page-message row";
              messageElement.style.textAlign = "center";
              messageElement.style.padding = "20px";
              messageElement.style.color = "#888";
              messageElement.style.fontSize = "1.1em";
              messageElement.style.fontStyle = "italic";
              messageElement.style.background = "rgba(0,0,0,0.03)";
              messageElement.style.margin = "10px 0";
              messageElement.style.borderRadius = "5px";
              messageElement.style.display = ""; // Ensure it's visible
              messageElement.textContent = "No new notifications";

              // Insert at the top of the notification list
              notificationList.insertBefore(
                messageElement,
                notificationList.firstChild,
              );
            }
          }
        }, 10); // Small delay to allow DOM changes to complete
      }
    }, // End of customizeNotificationPage

    async queuePostContentFetch(url, placeholder) {
      // Get relevant settings
      const enableImagePreview = _getScriptSetting(
        "notifications",
        "enableImagePreviews",
        true,
      );
      const enableVideoPreview = _getScriptSetting(
        "notifications",
        "enableVideoPreviews",
        false,
      );
      const enableQuotePreview = _getScriptSetting(
        // Need this for quote notifications
        "notifications",
        "enableQuotePreviews",
        true,
      );

      // Determine notification type from URL or placeholder context if possible?
      // For now, assume we want text unless specific previews are enabled and match.
      const wantsPreview = enableImagePreview || enableVideoPreview;
      const wantsTextQuote = enableQuotePreview; // Specifically for quote notifications

      const postId = Utils.extractPostId(url);
      if (!postId) {
        placeholder.remove();
        return;
      }

      // Check if we need to wait before next fetch
      if (this.lastFetchTime) {
        const timeSinceLastFetch = Date.now() - this.lastFetchTime;
        if (timeSinceLastFetch < FETCH_DELAY) {
          await Utils.sleep(FETCH_DELAY - timeSinceLastFetch);
        }
      }

      try {
        const postContent = await ReactionHandler.fetchPostContent(postId);
        if (postContent && placeholder.parentNode) {
          const trimmedContent = postContent.trim();

          // Always create the media preview container, but only add if needed
          const mediaPreviewContainer = Utils.createElement("div", {
            className: "notification-media-preview",
          });
          let mediaFound = false;

          // Check for video first
          if (
            enableVideoPreview &&
            ((trimmedContent.startsWith("[webm]") &&
              trimmedContent.endsWith("[/webm]")) ||
              (trimmedContent.startsWith("[media]") &&
                trimmedContent.endsWith("[/media]")))
          ) {
            const videoData = Utils.extractVideoUrl(trimmedContent);
            if (videoData) {
              mediaPreviewContainer.innerHTML = `<video src="${videoData.url}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" loop muted autoplay title="Video Preview"></video>`;
              mediaFound = true;
            }
          }

          // If no video or video disabled, check for image
          if (
            !mediaFound &&
            enableImagePreview &&
            ((trimmedContent.startsWith("[img]") &&
              trimmedContent.endsWith("[/img]")) ||
              trimmedContent.match(/^\[img\s+[^=\]]+=[^\]]+\].*?\[\/img\]$/i))
          ) {
            let imageUrl;
            if (trimmedContent.startsWith("[img]")) {
              imageUrl = trimmedContent.slice(5, -6).trim();
            } else {
              const paramMatch = trimmedContent.match(
                /^\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]$/i,
              );
              imageUrl = paramMatch ? paramMatch[1].trim() : null;
            }
            if (imageUrl) {
              mediaPreviewContainer.innerHTML = `<img src="${imageUrl}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" title="Image Preview">`;
              mediaFound = true;
            }
          }

          // Decision time: Show media, text, or nothing?
          if (mediaFound && wantsPreview) {
            // Media found and previews enabled: Insert media, remove placeholder
            placeholder.parentNode.insertBefore(
              mediaPreviewContainer,
              placeholder,
            );
            placeholder.remove();
          } else if (wantsTextQuote) {
            // Show text content (for quotes or if media previews off/no media found)
            placeholder.textContent = Utils.removeBBCode(postContent);
            Utils.styleReference(placeholder);
            mediaPreviewContainer.remove(); // Ensure empty preview div is not added
          } else {
            // No text quote wanted, no media preview shown -> remove placeholder
            placeholder.remove();
            mediaPreviewContainer.remove();
          }
        } else {
          placeholder.remove();
        }
      } catch (error) {
        console.error("Error fetching post content:", error);
        placeholder.remove();
      }

      this.lastFetchTime = Date.now();
    },
  };

  // --- Notification Marker ---
  const NotificationMarker = {
    getDisplayedPostIds() {
      return Array.from(document.querySelectorAll('div[id^="p"]')).map((el) =>
        el.id.substring(1),
      );
    },

    getNotificationData() {
      return Array.from(document.querySelectorAll(".notification-block"))
        .map((link) => {
          const href = link.getAttribute("href");
          const postId = Utils.extractPostId(
            link.getAttribute("data-real-url") || href,
          );
          return { href, postId };
        })
        .filter((data) => data.href && data.postId);
    },

    markNotificationAsRead(href) {
      GM_xmlhttpRequest({
        method: "GET",
        url: "https://rpghq.org/forums/" + href,
        onload: (response) =>
          console.log("Notification marked as read:", response.status),
      });
    },

    checkAndMarkNotifications() {
      const displayedPostIds = this.getDisplayedPostIds();
      const notificationData = this.getNotificationData();

      notificationData.forEach((notification) => {
        if (displayedPostIds.includes(notification.postId)) {
          this.markNotificationAsRead(notification.href);
        }
      });
    },
  };

  // --- Initialization ---
  const init = () => {
    // Add CSS override to set max-width to 50px for .row .list-inner img
    const styleElement = document.createElement("style");
    styleElement.textContent = `
        .row .list-inner img {
          max-width: 50px !important;
        }
      `;
    document.head.appendChild(styleElement);

    NotificationCustomizer.customizeNotificationPanel();
    NotificationMarker.checkAndMarkNotifications(); // Now unconditional

    if (window.location.href.includes("ucp.php?i=ucp_notifications")) {
      NotificationCustomizer.customizeNotificationPage();
    }

    // Add debouncing to prevent rapid re-processing
    let debounceTimer;
    const debouncedCustomize = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        NotificationCustomizer.customizeNotificationPanel();
      }, 100);
    };

    // Observe DOM changes to apply customizations dynamically
    const observer = new MutationObserver((mutations) => {
      let shouldProcess = false;

      for (const mutation of mutations) {
        // Check if class attribute changed on a relevant parent LI
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class" &&
          mutation.target.nodeType === Node.ELEMENT_NODE &&
          mutation.target.matches("li") && // Check if the target is an LI
          mutation.target.querySelector(
            ".notification-block, a.notification-block",
          ) // Check if it contains a notification block
        ) {
          console.log("Observer triggered: Parent LI class changed.");
          shouldProcess = true;
          break;
        }

        // Check if new notification blocks were added
        if (mutation.type === "childList") {
          const addedNotifications = Array.from(mutation.addedNodes).some(
            (node) =>
              node.nodeType === Node.ELEMENT_NODE &&
              (node.matches?.(".notification-block, a.notification-block") ||
                node.querySelector?.(
                  ".notification-block, a.notification-block",
                )),
          );

          if (addedNotifications) {
            console.log("Observer triggered: New notifications added.");
            shouldProcess = true;
            break; // Found a relevant change
          }
        }
      }

      if (shouldProcess) {
        debouncedCustomize(); // Use existing debounce
      }
    });

    // Observe relevant DOM changes (attributes and childList)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"], // Focus on class attribute changes
    });

    // Run storage cleanup last
    Storage.cleanupStorage();
  };

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    init();
  } else {
    window.addEventListener("load", init);
  }
}
