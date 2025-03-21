// ==UserScript==
// @name         RPGHQ Notifications Customization
// @namespace    http://tampermonkey.net/
// @version      4.6.0
// @description  Customize RPGHQ notifications display
// @author       LOREGAMER
// @match        https://rpghq.org/*/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @license     MIT
// @updateURL    https://raw.githubusercontent.com/loregamer/rpghq-userscripts/main/Notifications.user.js
// @downloadURL  https://raw.githubusercontent.com/loregamer/rpghq-userscripts/main/Notifications.user.js
// ==/UserScript==

/*
MIT License

Copyright (c) 2024 loregamer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function () {
  "use strict";

  // Inject a small inline script to override the page's activeNotifications update interval.
  const overrideCode = `(${function () {
    function overrideUpdateInterval() {
      if (
        window.activeNotifications &&
        typeof window.activeNotifications === "object"
      ) {
        window.activeNotifications.updateInterval = 999999;
        console.log("activeNotifications.updateInterval set to 999999");
      } else {
        setTimeout(overrideUpdateInterval, 50);
      }
    }
    overrideUpdateInterval();
  }.toString()})();`;

  const overrideScript = document.createElement("script");
  overrideScript.textContent = overrideCode;
  (document.head || document.documentElement).appendChild(overrideScript);
  overrideScript.remove();

  // --- Constants ---
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const REFERENCE_STYLE = {
    display: "inline-block",
    background: "rgba(23, 27, 36, 0.5)",
    color: "#ffffff",
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
    color: "#888",
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
        `
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
        /^\[img\s+([^=\]]+)=([^\]]+)\](.*?)\[\/img\]$/i
      );
      if (paramImgMatch) {
        console.log("Text is a single image tag with parameters");
        const url = paramImgMatch[3].trim();
        console.log("Extracted URL:", url);
        return url;
      }

      // Find all image tags (both with and without parameters)
      const imageUrls = text.match(
        /\[img(?:\s+[^=\]]+=[^\]]+)?\](.*?)\[\/img\]/gi
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
        JSON.stringify({ reactions, timestamp: Date.now() })
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
        JSON.stringify({ content, timestamp: Date.now() })
      );
    },

    cleanupStorage: () => {
      const lastCleanup = GM_getValue("last_storage_cleanup", 0);
      const now = Date.now();

      // Only cleanup if it's been more than 24 hours since last cleanup
      if (now - lastCleanup >= ONE_DAY) {
        // Get all stored keys
        const allKeys = GM_listValues ? GM_listValues() : [];

        allKeys.forEach((key) => {
          if (key === "last_storage_cleanup") return;

          const data = GM_getValue(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              if (parsed.timestamp && now - parsed.timestamp >= ONE_DAY) {
                GM_deleteValue(key);
              }
            } catch (e) {
              // If we can't parse the data, it's probably corrupted, so delete it
              GM_deleteValue(key);
            }
          }
        });

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
          }
        );
        const data = await response.json();
        const doc = new DOMParser().parseFromString(
          data.htmlContent,
          "text/html"
        );
        const reactions = Array.from(
          doc.querySelectorAll('.tab-content[data-id="0"] li')
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
          }
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

      // Apply container styling to the block
      Object.assign(block.style, NOTIFICATION_BLOCK_STYLE);

      // Move time element to bottom right
      const timeElement = block.querySelector(".notification-time");
      if (timeElement) {
        Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
      }

      const titleText = titleElement.innerHTML;
      const isUnread = block.href && block.href.includes("mark_notification");
      const postId = Utils.extractPostId(
        block.getAttribute("data-real-url") || block.href
      );
      if (!postId) return;

      const usernameElements = titleElement.querySelectorAll(
        ".username, .username-coloured"
      );
      const usernames = Array.from(usernameElements).map((el) =>
        el.textContent.trim()
      );
      const reactions = await ReactionHandler.fetchReactions(postId, isUnread);
      const filteredReactions = reactions.filter((reaction) =>
        usernames.includes(reaction.username)
      );
      const reactionHTML = Utils.formatReactions(filteredReactions);
      const isReactedTo = titleText.includes("reacted to a message you posted");

      if (isReactedTo) {
        titleElement.innerHTML = titleText.replace(
          /(have|has)\s+reacted.*$/,
          `<b style="color: #3889ED;">reacted</b> ${reactionHTML} to:`
        );
        const postContent = await ReactionHandler.fetchPostContent(postId);
        if (postContent) {
          const trimmedContent = postContent.trim();
          let referenceElement = block.querySelector(".notification-reference");

          if (!referenceElement) {
            referenceElement = Utils.createElement("span", {
              className: "notification-reference",
            });
            Utils.styleReference(referenceElement);
            titleElement.appendChild(document.createElement("br"));
            titleElement.appendChild(referenceElement);
          }

          // Always create the image/video preview div
          const mediaPreview = Utils.createElement("div", {
            className: "notification-image-preview",
          });

          // Check for video content first - only if the entire content is just a video tag
          if (
            (trimmedContent.startsWith("[webm]") &&
              trimmedContent.endsWith("[/webm]")) ||
            (trimmedContent.startsWith("[media]") &&
              trimmedContent.endsWith("[/media]"))
          ) {
            const videoData = Utils.extractVideoUrl(trimmedContent);
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
              referenceElement.textContent = Utils.removeURLs(
                Utils.removeBBCode(postContent)
              );
              Utils.styleReference(referenceElement);
              referenceElement.insertAdjacentElement("afterend", mediaPreview);
            } else {
              referenceElement = Utils.createElement("span", {
                className: "notification-reference",
                textContent: Utils.removeURLs(Utils.removeBBCode(postContent)),
              });
              Utils.styleReference(referenceElement);
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
    },

    async customizeMentionNotification(notificationBlock) {
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
        referenceElement
      );

      // Move time element to bottom right
      const timeElement = notificationText.querySelector(".notification-time");
      if (timeElement) {
        Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
      }
    },

    customizePrivateMessageNotification(titleElement, block) {
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
    },

    async customizeNotificationBlock(block) {
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
          await this.customizeMentionNotification(block);
        } else if (titleText.includes("reacted to a message you posted")) {
          await this.customizeReactionNotification(titleElement, block);
        } else if (titleText.includes("Private Message")) {
          this.customizePrivateMessageNotification(titleElement, block);
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
          Utils.styleReference(referenceElement);

          // Queue the content fetch
          this.queuePostContentFetch(
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
        Utils.styleReference(referenceElement);
      }

      block.querySelectorAll(".username-coloured").forEach((el) => {
        el.classList.replace("username-coloured", "username");
        el.style.color = "";
      });

      block.dataset.customized = "true";
    },

    customizeNotificationPanel() {
      document
        .querySelectorAll(".notification-block, a.notification-block")
        .forEach(
          NotificationCustomizer.customizeNotificationBlock.bind(
            NotificationCustomizer
          )
        );
    },

    customizeNotificationPage() {
      document.querySelectorAll(".cplist .row").forEach(async (row) => {
        if (row.dataset.customized === "true") return;

        // Ensure row has position relative for absolute positioning
        row.style.position = "relative";
        row.style.paddingBottom = "20px"; // Make room for timestamp

        // Handle the notifications_time elements
        const timeElement = row.querySelector(".notifications_time");
        if (timeElement) {
          // Directly set the styles to ensure they override any existing styles
          timeElement.style.position = "absolute";
          timeElement.style.bottom = "2px";
          timeElement.style.left = "2px";
          timeElement.style.fontSize = "0.85em";
          timeElement.style.color = "#888";
          timeElement.style.zIndex = "1"; // Ensure it's above other elements
        }

        const notificationBlock = row.querySelector(".notifications");
        const anchorElement = notificationBlock.querySelector("a");

        if (anchorElement) {
          const titleElement = anchorElement.querySelector(
            ".notifications_title"
          );
          let titleText = titleElement.innerHTML;

          // Handle mentioned notifications specially
          if (titleText.includes("You were mentioned by")) {
            const parts = titleText.split("<br>");
            if (parts.length === 2) {
              titleText = parts[0] + " " + parts[1];

              // Create the new HTML structure for mentions
              const newHtml = `
                <div class="notification-block">
                  <div class="notification-title">${titleText}</div>
                  <div class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; margin-top: 5px;">
                    Loading...
                  </div>
                </div>
              `;

              anchorElement.innerHTML = newHtml;

              // Queue the content fetch
              const referenceElement = anchorElement.querySelector(
                ".notification-reference"
              );
              if (referenceElement) {
                NotificationCustomizer.queuePostContentFetch(
                  anchorElement.href,
                  referenceElement
                );
              }
            }
          }
          // Handle reaction notifications
          else if (titleText.includes("reacted to")) {
            const usernameElements = Array.from(
              titleElement.querySelectorAll(".username, .username-coloured")
            );
            const usernames = usernameElements.map((el) =>
              el.textContent.trim()
            );

            const postId = Utils.extractPostId(anchorElement.href);
            if (postId) {
              const reactions = await ReactionHandler.fetchReactions(
                postId,
                false
              );
              const filteredReactions = reactions.filter((reaction) =>
                usernames.includes(reaction.username)
              );
              const reactionHTML = Utils.formatReactions(filteredReactions);

              // Keep everything up to the first username
              const firstPart = titleText.split(
                usernameElements[0].outerHTML
              )[0];

              const smallAnd =
                '<span style="font-size: 0.85em; padding: 0 0.25px;">and</span>';

              // Format usernames based on count
              let formattedUsernames;
              if (usernameElements.length === 2) {
                formattedUsernames = `${usernameElements[0].outerHTML} ${smallAnd} ${usernameElements[1].outerHTML}`;
              } else if (usernameElements.length > 2) {
                formattedUsernames =
                  usernameElements
                    .slice(0, -1)
                    .map((el) => el.outerHTML)
                    .join(", ") +
                  `, ${smallAnd} ${
                    usernameElements[usernameElements.length - 1].outerHTML
                  }`;
              } else {
                formattedUsernames = usernameElements[0].outerHTML;
              }

              titleText =
                firstPart +
                formattedUsernames +
                ` <b style="color: #3889ED;">reacted</b> ${reactionHTML} to:`;

              // Create the new HTML structure
              const newHtml = `
                <div class="notification-block">
                  <div class="notification-title">${titleText}</div>
                  <div class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; margin-top: 5px;">
                    Loading...
                  </div>
                </div>
              `;

              anchorElement.innerHTML = newHtml;

              // Queue the content fetch
              const referenceElement = anchorElement.querySelector(
                ".notification-reference"
              );
              if (referenceElement) {
                NotificationCustomizer.queuePostContentFetch(
                  anchorElement.href,
                  referenceElement
                );
              }
            }
          }
          // Handle other notifications with quotes
          else {
            const lastQuoteMatch = titleText.match(/"([^"]*)"$/);
            if (lastQuoteMatch) {
              // Only remove the quote from title if it's not a "Quoted" notification
              if (!titleText.includes("<strong>Quoted</strong>")) {
                titleText = titleText.replace(/"[^"]*"$/, "").trim();
              }

              // Apply text styling
              titleText = titleText
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

              // Create the new HTML structure
              const newHtml = `
                <div class="notification-block">
                  <div class="notification-title">${titleText}</div>
                  <div class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; margin-top: 5px;">
                    Loading...
                  </div>
                </div>
              `;

              anchorElement.innerHTML = newHtml;

              // Queue the content fetch
              const referenceElement = anchorElement.querySelector(
                ".notification-reference"
              );
              if (referenceElement) {
                NotificationCustomizer.queuePostContentFetch(
                  anchorElement.href,
                  referenceElement
                );
              }
            }
          }

          // Convert username-coloured to username
          anchorElement.querySelectorAll(".username-coloured").forEach((el) => {
            el.classList.replace("username-coloured", "username");
            el.style.color = "";
          });
        }

        row.dataset.customized = "true";
      });
    },

    async queuePostContentFetch(url, placeholder) {
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

          // Always create the image/video preview div
          const mediaPreview = Utils.createElement("div", {
            className: "notification-image-preview",
          });

          // Check for video content first - only if the entire content is just a video tag
          if (
            (trimmedContent.startsWith("[webm]") &&
              trimmedContent.endsWith("[/webm]")) ||
            (trimmedContent.startsWith("[media]") &&
              trimmedContent.endsWith("[/media]"))
          ) {
            const videoData = Utils.extractVideoUrl(trimmedContent);
            if (videoData) {
              // Create video element for preview
              mediaPreview.innerHTML = `<video src="${videoData.url}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" loop muted autoplay></video>`;

              // Remove the placeholder and add the video preview
              placeholder.parentNode.insertBefore(mediaPreview, placeholder);
              placeholder.remove();
            }
          }
          // Only add image if content is just an image tag
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
            // Remove the placeholder and add the image preview
            placeholder.parentNode.insertBefore(mediaPreview, placeholder);
            placeholder.remove();
          } else {
            // If not an image or video, update the placeholder with the text content
            placeholder.insertAdjacentElement("afterend", mediaPreview);
            placeholder.textContent = Utils.removeBBCode(postContent);
            Utils.styleReference(placeholder);
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
        el.id.substring(1)
      );
    },

    getNotificationData() {
      return Array.from(document.querySelectorAll(".notification-block"))
        .map((link) => {
          const href = link.getAttribute("href");
          const postId = Utils.extractPostId(
            link.getAttribute("data-real-url") || href
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
    NotificationMarker.checkAndMarkNotifications();

    if (window.location.href.includes("ucp.php?i=ucp_notifications")) {
      NotificationCustomizer.customizeNotificationPage();
    }

    // Add debouncing to prevent rapid re-processing
    let debounceTimer;
    const debouncedCustomize = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        NotificationCustomizer.customizeNotificationPanel();

        // Also customize the notification page if we're on that page
        if (window.location.href.includes("ucp.php?i=ucp_notifications")) {
          NotificationCustomizer.customizeNotificationPage();
        }
      }, 100);
    };

    // Set up mutation observer to detect DOM changes
    const observer = new MutationObserver(debouncedCustomize);
    observer.observe(document.body, { childList: true, subtree: true });

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
})();
