// ==UserScript==
// @name         RPGHQ Profile URL Converter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Converts simple profile URLs to full profile URLs on RPGHQ
// @author       You
// @match        https://rpghq.org/forums/*
// @grant        GM_xmlhttpRequest
// @connect      rpghq.org
// ==/UserScript==

(function () {
  "use strict";

  // Skip entirely if we're already on a profile page
  if (
    window.location.pathname.includes("memberlist.php") &&
    window.location.search.includes("mode=viewprofile")
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
    if (
      pathParts.length !== 2 ||
      pathParts[0] !== "forums" ||
      path.includes(".php")
    ) {
      return;
    }

    const username = pathParts[1];
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
      const newUrl = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}-${username.toLowerCase()}`;
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
