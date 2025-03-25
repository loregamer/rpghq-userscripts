// ==UserScript==
// @name         Ghost Users
// @namespace    http://tampermonkey.net/
// @version      5.9.1
// @description  Hides content from ghosted users, with enhanced user management (search, avatar replacement), quote→blockquote formatting, hides posts with @mentions of ghosted users
// @author       You
// @match        https://rpghq.org/*/*
// @run-at       document-start
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/ghosted-users/Ghost.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/ghosted-users/Ghost.user.js
// @license      MIT
// ==/UserScript==

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

  // ---------------------------------------------------------------------
  // 1) DATA LOAD + INITIAL STYLES
  // ---------------------------------------------------------------------

  // Legacy format: userId => lowercased username
  const legacyIgnoredUsers = GM_getValue("ignoredUsers", {});

  // New format: userId => { username, options }
  // options: {
  //   color: string (hex color for highlighting),
  //   hideOptions: {
  //     posts: { hide: boolean, highlight: boolean },
  //     topics: { hide: boolean, highlight: boolean },
  //     lastPost: { hide: boolean, highlight: boolean }
  //   }
  // }
  let ignoredUsers = GM_getValue("userPreferences", {});

  // Migrate legacy format to new format if needed
  if (
    Object.keys(ignoredUsers).length === 0 &&
    Object.keys(legacyIgnoredUsers).length > 0
  ) {
    Object.entries(legacyIgnoredUsers).forEach(([userId, username]) => {
      ignoredUsers[userId] = {
        username: typeof username === "string" ? username : "Unknown User",
        options: {
          color: "#FF5555", // Default red highlight
          hideOptions: {
            posts: { hide: true, highlight: false },
            topics: { hide: true, highlight: false },
            lastPost: { hide: true, highlight: false },
          },
        },
      };
    });
    GM_setValue("userPreferences", ignoredUsers);
  }

  const replacedAvatars = GM_getValue("replacedAvatars", {}); // userId => image URL
  const postCache = GM_getValue("postCache", {}); // postId => { content, timestamp }
  const userColors = GM_getValue("userColors", {}); // username => color

  // Set Oyster Sauce's username color
  userColors["Oyster Sauce"] = "#00AA00";
  GM_setValue("userColors", userColors);

  let showGhostedPosts = false; // Always start hidden

  // Clear expired cache entries (older than 24h)
  const now = Date.now();
  Object.keys(postCache)
    .filter(
      (key) =>
        !postCache[key].timestamp || now - postCache[key].timestamp > 86400000
    )
    .forEach((key) => delete postCache[key]);
  GM_setValue("postCache", postCache);

  // Create styles for the script
  const mainStyle = document.createElement("style");
  mainStyle.textContent = `
    /* Common ghost styles */
    .ghosted-row {
      display: none !important;
    }
    .ghosted-post {
      display: none !important;
    }
    .ghosted-quote {
      display: none !important;
    }
    .ghosted-reaction {
      display: none !important;
    }

    li.row.ghosted-highlight {
      padding: 10px 5px !important;
      margin-bottom: 5px !important;
    }

    .ghosted-quote-highlight {
      border: 1px solid var(--ghost-highlight-color, #FF5555) !important;
      padding: 5px !important;
      position: relative !important;
    }

    .ghosted-quote-highlight cite {
      background-color: var(--ghost-highlight-color, #FF5555) !important;
      color: #FFF !important;
      padding: 2px 5px !important;
    }

    .ghosted-mention {
      color: var(--ghost-highlight-color, #FF5555) !important;
      font-weight: bold !important;
      background-color: rgba(255, 85, 85, 0.1) !important;
      padding: 0 3px !important;
      border-radius: 3px !important;
    }

    /* Post preview tooltip */
    .post-preview-tooltip {
      position: absolute;
      z-index: 9999;
      background-color: #232323;
      border: 1px solid #444;
      border-radius: 4px;
      padding: 10px;
      max-width: 400px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
      font-size: 13px;
      display: none;
    }

    .post-preview-tooltip.show {
      display: block;
    }

    .post-preview-header {
      margin-bottom: 5px;
      padding-bottom: 5px;
      border-bottom: 1px solid #444;
      font-weight: bold;
    }

    .post-preview-content {
      max-height: 200px;
      overflow-y: auto;
    }

    /* Ghost popup styles */
    .ghost-popup {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .ghost-popup-content {
      background-color: #2a2e36;
      border-radius: 8px;
      width: 90%;
      max-width: 700px;
      max-height: 85vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
    }

    .ghost-popup-header {
      padding: 15px;
      background-color: #232830;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #3a3f4b;
    }

    .ghost-popup-header h3 {
      margin: 0;
      color: #e6e6e6;
      font-size: 18px;
    }

    .ghost-popup-close {
      background: none;
      border: none;
      color: #aab2bd;
      font-size: 24px;
      cursor: pointer;
      padding: 0 5px;
    }

    .ghost-popup-body {
      padding: 15px;
      overflow-y: auto;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 15px;
      max-height: calc(85vh - 60px);
    }

    .ghost-popup-info {
      color: #aab2bd;
      background-color: #232830;
      padding: 10px;
      border-radius: 5px;
      font-size: 14px;
    }

    .ghost-user-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow-y: auto;
    }

    .ghost-no-users {
      text-align: center;
      color: #aab2bd;
      padding: 20px;
      background-color: #232830;
      border-radius: 5px;
    }

    .ghost-user-entry {
      background-color: #232830;
      border-radius: 5px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .ghost-user-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .ghost-username {
      font-weight: bold;
      color: #e6e6e6;
      flex-grow: 1;
    }

    .ghost-settings-toggle {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 5px;
    }

    .ghost-user-actions {
      display: flex;
      justify-content: flex-end;
      gap: 5px;
    }

    .ghost-delete-btn {
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
    }

    .ghost-settings-panel {
      background-color: #1e232b;
      padding: 15px;
      border-radius: 5px;
      margin-top: 5px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .ghost-settings-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ghost-settings-group label {
      color: #aab2bd;
      min-width: 120px;
    }

    .ghost-settings-section {
      background-color: #232830;
      padding: 10px;
      border-radius: 5px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .ghost-settings-section h4 {
      margin: 0;
      color: #e6e6e6;
      font-size: 15px;
    }

    .ghost-settings-info {
      color: #8a9db5;
      font-size: 13px;
      margin: 0;
    }

    /* Tabs for settings panel */
    .ghost-settings-tabs {
      display: flex;
      border-bottom: 1px solid #3a3f4b;
      margin-bottom: 10px;
    }

    .ghost-tab-button {
      background-color: transparent;
      border: none;
      color: #aab2bd;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
    }

    .ghost-tab-button:hover {
      color: #e6e6e6;
    }

    .ghost-tab-button.active {
      color: #4a90e2;
      border-bottom: 2px solid #4a90e2;
    }

    .ghost-tab-content {
      padding: 10px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .ghost-color-picker {
      width: 40px;
      height: 25px;
      padding: 0;
      border: none;
      cursor: pointer;
    }

    .ghost-visibility-select {
      background-color: #1e232b;
      color: #e6e6e6;
      border: 1px solid #3a3f4b;
      border-radius: 4px;
      padding: 5px;
      width: 100%;
    }

    .ghost-save-settings {
      background-color: #4a90e2;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      align-self: flex-end;
      margin-top: 10px;
    }

    .ghost-popup-add {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }

    #ghost-add-input {
      flex-grow: 1;
      padding: 8px;
      border: 1px solid #3a3f4b;
      border-radius: 4px;
      background-color: #1e232b;
      color: #e6e6e6;
    }

    #ghost-add-button {
      background-color: #4a90e2;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
    }

    /* Show ghosted content when toggle is active */
    body.show-ghosted-content .ghosted-row,
    body.show-ghosted-content .ghosted-post,
    body.show-ghosted-content .ghosted-quote,
    body.show-ghosted-content .ghosted-reaction {
      display: block !important;
    }

    /* Ghost toggle button */
    .ghost-toggle-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background-color: #2a2e36;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;
    }

    .ghost-toggle-button:hover {
      transform: scale(1.1);
      background-color: #3a3f4b;
    }

    .ghost-toggle-icon {
      color: #e6e6e6;
      font-size: 20px;
    }

    .ghost-toggle-count {
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: #FF5555;
      color: white;
      border-radius: 50%;
      min-width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }

    body.show-ghosted-content .ghost-toggle-button {
      background-color: #FF5555;
    }

    body.show-ghosted-content .ghost-toggle-icon {
      color: white;
    }

    body.show-ghosted-content .ghost-toggle-count {
      background-color: #2a2e36;
    }

    /* Content highlighting for posts mentioning ghosted users */
    .ghosted-content-highlight {
      display: block !important;
      border: 2px dashed var(--ghost-highlight-color, #FF5555) !important;
      padding: 5px !important;
      position: relative !important;
      opacity: 1 !important;
      visibility: visible !important;
    }

    .ghosted-content-highlight::before {
      content: "Mentions Ghosted User";
      display: inline-block;
      position: absolute;
      top: -10px;
      left: 10px;
      background-color: var(--ghost-highlight-color, #FF5555);
      color: white;
      padding: 0 5px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      border-radius: 3px;
    }

    /* Specific style for username mentions */
    .ghosted-mention {
      display: inline-block !important;
      padding: 0 3px !important;
      background-color: var(--ghost-highlight-color, #FF9955) !important;
      color: white !important;
      font-weight: bold !important;
      border-radius: 3px !important;
      opacity: 1 !important;
      visibility: visible !important;
      text-decoration: none !important;
    }

    /* Basic ghost styles for hidden elements */
  `;
  document.head.appendChild(mainStyle);

  // ---------------------------------------------------------------------
  // 2) TOOLTIP, MOBILE DETECTION & BBCode/Quote PARSING
  // ---------------------------------------------------------------------

  let tooltip = null;
  let currentHoverTimeout = null;
  let isMobileDevice = false;

  function detectMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      window.matchMedia("(max-width: 768px)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  }

  function removeRemainingBrackets(text) {
    text = text.replace(/\[[^\]]*\][^\[]*\[\/[^\]]*\]/g, "");
    text = text.replace(/\[[^\]]*\]/g, "");
    return text;
  }

  function parseBBCode(text) {
    if (!text) return "";
    const patterns = {
      b: { pattern: /\[b\](.*?)\[\/b\]/gi, replacement: "<strong>$1</strong>" },
      i: { pattern: /\[i\](.*?)\[\/i\]/gi, replacement: "<em>$1</em>" },
      u: { pattern: /\[u\](.*?)\[\/u\]/gi, replacement: "<u>$1</u>" },
      s: { pattern: /\[s\](.*?)\[\/s\]/gi, replacement: " $1 " },
      smention: {
        pattern: /\[smention u=(\d+)\](.*?)\[\/smention\]/gi,
        replacement: '<em class="mention">@$2</em>',
      },
      color: {
        pattern: /\[color=([^\]]+)\](.*?)\[\/color\]/gi,
        replacement: '<span style="color: $1">$2</span>',
      },
      size: {
        pattern: /\[size=([^\]]+)\](.*?)\[\/size\]/gi,
        replacement: '<span style="font-size: $1">$2</span>',
      },
      url: {
        pattern: /\[url=([^\]]+)\](.*?)\[\/url\]/gi,
        replacement:
          '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>',
      },
      img: {
        pattern: /\[img\](.*?)\[\/img\]/gi,
        replacement:
          '<img src="$1" alt="" style="max-width: 100%; height: auto;">',
      },
      media: {
        pattern: /\[media\](.*?)\[\/media\]/gi,
        replacement:
          '<img src="https://f.rpghq.org/516uJnaFaEYB.png?n=pasted-file.png" alt="" style="max-width: 50%; height: auto;">',
      },
      list: {
        pattern: /\[list\](.*?)\[\/list\]/gis,
        replacement: "<ul>$1</ul>",
      },
      "*": {
        pattern: /\[\*\](.*?)(?=\[\*\]|\[\/list\]|$)/gi,
        replacement: "<li>$1</li>",
      },
      code: {
        pattern: /\[code\](.*?)\[\/code\]/gis,
        replacement: '<pre class="code">$1</pre>',
      },
      center: {
        pattern: /\[center\](.*?)\[\/center\]/gi,
        replacement: '<div style="text-align: center">$1</div>',
      },
      right: {
        pattern: /\[right\](.*?)\[\/right\]/gi,
        replacement: '<div style="text-align: right">$1</div>',
      },
      spoiler: {
        pattern: /\[spoiler\](.*?)\[\/spoiler\]/gis,
        replacement: "<details><summary>Spoiler</summary>$1</details>",
      },
      generic: {
        pattern: /\[([a-z]+)\](.*?)\[\/\1\]/gis,
        replacement: (match, tag, content) =>
          `<details><summary>${
            tag.charAt(0).toUpperCase() + tag.slice(1)
          }</summary>${content}</details>`,
      },
    };
    let processedText = text.replace(/\n/g, "<br>");
    for (const { pattern, replacement } of Object.values(patterns)) {
      processedText = processedText.replace(pattern, replacement);
    }
    return removeRemainingBrackets(processedText);
  }

  function parseQuotes(text) {
    if (!text) return "";
    const quoteRegex =
      /\[quote=(.*?)(?: post_id=(\d+))?(?: time=(\d+))?(?: user_id=(\d+))?\]([\s\S]*?)\[\/quote\]/gi;
    let output = "";
    let lastIndex = 0;
    let match;
    while ((match = quoteRegex.exec(text)) !== null) {
      output += text.slice(lastIndex, match.index);
      const author = match[1] || "Unknown";
      const userId = match[4] || "";
      let quoteBody = match[5] || "";
      quoteBody = quoteBody
        .replace(/\[quote=.*?\]|\[\/quote\]/g, "")
        .replace(/^\s+/, "");
      const profileUrl = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}-${encodeURIComponent(
        author
      )}`;
      const quoteHtml = `
        <div class="custom-quote">
          <div class="custom-quote-header">
            <a href="${profileUrl}" class="quote-author">${author}</a>
            <span class="quote-wrote">wrote:</span>
          </div>
          <div class="custom-quote-content">${quoteBody}</div>
        </div>`;
      output += quoteHtml;
      lastIndex = quoteRegex.lastIndex;
    }
    return output + text.slice(lastIndex);
  }

  function createTooltip() {
    if (tooltip) return;
    tooltip = document.createElement("div");
    tooltip.className = "post-preview-tooltip";
    document.body.appendChild(tooltip);
  }

  function hidePostPreview() {
    if (!tooltip) return;
    if (currentHoverTimeout) {
      clearTimeout(currentHoverTimeout);
      currentHoverTimeout = null;
    }
    tooltip.classList.remove("visible");
  }

  // ---------------------------------------------------------------------
  // 3) IGNORE / GHOST USERS FUNCTIONS
  // ---------------------------------------------------------------------

  function cleanUsername(username) {
    if (!username) return "";

    // First remove any HTML tags that might be in the username
    let cleaned = username.replace(/<[^>]*>/g, "");

    // Remove "Never Iggy" and other button text that might be in the username
    cleaned = cleaned.replace(
      /never iggy|unghost user|replace avatar|ghost user/gi,
      ""
    );

    // Remove any extra whitespace
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    return cleaned;
  }

  function isUserIgnored(usernameOrId) {
    // Check if it's a user ID
    if (ignoredUsers.hasOwnProperty(usernameOrId)) return true;

    // Check if it's a username
    const cleanedUsername = cleanUsername(usernameOrId);
    const lower = cleanedUsername.toLowerCase();

    // Check if the username exists in any of the user entries
    return Object.values(ignoredUsers).some(
      (user) => user.username && user.username.toLowerCase() === lower
    );
  }

  function getUserIdFromUrl() {
    const match = window.location.href.match(/u=(\d+)/);
    return match ? match[1] : null;
  }

  function toggleUserGhost(userId, username) {
    // If already ignored, remove
    if (ignoredUsers.hasOwnProperty(userId)) {
      delete ignoredUsers[userId];
      showToggleNotification(`User ${username} is no longer ghosted.`);

      // Save to storage
      saveIgnoredUsers();

      // Update all UI elements
      processIgnoredContentOnce();
      return false;
    }
    // Otherwise add to ignored list
    else {
      ignoredUsers[userId] = {
        username: username,
        settings: {
          global: "hide", // Default to hide
        },
        highlightColor: "#FF5555", // Default red
        mentionedColor: "#FF9955", // Default orange
      };

      showToggleNotification(`User ${username} is now ghosted.`);

      // Save to storage
      saveIgnoredUsers();

      // Update all UI elements
      processIgnoredContentOnce();
      return true;
    }
  }

  // Save ignored users to storage
  function saveIgnoredUsers() {
    GM_setValue("userPreferences", ignoredUsers);
  }

  // Get specific hide/highlight setting for a user and content type
  function getUserVisibilitySetting(userId, contentType) {
    // Check if user exists in ignoredUsers
    if (!ignoredUsers[userId]) {
      // Return default settings if user not found
      return { hide: true, highlight: false, hideMode: "entire_row" };
    }

    // If user has specific settings
    if (
      ignoredUsers[userId].settings &&
      ignoredUsers[userId].settings[contentType]
    ) {
      return {
        hide:
          ignoredUsers[userId].settings[contentType] === "hide" ||
          ignoredUsers[userId].settings[contentType] === "hide_entire_row" ||
          ignoredUsers[userId].settings[contentType] === "hide_last_post",
        highlight: ignoredUsers[userId].settings[contentType] === "highlight",
        hideMode:
          ignoredUsers[userId].settings[contentType] === "hide_last_post"
            ? "last_post"
            : "entire_row",
      };
    }

    // Check for global settings for this user
    if (ignoredUsers[userId].settings && ignoredUsers[userId].settings.global) {
      return {
        hide:
          ignoredUsers[userId].settings.global === "hide" ||
          ignoredUsers[userId].settings.global === "hide_entire_row" ||
          ignoredUsers[userId].settings.global === "hide_last_post",
        highlight: ignoredUsers[userId].settings.global === "highlight",
        hideMode:
          ignoredUsers[userId].settings.global === "hide_last_post"
            ? "last_post"
            : "entire_row",
      };
    }

    // Default to hiding entire row if no specific settings found
    return { hide: true, highlight: false, hideMode: "entire_row" };
  }

  function getUserHighlightColor(userId) {
    // Return user-specific highlight color if set
    if (ignoredUsers[userId] && ignoredUsers[userId].highlightColor) {
      return ignoredUsers[userId].highlightColor;
    }

    // Return default highlight color
    return "#FF5555";
  }

  function getUserMentionedColor(userId) {
    // Return user-specific mentioned color if set
    if (ignoredUsers[userId] && ignoredUsers[userId].mentionedColor) {
      return ignoredUsers[userId].mentionedColor;
    }

    // Return default mentioned color (slightly different from highlight)
    return "#FF9955";
  }

  // ---------------------------------------------------------------------
  // 4) POST FETCH, CACHING & CLEANUP
  // ---------------------------------------------------------------------

  function cleanupPostContent(content) {
    content = content.replace(/\[quote="([^"]+)"/g, "[quote=$1");
    content = content.replace(/^(\[quote=[^\]]+\]\s*)/, "");
    content = content.replace(/\[\/quote\]\s*$/, "");
    return removeNestedQuotes(content);
  }

  function removeNestedQuotes(str) {
    let result = "",
      i = 0,
      inQuote = false;
    while (i < str.length) {
      const openMatch = str.slice(i).match(/^(\[quote=[^\]]+\])/);
      if (openMatch) {
        if (!inQuote) {
          inQuote = true;
          result += openMatch[1];
          i += openMatch[1].length;
        } else {
          i += openMatch[1].length;
          const closeIdx = str.indexOf("[/quote]", i);
          i = closeIdx === -1 ? str.length : closeIdx + 8;
        }
        continue;
      }
      const closeMatch = str.slice(i).match(/^(\[\/quote\])/);
      if (closeMatch) {
        if (inQuote) {
          inQuote = false;
          result += closeMatch[1];
        }
        i += closeMatch[1].length;
        continue;
      }
      result += str[i];
      i++;
    }
    return result;
  }

  async function fetchAndCachePost(postId) {
    const cached = postCache[postId];
    if (
      cached &&
      cached.timestamp &&
      Date.now() - cached.timestamp < 86400000
    ) {
      return cached.content;
    }
    try {
      const response = await fetch(
        `https://rpghq.org/forums/posting.php?mode=quote&p=182671&multiquote=${postId}`
      );
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const textarea = doc.querySelector("textarea#message");
      if (textarea) {
        let content = textarea.value;
        content = cleanupPostContent(content);
        postCache[postId] = { content, timestamp: Date.now() };
        GM_setValue("postCache", postCache);
        return content;
      }
    } catch (err) {
      console.error(`Failed to fetch post ${postId}:`, err);
    }
    return null;
  }

  async function cacheAllPosts() {
    const lastPostLinks = document.querySelectorAll(
      'a[title="Go to last post"], a[title="View the latest post"]'
    );
    const postIds = Array.from(lastPostLinks)
      .map((lnk) => lnk.href.match(/p=(\d+)/)?.[1])
      .filter((id) => id && !postCache[id]);
    if (postIds.length === 0) return false;
    for (let i = 0; i < postIds.length; i += 5) {
      const chunk = postIds.slice(i, i + 5);
      await Promise.all(chunk.map(fetchAndCachePost));
    }
    return true;
  }

  // ---------------------------------------------------------------------
  // 5) CONTENT PROCESSING / HIDING LOGIC
  // ---------------------------------------------------------------------

  function postContentContainsGhosted(content) {
    if (!content) return false;

    // Check content for mentions of ghosted users
    let mentionedUsers = [];

    for (const userId in ignoredUsers) {
      const userData = ignoredUsers[userId];
      // Get the username safely from the new data structure
      const username =
        userData.username || (typeof userData === "string" ? userData : null);

      // Only check if username is a valid string
      if (username && typeof username === "string" && username.length > 3) {
        if (content.toLowerCase().includes(username.toLowerCase())) {
          mentionedUsers.push({
            userId,
            username,
          });
        }
      }
    }

    if (mentionedUsers.length > 0) {
      return {
        containsGhosted: true,
        mentionedUsers,
      };
    }

    return false;
  }

  function processReactionImages() {
    // Find all reaction images with reaction-username attribute
    const reactionImages = document.querySelectorAll("img[reaction-username]");

    reactionImages.forEach((img) => {
      const username = img.getAttribute("reaction-username");
      if (username) {
        // Convert username to lowercase for comparison
        const lowercaseUsername = username.toLowerCase();

        // Check if this user is ignored
        if (isUserIgnored(lowercaseUsername)) {
          // Remove the image
          img.remove();
        }
      }
    });
  }

  // Process topiclist rows - hide entire row except for forum rows where we only hide lastpost
  function processTopicListRow(rowType) {
    // Determine selector based on rowType
    let selector;
    if (rowType === "forum") {
      selector = "ul.topiclist.forums > li.row";
    } else if (rowType === "topic") {
      selector = "ul.topiclist.topics > li.row";
    } else if (rowType === "recent") {
      selector = "#recent-topics > ul > li.row";
    } else {
      console.error(
        "Invalid rowType provided to processTopicListRow:",
        rowType
      );
      return;
    }

    // Get all rows based on the selector
    const rows = document.querySelectorAll(selector);

    rows.forEach((row) => {
      // Skip if not a valid row
      if (!row) return;

      // Check for special forums we don't want to process
      const forumLinks = row.querySelectorAll(
        ".forum-links a, .responsive-hide a"
      );
      const forumNames = Array.from(forumLinks).map((link) =>
        link.textContent.trim()
      );

      if (
        forumNames.includes("Moderation Station") ||
        forumNames.includes("Chat With Staff")
      ) {
        return;
      }

      // Get the lastpost cell
      const lastpostCell = row.querySelector("dd.lastpost");
      if (!lastpostCell) return;

      // Get the author link in the lastpost cell
      const authorLink = lastpostCell.querySelector(
        "a.username, a.username-coloured"
      );
      if (!authorLink) return;

      const authorName = authorLink.textContent.trim();

      // For forum rows, we only hide the lastpost section
      if (rowType === "forum") {
        // Check if the author is ignored
        if (isUserIgnored(authorName)) {
          lastpostCell.classList.add("ghosted-row");
          return;
        }

        // If author isn't ignored, check the post content
        const postLink = lastpostCell.querySelector("a[href*='viewtopic.php']");
        if (postLink) {
          const postId = postLink.href.match(/p=(\d+)/)?.[1];
          if (postId && postCache[postId]) {
            const postContent = postCache[postId].content;
            if (postContent) {
              const ghostedResult = postContentContainsGhosted(postContent);
              if (ghostedResult && ghostedResult.containsGhosted) {
                // Post content contains ghosted username, add ghosted-by-content class
                lastpostCell.classList.add("ghosted-row");
              }
            }
          }
        }
      } else {
        // For topic and recent rows, we hide the entire row
        // Check if the author is ignored
        if (isUserIgnored(authorName)) {
          // Author is ghosted, add ghosted-by-author class to the entire row
          row.classList.add("ghosted-row");
          return;
        }

        // Check for post content with ghosted mentions
        const postLink = lastpostCell.querySelector("a[href*='viewtopic.php']");
        if (postLink) {
          const postId = postLink.href.match(/p=(\d+)/)?.[1];
          if (postId && postCache[postId]) {
            const postContent = postCache[postId].content;
            // Check if the lastPostCell contains the username of a ghosted user
            const lastpostCell = row.querySelector("dd.lastpost");
            if (lastpostCell) {
              const authorLink = lastpostCell.querySelector(
                "a.username, a.username-coloured"
              );
              if (authorLink && isUserIgnored(authorLink.textContent.trim())) {
                row.classList.add("ghosted-row");
                return;
              } else if (postContent) {
                const ghostedResult = postContentContainsGhosted(postContent);
                if (ghostedResult && ghostedResult.containsGhosted) {
                  // Only if author is not ghosted, check content
                  row.classList.add("ghosted-row");
                }
              }
            } else if (postContent) {
              const ghostedResult = postContentContainsGhosted(postContent);
              if (ghostedResult && ghostedResult.containsGhosted) {
                row.classList.add("ghosted-row");
              }
            }
          }
        }
      }
    });
  }

  function processRecentTopicsRows() {
    processTopicListRow("recent");
  }

  function processPoll(poll) {
    poll.classList.remove("content-processed");
    let totalVotes = 0;
    const options = poll.querySelectorAll("dl[data-poll-option-id]");
    options.forEach((option) => {
      const resultBar = option.querySelector(".resultbar");
      const pollBar = resultBar?.querySelector('[class^="pollbar"]');
      const voteCount = parseInt(pollBar?.textContent || "0", 10);
      totalVotes += voteCount;
    });
    options.forEach((option) => {
      const voterBox = option.nextElementSibling;
      if (!voterBox || !voterBox.classList.contains("poll_voters_box")) return;
      const votersList = voterBox.querySelector(".poll_voters");
      if (!votersList) return;
      const resultBar = option.querySelector(".resultbar");
      const pollBar = resultBar?.querySelector('[class^="pollbar"]');
      const voteCount = parseInt(pollBar?.textContent || "0", 10);
      let newCount = voteCount;
      const voterSpans = Array.from(votersList.childNodes);
      const toRemove = new Set();
      voterSpans.forEach((node, i) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.matches("span[name]")) {
          const userLink = node.querySelector("a");
          if (!userLink) return;
          const userId = userLink.href.match(/[?&]u=(\d+)/)?.[1];
          const username = userLink.textContent.trim();
          if ((userId && isUserIgnored(userId)) || isUserIgnored(username)) {
            toRemove.add(node);
            const prev = voterSpans[i - 1];
            if (prev && prev.nodeType === Node.TEXT_NODE) {
              toRemove.add(prev);
            }
            newCount--;
          }
        }
      });
      toRemove.forEach((node) => node.remove());
      const firstNode = votersList.firstChild;
      if (firstNode && firstNode.nodeType === Node.TEXT_NODE) {
        firstNode.remove();
      }
      if (newCount !== voteCount && pollBar) {
        pollBar.textContent = String(newCount);
        const maxVotes = Math.max(
          ...Array.from(options).map((opt) => {
            const bar = opt.querySelector('[class^="pollbar"]');
            return parseInt(bar?.textContent || "0", 10);
          })
        );
        const widthPercent = maxVotes > 0 ? (newCount / maxVotes) * 100 : 0;
        pollBar.style.width = `${widthPercent}%`;
      }
      if (!votersList.querySelector("span[name]")) {
        votersList.innerHTML = '<span name="none">None</span>';
      }
    });
    const finalVoteCounts = Array.from(options).map((opt) => {
      const bar = opt.querySelector('[class^="pollbar"]');
      return parseInt(bar?.textContent || "0", 10);
    });
    const total = finalVoteCounts.reduce((a, b) => a + b, 0);
    const exactPercentages = finalVoteCounts.map(
      (count) => (count / total) * 100
    );
    const roundedDown = exactPercentages.map((p) => Math.floor(p));
    const remainder = 100 - roundedDown.reduce((a, b) => a + b, 0);
    const fractionalParts = exactPercentages
      .map((p, i) => ({ index: i, frac: p - Math.floor(p) }))
      .sort((a, b) => b.frac - a.frac);
    const finalPercentages = [...roundedDown];
    for (let i = 0; i < remainder; i++) {
      if (fractionalParts[i]) {
        finalPercentages[fractionalParts[i].index]++;
      }
    }
    options.forEach((option, index) => {
      const percentEl = option.querySelector(".poll_option_percent");
      if (percentEl) {
        const count = finalVoteCounts[index];
        percentEl.textContent =
          count === 0 ? "No votes" : `${finalPercentages[index]}%`;
      }
    });
    const totalVotesEl = poll.querySelector(".poll_total_vote_cnt");
    if (totalVotesEl) {
      totalVotesEl.textContent = String(total);
    }
    poll.classList.add("content-processed");
  }

  function setupPollRefreshDetection() {
    document.addEventListener("submit", (e) => {
      const form = e.target;
      const poll = form.closest("fieldset.polls");
      if (poll) poll.classList.remove("content-processed");
    });
    document.addEventListener("click", (e) => {
      if (
        e.target.matches(
          'input[type="submit"][name="update"][value="Submit vote"]'
        )
      ) {
        const poll = e.target.closest("fieldset.polls");
        if (poll) poll.classList.remove("content-processed");
      }
    });
    const pollObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          const node = mutation.target;
          if (
            node.classList.contains("vote-submitted") &&
            node.style.display === "block"
          ) {
            const pollSection = node.closest("fieldset.polls");
            if (pollSection) {
              pollSection.style.visibility = "hidden";
            }
            window.location.reload();
          }
        }
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const polls = node.matches("fieldset.polls")
              ? [node]
              : node.querySelectorAll("fieldset.polls");
            polls.forEach((poll) => {
              if (!poll.classList.contains("content-processed")) {
                processPoll(poll);
              }
            });
          }
        });
      });
    });
    pollObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  function processTopicPoster(poster) {
    const usernameEl = poster.querySelector(".username, .username-coloured");
    if (!usernameEl) return;

    const username = usernameEl.textContent.trim();
    const userId = usernameEl.href.match(/u=(\d+)/)?.[1];

    let hideIt = false;
    let highlightIt = false;
    let highlightColor = null;

    if (userId && isUserIgnored(userId)) {
      const settings = getUserVisibilitySetting(userId, "lastPost");
      hideIt = settings.hide;
      highlightIt = settings.highlight;
      highlightColor = getUserHighlightColor(userId);
    } else if (isUserIgnored(username)) {
      const foundUserId = Object.keys(ignoredUsers).find(
        (id) =>
          ignoredUsers[id].username &&
          ignoredUsers[id].username.toLowerCase() === username.toLowerCase()
      );

      if (foundUserId) {
        const settings = getUserVisibilitySetting(foundUserId, "lastPost");
        hideIt = settings.hide;
        highlightIt = settings.highlight;
        highlightColor = getUserHighlightColor(foundUserId);
      } else {
        // Fallback
        hideIt = true;
      }
    }

    if (hideIt) {
      const masWrap = poster.querySelector(".mas-wrap");
      if (masWrap) {
        masWrap.innerHTML = `
          <div class="mas-avatar" style="width: 20px; height: 20px;">
            <img class="avatar" src="./download/file.php?avatar=58.png" width="102" height="111" alt="User avatar">
          </div>
          <div class="mas-username">
            <a href="https://rpghq.org/forums/memberlist.php?mode=viewprofile&amp;u=58-rusty-shackleford" style="color: #ff6e6e;" class="username-coloured">rusty_shackleford</a>
          </div>
        `;
      }
    } else if (highlightIt) {
      poster.classList.add("ghosted-highlight");
      if (highlightColor) {
        poster.style.setProperty("--ghost-highlight-color", highlightColor);
      }
    }

    poster.classList.add("content-processed");
  }

  function processBlockquotesInPost(post) {
    const topLevelBlockquotes = post.querySelectorAll(".content > blockquote");

    // Check for single quote from ghosted user
    if (topLevelBlockquotes.length === 1) {
      const anchor = topLevelBlockquotes[0].querySelector("cite a");
      if (anchor) {
        const quotedName = anchor.textContent.trim();
        let quotedId = null;

        if (anchor.href) {
          quotedId = anchor.href.match(/u=(\d+)/)?.[1];
        }

        // Check if quoted user is ignored
        if (
          (quotedId && isUserIgnored(quotedId)) ||
          isUserIgnored(quotedName)
        ) {
          post.dataset.hideForSingleIgnoredQuote = "true";
          return;
        }
      }
    }

    // Process all blockquotes
    const allBlockquotes = post.querySelectorAll(".content blockquote");
    allBlockquotes.forEach((bq) => {
      const anchor = bq.querySelector("cite a");
      if (!anchor) return;

      const quotedName = anchor.textContent.trim();
      let quotedId = null;

      if (anchor.href) {
        quotedId = anchor.href.match(/u=(\d+)/)?.[1];
      }

      // Check if quoted user is ignored
      if ((quotedId && isUserIgnored(quotedId)) || isUserIgnored(quotedName)) {
        // Find the effective user ID
        const effectiveUserId =
          quotedId ||
          Object.keys(ignoredUsers).find(
            (id) =>
              ignoredUsers[id].username &&
              ignoredUsers[id].username.toLowerCase() ===
                quotedName.toLowerCase()
          );

        if (effectiveUserId) {
          // Get user-specific settings for quotes
          const settings = getUserVisibilitySetting(effectiveUserId, "quotes");

          if (settings.hide) {
            // Hide quote based on user preference
            bq.classList.add("ghosted-quote");
          }
        } else {
          // Fallback behavior
          bq.classList.add("ghosted-quote");
        }
      }
    });
  }

  function processPost(post) {
    if (post.classList.contains("content-processed")) {
      return;
    }

    // Get post-info and author
    const postInfo = post.querySelector(".post-info, .mas-post-info");
    if (!postInfo) {
      post.classList.add("content-processed");
      return;
    }

    const authorElement = postInfo.querySelector(
      ".user-link, a.username, a.username-coloured"
    );
    if (!authorElement) {
      post.classList.add("content-processed");
      return;
    }

    // Extract author info
    const authorName = authorElement.textContent.trim();
    let authorId = null;

    if (authorElement.href) {
      authorId = authorElement.href.match(/u=(\d+)/)?.[1];
    }

    // Check if post author is ignored
    if ((authorId && isUserIgnored(authorId)) || isUserIgnored(authorName)) {
      // Get the userID if we have it, or try to find it by username
      const effectiveUserId =
        authorId ||
        Object.keys(ignoredUsers).find(
          (id) =>
            ignoredUsers[id].username &&
            ignoredUsers[id].username.toLowerCase() === authorName.toLowerCase()
        );

      if (effectiveUserId) {
        // Get user-specific settings for posts
        const settings = getUserVisibilitySetting(effectiveUserId, "posts");
        const highlightColor = getUserHighlightColor(effectiveUserId);

        if (settings.hide) {
          // Hide post based on user preference
          post.classList.add("ghosted");
        } else if (settings.highlight) {
          // Highlight post based on user preference
          post.classList.add("ghosted-highlight");
          post.style.setProperty("--ghost-highlight-color", highlightColor);
        }
      } else {
        // Fallback to default behavior
        post.classList.add("ghosted");
      }

      post.classList.add("content-processed");
      return;
    }

    // Process blockquotes for ghosted users
    processBlockquotesInPost(post);

    // Process any mentions of ghosted users in the post content
    const postContent = post.querySelector(".content");
    if (postContent) {
      // First check for explicit @username mentions via links
      const anchorTags = postContent.querySelectorAll(
        "a.username, a.username-coloured"
      );

      let hasMentionedGhostedUser = false;
      let mentionedUserIds = new Set();

      anchorTags.forEach((anchor) => {
        const mentionedName = anchor.textContent.trim();
        let mentionedId = null;

        if (anchor.href) {
          mentionedId = anchor.href.match(/u=(\d+)/)?.[1];
        }

        if (
          (mentionedId && isUserIgnored(mentionedId)) ||
          isUserIgnored(mentionedName)
        ) {
          // Find specific user ID
          const effectiveUserId =
            mentionedId ||
            Object.keys(ignoredUsers).find(
              (id) =>
                ignoredUsers[id].username &&
                ignoredUsers[id].username.toLowerCase() ===
                  mentionedName.toLowerCase()
            );

          if (effectiveUserId) {
            mentionedUserIds.add(effectiveUserId);
            hasMentionedGhostedUser = true;

            // Apply highlighting to mention based on user preferences
            const mentionedColor = getUserMentionedColor(effectiveUserId);
            anchor.classList.add("ghosted-mention");
            anchor.style.setProperty("--ghost-highlight-color", mentionedColor);
          }
        }
      });

      // Then check for text content mentions of ghosted users
      const postText = postContent.textContent;

      if (postText) {
        const ghostedResult = postContentContainsGhosted(postText);

        if (ghostedResult && ghostedResult.containsGhosted) {
          hasMentionedGhostedUser = true;

          // Add all mentioned user IDs to our set
          ghostedResult.mentionedUsers.forEach((user) => {
            mentionedUserIds.add(user.userId);
          });
        }
      }

      // Apply content-based styling if any ghosted users are mentioned
      if (hasMentionedGhostedUser) {
        // If we have exactly one mentioned user, use their preferences
        if (mentionedUserIds.size === 1) {
          const userId = Array.from(mentionedUserIds)[0];
          const settings = getUserVisibilitySetting(userId, "mentions");
          const mentionedColor = getUserMentionedColor(userId);

          if (settings.hide) {
            // Hide based on user preference
            post.classList.add("ghosted-row");
          } else if (settings.highlight) {
            // Highlight based on user preference
            post.classList.add("ghosted-content-highlight");
            post.style.setProperty("--ghost-highlight-color", mentionedColor);
          } else {
            // Fallback in case no highlight preferences were found
            post.classList.add("ghosted-content-highlight");
            post.style.setProperty("--ghost-highlight-color", "#FF9955");
          }
        }
        // If multiple users are mentioned, use a mixed approach
        else if (mentionedUserIds.size > 1) {
          // Check if any users prefer hiding
          let shouldHide = false;
          let mentionHighlightColor = null;

          // For multiple mentioned users, if any has hide preference, hide the post
          for (const userId of mentionedUserIds) {
            const settings = getUserVisibilitySetting(userId, "mentions");
            if (settings.hide) {
              shouldHide = true;
              break;
            } else if (settings.highlight && !mentionHighlightColor) {
              // Use the first user's mentioned color for highlighting
              mentionHighlightColor = getUserMentionedColor(userId);
            }
          }

          if (shouldHide) {
            post.classList.add("ghosted-row");
          } else if (mentionHighlightColor) {
            post.classList.add("ghosted-content-highlight");
            post.style.setProperty(
              "--ghost-highlight-color",
              mentionHighlightColor
            );
          } else {
            // Fallback in case no highlight preferences were found
            post.classList.add("ghosted-content-highlight");
            post.style.setProperty("--ghost-highlight-color", "#FF9955");
          }
        }
      }
    }

    // Process reaction list if present
    const reactionList = post.querySelector(".mas-reactions");
    if (reactionList) {
      const reactionItems = reactionList.querySelectorAll("li");
      reactionItems.forEach((item) => {
        const userLinks = item.querySelectorAll(
          "a.username, a.username-coloured"
        );
        userLinks.forEach((link) => {
          const reactorName = link.textContent.trim();
          let reactorId = null;

          if (link.href) {
            reactorId = link.href.match(/u=(\d+)/)?.[1];
          }

          if (
            (reactorId && isUserIgnored(reactorId)) ||
            isUserIgnored(reactorName)
          ) {
            // Find specific user ID
            const effectiveUserId =
              reactorId ||
              Object.keys(ignoredUsers).find(
                (id) =>
                  ignoredUsers[id].username &&
                  ignoredUsers[id].username.toLowerCase() ===
                    reactorName.toLowerCase()
              );

            if (effectiveUserId) {
              // Get user-specific settings
              const settings = getUserVisibilitySetting(
                effectiveUserId,
                "reactions"
              );

              if (settings.hide) {
                // Hide reaction based on user preference
                item.classList.add("ghosted-reaction");
              }
            } else {
              // Fallback behavior
              item.classList.add("ghosted-reaction");
            }
          }
        });
      });
    }

    post.classList.add("content-processed");
  }

  function processReactionList(reactionList) {
    // Skip if already processed
    if (reactionList.classList.contains("content-processed")) {
      return;
    }

    // Add prevention of default action for links
    const links = reactionList.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
      });
    });

    // Process the list label and reaction scores
    const listLabel = reactionList.querySelector(".list-label a");
    if (!listLabel) {
      reactionList.classList.add("content-processed");
      return;
    }

    const originalText = listLabel.textContent.trim();
    let usernames = [];

    // Extract usernames from the label text
    if (originalText.includes(" and ")) {
      // Format: "user1 and user2" or "user1, user2 and X others"
      const parts = originalText.split(" and ");
      if (parts[0].includes(", ")) {
        // Multiple users
        usernames = parts[0].split(", ");
        // Handle "and X others" case
        if (parts[1].includes(" other")) {
          // We can't process this accurately without fetching the full list
        } else {
          usernames.push(parts[1]);
        }
      } else {
        // Just two users
        usernames = [parts[0], parts[1]];
      }
    } else {
      // Single user
      usernames = [originalText];
    }

    // Filter out ignored users
    const visibleUsers = usernames.filter(
      (username) => !isUserIgnored(username)
    );

    // Handle the list scores (reaction counts)
    const listScores = reactionList.querySelector(".list-scores");
    if (listScores) {
      // We don't have enough information to accurately adjust counts
      // without making API calls. Just mark as processed for now.
    }

    // Update display based on visible users
    if (visibleUsers.length === 0) {
      // If all users are ignored, hide the reaction list
      reactionList.style.display = "none";
    } else if (visibleUsers.length !== usernames.length) {
      // If some users are ignored, update the label text
      if (visibleUsers.length === 1) {
        listLabel.textContent = visibleUsers[0];
      } else if (visibleUsers.length === 2) {
        listLabel.textContent = `${visibleUsers[0]} and ${visibleUsers[1]}`;
      } else {
        const firstTwo = visibleUsers.slice(0, 2);
        listLabel.textContent = `${firstTwo.join(", ")} and ${
          visibleUsers.length - 2
        } other${visibleUsers.length - 2 > 1 ? "s" : ""}`;
      }
    }

    // Mark as processed
    reactionList.classList.add("content-processed");
  }

  async function processLastPostInForums(lastpostCell) {
    // Skip if already processed
    if (lastpostCell.classList.contains("content-processed")) {
      return;
    }

    // Get the author link in the lastpost cell
    const authorLink = lastpostCell.querySelector(
      "a.username, a.username-coloured"
    );
    if (!authorLink) {
      lastpostCell.classList.add("content-processed");
      return;
    }

    const authorName = authorLink.textContent.trim();
    let authorId = null;

    if (authorLink.href) {
      authorId = authorLink.href.match(/u=(\d+)/)?.[1];
    }

    // Check if the author is ignored
    if ((authorId && isUserIgnored(authorId)) || isUserIgnored(authorName)) {
      // Get the effective user ID
      const effectiveUserId =
        authorId ||
        Object.keys(ignoredUsers).find(
          (id) =>
            ignoredUsers[id].username &&
            ignoredUsers[id].username.toLowerCase() === authorName.toLowerCase()
        );

      if (effectiveUserId) {
        // Get user-specific settings for lastposts
        const settings = getUserVisibilitySetting(effectiveUserId, "lastposts");
        const highlightColor = getUserHighlightColor(effectiveUserId);

        if (settings.hide) {
          // For forum lists, ALWAYS hide just the lastpost cell, not the entire row
          lastpostCell.classList.add("ghosted-row");
        } else if (settings.highlight) {
          // Highlight lastpost based on user preference
          lastpostCell.classList.add("ghosted-highlight");
          lastpostCell.style.setProperty(
            "--ghost-highlight-color",
            highlightColor
          );
        }
      } else {
        // Fallback behavior
        lastpostCell.classList.add("ghosted-row");
      }

      lastpostCell.classList.add("content-processed");
      return;
    }

    // If author isn't ignored, check the post content
    const postLink = lastpostCell.querySelector("a[href*='viewtopic.php']");
    if (postLink) {
      const postId = postLink.href.match(/p=(\d+)/)?.[1];
      if (postId) {
        // If post isn't already cached, try to fetch it
        if (!postCache[postId]) {
          try {
            await fetchAndCachePost(postId);
          } catch (error) {
            console.error("Error fetching post for lastpost cell:", error);
          }
        }

        // Check if we have the post content
        if (postCache[postId] && postCache[postId].content) {
          const postContent = postCache[postId].content;
          const ghostedResult = postContentContainsGhosted(postContent);

          if (ghostedResult && ghostedResult.containsGhosted) {
            // For content mentions, get the first mentioned user's settings
            if (
              ghostedResult.mentionedUsers &&
              ghostedResult.mentionedUsers.length > 0
            ) {
              const firstMentionedUser = ghostedResult.mentionedUsers[0];
              const settings = getUserVisibilitySetting(
                firstMentionedUser.userId,
                "mentions"
              );
              const highlightColor = getUserHighlightColor(
                firstMentionedUser.userId
              );
              const mentionedColor = getUserMentionedColor(
                firstMentionedUser.userId
              );

              if (settings.hide) {
                // For forum lists, ALWAYS hide just the lastpost cell with ghosted-by-content
                lastpostCell.classList.add("ghosted-row");
              } else if (settings.highlight) {
                // Highlight lastpost based on user preference
                lastpostCell.classList.add("ghosted-content-highlight");
                lastpostCell.style.setProperty(
                  "--ghost-highlight-color",
                  mentionedColor
                );
              }
            } else {
              // Fallback behavior
              lastpostCell.classList.add("ghosted-row");
            }
          }
        }
      }
    }

    // Mark as processed
    lastpostCell.classList.add("content-processed");
  }

  async function processLastPostInTopics(lastpostCell) {
    // Skip if already processed
    if (lastpostCell.classList.contains("content-processed")) {
      return;
    }

    // Get the author link in the lastpost cell
    const authorLink = lastpostCell.querySelector(
      "a.username, a.username-coloured"
    );
    if (!authorLink) {
      lastpostCell.classList.add("content-processed");
      return;
    }

    const authorName = authorLink.textContent.trim();
    let authorId = null;

    if (authorLink.href) {
      authorId = authorLink.href.match(/u=(\d+)/)?.[1];
    }

    // Check if the author is ignored
    if ((authorId && isUserIgnored(authorId)) || isUserIgnored(authorName)) {
      // Get the effective user ID
      const effectiveUserId =
        authorId ||
        Object.keys(ignoredUsers).find(
          (id) =>
            ignoredUsers[id].username &&
            ignoredUsers[id].username.toLowerCase() === authorName.toLowerCase()
        );

      if (effectiveUserId) {
        // Get user-specific settings for lastposts
        const settings = getUserVisibilitySetting(effectiveUserId, "lastposts");

        // Get the parent row
        const rowItem = lastpostCell.closest("li.row");

        // Always add ghosted-by-author to the entire row for author identification
        if (rowItem) {
          rowItem.classList.add("ghosted-by-author");
        }

        if (settings.hide) {
          if (settings.hideMode === "last_post") {
            // Only add ghosted-row to the lastpost cell, not the row
            lastpostCell.classList.add("ghosted-row");
          } else {
            // Add ghosted-row to the entire row
            if (rowItem) {
              rowItem.classList.add("ghosted-row");
            }
          }
        } else if (settings.highlight) {
          // Apply highlighting
          const highlightColor = getUserHighlightColor(effectiveUserId);
          lastpostCell.classList.add("ghosted-highlight");
          lastpostCell.style.setProperty(
            "--ghost-highlight-color",
            highlightColor
          );
        }
      } else {
        // Fallback behavior - use default hide behavior
        const rowItem = lastpostCell.closest("li.row");

        // Always add ghosted-by-author to the entire row
        if (rowItem) {
          rowItem.classList.add("ghosted-by-author");
          // Add ghosted-row only if we want to hide the entire row
          rowItem.classList.add("ghosted-row");
        } else {
          lastpostCell.classList.add("ghosted-row");
        }
      }
    }

    // Mark as processed
    lastpostCell.classList.add("content-processed");
  }

  async function processLastPostInRecentTopics(lastpostCell) {
    // Skip if already processed
    if (lastpostCell.classList.contains("content-processed")) {
      return;
    }

    // Get the author link in the lastpost cell
    const authorLink = lastpostCell.querySelector(
      "a.username, a.username-coloured"
    );
    if (!authorLink) {
      lastpostCell.classList.add("content-processed");
      return;
    }

    const authorName = authorLink.textContent.trim();
    let authorId = null;

    if (authorLink.href) {
      authorId = authorLink.href.match(/u=(\d+)/)?.[1];
    }

    // Check if the author is ignored
    if ((authorId && isUserIgnored(authorId)) || isUserIgnored(authorName)) {
      // Get the effective user ID
      const effectiveUserId =
        authorId ||
        Object.keys(ignoredUsers).find(
          (id) =>
            ignoredUsers[id].username &&
            ignoredUsers[id].username.toLowerCase() === authorName.toLowerCase()
        );

      if (effectiveUserId) {
        // Get user-specific settings for lastposts
        const settings = getUserVisibilitySetting(effectiveUserId, "lastposts");

        // Get the parent row
        const rowItem = lastpostCell.closest("li.row");

        // Always add ghosted-by-author to the entire row for author identification
        if (rowItem) {
          rowItem.classList.add("ghosted-by-author");
        }

        if (settings.hide) {
          if (settings.hideMode === "last_post") {
            // Only add ghosted-row to the lastpost cell, not the row
            lastpostCell.classList.add("ghosted-row");
          } else {
            // Add ghosted-row to the entire row
            if (rowItem) {
              rowItem.classList.add("ghosted-row");
            }
          }
        } else if (settings.highlight) {
          // Apply highlighting
          const highlightColor = getUserHighlightColor(effectiveUserId);
          lastpostCell.classList.add("ghosted-highlight");
          lastpostCell.style.setProperty(
            "--ghost-highlight-color",
            highlightColor
          );
        }
      } else {
        // Fallback behavior - use default hide behavior
        const rowItem = lastpostCell.closest("li.row");

        // Always add ghosted-by-author to the entire row
        if (rowItem) {
          rowItem.classList.add("ghosted-by-author");
          // Add ghosted-row only if we want to hide the entire row
          rowItem.classList.add("ghosted-row");
        } else {
          lastpostCell.classList.add("ghosted-row");
        }
      }
    }

    // Mark as processed
    lastpostCell.classList.add("content-processed");
  }

  async function processForumsListRows() {
    const forumsLists = document.querySelectorAll(".topiclist.forums");

    for (const forumsList of forumsLists) {
      const rows = forumsList.querySelectorAll(
        "li.row:not(.content-processed)"
      );

      for (const row of rows) {
        // Get the lastpost cell
        const lastpostCell = row.querySelector(
          "dd.lastpost:not(.content-processed)"
        );
        if (lastpostCell) {
          await processLastPostInForums(lastpostCell);
        }

        // Mark the row as processed
        row.classList.add("content-processed");
      }
    }
  }

  async function processTopicsListRows() {
    const topicsLists = document.querySelectorAll(".topiclist.topics");

    for (const topicsList of topicsLists) {
      const rows = topicsList.querySelectorAll(
        "li.row:not(.content-processed)"
      );

      for (const row of rows) {
        // Get the lastpost cell
        const lastpostCell = row.querySelector(
          "dd.lastpost:not(.content-processed)"
        );
        if (lastpostCell) {
          await processLastPostInTopics(lastpostCell);
        }

        // Mark the row as processed
        row.classList.add("content-processed");
      }
    }
  }

  async function processRecentTopicsRows() {
    // Process rows in #recent-topics
    const recentTopics = document.querySelector("#recent-topics");
    if (recentTopics) {
      const rows = recentTopics.querySelectorAll(
        "li.row:not(.content-processed)"
      );

      for (const row of rows) {
        // Get the lastpost cell
        const lastpostCell = row.querySelector(
          "dd.lastpost:not(.content-processed)"
        );
        if (lastpostCell) {
          await processLastPostInRecentTopics(lastpostCell);
        }

        // Mark the row as processed
        row.classList.add("content-processed");
      }
    }
  }

  // Replace the old processLastPost function with specialized functions
  async function processLastPost(lastpostCell) {
    // Skip if already processed
    if (lastpostCell.classList.contains("content-processed")) {
      return;
    }

    // Detect which context we're in and call the appropriate function
    if (lastpostCell.closest(".topiclist.forums")) {
      return processLastPostInForums(lastpostCell);
    } else if (lastpostCell.closest("#recent-topics")) {
      return processLastPostInRecentTopics(lastpostCell);
    } else if (lastpostCell.closest(".topiclist.topics")) {
      return processLastPostInTopics(lastpostCell);
    } else {
      // For any other context, just mark as processed
      lastpostCell.classList.add("content-processed");
    }
  }

  function processTopicListRow(rowType) {
    if (rowType === "forum") {
      return processForumsListRows();
    } else if (rowType === "topic") {
      return processTopicsListRows();
    } else if (rowType === "recent") {
      return processRecentTopicsRows();
    } else {
      console.error(
        "Invalid rowType provided to processTopicListRow:",
        rowType
      );
    }
  }

  // Function to process all ignored content once
  async function processIgnoredContentOnce() {
    await Promise.all(
      Array.from(
        document.querySelectorAll(".notification-block:not(.content-processed)")
      ).map(processNotification)
    );

    // Process reaction notification blocks
    await Promise.all(
      Array.from(
        document.querySelectorAll(
          "a.notification-block[data-real-url]:not(.content-processed)"
        )
      ).map(processReactionNotificationBlock)
    );

    await cacheAllPosts();

    // Process the different types of topiclist rows using our specialized functions
    await processForumsListRows(); // Process forums list (categories)
    await processTopicsListRows(); // Process topics list (threads)
    await processRecentTopicsRows(); // Process recent topics

    document.querySelectorAll("fieldset.polls").forEach(processPoll);

    setupPollRefreshDetection();

    document.querySelectorAll(".topic-poster").forEach(processTopicPoster);

    document
      .querySelectorAll(".post:not(.content-processed)")
      .forEach(processPost);

    document
      .querySelectorAll(".reaction-score-list")
      .forEach(processReactionList);

    // Process reaction images from ignored users
    processReactionImages();

    const reactionObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const lists = node.classList?.contains("reaction-score-list")
              ? [node]
              : node.querySelectorAll(".reaction-score-list");
            lists.forEach((list) => processReactionList(list));

            // Also check for reaction images in added nodes
            if (node.querySelectorAll) {
              const images = node.querySelectorAll("img[reaction-username]");
              if (images.length > 0) {
                processReactionImages();
              }
            }
          }
        });
      });
    });

    reactionObserver.observe(document.body, { childList: true, subtree: true });
    await new Promise((resolve) => setTimeout(resolve, 150));

    document
      .querySelectorAll("strong.badge:not(.content-processed)")
      .forEach((badge) => badge.classList.add("content-processed"));

    // Make sure any remaining rows are marked as processed
    document
      .querySelectorAll("li.row:not(.content-processed)")
      .forEach((row) => {
        const lp = row.querySelector("dd.lastpost");
        if (lp && !lp.classList.contains("content-processed")) return;
        row.classList.add("content-processed");
      });
  }

  function processTopicListRow(rowType) {
    if (rowType === "forums") {
      return processForumsListRows();
    } else if (rowType === "topics") {
      return processTopicsListRows();
    } else if (rowType === "recent-topics") {
      return processRecentTopicsRows();
    }
  }

  // ---------------------------------------------------------------------
  // 6) AVATAR REPLACEMENT
  // ---------------------------------------------------------------------

  function replaceUserAvatars() {
    document.querySelectorAll("img").forEach((img) => {
      const match = img.src.match(/avatar=(\d+)/);
      if (match) {
        const uid = match[1];
        if (replacedAvatars.hasOwnProperty(uid)) {
          img.src = replacedAvatars[uid];
        }
      }
    });
  }

  function startPeriodicAvatarCheck() {
    replaceUserAvatars();
    setInterval(replaceUserAvatars, 1500);
  }

  function validateAndReplaceAvatar(userId, url) {
    const testImg = new Image();
    testImg.onload = function () {
      if (this.width <= 128 && this.height <= 128) {
        replacedAvatars[userId] = url;
        GM_setValue("replacedAvatars", replacedAvatars);
        alert("Avatar replaced!");
        replaceUserAvatars();
      } else {
        alert("Image must be 128x128 or smaller.");
      }
    };
    testImg.onerror = function () {
      alert("Could not load image from the provided URL.");
    };
    testImg.src = url;
  }

  // ---------------------------------------------------------------------
  // 7) PROFILE BUTTONS: GHOST + REPLACE AVATAR
  // ---------------------------------------------------------------------

  function addGhostButtonsIfOnProfile() {
    const memberlistTitle = document.querySelector(".memberlist-title");
    if (!memberlistTitle || document.getElementById("ghost-user-button"))
      return;
    const userId = getUserIdFromUrl();

    // Get just the direct text content, not including child divs
    const titleText = Array.from(memberlistTitle.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent.trim())
      .join(" ");

    // Extract the username after the dash
    const parts = titleText.split("-");
    let username = parts[1]?.trim() || "Unknown User";

    // Clean the username to remove any button text that might have been included
    username = cleanUsername(username);

    if (!userId) return;
    const container = document.createElement("div");
    container.style.display = "inline-block";
    container.style.marginLeft = "10px";
    const ghostBtn = document.createElement("a");
    ghostBtn.id = "ghost-user-button";
    ghostBtn.className = "button button-secondary";
    ghostBtn.href = "#";
    const replaceBtn = document.createElement("a");
    replaceBtn.id = "replace-avatar-button";
    replaceBtn.className = "button button-secondary";
    replaceBtn.href = "#";
    replaceBtn.textContent = "Replace Avatar";
    replaceBtn.style.marginLeft = "5px";
    container.appendChild(ghostBtn);
    container.appendChild(replaceBtn);
    memberlistTitle.appendChild(container);
    function refreshGhostBtn() {
      const isGhosted = ignoredUsers.hasOwnProperty(userId);
      ghostBtn.textContent = isGhosted ? "Unghost User" : "Ghost User";
      ghostBtn.title = isGhosted
        ? "Stop ignoring this user"
        : "Ignore this user";
    }
    refreshGhostBtn();
    ghostBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleUserGhost(userId, username);
      refreshGhostBtn();
    });
    replaceBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showReplaceAvatarPopup(userId);
    });
  }

  function showReplaceAvatarPopup(userId) {
    // Create overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(3px);
    `;

    // Create popup
    const popup = document.createElement("div");
    popup.style.cssText = `
      background-color: #2a2e36;
      color: #e0e0e0;
      padding: 25px;
      border-radius: 6px;
      box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
      width: 380px;
      max-width: 90%;
      animation: fadeInUp 0.3s ease-out;
    `;

    // Create style element for animations
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);

    // Title with username
    const title = document.createElement("h3");
    title.textContent = "Replace Avatar";
    title.style.cssText = `
      margin: 0 0 5px 0;
      font-size: 1.4em;
      font-weight: 600;
      color: #fff;
    `;

    // Attempt to get username from global state
    let username = "Unknown User";
    if (ignoredUsers[userId]) {
      username = ignoredUsers[userId];
    }

    const subtitle = document.createElement("div");
    subtitle.textContent = `Customizing avatar for ${username}`;
    subtitle.style.cssText = `
      color: #8a9db5;
      margin-bottom: 20px;
      font-size: 0.9em;
    `;

    // Current avatar preview
    const avatarPreview = document.createElement("div");
    avatarPreview.style.cssText = `
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #232830;
      padding: 15px;
      border-radius: 4px;
    `;

    const avatarTitle = document.createElement("div");
    avatarTitle.textContent = "Current Avatar";
    avatarTitle.style.cssText = `
      font-size: 0.9em;
      color: #8a9db5;
      margin-bottom: 10px;
    `;

    const avatarImage = document.createElement("div");
    avatarImage.style.cssText = `
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      background-color: #1a1e25;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const defaultAvatar =
      "https://f.rpghq.org/OhUxAgzR9avp.png?n=pasted-file.png";
    const img = document.createElement("img");
    img.src =
      replacedAvatars[userId] ||
      `https://rpghq.org/forums/download/file.php?avatar=${userId}.jpg`;
    img.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
    img.onerror = function () {
      if (this.src.endsWith(".jpg") && !this.src.includes("f.rpghq.org")) {
        this.src = `https://rpghq.org/forums/download/file.php?avatar=${userId}.png`;
      } else if (
        this.src.endsWith(".png") &&
        !this.src.includes("f.rpghq.org")
      ) {
        this.src = `https://rpghq.org/forums/download/file.php?avatar=${userId}.gif`;
      } else if (!this.src.includes("f.rpghq.org")) {
        this.src = defaultAvatar;
      }
    };
    avatarImage.appendChild(img);

    const customStatus = document.createElement("div");
    customStatus.style.cssText = `
      font-size: 0.8em;
      margin-top: 8px;
      color: #8a9db5;
      font-style: italic;
    `;
    customStatus.textContent = replacedAvatars[userId]
      ? "Custom avatar set"
      : "Using default forum avatar";

    avatarPreview.appendChild(avatarTitle);
    avatarPreview.appendChild(avatarImage);
    avatarPreview.appendChild(customStatus);

    // Input area with label and description
    const inputArea = document.createElement("div");
    inputArea.style.cssText = `
      margin-bottom: 20px;
    `;

    const inputLabel = document.createElement("label");
    inputLabel.textContent = "New Avatar URL";
    inputLabel.style.cssText = `
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
    `;

    const inputDescription = document.createElement("div");
    inputDescription.innerHTML = `
      <i class="icon fa-info-circle fa-fw" aria-hidden="true"></i>
      Provide a direct image URL (128×128px or smaller)
    `;
    inputDescription.style.cssText = `
      margin-bottom: 8px;
      font-size: 0.85em;
      color: #8a9db5;
    `;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "https://example.com/image.png";
    input.style.cssText = `
      width: 100%;
      padding: 10px;
      margin-bottom: 5px;
      background: #1e232b;
      border: 1px solid #3a3f4b;
      color: #e0e0e0;
      border-radius: 4px;
      box-sizing: border-box;
      transition: border-color 0.3s;
    `;
    input.onfocus = () => {
      input.style.borderColor = "#4a90e2";
    };
    input.onblur = () => {
      input.style.borderColor = "#3a3f4b";
    };

    // URL validation helper text
    const validationTip = document.createElement("div");
    validationTip.style.cssText = `
      font-size: 0.8em;
      color: #8a9db5;
    `;
    validationTip.textContent = "Enter a direct image URL (.jpg, .png, .gif)";

    // Color settings section
    const colorSettingsSection = document.createElement("div");
    colorSettingsSection.style.cssText = `
      margin-bottom: 20px;
      padding: 15px;
      background-color: #232830;
      border-radius: 4px;
    `;

    const colorSettingsTitle = document.createElement("div");
    colorSettingsTitle.textContent = "User Color Settings";
    colorSettingsTitle.style.cssText = `
      font-weight: 600;
      margin-bottom: 12px;
      color: #e0e0e0;
    `;

    // Highlight color picker area
    const highlightColorArea = document.createElement("div");
    highlightColorArea.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

    const highlightColorLabel = document.createElement("label");
    highlightColorLabel.textContent = "Author Highlight Color";
    highlightColorLabel.style.cssText = `
      font-size: 0.9em;
      color: #c0c0c0;
    `;

    const highlightColorPicker = document.createElement("input");
    highlightColorPicker.type = "color";
    highlightColorPicker.value =
      ignoredUsers[userId]?.highlightColor || "#FF5555";
    highlightColorPicker.className = "ghost-highlight-color-picker";
    highlightColorPicker.style.cssText = `
      border: none;
      height: 30px;
      width: 80px;
      cursor: pointer;
      border-radius: 4px;
    `;

    // Mentioned color picker area
    const mentionedColorArea = document.createElement("div");
    mentionedColorArea.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

    const mentionedColorLabel = document.createElement("label");
    mentionedColorLabel.textContent = "Mentioned Highlight Color";
    mentionedColorLabel.style.cssText = `
      font-size: 0.9em;
      color: #c0c0c0;
    `;

    const mentionedColorPicker = document.createElement("input");
    mentionedColorPicker.type = "color";
    mentionedColorPicker.value =
      ignoredUsers[userId]?.mentionedColor || "#FF9955";
    mentionedColorPicker.className = "ghost-mentioned-color-picker";
    mentionedColorPicker.style.cssText = `
      border: none;
      height: 30px;
      width: 80px;
      cursor: pointer;
      border-radius: 4px;
    `;

    // Description for color settings
    const colorSettingsDescription = document.createElement("div");
    colorSettingsDescription.innerHTML = `
      <i class="icon fa-info-circle fa-fw" aria-hidden="true"></i>
      Different colors for when user authors content vs. when they're mentioned
    `;
    colorSettingsDescription.style.cssText = `
      margin-top: 10px;
      font-size: 0.85em;
      color: #8a9db5;
    `;

    // Assemble color settings section
    highlightColorArea.appendChild(highlightColorLabel);
    highlightColorArea.appendChild(highlightColorPicker);
    mentionedColorArea.appendChild(mentionedColorLabel);
    mentionedColorArea.appendChild(mentionedColorPicker);

    colorSettingsSection.appendChild(colorSettingsTitle);
    colorSettingsSection.appendChild(highlightColorArea);
    colorSettingsSection.appendChild(mentionedColorArea);
    colorSettingsSection.appendChild(colorSettingsDescription);

    inputArea.appendChild(inputLabel);
    inputArea.appendChild(inputDescription);
    inputArea.appendChild(input);
    inputArea.appendChild(validationTip);
    inputArea.appendChild(colorSettingsSection);

    // URL validation
    input.addEventListener("input", function () {
      const url = this.value.trim();
      if (!url) {
        validationTip.textContent =
          "Enter a direct image URL (.jpg, .png, .gif)";
        validationTip.style.color = "#8a9db5";
        return;
      }

      try {
        new URL(url);

        // Check if it likely points to an image
        if (url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
          validationTip.textContent = "URL format appears valid";
          validationTip.style.color = "#4CAF50";
        } else {
          validationTip.textContent = "URL doesn't appear to be an image";
          validationTip.style.color = "#FFC107";
        }
      } catch (e) {
        validationTip.textContent = "Invalid URL format";
        validationTip.style.color = "#F44336";
      }
    });

    // Success message area (initially hidden)
    const messageArea = document.createElement("div");
    messageArea.style.cssText = `
      margin-bottom: 20px;
      padding: 10px;
      border-radius: 4px;
      display: none;
      text-align: center;
    `;

    // Button container with flex layout
    const btnContainer = document.createElement("div");
    btnContainer.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: space-between;
    `;

    // Function to create styled buttons
    function makeBtn(label, isPrimary = false, isDanger = false) {
      const b = document.createElement("button");
      b.textContent = label;

      let bgColor = "#3a3f4b"; // Default
      let hoverBgColor = "#4a5464"; // Default hover
      let textColor = "#e0e0e0"; // Default text

      if (isPrimary) {
        bgColor = "#4a90e2";
        hoverBgColor = "#5aa0f2";
        textColor = "white";
      } else if (isDanger) {
        bgColor = "#e74c3c";
        hoverBgColor = "#f55c4c";
        textColor = "white";
      }

      b.style.cssText = `
        background-color: ${bgColor};
        color: ${textColor};
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: ${isPrimary ? "600" : "normal"};
        transition: background-color 0.2s;
        flex: 1;
      `;

      b.addEventListener("mouseover", () => {
        b.style.backgroundColor = hoverBgColor;
      });
      b.addEventListener("mouseout", () => {
        b.style.backgroundColor = bgColor;
      });

      return b;
    }

    // Button actions
    const replaceB = makeBtn("Replace Avatar", true);
    replaceB.addEventListener("click", () => {
      const url = input.value.trim();
      if (!url) {
        validationTip.textContent = "Please enter a URL";
        validationTip.style.color = "#F44336";
        input.focus();
        return;
      }

      // Save color settings regardless of avatar URL
      // Get color picker values
      const highlightColor = highlightColorPicker.value;
      const mentionedColor = mentionedColorPicker.value;

      // Save color settings
      if (!ignoredUsers[userId]) {
        ignoredUsers[userId] = {};
      }
      ignoredUsers[userId].highlightColor = highlightColor;
      ignoredUsers[userId].mentionedColor = mentionedColor;
      saveIgnoredUsers();

      // Show loading state
      replaceB.disabled = true;
      replaceB.textContent = "Validating...";
      replaceB.style.opacity = "0.7";

      validateAndReplaceAvatar(userId, url, (success, message) => {
        if (success) {
          // Update preview
          img.src = url;
          customStatus.textContent = "Custom avatar set";

          // Show success message
          messageArea.style.display = "block";
          messageArea.style.backgroundColor = "rgba(76, 175, 80, 0.2)";
          messageArea.innerHTML = `
            <i class="icon fa-check-circle fa-fw" aria-hidden="true"></i>
            Avatar successfully updated
          `;
          messageArea.style.color = "#4CAF50";

          // Clear input
          input.value = "";
          validationTip.textContent =
            "Enter a direct image URL (.jpg, .png, .gif)";
          validationTip.style.color = "#8a9db5";

          // Reset button
          replaceB.disabled = false;
          replaceB.textContent = "Replace Avatar";
          replaceB.style.opacity = "1";

          // Auto close after delay
          setTimeout(() => {
            document.body.removeChild(overlay);
          }, 2000);
        } else {
          // Show error message
          messageArea.style.display = "block";
          messageArea.style.backgroundColor = "rgba(244, 67, 54, 0.2)";
          messageArea.innerHTML = `
            <i class="icon fa-exclamation-circle fa-fw" aria-hidden="true"></i>
            ${message || "Failed to set avatar"}
          `;
          messageArea.style.color = "#F44336";

          // Reset button
          replaceB.disabled = false;
          replaceB.textContent = "Replace Avatar";
          replaceB.style.opacity = "1";
        }
      });
    });

    const resetB = makeBtn("Reset to Default", false, true);
    resetB.addEventListener("click", () => {
      if (replacedAvatars[userId]) {
        if (confirm(`Reset avatar for ${username} to forum default?`)) {
          delete replacedAvatars[userId];
          GM_setValue("replacedAvatars", replacedAvatars);

          // Update preview
          img.src = `https://rpghq.org/forums/download/file.php?avatar=${userId}.jpg`;
          customStatus.textContent = "Using default forum avatar";

          // Show success message
          messageArea.style.display = "block";
          messageArea.style.backgroundColor = "rgba(76, 175, 80, 0.2)";
          messageArea.innerHTML = `
            <i class="icon fa-check-circle fa-fw" aria-hidden="true"></i>
            Avatar reset to default
          `;
          messageArea.style.color = "#4CAF50";

          replaceUserAvatars();

          // Auto close after delay
          setTimeout(() => {
            document.body.removeChild(overlay);
          }, 2000);
        }
      } else {
        // Show info message
        messageArea.style.display = "block";
        messageArea.style.backgroundColor = "rgba(33, 150, 243, 0.2)";
        messageArea.innerHTML = `
          <i class="icon fa-info-circle fa-fw" aria-hidden="true"></i>
          This user already has the default avatar
        `;
        messageArea.style.color = "#2196F3";
      }
    });

    const cancelB = makeBtn("Cancel");
    cancelB.addEventListener("click", () => {
      document.body.removeChild(overlay);
    });

    // Add buttons
    btnContainer.appendChild(cancelB);
    btnContainer.appendChild(resetB);
    btnContainer.appendChild(replaceB);

    // Assemble popup
    popup.appendChild(title);
    popup.appendChild(subtitle);
    popup.appendChild(avatarPreview);
    popup.appendChild(messageArea);
    popup.appendChild(inputArea);
    popup.appendChild(btnContainer);

    // Add popup to overlay
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Focus input field
    setTimeout(() => {
      input.focus();
    }, 100);

    // Close on escape key
    document.addEventListener("keydown", function escapeHandler(e) {
      if (e.key === "Escape") {
        document.body.removeChild(overlay);
        document.removeEventListener("keydown", escapeHandler);
      }
    });

    // Close when clicking outside
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }

  // Modified to support callbacks for better error handling
  function validateAndReplaceAvatar(userId, url, callback) {
    const testImg = new Image();
    testImg.onload = function () {
      if (this.width <= 128 && this.height <= 128) {
        replacedAvatars[userId] = url;
        GM_setValue("replacedAvatars", replacedAvatars);
        replaceUserAvatars();
        if (callback) callback(true);
      } else {
        if (callback)
          callback(
            false,
            `Image must be 128×128 or smaller (found: ${this.width}×${this.height})`
          );
      }
    };
    testImg.onerror = function () {
      if (callback)
        callback(false, "Could not load image from the provided URL");
    };
    testImg.src = url;
  }

  // ---------------------------------------------------------------------
  // 8) SHOW/HIDE GHOSTED POSTS TOGGLE VIA KEYBOARD
  // ---------------------------------------------------------------------

  function showToggleNotification() {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 9999;
      transition: opacity 0.3s;
    `;
    notification.textContent = showGhostedPosts
      ? "Showing Ghosted Posts"
      : "Hiding Ghosted Posts";
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 300);
    }, 1500);
  }

  // Create a toggle button for showing/hiding ghosted content
  function createGhostedContentToggle() {
    // Create the toggle button
    const toggleButton = document.createElement("div");
    toggleButton.classList.add("ghost-toggle-button");
    toggleButton.title = "Toggle ghosted content (Shortcut: \\)";
    toggleButton.innerHTML = `
      <div class="ghost-toggle-icon">
        <i class="fa fa-eye${
          showGhostedPosts ? "" : "-slash"
        }" aria-hidden="true"></i>
      </div>
      <div class="ghost-toggle-count" style="display: none;">0</div>
    `;

    // Add click event
    toggleButton.addEventListener("click", toggleGhostedPosts);

    // Add to document body
    document.body.appendChild(toggleButton);

    // Update the ghosted content count
    updateGhostedContentCount();

    return toggleButton;
  }

  // Update the count of ghosted content
  function updateGhostedContentCount() {
    const toggleButton = document.querySelector(".ghost-toggle-button");
    if (!toggleButton) return;

    // Find all types of ghosted content
    const ghostedPosts = document.querySelectorAll(".ghosted").length;
    const ghostedTopicRows = document.querySelectorAll(".ghosted-row").length;
    const ghostedQuotes = document.querySelectorAll(".ghosted-quote").length;
    const ghostedByAuthor =
      document.querySelectorAll(".ghosted-by-author").length;
    const ghostedByContent = document.querySelectorAll(
      ".ghosted-by-content"
    ).length;
    const ghostedReactions =
      document.querySelectorAll(".ghosted-reaction").length;

    // Calculate total unique items (avoid double counting)
    let total =
      ghostedPosts + ghostedTopicRows + ghostedQuotes + ghostedReactions;

    // Update the count element
    const countElement = toggleButton.querySelector(".ghost-toggle-count");
    if (countElement) {
      countElement.textContent = total;
      countElement.style.display = total > 0 ? "block" : "none";
    }

    // Update the eye icon
    const iconElement = toggleButton.querySelector(".ghost-toggle-icon i");
    if (iconElement) {
      iconElement.className = showGhostedPosts
        ? "fa fa-eye"
        : "fa fa-eye-slash";
    }

    // Update button visibility
    toggleButton.style.display = total > 0 ? "flex" : "none";
  }

  // Set up a periodic update of the ghosted content count
  function startPeriodicGhostedContentCountUpdate() {
    // Initial update
    updateGhostedContentCount();

    // Update every 2 seconds
    setInterval(updateGhostedContentCount, 2000);
  }

  function toggleGhostedPosts() {
    // Toggle global show state
    showGhostedPosts = !showGhostedPosts;

    // Apply the show-ghosted-content class to the body
    document.body.classList.toggle("show-ghosted-content", showGhostedPosts);

    // Find all types of ghosted content
    const ghostedPosts = document.querySelectorAll(".ghosted");
    const ghostedTopicRows = document.querySelectorAll(".ghosted-row");
    const ghostedQuotes = document.querySelectorAll(".ghosted-quote");
    const ghostedByAuthor = document.querySelectorAll(".ghosted-by-author");
    const ghostedByContent = document.querySelectorAll(".ghosted-by-content");
    const ghostedReactions = document.querySelectorAll(".ghosted-reaction");

    const hasGhostedContent =
      ghostedPosts.length > 0 ||
      ghostedTopicRows.length > 0 ||
      ghostedQuotes.length > 0 ||
      ghostedByAuthor.length > 0 ||
      ghostedByContent.length > 0 ||
      ghostedReactions.length > 0;

    if (!hasGhostedContent) {
      showNotification("No ghosted content found on this page", "info");
      return;
    }

    // Update the UI toggle button
    updateGhostedContentCount();

    // Show a notification about the state change
    if (showGhostedPosts) {
      showNotification(
        "Showing all ghosted content (press \\ to hide)",
        "success"
      );

      // Find the first ghosted element to scroll to
      const firstGhostedElement =
        document.querySelector(".ghosted") ||
        document.querySelector(".ghosted-row") ||
        document.querySelector(".ghosted-quote") ||
        document.querySelector(".ghosted-by-author") ||
        document.querySelector(".ghosted-by-content");

      // Scroll to the first ghosted element if found
      if (firstGhostedElement) {
        firstGhostedElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    } else {
      showNotification("Hiding ghosted content (press \\ to show)", "info");
    }

    // Update pagination counts to reflect the visibility change
    updatePaginationPostCount();
  }

  // Add keyboard shortcut listener
  document.addEventListener("keydown", (e) => {
    // Skip if we're in a text input
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.isContentEditable
    ) {
      return;
    }

    // Toggle on backslash key
    if (e.key === "\\") {
      e.preventDefault();
      toggleGhostedPosts();
    }
  });

  // ---------------------------------------------------------------------
  // 9) MISC HELPER FUNCTIONS
  // ---------------------------------------------------------------------

  function moveExternalLinkIcon() {
    const lastPostSpans = document.querySelectorAll(
      "dd.lastpost span:not(.icon-moved)"
    );
    lastPostSpans.forEach((sp) => {
      const externalLink = sp.querySelector('a[title="Go to last post"]');
      const timeEl = sp.querySelector("time");
      if (externalLink && timeEl) {
        externalLink.remove();
        timeEl.insertAdjacentElement("afterend", externalLink);
        externalLink.style.marginLeft = "5px";
        sp.classList.add("icon-moved");
      }
    });
  }

  function cleanGhostedQuotesInTextarea() {
    const textarea = document.querySelector("textarea#message");
    if (!textarea || !textarea.value.includes("[quote")) return;
    let text = textarea.value;
    for (const userId in ignoredUsers) {
      const rx = new RegExp(
        `\\[quote=[^\\]]*user_id=${userId}[^\\]]*\\][\\s\\S]*?\\[\\/quote\\]`,
        "g"
      );
      text = text.replace(rx, "");
    }
    if (text !== textarea.value) {
      textarea.value = text;
    }
  }

  function processOnlineList() {
    const onlineList = document.querySelector(".stat-block.online-list p");
    if (!onlineList) return;
    const userLinks = Array.from(
      onlineList.querySelectorAll("a.username, a.username-coloured")
    );
    const nonGhostedUsers = userLinks.filter((link) => {
      const userId = link.href.match(/u=(\d+)/)?.[1];
      const username = link.textContent.trim();
      return !(userId && isUserIgnored(userId)) && !isUserIgnored(username);
    });
    if (nonGhostedUsers.length === 0) {
      const guestsMatch = onlineList.textContent.match(/and (\d+) guests/);
      const guestCount = guestsMatch ? guestsMatch[1] : "0";
      onlineList.innerHTML = `Users browsing this forum: ${guestCount} guests`;
      return;
    }
    let newText = "Users browsing this forum: ";
    nonGhostedUsers.forEach((link, index) => {
      if (index > 0) newText += ", ";
      newText += link.outerHTML;
    });
    const guestsMatch = onlineList.textContent.match(/and (\d+) guests/);
    if (guestsMatch) {
      newText += `, and ${guestsMatch[1]} guests`;
    }
    onlineList.innerHTML = newText;
  }

  // ---------------------------------------------------------------------
  // 10) IGNORED USERS MANAGEMENT
  // ---------------------------------------------------------------------

  // User feedback notification function - globally available
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    `;

    if (type === "success") {
      notification.style.backgroundColor = "#4CAF50";
    } else if (type === "error") {
      notification.style.backgroundColor = "#F44336";
    } else {
      notification.style.backgroundColor = "#2196F3";
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // Fade in
    setTimeout(() => {
      notification.style.opacity = "1";
    }, 10);

    // Fade out and remove
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  async function showIgnoredUsersPopup() {
    // Local function to fix the reference error
    function saveIgnoredUsers() {
      GM_setValue("userPreferences", ignoredUsers);
    }

    // Create the popup container
    const popup = document.createElement("div");
    popup.classList.add("ghost-popup");
    popup.innerHTML = `
      <div class="ghost-popup-content">
        <div class="ghost-popup-header">
          <h3>Ghosted Users</h3>
          <button class="ghost-popup-close">×</button>
        </div>
        <div class="ghost-popup-body">
          <div class="ghost-popup-info">
            Manage your ghosted users here. Click on a username to customize options or unignore.
          </div>
          <div class="ghost-user-list"></div>
          <div class="ghost-popup-add">
            <input type="text" id="ghost-add-input" placeholder="Add user to ghost list...">
            <button id="ghost-add-button">Add</button>
          </div>
        </div>
      </div>
    `;

    // Add close button functionality
    popup.querySelector(".ghost-popup-close").addEventListener("click", () => {
      document.body.removeChild(popup);
    });

    // Function to add a new user
    const addUserInput = popup.querySelector("#ghost-add-input");
    const addUserButton = popup.querySelector("#ghost-add-button");

    // Function to add user when button is clicked
    const addUser = async () => {
      const username = addUserInput.value.trim();
      if (username) {
        const added = await toggleUserGhost(username);
        if (added) {
          addUserInput.value = "";
          renderUserList();
        } else {
          alert(`Could not find user: ${username}`);
        }
      }
    };

    // Add event listeners
    addUserButton.addEventListener("click", addUser);
    addUserInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        addUser();
      }
    });

    // Function to render the user list
    const renderUserList = () => {
      const userListEl = popup.querySelector(".ghost-user-list");
      userListEl.innerHTML = "";

      if (Object.keys(ignoredUsers).length === 0) {
        userListEl.innerHTML = `<div class="ghost-no-users">You haven't ghosted any users yet.</div>`;
        return;
      }

      // Create a list element for each ignored user
      Object.entries(ignoredUsers).forEach(([userId, userData]) => {
        const username = userData.username || `User ID: ${userId}`;

        // Create the main user entry
        const userEntry = document.createElement("div");
        userEntry.classList.add("ghost-user-entry");
        userEntry.setAttribute("data-user-id", userId);

        // Create the user info section (left side)
        const userInfo = document.createElement("div");
        userInfo.classList.add("ghost-user-info");

        // Username with optional customization toggle
        const usernameEl = document.createElement("span");
        usernameEl.classList.add("ghost-username");
        usernameEl.textContent = username;
        userInfo.appendChild(usernameEl);

        // Settings toggle button
        const settingsToggle = document.createElement("button");
        settingsToggle.classList.add("ghost-settings-toggle");
        settingsToggle.textContent = "⚙️";
        settingsToggle.title = "Customize settings";
        userInfo.appendChild(settingsToggle);

        // User actions section (right side)
        const userActions = document.createElement("div");
        userActions.classList.add("ghost-user-actions");

        // Delete button to remove from ghost list
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("ghost-delete-btn");
        deleteBtn.textContent = "Unignore";
        deleteBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          await toggleUserGhost(username);
          renderUserList();
        });
        userActions.appendChild(deleteBtn);

        // Append sections to user entry
        userEntry.appendChild(userInfo);
        userEntry.appendChild(userActions);

        // Create expandable settings panel
        const settingsPanel = document.createElement("div");
        settingsPanel.classList.add("ghost-settings-panel");
        settingsPanel.style.display = "none";

        // Get current user settings
        const highlightColor = getUserHighlightColor(userId);
        const mentionedColor = getUserMentionedColor(userId);
        const globalSetting = userData.settings?.global || "hide";

        // Create settings content with tabbed interface
        settingsPanel.innerHTML = `
          <div class="ghost-settings-group">
            <label>Author Highlight Color:</label>
            <input type="color" class="ghost-color-picker" value="${highlightColor}">
          </div>

          <div class="ghost-settings-group">
            <label>Mentioned Highlight Color:</label>
            <input type="color" class="ghost-mentioned-color-picker" value="${mentionedColor}">
            <p class="ghost-settings-info">Used when user is mentioned in content</p>
          </div>

          <div class="ghost-settings-group">
            <label>Global Visibility:</label>
            <select class="ghost-visibility-select" data-content-type="global">
              <option value="hide_entire_row" ${
                globalSetting === "hide" || globalSetting === "hide_entire_row"
                  ? "selected"
                  : ""
              }>Hide Entire Row</option>
              <option value="hide_last_post" ${
                globalSetting === "hide_last_post" ? "selected" : ""
              }>Hide Last Post Only</option>
              <option value="highlight" ${
                globalSetting === "highlight" ? "selected" : ""
              }>Highlight Content</option>
            </select>
          </div>

          <div class="ghost-settings-section">
            <h4>Advanced Settings</h4>
            <p class="ghost-settings-info">Set specific visibility for different content types</p>

            <div class="ghost-settings-tabs">
              <button class="ghost-tab-button active" data-tab="forum-view">Threads</button>
              <button class="ghost-tab-button" data-tab="topics">Forum Last Posts</button>
            </div>

            <div class="ghost-tab-content" id="forum-view-tab">
              <div class="ghost-settings-group">
                <label>Posts:</label>
                <select class="ghost-visibility-select" data-content-type="posts">
                  <option value="default">Use Global Setting</option>
                  <option value="hide" ${
                    userData.settings?.posts === "hide" ? "selected" : ""
                  }>Hide</option>
                  <option value="highlight" ${
                    userData.settings?.posts === "highlight" ? "selected" : ""
                  }>Highlight</option>
                </select>
              </div>

              <div class="ghost-settings-group">
                <label>Quotes:</label>
                <select class="ghost-visibility-select" data-content-type="quotes">
                  <option value="default">Use Global Setting</option>
                  <option value="hide" ${
                    userData.settings?.quotes === "hide" ? "selected" : ""
                  }>Hide</option>
                  <option value="highlight" ${
                    userData.settings?.quotes === "highlight" ? "selected" : ""
                  }>Highlight</option>
                </select>
              </div>

              <div class="ghost-settings-group">
                <label>Mentions:</label>
                <select class="ghost-visibility-select" data-content-type="mentions">
                  <option value="default">Use Global Setting</option>
                  <option value="hide" ${
                    userData.settings?.mentions === "hide" ? "selected" : ""
                  }>Hide</option>
                  <option value="highlight" ${
                    userData.settings?.mentions === "highlight"
                      ? "selected"
                      : ""
                  }>Highlight</option>
                </select>
              </div>

              <div class="ghost-settings-group">
                <label>Reactions:</label>
                <select class="ghost-visibility-select" data-content-type="reactions">
                  <option value="default">Use Global Setting</option>
                  <option value="hide" ${
                    userData.settings?.reactions === "hide" ? "selected" : ""
                  }>Hide</option>
                  <option value="highlight" ${
                    userData.settings?.reactions === "highlight"
                      ? "selected"
                      : ""
                  }>Highlight</option>
                </select>
              </div>
            </div>

            <div class="ghost-tab-content" id="topics-tab" style="display: none;">
              <div class="ghost-settings-group">
                <label>Last Posts:</label>
                <select class="ghost-visibility-select" data-content-type="lastPost">
                  <option value="default">Use Global Setting</option>
                  <option value="hide_entire_row" ${
                    userData.settings?.lastPost === "hide" ||
                    userData.settings?.lastPost === "hide_entire_row"
                      ? "selected"
                      : ""
                  }>Hide Entire Row</option>
                  <option value="hide_last_post" ${
                    userData.settings?.lastPost === "hide_last_post"
                      ? "selected"
                      : ""
                  }>Hide Last Post</option>
                  <option value="highlight" ${
                    userData.settings?.lastPost === "highlight"
                      ? "selected"
                      : ""
                  }>Highlight</option>
                </select>
              </div>
            </div>
          </div>

          <button class="ghost-save-settings">Save Settings</button>
        `;

        // Add event listener for settings toggle
        settingsToggle.addEventListener("click", (e) => {
          e.stopPropagation();
          if (settingsPanel.style.display === "none") {
            settingsPanel.style.display = "block";
          } else {
            settingsPanel.style.display = "none";
          }
        });

        // Add event listeners for tab buttons
        const tabButtons = settingsPanel.querySelectorAll(".ghost-tab-button");
        tabButtons.forEach((button) => {
          button.addEventListener("click", () => {
            // Remove active class from all buttons
            tabButtons.forEach((btn) => btn.classList.remove("active"));
            // Add active class to clicked button
            button.classList.add("active");

            // Hide all tab content
            const tabContents =
              settingsPanel.querySelectorAll(".ghost-tab-content");
            tabContents.forEach((content) => (content.style.display = "none"));

            // Show relevant tab content
            const tabId = button.getAttribute("data-tab") + "-tab";
            settingsPanel.querySelector(`#${tabId}`).style.display = "block";
          });
        });

        // Add event listener for saving settings
        settingsPanel
          .querySelector(".ghost-save-settings")
          .addEventListener("click", () => {
            // Get color picker values
            const colorPicker = settingsPanel.querySelector(
              ".ghost-color-picker"
            );
            const mentionedColorPicker = settingsPanel.querySelector(
              ".ghost-mentioned-color-picker"
            );
            const newColor = colorPicker.value;
            const newMentionedColor = mentionedColorPicker.value;

            // Initialize settings if they don't exist
            if (!ignoredUsers[userId].settings) {
              ignoredUsers[userId].settings = {};
            }

            // Save both colors
            ignoredUsers[userId].highlightColor = newColor;
            ignoredUsers[userId].mentionedColor = newMentionedColor;

            // Get and save visibility settings
            const visibilitySelects = settingsPanel.querySelectorAll(
              ".ghost-visibility-select"
            );
            visibilitySelects.forEach((select) => {
              const contentType = select.getAttribute("data-content-type");
              const value = select.value;

              if (contentType === "global" || value !== "default") {
                ignoredUsers[userId].settings[contentType] = value;
              } else if (
                value === "default" &&
                ignoredUsers[userId].settings[contentType]
              ) {
                // Remove the content-specific setting to use global
                delete ignoredUsers[userId].settings[contentType];
              }
            });

            // Save to localStorage
            saveIgnoredUsers();

            // Show feedback and close panel
            alert("Settings saved!");
            settingsPanel.style.display = "none";
          });

        // Append settings panel to user entry
        userEntry.appendChild(settingsPanel);

        // Add to the user list
        userListEl.appendChild(userEntry);
      });
    };

    // Render the initial user list
    renderUserList();

    // Add the popup to the document
    document.body.appendChild(popup);
  }

  function addShowIgnoredUsersButton() {
    const dropdown = document.querySelector(
      "#username_logged_in .dropdown-contents"
    );
    if (dropdown && !document.getElementById("show-ignored-users-button")) {
      const listItem = document.createElement("li");
      const showButton = document.createElement("a");
      showButton.id = "show-ignored-users-button";
      showButton.href = "#";
      showButton.title = "Ghosted Users";
      showButton.role = "menuitem";
      showButton.innerHTML =
        '<i class="icon fa-ban fa-fw" aria-hidden="true"></i><span>Ghosted Users</span>';

      showButton.addEventListener("click", function (e) {
        e.preventDefault();
        showIgnoredUsersPopup();
      });

      listItem.appendChild(showButton);
      dropdown.insertBefore(listItem, dropdown.lastElementChild);
    }
  }

  // ---------------------------------------------------------------------
  // 11) RT PAGE INJECTION
  // ---------------------------------------------------------------------

  async function injectRTContent() {
    if (!window.location.href.includes("search.php?search_id=newposts")) return;
    try {
      const pagebody = document.querySelector("#page-body");
      const innerDiv = pagebody.querySelector(".inner:not(.column1)");
      if (!innerDiv) return;

      // Immediately replace with loading state
      innerDiv.innerHTML = `
        <ul class="topiclist">
            <li class="header">
                <dl class="row-item">
                    <dt><div class="list-inner">Topics</div></dt>
                    <dd class="posts">Replies</dd>
                    <dd class="views">Views</dd>
                    <dd class="lastpost content-processed"><span>Last post</span></dd>
                </dl>
            </li>
        </ul>
        <ul class="topiclist topics collapsible">
        </ul>
      `;

      const originalAvatars = new Map();
      const response = await fetch(
        "https://rpghq.org/forums/rt?recent_topics_start=0"
      );
      const text = await response.text();
      const parser = new DOMParser();
      const rtDoc = parser.parseFromString(text, "text/html");
      const rtInner = rtDoc.querySelector(".inner:not(.column1)");
      if (!rtInner) throw new Error("Could not find inner div in RT page");

      const targetList = innerDiv.querySelector("ul.topiclist.topics");
      const rtListItems = rtInner.querySelectorAll("li.row");
      console.log(`Found ${rtListItems.length} topics on first RT page`);
      rtListItems.forEach((row) => {
        targetList.appendChild(row.cloneNode(true));
      });

      if (rtListItems.length === 35) {
        console.log("Found 35 items, fetching second page...");
        const secondResponse = await fetch(
          "https://rpghq.org/forums/rt?recent_topics_start=35"
        );
        const secondText = await secondResponse.text();
        const secondDoc = parser.parseFromString(secondText, "text/html");
        const secondInner = secondDoc.querySelector(".inner:not(.column1)");
        if (secondInner) {
          const secondPageItems = secondInner.querySelectorAll("li.row");
          console.log(
            `Found ${secondPageItems.length} topics on second RT page`
          );
          secondPageItems.forEach((row) => {
            targetList.appendChild(row.cloneNode(true));
          });
        }
      }

      innerDiv.querySelectorAll('a[href^="./"]').forEach((link) => {
        link.href = link.href.replace("./", "https://rpghq.org/forums/");
      });

      // Change Oyster Sauce's username color to #00AA00
      innerDiv.querySelectorAll("a.username-coloured").forEach((link) => {
        if (link.textContent.trim() === "Oyster Sauce") {
          link.style.color = "#00AA00";
        }
      });

      innerDiv.querySelectorAll("li.row").forEach((row) => {
        const responsiveHide = row.querySelector(".responsive-hide");
        if (responsiveHide) {
          const otherLink = responsiveHide.querySelector('a[href$="f=11"]');
          if (
            otherLink &&
            otherLink.nextSibling &&
            otherLink.nextSibling.textContent.includes("»")
          ) {
            otherLink.nextSibling.remove();
            otherLink.remove();
          }
        }

        const isUnread =
          row.querySelector(".row-item").classList.contains("topic_unread") ||
          row
            .querySelector(".row-item")
            .classList.contains("topic_unread_hot") ||
          row
            .querySelector(".row-item")
            .classList.contains("topic_unread_hot_mine") ||
          row.querySelector(".row-item").classList.contains("sticky_unread") ||
          row
            .querySelector(".row-item")
            .classList.contains("sticky_unread_mine") ||
          row.querySelector(".row-item").classList.contains("announce_unread");

        const topicTitle = row.querySelector("a.topictitle");
        if (topicTitle) {
          if (isUnread) {
            topicTitle.href = topicTitle.href + "&view=unread#unread";
            const externalIcon = row.querySelector(".icon-lightgray");
            if (externalIcon) {
              externalIcon.classList.remove("icon-lightgray");
              externalIcon.classList.add("icon-red");
            }
          } else {
            const lastPostLink = row.querySelector(
              'a[title="Go to last post"]'
            );
            if (lastPostLink) {
              const postParams = lastPostLink.href.match(/[?&]p=\d+#p\d+/)?.[0];
              if (postParams) {
                topicTitle.href = topicTitle.href + postParams;
              }
            }
          }
        }
      });
    } catch (error) {
      console.error("Failed to inject RT content:", error);
    }
  }

  function updatePaginationPostCount() {
    const paginationElements = document.querySelectorAll(".pagination");
    if (!paginationElements.length) return;

    paginationElements.forEach((pagination) => {
      const paginationText = pagination.textContent.trim();
      if (!paginationText.includes("Page 1 of 1")) {
        pagination.classList.add("content-processed");
        return;
      }

      const visiblePosts = showGhostedPosts
        ? document.querySelectorAll(".post").length
        : document.querySelectorAll(".post:not(.ghosted-post)").length;

      const visibleMatches = showGhostedPosts
        ? document.querySelectorAll("li.row").length
        : document.querySelectorAll("li.row:not(.ghosted-row)").length;

      const originalText = pagination.innerHTML;
      let newText = originalText;

      // Update post count if this is a post page
      const postCountMatch = paginationText.match(/(\d+) posts/);
      if (postCountMatch) {
        newText = newText.replace(/\d+ posts/, `${visiblePosts} posts`);
      }

      // Update match count if this is a search page
      const matchCountMatch = paginationText.match(
        /Search found (\d+) matches/
      );
      if (matchCountMatch) {
        newText = newText.replace(
          /Search found \d+ matches/,
          `Search found ${visibleMatches} matches`
        );
      }

      if (newText !== originalText) {
        pagination.innerHTML = newText;
      }
      pagination.classList.add("content-processed");
    });
  }

  // ---------------------------------------------------------------------
  // 12) INIT ON DOMContentLoaded
  // ---------------------------------------------------------------------

  function startPeriodicReactionCheck() {
    // Initial check
    processReactionImages();

    // Set up interval to check every 2 seconds
    setInterval(processReactionImages, 2000);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all(
      Array.from(
        document.querySelectorAll(
          ".topiclist.cplist .notifications:not(.content-processed)"
        )
      ).map(processCPListNotification)
    );
    isMobileDevice = detectMobile();
    createTooltip();
    startPeriodicAvatarCheck();
    startPeriodicReactionCheck();
    await injectRTContent();
    const needsFetching = await cacheAllPosts();

    // Create the ghosted content toggle button
    createGhostedContentToggle();
    startPeriodicGhostedContentCountUpdate();

    // Process topiclist topics elements first
    document.querySelectorAll(".topiclist.topics").forEach((topiclist) => {
      processTopicListRow("topic");
    });

    // Then process the containers, but only if all their li elements are processed
    if (!needsFetching) {
      document
        .querySelectorAll(
          ".topiclist.topics, #recent-topics, .topiclist.forums"
        )
        .forEach((container) => {
          // For topiclist.topics and recent-topics, only add content-processed if all li's are processed
          if (
            (container.classList.contains("topiclist") &&
              container.classList.contains("topics")) ||
            container.id === "recent-topics"
          ) {
            const allLis = container.querySelectorAll("li.row");
            const allProcessed = Array.from(allLis).every((li) =>
              li.classList.contains("content-processed")
            );
            if (allProcessed) {
              container.classList.add("content-processed");
            }
          } else {
            // For other containers, proceed as before
            container.classList.add("content-processed");
          }
        });
    }

    await processIgnoredContentOnce();
    replaceUserAvatars();
    addGhostButtonsIfOnProfile();
    addShowIgnoredUsersButton();
    processOnlineList();
    moveExternalLinkIcon();
    cleanGhostedQuotesInTextarea();
    updatePaginationPostCount();

    // Final pass to ensure all containers are marked as processed
    document
      .querySelectorAll(".topiclist.topics, #recent-topics, .topiclist.forums")
      .forEach((container) => {
        if (
          container.classList.contains("topiclist") &&
          container.classList.contains("topics")
        ) {
          processTopicListRow("topic");
          container.classList.add("content-processed");
        } else if (container.id === "recent-topics") {
          processTopicListRow("recent");
          container.classList.add("content-processed");
        } else if (
          container.classList.contains("topiclist") &&
          container.classList.contains("forums")
        ) {
          processTopicListRow("forum");
          container.classList.add("content-processed");
        } else {
          container.classList.add("content-processed");
        }
      });

    // Clean up any elements that have both ghosted-by-author and ghosted-by-content classes
    cleanupGhostedClasses();

    // Set up a MutationObserver to clean up any elements that get both classes in the future
    const ghostedClassesObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class" &&
          mutation.target.classList.contains("ghosted-by-author") &&
          mutation.target.classList.contains("ghosted-by-content")
        ) {
          mutation.target.classList.remove("ghosted-by-content");
        }
      });
    });

    ghostedClassesObserver.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  });

  /**
   * Marks a notification as read before hiding it
   * @param {Element} notificationElement - The notification element to mark as read
   * @returns {Promise<boolean>} - Whether the notification was successfully marked as read
   */
  async function markNotificationAsRead(notificationElement) {
    try {
      // First try to find the mark read input checkbox (for notification center)
      const container = notificationElement.closest(
        "li, div.notification-block"
      );
      if (!container) return false;

      // Try to find the mark read checkbox
      const markReadInput = container.querySelector('input[name^="mark"]');
      if (markReadInput) {
        markReadInput.checked = true;
        await new Promise((resolve) => setTimeout(resolve, 100));
        return true;
      }

      // Try to find the mark read icon/link
      const markReadLink = container.querySelector(".mark_read.icon-mark");
      if (markReadLink) {
        markReadLink.click();
        await new Promise((resolve) => setTimeout(resolve, 100));
        return true;
      }

      // Try to extract the mark notification URL from the href attribute
      if (
        notificationElement.href &&
        notificationElement.href.includes("mark_notification")
      ) {
        // Extract the notification ID and hash from the URL
        const markUrl = notificationElement.href;

        // Create a hidden iframe to load the mark as read URL
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = markUrl;
        document.body.appendChild(iframe);

        // Wait for the iframe to load
        await new Promise((resolve) => {
          iframe.onload = resolve;
          // Timeout after 2 seconds in case the iframe doesn't load
          setTimeout(resolve, 2000);
        });

        // Remove the iframe
        document.body.removeChild(iframe);
        return true;
      }

      return false;
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      return false;
    }
  }

  async function processCPListNotification(item) {
    const titleEl = item.querySelector(".notifications_title");
    if (!titleEl) {
      item.classList.add("content-processed");
      return;
    }

    const usernameEls = titleEl.querySelectorAll(
      ".username, .username-coloured"
    );
    const usernames = Array.from(usernameEls).map((el) =>
      el.textContent.trim()
    );

    if (usernames.length === 0) {
      item.classList.add("content-processed");
      return;
    }

    // For notifications that start with "Quoted by" or "You were mentioned by", the first username is the key user
    const titleText = titleEl.textContent.trim();
    const isQuoteOrMention =
      titleText.startsWith("Quoted") || titleText.includes("mentioned by");
    const firstUsername = usernames[0];

    if (isQuoteOrMention && isUserIgnored(firstUsername)) {
      const row = item.closest("li.row");
      if (row) {
        row.classList.add("ghosted-row");
        await markNotificationAsRead(item);
      }
      item.classList.add("content-processed");
      return;
    }

    const nonIgnored = usernames.filter((u) => !isUserIgnored(u));
    const ghosted = usernames.filter((u) => isUserIgnored(u));
    const hasIgnored = ghosted.length > 0;

    if (!hasIgnored) {
      item.classList.add("content-processed");
      return;
    }

    if (nonIgnored.length === 0) {
      const row = item.closest("li.row");
      if (row) {
        row.classList.add("ghosted-row");
        await markNotificationAsRead(item);
      }
      item.classList.add("content-processed");
      return;
    }

    // Create the non-ghosted notification first
    // Find the last username element to get text after it
    const lastIgnoredEl = usernameEls[usernameEls.length - 1];
    const nodesAfter = [];
    let nxt = lastIgnoredEl?.nextSibling;
    while (nxt) {
      nodesAfter.push(nxt.cloneNode(true));
      nxt = nxt.nextSibling;
    }

    // Clear the title element
    titleEl.textContent = "";

    // Add non-ignored usernames with appropriate separators
    nonIgnored.forEach((username, i) => {
      const matchEl = Array.from(usernameEls).find(
        (el) => el.textContent.trim().toLowerCase() === username.toLowerCase()
      );
      if (matchEl) {
        titleEl.appendChild(matchEl.cloneNode(true));
      } else {
        titleEl.appendChild(document.createTextNode(username));
      }

      if (i < nonIgnored.length - 2) {
        titleEl.appendChild(document.createTextNode(", "));
      } else if (i === nonIgnored.length - 2) {
        titleEl.appendChild(document.createTextNode(" and "));
      }
    });

    // Add "have reacted" or other trailing text
    nodesAfter.forEach((node) => titleEl.appendChild(node));

    // Now create ghosted notifications for each ghosted user
    const row = item.closest("li.row");
    if (row) {
      ghosted.forEach((ghostedUsername) => {
        const ghostedRow = row.cloneNode(true);
        ghostedRow.classList.add("ghosted-row");

        // Update the notification text for this ghosted user
        const ghostedTitleEl = ghostedRow.querySelector(".notifications_title");
        if (ghostedTitleEl) {
          ghostedTitleEl.textContent = "";
          const matchEl = Array.from(usernameEls).find(
            (el) =>
              el.textContent.trim().toLowerCase() ===
              ghostedUsername.toLowerCase()
          );
          if (matchEl) {
            ghostedTitleEl.appendChild(matchEl.cloneNode(true));
          } else {
            ghostedTitleEl.appendChild(
              document.createTextNode(ghostedUsername)
            );
          }

          // Add the trailing text
          nodesAfter.forEach((node) =>
            ghostedTitleEl.appendChild(node.cloneNode(true))
          );
        }

        // Insert the ghosted row after the original
        row.parentNode.insertBefore(ghostedRow, row.nextSibling);
      });
    }

    item.classList.add("content-processed");
  }

  async function processNotification(item) {
    const usernameEls = item.querySelectorAll(".username, .username-coloured");
    const usernames = Array.from(usernameEls).map((el) =>
      el.textContent.trim()
    );

    if (usernames.length === 0) {
      item.classList.add("content-processed");
      return;
    }

    const firstUsername = usernames[0];
    if (isUserIgnored(firstUsername)) {
      const li = item.closest("li");
      if (li) {
        await markNotificationAsRead(item);
        li.classList.add("ghosted-row");
      }
      item.classList.add("content-processed");
      return;
    }

    const nonIgnored = usernames.filter((u) => !isUserIgnored(u));
    const hasIgnored = nonIgnored.length < usernames.length;

    if (!hasIgnored) {
      item.classList.add("content-processed");
      return;
    }

    const titleEl = item.querySelector(".notification-title");
    if (!titleEl) {
      item.classList.add("content-processed");
      return;
    }

    if (nonIgnored.length === 0) {
      const li = item.closest("li");
      if (li) {
        await markNotificationAsRead(item);
        li.classList.add("ghosted-row");
      }
      item.classList.add("content-processed");
      return;
    }

    const lastIgnoredEl = usernameEls[usernameEls.length - 1];
    const nodesAfter = [];
    let nxt = lastIgnoredEl?.nextSibling;

    while (nxt) {
      nodesAfter.push(nxt.cloneNode(true));
      nxt = nxt.nextSibling;
    }

    titleEl.textContent = "";

    nonIgnored.forEach((usr, i) => {
      const matchEl = Array.from(usernameEls).find(
        (el) => el.textContent.trim().toLowerCase() === usr.toLowerCase()
      );

      if (matchEl) {
        titleEl.appendChild(matchEl.cloneNode(true));
      } else {
        titleEl.appendChild(document.createTextNode(usr));
      }

      if (i < nonIgnored.length - 2) {
        titleEl.appendChild(document.createTextNode(", "));
      } else if (i === nonIgnored.length - 2) {
        titleEl.appendChild(document.createTextNode(" and "));
      }
    });

    nodesAfter.forEach((node) => titleEl.appendChild(node));
    item.classList.add("content-processed");
  }

  /**
   * Process reaction notification blocks (the ones with data-real-url attribute)
   * @param {Element} notificationBlock - The notification block element
   */
  async function processReactionNotificationBlock(notificationBlock) {
    try {
      // Skip if already processed
      if (notificationBlock.classList.contains("content-processed")) {
        return;
      }

      // Find username elements
      const usernameEl = notificationBlock.querySelector(".username");
      if (!usernameEl) {
        notificationBlock.classList.add("content-processed");
        return;
      }

      const username = usernameEl.textContent.trim();

      // Check if the user who reacted is ignored
      if (isUserIgnored(username)) {
        // Mark as read before hiding
        await markNotificationAsRead(notificationBlock);

        // Hide the notification
        notificationBlock.style.display = "none";
      }

      notificationBlock.classList.add("content-processed");
    } catch (err) {
      console.error("Error processing reaction notification block:", err);
      notificationBlock.classList.add("content-processed");
    }
  }
})();
