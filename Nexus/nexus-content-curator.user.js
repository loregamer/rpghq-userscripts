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

  // Create and setup tooltip element
  const tooltip = document.createElement("div");
  tooltip.style.cssText = `
    position: fixed;
    display: none;
    background: #2a2a2a;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    max-width: 300px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 10000;
    pointer-events: none;
    border: 1px solid #444;
  `;
  document.body.appendChild(tooltip);

  // Handle tooltip positioning
  function updateTooltipPosition(e) {
    const offset = 15; // Distance from cursor
    let x = e.clientX + offset;
    let y = e.clientY + offset;

    // Check if tooltip would go off screen and adjust if needed
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (x + tooltipRect.width > viewportWidth) {
      x = e.clientX - tooltipRect.width - offset;
    }

    if (y + tooltipRect.height > viewportHeight) {
      y = e.clientY - tooltipRect.height - offset;
    }

    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
  }

  // Extract game and mod ID from URL
  function getGameAndModId() {
    const urlParts = window.location.pathname.split("/");
    const gameId = urlParts[1];
    const modId = urlParts[3];
    return { gameId, modId };
  }

  // Add warning label to page title
  function addModStatusIndicator(status) {
    const pageTitle = document.querySelector("#pagetitle h1");
    if (!pageTitle) return;

    const container = document.createElement("span");
    container.style.marginLeft = "10px";
    container.style.display = "inline-flex";
    container.style.gap = "2px";
    container.style.alignItems = "center";
    container.style.verticalAlign = "middle";

    // Create wrapper that will be either a span or anchor
    const wrapper = status.url
      ? document.createElement("a")
      : document.createElement("span");
    if (status.url) {
      wrapper.href = status.url;
      wrapper.target = "_blank";
      wrapper.rel = "noopener noreferrer";
      wrapper.style.textDecoration = "none";
    }

    const indicator = document.createElement("span");
    indicator.style.cursor = status.url ? "pointer" : "help";
    indicator.style.fontSize = "0.8em";

    // Create either an image or fallback text icon
    if (status.icon && status.icon.startsWith("http")) {
      const img = document.createElement("img");
      img.src = status.icon;
      img.style.width = "16px";
      img.style.height = "16px";
      img.style.verticalAlign = "middle";
      img.style.filter = status.color
        ? `drop-shadow(0 0 2px ${status.color})`
        : "";

      // Fallback to emoji if image fails to load
      img.onerror = () => {
        indicator.textContent = DEFAULT_ICONS[status.type] || "⚠️";
        indicator.style.color = status.color || "red";
      };

      indicator.appendChild(img);
    } else {
      indicator.textContent = DEFAULT_ICONS[status.type] || "⚠️";
      indicator.style.color = status.color || "red";
    }

    // Add hover effect
    indicator.style.transition = "transform 0.2s";

    // Custom tooltip handlers
    const showTooltip = (e) => {
      indicator.style.transform = "scale(1.2)";
      let tooltipText = status.reason || "This mod has been flagged";
      if (status.alternative) {
        tooltipText += `\nRecommended alternative: ${status.alternative}`;
      }
      if (status.url) {
        tooltipText += "\nClick to learn more";
      }
      tooltip.textContent = tooltipText;
      tooltip.style.display = "block";
      updateTooltipPosition(e);
    };

    const hideTooltip = () => {
      indicator.style.transform = "scale(1)";
      tooltip.style.display = "none";
    };

    indicator.addEventListener("mouseover", showTooltip);
    indicator.addEventListener("mousemove", updateTooltipPosition);
    indicator.addEventListener("mouseout", hideTooltip);

    wrapper.appendChild(indicator);
    container.appendChild(wrapper);
    pageTitle.appendChild(container);
  }

  // Default icons for different status types
  const DEFAULT_ICONS = {
    MALICIOUS: "⚠️",
    WARNING: "⚡",
    INFO: "ℹ️",
    ABANDONED: "🚫",
  };

  // Add status indicator to author name
  function addAuthorStatusIndicator(authorElement, authorInfo) {
    const container = document.createElement("span");
    container.style.marginLeft = "5px";
    container.style.display = "inline-flex";
    container.style.gap = "2px";
    container.style.alignItems = "center";

    authorInfo.labels.forEach((label) => {
      // Create wrapper that will be either a span or anchor
      const wrapper = label.url
        ? document.createElement("a")
        : document.createElement("span");
      if (label.url) {
        wrapper.href = label.url;
        wrapper.target = "_blank";
        wrapper.rel = "noopener noreferrer";
        wrapper.style.textDecoration = "none";
      }

      const indicator = document.createElement("span");
      indicator.style.cursor = label.url ? "pointer" : "help";

      // Create either an image or fallback text icon
      if (label.icon && label.icon.startsWith("http")) {
        const img = document.createElement("img");
        img.src = label.icon;
        img.style.width = "16px";
        img.style.height = "16px";
        img.style.verticalAlign = "middle";
        img.style.filter = label.color
          ? `drop-shadow(0 0 2px ${label.color})`
          : "";

        // Fallback to emoji if image fails to load
        img.onerror = () => {
          indicator.textContent = DEFAULT_ICONS[label.type] || "ℹ️";
          indicator.style.color = label.color || "orange";
        };

        indicator.appendChild(img);
      } else {
        indicator.textContent = DEFAULT_ICONS[label.type] || "ℹ️";
        indicator.style.color = label.color || "orange";
      }

      // Add hover effect
      indicator.style.transition = "transform 0.2s";

      // Custom tooltip handlers
      const showTooltip = (e) => {
        indicator.style.transform = "scale(1.2)";
        let tooltipText = `[${label.type}] ${label.tooltip}`;
        if (label.url) {
          tooltipText += "\nClick to learn more";
        }
        tooltip.textContent = tooltipText;
        tooltip.style.display = "block";
        updateTooltipPosition(e);
      };

      const hideTooltip = () => {
        indicator.style.transform = "scale(1)";
        tooltip.style.display = "none";
      };

      indicator.addEventListener("mouseover", showTooltip);
      indicator.addEventListener("mousemove", updateTooltipPosition);
      indicator.addEventListener("mouseout", hideTooltip);

      wrapper.appendChild(indicator);
      container.appendChild(wrapper);
    });

    authorElement.insertAdjacentElement("afterend", container);
  }

  // Check author status
  function checkAuthorStatus() {
    const authorLinks = document.querySelectorAll("a[href*='/users/']");

    GM_xmlhttpRequest({
      method: "GET",
      url: AUTHOR_STATUS_URL,
      onload: function (response) {
        try {
          const authorStatus = JSON.parse(response.responseText);

          authorLinks.forEach((authorLink) => {
            const authorName = authorLink.textContent.trim();
            if (authorStatus[authorName]) {
              addAuthorStatusIndicator(authorLink, authorStatus[authorName]);
            }
          });
        } catch (error) {
          console.error("Error processing author status:", error);
        }
      },
      onerror: function (error) {
        console.error("Error fetching author status:", error);
      },
    });
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
              // Convert the status to match our indicator format
              const indicatorStatus = {
                type: status.type || "WARNING",
                reason: status.reason || "This mod is marked as broken",
                color: status.color || "red",
                icon: status.icon,
                url: status.url,
                alternative: status.alternative,
              };

              addModStatusIndicator(indicatorStatus);
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
  checkAuthorStatus();
})();
