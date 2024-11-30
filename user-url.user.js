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

  // Function to process links
  async function processLink(link) {
    const path = link.pathname;
    console.log("Processing link:", path); // Debug log

    if (path.startsWith("/forums/")) {
      const username = path.split("/").pop();
      console.log("Extracted username:", username); // Debug log

      if (username && !path.includes(".php")) {
        console.log("Making API request for:", username); // Debug log
        try {
          const userId = await getUserId(username);
          console.log("Got user ID:", userId); // Debug log
          const newUrl = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}-${username.toLowerCase()}`;
          console.log("Setting new URL:", newUrl); // Debug log
          window.location.replace(newUrl);
        } catch (error) {
          console.error("Error processing link:", error);
        }
      }
    }
  }

  // Observer to watch for new links being added to the page
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          const links = node.getElementsByTagName("a");
          Array.from(links).forEach(processLink);
        }
      });
    });
  });

  // Process existing links
  window.addEventListener("load", () => {
    // Changed from DOMContentLoaded
    console.log("Processing existing links"); // Debug log
    const links = document.getElementsByTagName("a");
    Array.from(links).forEach(processLink);
  });

  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
