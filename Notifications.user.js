// ==UserScript==
// @name         RPGHQ Notifications Customization
// @namespace    http://tampermonkey.net/
// @version      4.1
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
          <img src="${reaction.image}" alt="${reaction.name}" title="${reaction.name}" 
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
        // Remove img tags
        .replace(/\[img\](.*?)\[\/img\]/gi, "")
        // Remove media tags
        .replace(/\[media\](.*?)\[\/media\]/gi, "")
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
      const imageUrls = text.match(/\[img\](.*?)\[\/img\]/gi);
      if (imageUrls && imageUrls.length === 1) {
        return imageUrls[0].replace(/\[img\](.*?)\[\/img\]/i, "$1");
      }
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
          // Extract image URL before removing BBCode
          const imageUrl = Utils.extractSingleImageUrl(postContent);

          let referenceElement = block.querySelector(".notification-reference");
          if (referenceElement) {
            referenceElement.textContent = Utils.removeURLs(
              Utils.removeBBCode(postContent)
            );
            Utils.styleReference(referenceElement);
          } else {
            referenceElement = Utils.createElement("span", {
              className: "notification-reference",
              textContent: Utils.removeURLs(Utils.removeBBCode(postContent)),
            });
            Utils.styleReference(referenceElement);
            titleElement.appendChild(document.createElement("br"));
            titleElement.appendChild(referenceElement);
          }

          // Add image preview if we found one earlier
          if (imageUrl && referenceElement) {
            const imagePreview = Utils.createElement("div", {
              className: "notification-image-preview",
              innerHTML: `<img src="${imageUrl}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;">`,
            });
            referenceElement.insertAdjacentElement("afterend", imagePreview);
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

    customizeMentionNotification(notificationBlock) {
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
      const timeElement = notificationText.querySelector(".notification-time");
      if (timeElement) {
        notificationText.appendChild(timeElement);
      }
    },

    customizePrivateMessageNotification(titleElement, referenceElement) {
      const subject = referenceElement?.textContent
        .trim()
        .replace(/^"(.*)"$/, "$1");
      if (subject === "Board warning issued") {
        titleElement.innerHTML = titleElement.innerHTML
          .replace(
            /<strong>Private Message<\/strong>/,
            '<strong style="color: #D31141;">Board warning issued</strong>'
          )
          .replace(/from/, "by")
          .replace(/:$/, "");
        referenceElement?.remove();
      }
    },

    async customizeNotificationBlock(block) {
      if (block.dataset.customized === "true") return;
      const notificationText = block.querySelector(".notification_text");
      if (!notificationText) return;
      const titleElement = notificationText.querySelector(
        ".notification-title"
      );

      if (titleElement) {
        let titleText = titleElement.innerHTML;
        if (titleText.includes("You were mentioned by")) {
          this.customizeMentionNotification(block);
        } else if (titleText.includes("reacted to a message you posted")) {
          await this.customizeReactionNotification(titleElement, block);
        } else if (titleText.includes("Private Message")) {
          this.customizePrivateMessageNotification(
            titleElement,
            notificationText.querySelector(".notification-reference")
          );
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
      document.querySelectorAll(".cplist .row").forEach((row) => {
        if (row.dataset.customized === "true") return;

        const notificationBlock = row.querySelector(".notifications");
        const anchorElement = notificationBlock.querySelector("a");

        if (anchorElement) {
          const titleElement = anchorElement.querySelector(
            ".notifications_title"
          );
          let titleText = titleElement.innerHTML;

          // Find the last quoted text in the title
          const lastQuoteMatch = titleText.match(/"([^"]*)"$/);

          if (lastQuoteMatch) {
            // Get the quote without the quotation marks
            const quote = lastQuoteMatch[1];

            // Remove the quote from the title text
            titleText = titleText.replace(/"[^"]*"$/, "").trim();

            // Create the new HTML structure
            const newHtml = `
              <div class="notification-block">
                <div class="notification-title">${titleText}</div>
                <div class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; margin-top: 5px;">
                  ${quote}
                </div>
              </div>
            `;

            anchorElement.innerHTML = newHtml;
          }
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
          // Extract image URL before removing BBCode
          const imageUrl = Utils.extractSingleImageUrl(postContent);

          placeholder.textContent = Utils.removeBBCode(postContent);
          Utils.styleReference(placeholder);

          // Add image preview if we found one earlier
          if (imageUrl) {
            const imagePreview = Utils.createElement("div", {
              className: "notification-image-preview",
              innerHTML: `<img src="${imageUrl}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;">`,
            });
            placeholder.insertAdjacentElement("afterend", imagePreview);
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
    NotificationCustomizer.customizeNotificationPanel();
    NotificationMarker.checkAndMarkNotifications();

    if (window.location.href.includes("ucp.php?i=ucp_notifications")) {
      NotificationCustomizer.customizeNotificationPage();
    }

    // Observe DOM changes to apply customizations dynamically
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          NotificationCustomizer.customizeNotificationPanel();
        }
      });
    });

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
