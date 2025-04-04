// ==UserScript==
// @name         Ghost Users
// @namespace    http://tampermonkey.net/
// @version      5.14
// @description  Hides content from ghosted users + optional avatar replacement, plus quote→blockquote formatting in previews, hides posts with @mentions of ghosted users. Now with tile view and search.
// @author       You
// @match        https://rpghq.org/*/*
// @run-at       document-start
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
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
  // 1) DATA LOAD + INITIAL STYLES + CONFIG
  // ---------------------------------------------------------------------

  const ignoredUsers = GM_getValue("ignoredUsers", {}); // userId => lowercased username
  const replacedAvatars = GM_getValue("replacedAvatars", {}); // userId => image URL
  const postCache = GM_getValue("postCache", {}); // postId => { content, timestamp }
  const userColors = GM_getValue("userColors", {}); // username => color

  // Custom configuration values with defaults
  const config = GM_getValue("ghostConfig", {
    authorHighlightColor: "rgba(255, 0, 0, 0.1)", // Default red for ghosted-by-author
    contentHighlightColor: "rgba(255, 128, 0, 0.1)", // Default orange for ghosted-by-content
    hideEntireRow: true, // Default: only hide lastpost, not entire row
    hideTopicCreations: true, // Default: hide rows with ghosted username in row class
  });

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

  // Inject style at document-start
  const mainStyle = document.createElement("style");
  mainStyle.textContent = `
    /* -----------------------------------------------------------------
       1) Spinner styling for containers that are not yet processed
       ----------------------------------------------------------------- */
    #recent-topics:not(.content-processed)::after,
    .topiclist.forums:not(.content-processed)::after,
    fieldset.polls:not(.content-processed)::after,
    .topiclist.topics:not(.content-processed)::after {
      content: "";
      position: absolute;
      top: 16px;
      left: 50%;
      margin-top: 0;
      margin-left: -12px;
      width: 24px;
      height: 24px;
      border: 3px solid #999;
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      pointer-events: none;
      z-index: 9999;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* -----------------------------------------------------------------
       2) Hide unprocessed content
       ----------------------------------------------------------------- */
    /* Hide child elements in these containers until processed */
    #recent-topics:not(.content-processed) > *:not(style),
    .topiclist.forums:not(.content-processed) > *:not(style),
    .topiclist.topics:not(.content-processed) > *:not(style),
    fieldset.polls:not(.content-processed) > *:not(style) {
      visibility: hidden;
    }
    /* Hide badges until processed */
    strong.badge:not(.content-processed) {
      display: none !important;
    }
    /* Hide main post containers until processed */
    .post.bg1:not(.content-processed),
    .post.bg2:not(.content-processed),
    dd.lastpost:not(.content-processed),
    .reaction-score-list:not(.content-processed),
    .pagination:not(.content-processed) {
      visibility: hidden !important;
    }
    /* Hide list rows until they are processed */
    li.row:not(.content-processed) {
      display: none !important;
    }
    .loading_indicator:not(.content-processed) {
      display: none !important;
    }

    /* -----------------------------------------------------------------
       3) Reveal content once processing is complete
       ----------------------------------------------------------------- */
    #recent-topics.content-processed > *,
    .topiclist.forums.content-processed > *,
    fieldset.polls.content-processed > *,
    strong.badge.content-processed,
    .reaction-score-list.content-processed,
    li.row.content-processed,
    .notification-block,
    .pagination.content-processed,
    .content-processed:not(.ghosted-post):not(.ghosted-row):not(.ghosted-quote) {
      visibility: visible !important;
    }

    /* -----------------------------------------------------------------
      4) Ghosted element styling - with increased specificity
      ----------------------------------------------------------------- */
    /* Simple hiding for ghosted-row */
    .ghosted-row {
      display: none !important;
    }

    .ghosted-row.show {
      display: block !important;
    }

    /* Background colors for highlighting with higher specificity to override site defaults */
    html body .ghosted-by-author,
    html body li.row.ghosted-by-author,
    html body .bg1.ghosted-by-author,
    html body .bg2.ghosted-by-author {
      background-color: var(--ghost-author-highlight, rgba(255, 0, 0, 0.1)) !important;
    }

    html body .ghosted-by-content,
    html body li.row.ghosted-by-content,
    html body .bg1.ghosted-by-content,
    html body .bg2.ghosted-by-content {
      background-color: var(--ghost-content-highlight, rgba(255, 128, 0, 0.1)) !important;
    }
    .topiclist.forums .ghosted-row:not(.show) dd.lastpost,
    body[class*="viewforum-"] .ghosted-row:not(.show) dd.lastpost,
    .topiclist.topics .ghosted-row:not(.show) dd.lastpost,
    #recent-topics .ghosted-row:not(.show) dd.lastpost {
      display: none !important;
    }
    .ghosted-row.show::before {
      display: block;
    }
    .topiclist.forums .ghosted-row.show dd.lastpost,
    body[class*="viewforum-"] .ghosted-row.show dd.lastpost {
      display: block !important;
    }
    .topiclist.forums .ghosted-row.show dd.lastpost,
    body[class*="viewforum-"] .ghosted-row.show dd.lastpost {
      display: block !important;
    }
    .ghosted-post,
    .ghosted-quote {
      display: none !important;
    }
    .ghosted-post.show,
    .ghosted-quote.show {
      display: block !important;
      border: 3px solid;
      border-image: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet) 1;
      border-image-slice: 1;
      border-radius: 4px;
      padding: 6px;
    }

    /* -----------------------------------------------------------------
       5) Post preview tooltip & custom quote styling
       ----------------------------------------------------------------- */
    .post-preview-tooltip {
      position: absolute;
      background: #171b24;
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      z-index: 9999;
      max-width: 600px;
      min-width: 400px;
      font-size: 12px;
      line-height: 1.4;
      word-break: break-word;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .post-preview-tooltip.visible {
      opacity: 1;
      pointer-events: auto;
    }
    .post-preview-tooltip .post-content {
      max-height: 500px;
      overflow-y: auto;
      padding-right: 10px;
    }
    .post-preview-tooltip pre.code {
      background: #1a1a1a;
      padding: 8px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 11px;
      overflow-x: auto;
    }
    .post-preview-tooltip ul,
    .post-preview-tooltip ol {
      padding-left: 20px;
      margin: 5px 0;
    }
    .post-preview-tooltip li {
      margin: 2px 0;
    }
    .post-preview-tooltip details {
      margin: 5px 0;
      padding: 5px;
      background: #253450;
      border: 1px solid #959595;
      border-radius: 3px;
    }
    .post-preview-tooltip summary {
      cursor: pointer;
      user-select: none;
    }
    .post-preview-tooltip table {
      border-collapse: collapse;
      margin: 5px 0;
    }
    .post-preview-tooltip td {
      border: 1px solid #4a4a4a;
      padding: 3px 6px;
    }
    .custom-quote {
      background-color: #242a36;
      border-left: 3px solid #4a90e2;
      padding: 10px;
      margin: 10px 0;
      font-size: 0.9em;
      line-height: 1.4;
    }
    .custom-quote-header {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
    }
    .custom-quote-header a {
      color: #89a6cf;
      text-decoration: none;
      font-weight: 700;
    }
    .custom-quote .custom-quote {
      border-left-color: #ff9e4a;
      margin: 10px 0;
    }
    .custom-quote .custom-quote .custom-quote-header a {
      color: #ff9e4a;
    }
    .custom-quote .custom-quote .custom-quote-header a:hover {
      color: #ffa85e;
    }
    @media (max-width: 700px) {
      .show-ghosted-posts span:not(.icon) {
        display: none;
      }
    }

    /* -----------------------------------------------------------------
       6) NEW: Tile view styling for Ghosted Users popup
       ----------------------------------------------------------------- */
    #ignored-users-popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #2a2e36;
      border: 1px solid #3a3f4b;
      border-radius: 5px;
      width: 80%;
      max-width: 700px;
      height: 80%;
      max-height: 600px;
      display: flex;
      flex-direction: column;
      z-index: 9999;
      font-family: 'Open Sans', 'Droid Sans', Arial, Verdana, sans-serif;
    }

    .ghost-popup-header {
      padding: 15px;
      background-color: #2a2e36;
      border-bottom: 1px solid #3a3f4b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .ghost-popup-title {
      margin: 0;
      color: #c5d0db;
      font-size: 1.2em;
    }

    .ghost-popup-close {
      background-color: transparent;
      color: #c5d0db;
      border: none;
      font-size: 1.5em;
      cursor: pointer;
    }

    .ghost-popup-controls {
      padding: 10px 15px;
      background-color: #242830;
      border-bottom: 1px solid #3a3f4b;
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .ghost-popup-search {
      flex: 1;
      background-color: #171b24;
      border: 1px solid #3a3f4b;
      border-radius: 4px;
      padding: 8px 12px;
      color: #c5d0db;
      font-size: 14px;
    }

    .ghost-popup-search:focus {
      outline: none;
      border-color: #4a90e2;
    }

    .ghost-popup-add-btn {
      background-color: #4a5464;
      color: #c5d0db;
      border: none;
      border-radius: 4px;
      padding: 8px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .ghost-popup-add-btn:hover {
      background-color: #5a6474;
    }

    .ghost-popup-content {
      padding: 15px;
      overflow-y: auto;
      flex-grow: 1;
      background-color: #2a2e36;
    }

    .ghost-users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
    }

    .ghost-user-tile {
      background-color: #242830;
      border-radius: 5px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .ghost-user-tile:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .ghost-user-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      margin-bottom: 10px;
      object-fit: cover;
      border: 2px solid #3a3f4b;
    }

    .ghost-user-name {
      color: #c5d0db;
      font-size: 14px;
      text-align: center;
      word-break: break-word;
      margin-bottom: 8px;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ghost-user-actions {
      display: flex;
      gap: 5px;
      margin-top: auto;
    }

    .ghost-user-unghost {
      background-color: #e74c3c;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .ghost-user-unghost:hover {
      background-color: #c0392b;
    }

    .ghost-user-visit {
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .ghost-user-visit:hover {
      background-color: #2980b9;
    }

    .ghost-empty-state {
      text-align: center;
      color: #8a8a8a;
      padding: 30px;
      font-size: 16px;
    }

    .ghost-popup-footer {
      padding: 10px 15px;
      background-color: #242830;
      border-top: 1px solid #3a3f4b;
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .ghost-popup-footer button {
      background-color: #4a5464;
      color: #c5d0db;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .ghost-popup-footer button:hover {
      background-color: #5a6474;
    }

    /* Settings Panel Styles */
    .ghost-settings-panel {
      background-color: #242830;
      border: 1px solid #3a3f4b;
      border-radius: 5px;
      padding: 15px;
      margin-top: 15px;
      display: none;
    }

    .ghost-settings-panel.visible {
      display: block;
    }

    .ghost-settings-title {
      color: #c5d0db;
      font-size: 16px;
      margin-bottom: 15px;
      text-align: center;
    }

    .ghost-settings-row {
      display: flex;
      margin-bottom: 12px;
      align-items: center;
    }

    .ghost-settings-label {
      flex: 1;
      color: #c5d0db;
      font-size: 14px;
    }

    .ghost-settings-input {
      flex: 1;
      background-color: #1e232b;
      border: 1px solid #3a3f4b;
      border-radius: 4px;
      padding: 6px 10px;
      color: #c5d0db;
    }

    .ghost-settings-checkbox {
      margin-right: 10px;
    }

    .ghost-settings-color {
      width: 100px;
      height: 30px;
      padding: 0 5px;
      background-color: #1e232b;
      border: 1px solid #3a3f4b;
      border-radius: 4px;
    }

    .ghost-settings-preview {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      margin-left: 10px;
      border: 1px solid #3a3f4b;
    }

    .ghost-settings-buttons {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 15px;
    }

    .ghost-settings-save,
    .ghost-settings-reset {
      background-color: #4a5464;
      color: #c5d0db;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
    }

    .ghost-settings-save:hover,
    .ghost-settings-reset:hover {
      background-color: #5a6474;
    }

    /* Member search modal styling */
    .member-search-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 1001;
      justify-content: center;
      align-items: center;
    }

    .member-search-modal.active {
      display: flex;
    }

    .member-search-container {
      background-color: #1e232b;
      border: 1px solid #292e37;
      border-radius: 4px;
      width: 350px;
      max-width: 80%;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      padding: 20px;
      position: relative;
      z-index: 1002;
      margin: 0 auto;
    }

    .member-search-close {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 20px;
      color: #888;
      cursor: pointer;
    }

    .member-search-close:hover {
      color: #fff;
    }

    .member-search-title {
      font-size: 18px;
      margin-bottom: 15px;
      color: #fff;
      text-align: center;
    }

    .member-search-input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #292e37;
      border-radius: 4px;
      background-color: #171b24;
      color: #fff;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .member-search-input:focus {
      outline: none;
      border-color: #8698b3;
    }

    .member-search-results {
      max-height: 300px;
      overflow-y: auto;
    }

    .member-search-result {
      display: flex;
      align-items: center;
      padding: 8px 10px;
      cursor: pointer;
      border-radius: 4px;
    }

    .member-search-result:hover {
      background-color: #292e37;
    }

    .member-search-result img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 10px;
    }

    .member-search-result span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .member-search-no-results {
      padding: 10px;
      color: #8a8a8a;
      text-align: center;
    }

    .member-search-loading {
      text-align: center;
      padding: 10px;
      color: #8a8a8a;
    }

    .ghost-action-buttons {
      display: flex;
      gap: 5px;
      margin-top: 10px;
    }
  `;
  document.documentElement.appendChild(mainStyle);

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

  async function showPostPreview(event, postId) {
    if (isMobileDevice) return;
    if (!tooltip) return;
    if (currentHoverTimeout) clearTimeout(currentHoverTimeout);
    currentHoverTimeout = setTimeout(async () => {
      let content = await fetchAndCachePost(postId);
      if (!content) return;
      content = parseQuotes(content);
      content = parseBBCode(content);
      Object.entries(userColors).forEach(([username, color]) => {
        const usernameRegex = new RegExp(`<a[^>]*>${username}</a>`, "g");
        content = content.replace(
          usernameRegex,
          `<a href="#" style="color: ${color};">${username}</a>`
        );
      });
      tooltip.innerHTML = `<div class="post-content">${content}</div>`;
      const tooltipX = Math.max(10, event.pageX - tooltip.offsetWidth - 100);
      const tooltipY = Math.max(10, event.pageY - tooltip.offsetHeight / 2);
      tooltip.style.left = `${tooltipX}px`;
      tooltip.style.top = `${tooltipY}px`;
      tooltip.classList.add("visible");
      tooltip.addEventListener("mouseenter", () => {
        if (currentHoverTimeout) clearTimeout(currentHoverTimeout);
      });
      tooltip.addEventListener("mouseleave", hidePostPreview);
    }, 200);
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
    if (ignoredUsers.hasOwnProperty(usernameOrId)) return true;
    const cleanedUsername = cleanUsername(usernameOrId);
    const lower = cleanedUsername.toLowerCase();
    return Object.values(ignoredUsers).includes(lower);
  }

  function getUserIdFromUrl() {
    const match = window.location.href.match(/u=(\d+)/);
    return match ? match[1] : null;
  }

  function toggleUserGhost(userId, username) {
    const cleanedUsername = cleanUsername(username);
    if (ignoredUsers.hasOwnProperty(userId)) {
      delete ignoredUsers[userId];
    } else {
      ignoredUsers[userId] = cleanedUsername.toLowerCase();
    }
    GM_setValue("ignoredUsers", ignoredUsers);
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
    // const quoteMatches = content.match(/\[quote=([^\]]+)/g);
    // if (quoteMatches) {
    //   for (const q of quoteMatches) {
    //     const userIdMatch = q.match(/user_id=(\d+)/);
    //     if (userIdMatch && isUserIgnored(userIdMatch[1])) return true;
    //     const quotedName = q.replace("[quote=", "").split(" ")[0];
    //     if (isUserIgnored(quotedName)) return true;
    //   }
    // }

    for (const userId in ignoredUsers) {
      const username = ignoredUsers[userId];
      if (content.toLowerCase().includes(username.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  // Check if post content contains @mentions of ghosted users
  function postContentContainsMentionedGhosted(post) {
    // Get the post content div
    const contentDiv = post.querySelector(".content");
    if (!contentDiv) return false;

    // Get the text content of the post
    const postText = contentDiv.textContent;
    if (!postText) return false;

    // Check for @username mentions of ghosted users
    for (const userId in ignoredUsers) {
      const username = ignoredUsers[userId];
      // Look for @username pattern with word boundary
      // const mentionRegex = new RegExp(`@${username}\\b`, "i");
      // if (mentionRegex.test(postText)) {
      //   return true;
      // }
      if (postText.toLowerCase().includes(username.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  /**
   * Helper function to check if we're on a UCP page that's not notifications
   * @returns {boolean} True if on a UCP page that's not notifications
   */
  function isNonNotificationUCP() {
    return (
      window.location.href.includes("ucp") &&
      !window.location.href.includes("notifications")
    );
  }

  function hideTopicRow(element) {
    // First, check if the element or its parent row has author-name-* class
    // which indicates it's authored by a ghosted user
    const rowItem = element.closest("li.row");
    const hasGhostedClass =
      rowItem &&
      Array.from(rowItem.classList).some((cls) => {
        // Check for author-name-* class
        if (cls.startsWith("author-name-")) {
          const username = cls.replace("author-name-", "");
          return isUserIgnored(username) && !isNonNotificationUCP();
        }
        // Check for row-by-* class
        if (cls.startsWith("row-by-")) {
          const username = cls.replace("row-by-", "");
          return isUserIgnored(username) && !isNonNotificationUCP();
        }
        return false;
      });

    if (hasGhostedClass) {
      // If it's authored by a ghosted user, add both classes
      if (rowItem) {
        rowItem.classList.add("ghosted-row", "ghosted-by-content");
        // Add asterisk to topic title
        const topicTitle = rowItem.querySelector("a.topictitle");
        if (topicTitle && !topicTitle.textContent.startsWith("*")) {
          topicTitle.textContent = "*" + topicTitle.textContent;
        }
        const lastpost = rowItem.querySelector("dd.lastpost");
        if (lastpost) {
          lastpost.classList.add("ghosted-by-content");
        }
      } else {
        element.classList.add("ghosted-row", "ghosted-by-content");
        // Add asterisk to topic title if it exists
        const topicTitle = element.querySelector("a.topictitle");
        if (topicTitle && !topicTitle.textContent.startsWith("*")) {
          topicTitle.textContent = "*" + topicTitle.textContent;
        }
      }
      return;
    }

    const recentTopicLi = element.closest("#recent-topics li");
    if (recentTopicLi) {
      recentTopicLi.classList.add("ghosted-row", "ghosted-by-author");
      return;
    }

    if (rowItem) {
      const forumLinks = rowItem.querySelectorAll(
        ".forum-links a, .responsive-hide a"
      );
      const forumNames = Array.from(forumLinks).map((link) =>
        link.textContent.trim()
      );
      if (
        forumNames.includes("Moderation Station") ||
        forumNames.includes("Chat With Staff")
      )
        return;

      const isForumList = rowItem.closest(".topiclist.forums");
      const isViewForum = window.location.href.includes("/viewforum.php");
      const isSearch = window.location.href.includes("/search.php");

      if (isViewForum || isSearch) {
        const lastpostCell = rowItem.querySelector("dd.lastpost");
        if (lastpostCell) {
          const authorLink = lastpostCell.querySelector(
            "a.username, a.username-coloured"
          );
          if (
            authorLink &&
            isUserIgnored(authorLink.textContent.trim()) &&
            !isNonNotificationUCP()
          ) {
            // Author is ghosted, only add ghosted-by-author
            if (isViewForum) lastpostCell.classList.add("ghosted-row");
            lastpostCell.classList.add("ghosted-by-author");
            return;
          } else {
            const allLinks = rowItem.querySelectorAll(
              "a.username, a.username-coloured"
            );
            const nonAuthorLinks = Array.from(allLinks).filter(
              (link) => !link.closest(".responsive-hide.left-box")
            );
            const hasGhostedUser = nonAuthorLinks.some(
              (link) =>
                isUserIgnored(link.textContent.trim()) &&
                !isNonNotificationUCP()
            );
            if (hasGhostedUser) {
              // Has ghosted user in content, add ghosted-by-author
              if (isViewForum) lastpostCell.classList.add("ghosted-row");
              rowItem.classList.add("ghosted-row", "ghosted-by-author");
            } else {
              // No ghosted author, but content might contain ghosted references
              if (isViewForum) lastpostCell.classList.add("ghosted-row");
              lastpostCell.classList.add("ghosted-by-content");
            }
          }
          return;
        }
      }

      // Check for ghosted authors in the row
      const authorLinks = rowItem.querySelectorAll(
        "a.username, a.username-coloured"
      );
      const authorNames = Array.from(authorLinks).map((link) =>
        link.textContent.trim()
      );
      const hasGhostedAuthor = authorNames.some(
        (name) => isUserIgnored(name) && !isNonNotificationUCP()
      );

      if (hasGhostedAuthor) {
        rowItem.classList.add("ghosted-row", "ghosted-by-author");
        return;
      }

      const innerDiv = rowItem.querySelector(".list-inner");
      if (innerDiv) {
        const byText = innerDiv.textContent.toLowerCase();
        const hasGhostedInBy = Object.values(ignoredUsers).some(
          (username) =>
            byText.includes(`by ${username.toLowerCase()}`) &&
            !isNonNotificationUCP()
        );
        if (hasGhostedInBy) {
          rowItem.classList.add("ghosted-row", "ghosted-by-author");
          return;
        }
      }

      // If we get here, it's content-based ghosting
      if (!isNonNotificationUCP()) {
        rowItem.classList.add("ghosted-row", "ghosted-by-content");
      }
    } else {
      if (!isNonNotificationUCP()) {
        element.classList.add("ghosted-row", "ghosted-by-author");
      }
    }
  }

  /**
   * Process topiclist rows - hide entire row except for forum rows where we only hide lastpost
   * @param {string} rowType - The type of row to process ('forum' or 'topic')
   */
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

      // First check for author-name-* class
      const authorNameClass = Array.from(row.classList).find((cls) =>
        cls.startsWith("author-name-")
      );
      if (authorNameClass) {
        const username = authorNameClass.replace("author-name-", "");
        if (isUserIgnored(username) && !isNonNotificationUCP()) {
          row.classList.add("ghosted-row", "ghosted-by-content");
          const lastpost = row.querySelector("dd.lastpost");
          if (lastpost) {
            lastpost.classList.add("ghosted-by-content");
          }
          return;
        }
      }

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

      // Get the topic title (without adding asterisk to all titles)
      const topicTitle = row.querySelector("a.topictitle");

      // Get the author link in the lastpost cell
      const authorLink = lastpostCell.querySelector(
        "a.username, a.username-coloured"
      );
      if (!authorLink) return;

      const authorName = authorLink.textContent.trim();

      // For forum rows, we only hide the lastpost section
      if (rowType === "forum") {
        // Check if the author is ignored
        if (isUserIgnored(authorName) && !isNonNotificationUCP()) {
          // Author is ghosted, add ghosted-row class to lastpost
          lastpostCell.classList.add("ghosted-row");
          // Add highlighting class to the row
          row.classList.add("ghosted-by-author");
          return;
        }

        // If author isn't ignored, check the post content
        const postLink = lastpostCell.querySelector("a[href*='viewtopic.php']");
        if (postLink) {
          const postId = postLink.href.match(/p=(\d+)/)?.[1];
          if (postId && postCache[postId]) {
            const postContent = postCache[postId].content;
            if (
              postContent &&
              postContentContainsGhosted(postContent) &&
              !isNonNotificationUCP()
            ) {
              // Post content contains ghosted username, add ghosted-row class to lastpost
              lastpostCell.classList.add("ghosted-row");
              // Add highlighting class to the row
              row.classList.add("ghosted-by-content");
            }
          }
        }
      } else {
        // For topic and recent rows, check config to see if we should hide entire row or just lastpost
        // Check if the author is ignored
        if (isUserIgnored(authorName) && !isNonNotificationUCP()) {
          if (config.hideEntireRow) {
            // Hide entire row - Author is ghosted
            row.classList.add("ghosted-row");
            // Add highlighting class to the row
            row.classList.add("ghosted-by-author");
          } else {
            // Only hide lastpost
            lastpostCell.classList.add("ghosted-row");
            // Add highlighting class to the row
            row.classList.add("ghosted-by-author");
          }
          return;
        }

        // Check for post content with ghosted mentions
        const postLink = lastpostCell.querySelector("a[href*='viewtopic.php']");
        if (postLink) {
          const postId = postLink.href.match(/p=(\d+)/)?.[1];
          if (postId && postCache[postId]) {
            const postContent = postCache[postId].content;
            // Check if the lastPostCell contains the username of a ghosted user
            if (
              authorLink &&
              isUserIgnored(authorLink.textContent.trim()) &&
              !isNonNotificationUCP()
            ) {
              if (config.hideEntireRow) {
                // Hide entire row
                row.classList.add("ghosted-row");
                // Add highlighting class to the row
                row.classList.add("ghosted-by-author");
              } else {
                // Only hide lastpost
                lastpostCell.classList.add("ghosted-row");
                // Add highlighting class to the row
                row.classList.add("ghosted-by-author");
              }
              return; // Stop here, don't check content
            } else if (
              postContent &&
              postContentContainsGhosted(postContent) &&
              !isNonNotificationUCP()
            ) {
              // Content contains ghosted references
              if (config.hideEntireRow) {
                // Hide entire row
                row.classList.add("ghosted-row");
                // Add highlighting class to the row
                row.classList.add("ghosted-by-content");
              } else {
                // Only hide lastpost
                lastpostCell.classList.add("ghosted-row");
                // Add highlighting class to the row
                row.classList.add("ghosted-by-content");
              }
            }
          }
        }
      }
    });
  }

  // Legacy functions for backward compatibility
  function processTopiclistForumsRow() {
    processTopicListRow("forum");
  }

  function processRecentTopicsRows() {
    processTopicListRow("recent");
  }

  function processTopiclistTopicsRows() {
    processTopicListRow("topic");
  }

  async function processLastPost(element) {
    const linksWithIcons = element.querySelectorAll("a:has(i.icon)");
    linksWithIcons.forEach((link) => {
      const pid = link.href.match(/[#&]p=?(\d+)/)?.[1];
      if (pid) {
        link.addEventListener("mouseenter", (e) => showPostPreview(e, pid));
        link.addEventListener("mouseleave", hidePostPreview);
      }
    });

    const row = element.closest("li.row");
    const isForumList = row && row.closest(".topiclist.forums");

    // Check if the lastpost author is ignored
    const authorLink = element.querySelector("a.username, a.username-coloured");
    if (
      authorLink &&
      isUserIgnored(authorLink.textContent.trim()) &&
      !isNonNotificationUCP()
    ) {
      if (isForumList) {
        // For forum rows, only hide the lastpost
        element.classList.add("ghosted-row");
        // Add highlight class to the row
        if (row) row.classList.add("ghosted-by-author");
      } else if (row) {
        // For other rows, apply to the row or lastpost based on config
        if (config.hideEntireRow) {
          // Hide entire row
          row.classList.add("ghosted-row", "ghosted-by-author");
        } else {
          // Only hide lastpost
          element.classList.add("ghosted-row");
          // Add highlight class to the row
          row.classList.add("ghosted-by-author");
        }
      }
      element.classList.add("content-processed");
      return;
    }

    const spanEl = element.querySelector("span");
    if (!spanEl) {
      element.classList.add("content-processed");
      return;
    }

    const byTextNode = Array.from(spanEl.childNodes).find(
      (node) =>
        node.nodeType === Node.TEXT_NODE &&
        node.textContent.trim().toLowerCase() === "by"
    );

    if (!byTextNode) {
      element.classList.add("content-processed");
      return;
    }

    const nextEl = byTextNode.nextElementSibling;
    if (
      nextEl &&
      (nextEl.classList.contains("mas-wrap") ||
        nextEl.classList.contains("username") ||
        nextEl.classList.contains("username-coloured"))
    ) {
      const userEl =
        nextEl.classList.contains("username") ||
        nextEl.classList.contains("username-coloured")
          ? nextEl
          : nextEl.querySelector(".username, .username-coloured");

      const link = element.querySelector(
        'a[href*="viewtopic.php"][href*="#p"]'
      );

      if (link) {
        const pid = link.href.match(/[#&]p=?(\d+)/)?.[1];
        if (pid) {
          if (userEl && isUserIgnored(userEl.textContent.trim())) {
            if (isForumList) {
              // For forum rows, only hide the lastpost
              element.classList.add("ghosted-row");
              // Add highlight class to the row
              if (row) row.classList.add("ghosted-by-author");
            } else if (row) {
              // For other rows, apply based on config
              if (config.hideEntireRow) {
                // Hide entire row
                row.classList.add("ghosted-row", "ghosted-by-author");
              } else {
                // Only hide lastpost
                element.classList.add("ghosted-row");
                // Add highlight class to the row
                row.classList.add("ghosted-by-author");
              }
            }
          } else {
            try {
              const content = await fetchAndCachePost(pid);
              if (!content || postContentContainsGhosted(content)) {
                if (isForumList) {
                  // For forum rows, only hide the lastpost
                  element.classList.add("ghosted-row");
                  // Add highlight class to the row
                  if (row) row.classList.add("ghosted-by-content");
                } else if (row) {
                  // For other rows, apply based on config
                  if (config.hideEntireRow) {
                    // Hide entire row
                    row.classList.add("ghosted-row", "ghosted-by-content");
                  } else {
                    // Only hide lastpost
                    element.classList.add("ghosted-row");
                    // Add highlight class to the row
                    row.classList.add("ghosted-by-content");
                  }
                }
              }
            } catch (err) {
              if (isForumList) {
                // For forum rows, only hide the lastpost
                element.classList.add("ghosted-row");
                // Add highlight class to the row
                if (row) row.classList.add("ghosted-by-content");
              } else if (row) {
                // For other rows, hide based on config
                if (config.hideEntireRow) {
                  // Hide entire row
                  row.classList.add("ghosted-row", "ghosted-by-content");
                } else {
                  // Only hide lastpost
                  element.classList.add("ghosted-row");
                  // Add highlight class to the row
                  row.classList.add("ghosted-by-content");
                }
              }
            }
          }
        }
      }
    }

    element.classList.add("content-processed");
  }

  function processReactionList(list) {
    const reactionGroups = list.querySelectorAll(".reaction-group");
    reactionGroups.forEach((group) => {
      const popup = group.querySelector(".reaction-users-popup");
      if (!popup) return;
      const userLinks = popup.querySelectorAll(
        "a.username, a.username-coloured"
      );
      const countSpan = group.querySelector("span");
      if (!countSpan) return;
      let currentCount = parseInt(countSpan.textContent || "0", 10);
      let removedCount = 0;
      userLinks.forEach((link) => {
        const uid = link.href.match(/u=(\d+)/)?.[1];
        if (uid && isUserIgnored(uid)) {
          // Start from the link and traverse upward to find the complete user entry container
          // Look for a more specific parent that contains the entire user entry with avatar
          let userRow = link;
          let parent = link.parentElement;

          // Go up several levels to ensure we get the complete structure
          // This traverses up to find the outermost flex container that has the avatar and username
          while (parent && parent !== popup) {
            userRow = parent;
            if (
              parent.style &&
              parent.style.display === "flex" &&
              parent.querySelector("img[alt]") &&
              parent.textContent.trim().includes(link.textContent.trim())
            ) {
              break; // Found the complete container with both avatar and username
            }
            parent = parent.parentElement;
          }

          if (userRow) {
            userRow.remove();
            removedCount++;
          }
        }
      });
      if (removedCount > 0) {
        const newCount = currentCount - removedCount;
        if (newCount <= 0) {
          group.remove();
        } else {
          countSpan.textContent = String(newCount);
        }
      }
    });
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
        row.classList.add("ghosted-row", "ghosted-by-author");
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
        row.classList.add("ghosted-row", "ghosted-by-author");
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
        ghostedRow.classList.add("ghosted-row", "ghosted-by-author");

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
        li.style.display = "none";
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
        li.style.display = "none";
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

  function processBlockquotesInPost(post) {
    const topLevelBlockquotes = post.querySelectorAll(".content > blockquote");
    if (topLevelBlockquotes.length === 1) {
      const anchor = topLevelBlockquotes[0].querySelector("cite a");
      if (
        anchor &&
        isUserIgnored(anchor.textContent.trim()) &&
        !isNonNotificationUCP()
      ) {
        post.dataset.hideForSingleIgnoredQuote = "true";
        return;
      }
    }

    const allBlockquotes = post.querySelectorAll(".content blockquote");
    allBlockquotes.forEach((bq) => {
      const anchor = bq.querySelector("cite a");
      if (!anchor) return;
      if (isUserIgnored(anchor.textContent.trim()) && !isNonNotificationUCP()) {
        bq.classList.add("ghosted-quote");
      }
    });
  }

  function processPost(post) {
    processBlockquotesInPost(post);
    const usernameEl = post.querySelector(".username, .username-coloured");
    let hideIt = false;

    if (post.dataset.hideForSingleIgnoredQuote === "true") {
      // Only hide if not in UCP or in notifications
      if (!isNonNotificationUCP()) {
        hideIt = true;
      }
      delete post.dataset.hideForSingleIgnoredQuote;
    }

    if (
      usernameEl &&
      isUserIgnored(usernameEl.textContent.trim()) &&
      !isNonNotificationUCP()
    ) {
      hideIt = true;
    }

    // Check for @mentions of ghosted users
    if (
      !hideIt &&
      postContentContainsMentionedGhosted(post) &&
      !isNonNotificationUCP()
    ) {
      hideIt = true;
      // Use the existing ghosted-by-content class
      post.classList.add("ghosted-by-content");
    }

    if (hideIt) {
      post.classList.add("ghosted-post");
    }

    post.classList.add("content-processed");
  }

  function processTopicPoster(poster) {
    const usernameEl = poster.querySelector(".username, .username-coloured");
    if (!usernameEl) return;
    if (
      isUserIgnored(usernameEl.textContent.trim()) &&
      !isNonNotificationUCP()
    ) {
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
    }
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
            return;
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

    // Process the different types of topiclist rows
    processTopiclistForumsRow();
    processRecentTopicsRows();
    processTopiclistTopicsRows();

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

    const lastPosts = document.querySelectorAll(
      "dd.lastpost:not(.content-processed), #recent-topics li dd.lastpost:not(.content-processed)"
    );

    await Promise.all(Array.from(lastPosts).map(processLastPost));

    document
      .querySelectorAll("li.row:not(.content-processed)")
      .forEach((row) => {
        const lp = row.querySelector("dd.lastpost");
        if (lp && !lp.classList.contains("content-processed")) return;
        row.classList.add("content-processed");
      });
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
    const popup = document.createElement("div");
    popup.style.cssText = `
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background-color: #2a2a2a; color: #e0e0e0; padding: 20px;
      border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.5); z-index: 9999;
      width: 300px;
    `;
    const title = document.createElement("h3");
    title.textContent = "Replace Avatar";
    title.style.marginTop = "0";
    title.style.marginBottom = "15px";
    popup.appendChild(title);
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter image URL (128x128 or smaller)";
    input.style.cssText = `
      width: 100%; padding: 5px; margin-bottom: 15px; background: #3a3a3a;
      border: 1px solid #4a4a4a; color: #e0e0e0; border-radius: 3px;
    `;
    popup.appendChild(input);
    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "space-between";
    popup.appendChild(btnContainer);
    function makeBtn(label) {
      const b = document.createElement("button");
      b.textContent = label;
      b.style.cssText = `
        background-color: #3a3a3a; color: #e0e0e0; border: none;
        padding: 5px 10px; border-radius: 3px; cursor: pointer;
      `;
      b.addEventListener(
        "mouseover",
        () => (b.style.backgroundColor = "#4a4a4a")
      );
      b.addEventListener(
        "mouseout",
        () => (b.style.backgroundColor = "#3a3a3a")
      );
      return b;
    }
    const replaceB = makeBtn("Replace");
    replaceB.addEventListener("click", () => {
      validateAndReplaceAvatar(userId, input.value);
      document.body.removeChild(popup);
    });
    const resetB = makeBtn("Reset to Default");
    resetB.addEventListener("click", () => {
      delete replacedAvatars[userId];
      GM_setValue("replacedAvatars", replacedAvatars);
      alert("Avatar reset to default.");
      replaceUserAvatars();
      document.body.removeChild(popup);
    });
    const cancelB = makeBtn("Cancel");
    cancelB.addEventListener("click", () => {
      document.body.removeChild(popup);
    });
    btnContainer.appendChild(replaceB);
    btnContainer.appendChild(resetB);
    btnContainer.appendChild(cancelB);
    document.body.appendChild(popup);
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

  function toggleGhostedPosts() {
    const ghostedPosts = document.querySelectorAll(".post.ghosted-post");
    const ghostedQuotes = document.querySelectorAll(".ghosted-quote");
    const ghostedRows = document.querySelectorAll(".ghosted-row");

    const hasGhostedContent =
      ghostedPosts.length > 0 ||
      ghostedQuotes.length > 0 ||
      ghostedRows.length > 0;

    if (!hasGhostedContent) {
      console.log("No ghosted content found on this page");
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
      notification.textContent = "No ghosted content found on this page";
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notification.remove(), 300);
      }, 1500);
      return;
    }

    showGhostedPosts = !showGhostedPosts;

    ghostedPosts.forEach((p) => p.classList.toggle("show", showGhostedPosts));
    ghostedQuotes.forEach((q) => q.classList.toggle("show", showGhostedPosts));

    // For ghosted rows (which are now only lastpost cells), toggle visibility
    ghostedRows.forEach((r) => {
      r.classList.toggle("show", showGhostedPosts);
    });

    document.body.classList.toggle("show-hidden-threads", showGhostedPosts);

    showToggleNotification();
    updatePaginationPostCount();

    // If we're showing ghosted content, scroll to the first shown element
    if (showGhostedPosts) {
      const firstShownElement =
        document.querySelector(".post.ghosted-post.show") ||
        document.querySelector(".ghosted-quote.show") ||
        document.querySelector(".ghosted-row.show");

      if (firstShownElement) {
        firstShownElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }

  // Add keyboard shortcut listener
  document.addEventListener("keydown", (e) => {
    // Check if we're in a text input
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }

    // Check for backslash key
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
  // 10) NEW: IMPROVED IGNORED USERS MANAGEMENT WITH TILE VIEW
  // ---------------------------------------------------------------------

  function createMemberSearchModal() {
    const modal = document.createElement("div");
    modal.className = "member-search-modal";
    modal.innerHTML = `
      <div class="member-search-container">
        <div class="member-search-close">&times;</div>
        <div class="member-search-title">Search for Member</div>
        <input type="text" class="member-search-input" placeholder="Type username to search...">
        <div class="member-search-results"></div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal when clicking the close button
    const closeButton = modal.querySelector(".member-search-close");
    closeButton.addEventListener("click", function () {
      modal.classList.remove("active");
    });

    // Setup search functionality
    setupSearchFunctionality(modal);

    return modal;
  }

  function setupSearchFunctionality(modal) {
    const searchInput = modal.querySelector(".member-search-input");
    const searchResults = modal.querySelector(".member-search-results");

    // Handle input changes for search
    let debounceTimer;
    searchInput.addEventListener("input", function () {
      clearTimeout(debounceTimer);

      const query = this.value.trim();

      if (query.length < 2) {
        searchResults.innerHTML = "";
        return;
      }

      searchResults.innerHTML =
        '<div class="member-search-loading">Searching...</div>';

      debounceTimer = setTimeout(() => {
        searchMembers(query, searchResults);
      }, 300);
    });

    // Focus input when modal is opened
    modal.addEventListener("transitionend", function () {
      if (modal.classList.contains("active")) {
        searchInput.focus();
      }
    });

    // Also try to focus right away when modal is shown
    const activeObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.attributeName === "class" &&
          modal.classList.contains("active")
        ) {
          searchInput.focus();
        }
      });
    });

    activeObserver.observe(modal, { attributes: true });
  }

  function searchMembers(query, resultsContainer) {
    fetch(
      `https://rpghq.org/forums/mentionloc?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "x-requested-with": "XMLHttpRequest",
        },
        credentials: "include",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        displaySearchResults(data, resultsContainer);
      })
      .catch((error) => {
        console.error("Error searching for members:", error);
        resultsContainer.innerHTML =
          '<div class="member-search-no-results">Error searching for members</div>';
      });
  }

  function displaySearchResults(data, resultsContainer) {
    resultsContainer.innerHTML = "";

    // Filter to only include users, exclude groups
    const filteredData = data.filter((item) => item.type === "user");

    if (!filteredData || filteredData.length === 0) {
      resultsContainer.innerHTML =
        '<div class="member-search-no-results">No members found</div>';
      return;
    }

    const fragment = document.createDocumentFragment();

    filteredData.forEach((item) => {
      const resultItem = document.createElement("div");
      resultItem.className = "member-search-result";

      // User entry
      resultItem.setAttribute("data-user-id", item.user_id);
      resultItem.setAttribute(
        "data-username",
        item.value || item.key || "Unknown User"
      );

      // Default fallback avatar
      const defaultAvatar =
        "https://f.rpghq.org/OhUxAgzR9avp.png?n=pasted-file.png";

      // Create the result item with image that tries multiple extensions
      const userId = item.user_id;
      const username = item.value || item.key || "Unknown User";

      resultItem.innerHTML = `
        <img
          src="https://rpghq.org/forums/download/file.php?avatar=${userId}.jpg"
          alt="${username}'s avatar"
          onerror="if(this.src.endsWith('.jpg')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.png';}else if(this.src.endsWith('.png')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.gif';}else{this.src='${defaultAvatar}';}"
        >
        <span>${username}</span>
      `;

      resultItem.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id");
        const username = this.getAttribute("data-username");

        // Check if the user is already ghosted
        if (isUserIgnored(userId)) {
          alert(`${username} is already ghosted!`);
        } else {
          // Add the user to ignored users
          toggleUserGhost(userId, username);
          alert(`${username} has been ghosted.`);

          // Refresh the ghosted users popup if it's open
          refreshGhostedUsersPopup();
        }

        // Close the search modal
        document
          .querySelector(".member-search-modal")
          .classList.remove("active");
      });

      fragment.appendChild(resultItem);
    });

    resultsContainer.appendChild(fragment);
  }

  function refreshGhostedUsersPopup() {
    const popup = document.getElementById("ignored-users-popup");
    if (popup) {
      const content = popup.querySelector(".ghost-popup-content");
      if (content) {
        populateGhostedUsersGrid(content);
      }
    }
  }

  function populateGhostedUsersGrid(container) {
    // Clear existing content
    container.innerHTML = "";

    // Get all ghosted users
    const userEntries = Object.entries(ignoredUsers).map(
      ([userId, username]) => ({
        userId,
        username: typeof username === "string" ? username : "Unknown User",
      })
    );

    // Sort by username alphabetically
    userEntries.sort((a, b) => a.username.localeCompare(b.username));

    if (userEntries.length === 0) {
      container.innerHTML = `
        <div class="ghost-empty-state">
          <p>No ghosted users yet.</p>
          <p>Click "Add User" to ghost someone.</p>
        </div>
      `;
      return;
    }

    // Create the grid container
    const grid = document.createElement("div");
    grid.className = "ghost-users-grid";

    // Create a tile for each user
    userEntries.forEach(({ userId, username }) => {
      const tile = document.createElement("div");
      tile.className = "ghost-user-tile";

      // Default avatar fallback
      const defaultAvatar =
        "https://f.rpghq.org/OhUxAgzR9avp.png?n=pasted-file.png";

      tile.innerHTML = `
        <img
          class="ghost-user-avatar"
          src="https://rpghq.org/forums/download/file.php?avatar=${userId}.jpg"
          alt="${username}'s avatar"
          onerror="if(this.src.endsWith('.jpg')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.png';}else if(this.src.endsWith('.png')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.gif';}else{this.src='${defaultAvatar}';}"
        >
        <div class="ghost-user-name" title="${username}">${username}</div>
        <div class="ghost-user-actions">
          <button class="ghost-user-unghost" title="Unghost User">Unghost</button>
          <button class="ghost-user-visit" title="Visit Profile">Profile</button>
        </div>
      `;

      // Add event listeners for the buttons
      const unghostBtn = tile.querySelector(".ghost-user-unghost");
      unghostBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm(`Are you sure you want to unghost ${username}?`)) {
          toggleUserGhost(userId, username);
          tile.remove();

          // Check if grid is now empty
          if (grid.children.length === 0) {
            container.innerHTML = `
              <div class="ghost-empty-state">
                <p>No ghosted users yet.</p>
                <p>Click "Add User" to ghost someone.</p>
              </div>
            `;
          }
        }
      });

      const visitBtn = tile.querySelector(".ghost-user-visit");
      visitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}`;
      });

      grid.appendChild(tile);
    });

    container.appendChild(grid);
  }

  function createNewGhostedUsersPopup() {
    // Remove any existing popup
    const existingPopup = document.getElementById("ignored-users-popup");
    if (existingPopup) existingPopup.remove();

    // Create the member search modal first (if it doesn't exist)
    if (!document.querySelector(".member-search-modal")) {
      createMemberSearchModal();
    }

    // Create the main popup
    const popup = document.createElement("div");
    popup.id = "ignored-users-popup";

    // Create the header
    const header = document.createElement("div");
    header.className = "ghost-popup-header";
    header.innerHTML = `
      <h2 class="ghost-popup-title">Ghosted Users</h2>
      <button class="ghost-popup-close">&times;</button>
    `;

    // Create the controls section
    const controls = document.createElement("div");
    controls.className = "ghost-popup-controls";
    controls.innerHTML = `
      <input type="text" class="ghost-popup-search" placeholder="Filter ghosted users...">
      <button class="ghost-popup-add-btn">
        <i class="fa fa-user-plus" aria-hidden="true"></i> Add User
      </button>
    `;

    // Create the content area
    const content = document.createElement("div");
    content.className = "ghost-popup-content";

    // Create the footer
    const footer = document.createElement("div");
    footer.className = "ghost-popup-footer";
    footer.innerHTML = `
      <button class="ghost-unghost-all">
        <i class="fa fa-trash" aria-hidden="true"></i> Unghost All
      </button>
      <button class="ghost-settings-btn">
        <i class="fa fa-cog" aria-hidden="true"></i> Settings
      </button>
    `;

    // Create settings panel (hidden by default)
    const settingsPanel = document.createElement("div");
    settingsPanel.className = "ghost-settings-panel";
    settingsPanel.innerHTML = `
      <div class="ghost-settings-title">Ghost Settings</div>

      <div class="ghost-settings-row">
        <label class="ghost-settings-label">Author Highlight Color:</label>
        <input type="text" class="ghost-settings-input ghost-author-color"
               value="${config.authorHighlightColor}">
        <div class="ghost-settings-preview author-preview"
             style="background-color: ${config.authorHighlightColor};"></div>
      </div>

      <div class="ghost-settings-row">
        <label class="ghost-settings-label">Topic Highlight Color:</label>
        <input type="text" class="ghost-settings-input ghost-topic-color"
               value="${config.topicHighlightColor}">
        <div class="ghost-settings-preview topic-preview"
             style="background-color: ${config.topicHighlightColor};"></div>
      </div>

      <div class="ghost-settings-row">
        <label class="ghost-settings-label">Content Highlight Color:</label>
        <input type="text" class="ghost-settings-input ghost-content-color"
               value="${config.contentHighlightColor}">
        <div class="ghost-settings-preview content-preview"
             style="background-color: ${config.contentHighlightColor};"></div>
      </div>

      <div class="ghost-settings-row">
        <input type="checkbox" class="ghost-settings-checkbox ghost-hide-entire-row"
               id="ghost-hide-entire-row" ${
                 config.hideEntireRow ? "checked" : ""
               }>
        <label class="ghost-settings-label" for="ghost-hide-entire-row">
          Hide entire row (not just lastpost) for topics and recent posts
        </label>
      </div>

      <div class="ghost-settings-row" style="margin-left: 20px;">
        <input type="checkbox" class="ghost-settings-checkbox ghost-hide-topic-creations"
               id="ghost-hide-topic-creations" ${
                 config.hideTopicCreations ? "checked" : ""
               }>
        <label class="ghost-settings-label" for="ghost-hide-topic-creations">
          Hide topics created by ghosted users
        </label>
      </div>

      <div class="ghost-settings-buttons">
        <button class="ghost-settings-save">Save Changes</button>
        <button class="ghost-settings-reset">Reset to Defaults</button>
      </div>
    `;

    // Assemble the popup
    popup.appendChild(header);
    popup.appendChild(controls);
    popup.appendChild(content);
    popup.appendChild(settingsPanel);
    popup.appendChild(footer);

    // Add the popup to the page
    document.body.appendChild(popup);

    // Populate the grid with ghosted users
    populateGhostedUsersGrid(content);

    // Add event listeners
    const closeBtn = popup.querySelector(".ghost-popup-close");
    closeBtn.addEventListener("click", () => {
      popup.remove();
    });

    const addBtn = popup.querySelector(".ghost-popup-add-btn");
    addBtn.addEventListener("click", () => {
      const searchModal = document.querySelector(".member-search-modal");
      searchModal.classList.add("active");
      const searchInput = searchModal.querySelector(".member-search-input");
      searchInput.value = "";
      searchInput.focus();
      searchModal.querySelector(".member-search-results").innerHTML = "";
    });

    const unghostAllBtn = popup.querySelector(".ghost-unghost-all");
    unghostAllBtn.addEventListener("click", () => {
      if (Object.keys(ignoredUsers).length === 0) {
        alert("There are no ghosted users.");
        return;
      }

      if (confirm("Are you sure you want to unghost ALL users?")) {
        GM_setValue("ignoredUsers", {});
        Object.keys(ignoredUsers).forEach((key) => delete ignoredUsers[key]);
        populateGhostedUsersGrid(content);
        alert("All users have been unghosted.");
      }
    });

    // Settings panel toggle
    const settingsBtn = popup.querySelector(".ghost-settings-btn");
    settingsBtn.addEventListener("click", () => {
      settingsPanel.classList.toggle("visible");

      // Update scroll position to show settings if they're visible
      if (settingsPanel.classList.contains("visible")) {
        setTimeout(() => {
          settingsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    });

    // Color input previews
    const authorColorInput = popup.querySelector(".ghost-author-color");
    const authorPreview = popup.querySelector(".author-preview");
    authorColorInput.addEventListener("input", () => {
      authorPreview.style.backgroundColor = authorColorInput.value;
    });

    const contentColorInput = popup.querySelector(".ghost-content-color");
    const contentPreview = popup.querySelector(".content-preview");
    contentColorInput.addEventListener("input", () => {
      contentPreview.style.backgroundColor = contentColorInput.value;
    });

    // Save settings
    const saveSettingsBtn = popup.querySelector(".ghost-settings-save");
    saveSettingsBtn.addEventListener("click", () => {
      const newConfig = {
        authorHighlightColor: authorColorInput.value,
        topicHighlightColor: popup.querySelector(".ghost-topic-color").value,
        contentHighlightColor: contentColorInput.value,
        hideEntireRow: popup.querySelector(".ghost-hide-entire-row").checked,
        hideTopicCreations: popup.querySelector(".ghost-hide-topic-creations")
          .checked,
      };

      // Save to GM storage
      GM_setValue("ghostConfig", newConfig);

      // Update current config
      Object.assign(config, newConfig);

      // Apply changes
      applyCustomColors();

      alert("Settings saved! Refresh the page to see all changes take effect.");
    });

    // Reset settings
    const resetSettingsBtn = popup.querySelector(".ghost-settings-reset");
    resetSettingsBtn.addEventListener("click", () => {
      if (confirm("Reset all settings to default values?")) {
        const defaultConfig = {
          authorHighlightColor: "rgba(255, 0, 0, 0.1)",
          topicHighlightColor: "rgba(255, 165, 0, 0.1)",
          contentHighlightColor: "rgba(255, 128, 0, 0.1)",
          hideEntireRow: false,
          hideTopicCreations: true,
        };

        // Update inputs
        authorColorInput.value = defaultConfig.authorHighlightColor;
        contentColorInput.value = defaultConfig.contentHighlightColor;
        popup.querySelector(".ghost-hide-entire-row").checked =
          defaultConfig.hideEntireRow;
        popup.querySelector(".ghost-hide-topic-creations").checked =
          defaultConfig.hideTopicCreations;

        // Update previews
        authorPreview.style.backgroundColor =
          defaultConfig.authorHighlightColor;
        contentPreview.style.backgroundColor =
          defaultConfig.contentHighlightColor;

        // Save to GM storage
        GM_setValue("ghostConfig", defaultConfig);

        // Update current config
        Object.assign(config, defaultConfig);

        // Apply changes
        applyCustomColors();

        alert(
          "Settings reset to defaults! Refresh the page to see all changes take effect."
        );
      }
    });

    // Add filter functionality
    const filterInput = popup.querySelector(".ghost-popup-search");
    filterInput.addEventListener("input", () => {
      const filterText = filterInput.value.toLowerCase().trim();

      // If filter is empty, repopulate the grid
      if (!filterText) {
        populateGhostedUsersGrid(content);
        return;
      }

      // Otherwise, filter the tiles
      const tiles = content.querySelectorAll(".ghost-user-tile");
      let anyVisible = false;

      tiles.forEach((tile) => {
        const username = tile
          .querySelector(".ghost-user-name")
          .textContent.toLowerCase();
        if (username.includes(filterText)) {
          tile.style.display = "";
          anyVisible = true;
        } else {
          tile.style.display = "none";
        }
      });

      // Show a message if no tiles match the filter
      const noResults = content.querySelector(".no-filter-results");
      if (!anyVisible && !noResults) {
        const grid = content.querySelector(".ghost-users-grid");
        if (grid) {
          const msg = document.createElement("div");
          msg.className = "no-filter-results";
          msg.style.cssText =
            "color: #8a8a8a; text-align: center; margin-top: 20px;";
          msg.textContent = "No users match your filter.";
          content.appendChild(msg);
        }
      } else if (anyVisible && noResults) {
        noResults.remove();
      }
    });

    return popup;
  }

  function showIgnoredUsersPopup() {
    const popup = createNewGhostedUsersPopup();
    // The popup is already added to the document
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

  // Function to change Oyster Sauce's username color to #00AA00
  function changeOysterSauceColor() {
    document.querySelectorAll("a.username-coloured").forEach((link) => {
      if (link.textContent.trim() === "Oyster Sauce") {
        link.style.color = "#00AA00";
      }
    });

    // Set up a MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Element node
              const usernameLinks = node.querySelectorAll
                ? node.querySelectorAll("a.username-coloured")
                : [];

              usernameLinks.forEach((link) => {
                if (link.textContent.trim() === "Oyster Sauce") {
                  link.style.color = "#00AA00";
                }
              });
            }
          });
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Function to clean up any elements that have both ghosted-by-author and ghosted-by-content classes
  function cleanupGhostedClasses() {
    // Find all elements with both classes
    const elementsWithBothClasses = document.querySelectorAll(
      ".ghosted-by-author.ghosted-by-content"
    );

    // Remove ghosted-by-content from these elements
    elementsWithBothClasses.forEach((element) => {
      element.classList.remove("ghosted-by-content");
    });
  }

  // Apply CSS variables for custom colors
  function applyCustomColors() {
    document.documentElement.style.setProperty(
      "--ghost-author-highlight",
      config.authorHighlightColor
    );
    document.documentElement.style.setProperty(
      "--ghost-topic-highlight",
      config.topicHighlightColor
    );
    document.documentElement.style.setProperty(
      "--ghost-content-highlight",
      config.contentHighlightColor
    );
  }

  /**
   * Process mas-wrap elements that may contain ghosted users
   * Hides the entire element if it contains a user who is ghosted
   */
  function processMasWrapElements() {
    // First, find all responsive-hide containers that contain mas-wrap elements
    const responsiveHideElements =
      document.querySelectorAll(".responsive-hide");

    responsiveHideElements.forEach((container) => {
      const masWrapElement = container.querySelector(".mas-wrap");
      if (!masWrapElement) return;

      const usernameElement = masWrapElement.querySelector(".mas-username");
      if (!usernameElement) return;

      const usernameLink = usernameElement.querySelector("a");
      if (!usernameLink) return;

      const username = cleanUsername(usernameLink.textContent.trim());
      if (isUserIgnored(username)) {
        // Clean up the text nodes before and after mas-wrap
        const containerContent = container.childNodes;
        containerContent.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            // Replace "by" and "»" with a space
            node.textContent = node.textContent
              .replace(/by\s*$/, " ")
              .replace(/^\s*»/, " ");
          }
        });

        // Remove the entire mas-wrap element (contains both username and avatar)
        masWrapElement.remove();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    // Apply custom colors from config
    applyCustomColors();
    // Remove zero badges
    removeZeroBadges();
    // Set up interval to periodically check for and remove zero badges
    setInterval(removeZeroBadges, 1000);
    // Set up more frequent title cleaning
    setInterval(cleanTitleNotifications, 250);

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

    // Process topiclist topics elements first
    document.querySelectorAll(".topiclist.topics").forEach((topiclist) => {
      processTopicListRow("topic");
    });

    // Process cplist notifications

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
    changeOysterSauceColor();

    // Process mas-wrap elements
    processMasWrapElements();

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

  /**
   * Remove badges that show "0" and prevent tab title from showing notification numbers
   */
  function removeZeroBadges() {
    const zeroBadges = document.querySelectorAll(
      "strong.badge.hidden.content-processed"
    );

    zeroBadges.forEach((badge) => {
      if (badge.textContent.trim() === "0") {
        badge.remove();
      }
    });

    // Store the original title if not already stored
    if (!window.originalTitle) {
      window.originalTitle = document.title.replace(/^\(\d+\)\s+/, "");
    }
  }

  /**
   * Clean notification numbers from the tab title
   */
  function cleanTitleNotifications() {
    // If title has notification count, reset it
    if (/^\(\d+\)\s+/.test(document.title)) {
      document.title =
        window.originalTitle || document.title.replace(/^\(\d+\)\s+/, "");
    }
  }

  // Main initialization
  document.addEventListener("DOMContentLoaded", async function () {
    setupPollRefreshDetection();

    // Remove zero badges on page load
    removeZeroBadges();
    cleanTitleNotifications;

    // Also check periodically for any dynamically added zero badges
    setInterval(removeZeroBadges, 150);

    setInterval(cleanTitleNotifications, 150);
  });
})();
