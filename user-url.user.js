// ==UserScript==
// @name         RPGHQ Profile URL Converter
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Converts simple profile URLs to full profile URLs on RPGHQ
// @author       You
// @match        https://rpghq.org/forums/*
// @grant        GM_xmlhttpRequest
// @connect      rpghq.org
// @license      MIT
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/user-url.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/user-url.user.js
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

  // Skip if URL contains .php or is the contact admin page
  if (
    window.location.pathname.includes(".php") ||
    window.location.pathname.includes("contactadmin")
  ) {
    return;
  }

  // Function to get user ID from the mention API
  async function getUserId(username) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: `https://rpghq.org/forums/mentionloc?q=${encodeURIComponent(
          username
        )}`,
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "x-requested-with": "XMLHttpRequest",
        },
        onload: function (response) {
          try {
            const data = JSON.parse(response.responseText);
            // Find exact match
            const exactMatch = data.find(
              (item) => item.key.toLowerCase() === username.toLowerCase()
            );

            if (exactMatch) {
              resolve(exactMatch.user_id);
            } else {
              reject("User not found");
            }
          } catch (error) {
            reject(error);
          }
        },
        onerror: function (error) {
          reject(error);
        },
      });
    });
  }

  // Process only the current window URL
  async function processCurrentURL() {
    const path = window.location.pathname;

    // Skip if not a simple /forums/username pattern
    const pathParts = path.split("/").filter(Boolean);
    if (pathParts.length !== 2 || pathParts[0] !== "forums") {
      return;
    }

    // Decode the URL-encoded username
    const username = decodeURIComponent(pathParts[1]);
    console.log("Processing URL:", path);

    const messagePanel = document.querySelector(".panel .inner");
    if (messagePanel) {
      messagePanel.innerHTML = `
        <h2 class="message-title">Loading</h2>
        <p>Fetching profile for user: ${username}...</p>
      `;
    }

    try {
      const userId = await getUserId(username);
      console.log("Got user ID:", userId);
      // Convert spaces to hyphens in the final URL
      const formattedUsername = username.toLowerCase().replace(/\s+/g, "-");
      const newUrl = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}-${formattedUsername}`;
      console.log("Setting new URL:", newUrl);
      window.location.replace(newUrl);
    } catch (error) {
      console.error("Error processing URL:", error);
      if (messagePanel) {
        messagePanel.innerHTML = `
          <h2 class="message-title">Error</h2>
          <p style="color: red;">User "${username}" not found.</p>
        `;
      }
    }
  }

  // Remove all the observer and link processing code
  // Just process the current URL when the script loads
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", processCurrentURL, {
      once: true,
    });
  } else {
    processCurrentURL();
  }
})();
