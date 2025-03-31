"use strict";

// --- Constants ---

// --- Storage Helpers ---
const Storage = {
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
    const titleElement = notificationText.querySelector(".notification-title");
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
      notificationBlock.getAttribute("data-real-url") || notificationBlock.href,
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

    const titleElement = notificationText.querySelector(".notification-title");

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
        Object.assign(timeElement.style, NOTIFICATIONS_TIME_STYLE);
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
          const usernames = usernameElements.map((el) => el.textContent.trim());

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
            const firstPart = titleText.split(usernameElements[0].outerHTML)[0];

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
    }, 100);
  };

  // Observe DOM changes to apply customizations dynamically
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;

    for (const mutation of mutations) {
      // Only process if new notification blocks are added
      if (mutation.type === "childList") {
        const hasNewNotifications = Array.from(mutation.addedNodes).some(
          (node) => {
            return (
              node.nodeType === Node.ELEMENT_NODE &&
              (node.classList?.contains("notification-block") ||
                node.querySelector?.(".notification-block"))
            );
          }
        );

        if (hasNewNotifications) {
          shouldProcess = true;
          break;
        }
      }
    }

    if (shouldProcess) {
      debouncedCustomize();
    }
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
