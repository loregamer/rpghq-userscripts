// ==UserScript==
// @name         Nexus Mods - Content Curator
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds warning labels to mods marked as broken or not recommended based on a GitHub-hosted database
// @author       You
// @match        https://www.nexusmods.com/*/mods/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
  "use strict";

  // Configuration - Replace with your GitHub raw JSON URL
  const MOD_STATUS_URL =
    "https://raw.githubusercontent.com/loregamer/rpghq-userscripts/refs/heads/main/Nexus/Resources/mod-status.json";

  const AUTHOR_STATUS_URL =
    "https://raw.githubusercontent.com/loregamer/rpghq-userscripts/refs/heads/main/Nexus/Resources/author-status.json";

  // Extract game and mod ID from URL
  function getGameAndModId() {
    const urlParts = window.location.pathname.split("/");
    const gameId = urlParts[1];
    const modId = urlParts[3];
    return { gameId, modId };
  }

  // Add warning label to page title
  function addWarningLabel(warningText) {
    const pageTitle = document.querySelector("#pagetitle h1");
    if (pageTitle) {
      const warningLabel = document.createElement("span");
      warningLabel.style.color = "red";
      warningLabel.style.marginLeft = "10px";
      warningLabel.style.fontSize = "0.8em";
      warningLabel.textContent = `⚠️ ${warningText}`;
      pageTitle.appendChild(warningLabel);
    }
  }

  // Main function to check mod status and update UI
  function checkModStatus() {
    const { gameId, modId } = getGameAndModId();

    GM_xmlhttpRequest({
      method: "GET",
      url: MOD_STATUS_URL,
      onload: function (response) {
        try {
          const modStatus = JSON.parse(response.responseText);

          if (modStatus[gameId] && modStatus[gameId][modId]) {
            const status = modStatus[gameId][modId];

            if (status.broken) {
              const warningText =
                status.reason || "This mod is marked as broken";
              addWarningLabel(warningText);

              if (status.alternative) {
                addWarningLabel(
                  `Recommended alternative: ${status.alternative}`
                );
              }
            }
          }
        } catch (error) {
          console.error("Error processing mod status:", error);
        }
      },
      onerror: function (error) {
        console.error("Error fetching mod status:", error);
      },
    });
  }

  // Run when the page loads
  checkModStatus();
})();
