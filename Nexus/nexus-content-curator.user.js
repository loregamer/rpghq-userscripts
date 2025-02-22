// ==UserScript==
// @name         Nexus Mods - Content Curator
// @namespace    http://tampermonkey.net/
// @version      1.1
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

  // Enhanced warning styles
  const styles = `
    .mod-warning-banner {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: 0;
      padding: 15px;
      border-radius: 0;
      display: flex;
      align-items: center;
      gap: 15px;
      pointer-events: none;
      z-index: 5;
    }

    .mod-warning-banner.severe {
      background: linear-gradient(45deg, rgba(255, 0, 0, 0.1), rgba(255, 0, 0, 0.2));
      border: 2px solid #ff0000;
      box-shadow: inset 0 0 20px rgba(255, 0, 0, 0.2);
    }

    .mod-warning-banner.warning {
      background: linear-gradient(45deg, rgba(255, 165, 0, 0.1), rgba(255, 165, 0, 0.2));
      border: 2px solid #ffa500;
      box-shadow: inset 0 0 20px rgba(255, 165, 0, 0.2);
    }

    .mod-warning-banner.info {
      background: linear-gradient(45deg, rgba(0, 136, 255, 0.1), rgba(0, 136, 255, 0.2));
      border: 2px solid #0088ff;
      box-shadow: inset 0 0 20px rgba(0, 136, 255, 0.2);
    }

    .warning-icon-container {
      display: flex;
      gap: 5px;
      pointer-events: auto;
    }

    .warning-icon {
      font-size: 24px;
      animation: bounce 1s infinite;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .warning-text {
      flex-grow: 1;
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
      font-size: 1.2em;
      font-weight: bold;
      pointer-events: auto;
    }

    .warning-actions {
      display: flex;
      gap: 10px;
      pointer-events: auto;
    }

    .warning-button {
      padding: 5px 10px;
      border-radius: 3px;
      color: white;
      text-decoration: none;
      background: rgba(255, 255, 255, 0.2);
      transition: all 0.3s;
      backdrop-filter: blur(5px);
    }

    .warning-button:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    @keyframes warning-pulse {
      0% { opacity: 1; }
      50% { opacity: 0.8; }
      100% { opacity: 1; }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    #featured {
      position: relative;
    }
  `;

  // Add styles to document
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

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
    container.style.cssText = `
      margin-left: 5px;
      display: inline-flex;
      gap: 2px;
      align-items: center;
      vertical-align: middle;
      line-height: 1;
      height: 16px; /* Match image height */
    `;
    container.classList.add("author-status-container");

    authorInfo.labels.forEach((label) => {
      // Create wrapper that will be either a span or anchor
      const wrapper = label.url
        ? document.createElement("a")
        : document.createElement("span");
      wrapper.style.cssText = `
        display: inline-flex;
        align-items: center;
        height: 16px;
        vertical-align: middle;
      `;

      if (label.url) {
        wrapper.href = label.url;
        wrapper.target = "_blank";
        wrapper.rel = "noopener noreferrer";
        wrapper.style.textDecoration = "none";
      }

      const indicator = document.createElement("span");
      indicator.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 16px;
        cursor: ${label.url ? "pointer" : "help"};
        vertical-align: middle;
        line-height: 1;
      `;

      // Create either an image or fallback text icon
      if (label.icon && label.icon.startsWith("http")) {
        const img = document.createElement("img");
        img.style.cssText = `
          width: 16px;
          height: 16px;
          vertical-align: middle;
          object-fit: contain;
          display: block;
          ${label.color ? `filter: drop-shadow(0 0 2px ${label.color})` : ""}
        `;
        img.src = label.icon;

        // Fallback to emoji if image fails to load
        img.onerror = () => {
          indicator.textContent = DEFAULT_ICONS[label.type] || "ℹ️";
          indicator.style.color = label.color || "orange";
          indicator.style.fontSize = "14px"; // Adjust emoji size to match image height
        };

        indicator.appendChild(img);
      } else {
        indicator.textContent = DEFAULT_ICONS[label.type] || "ℹ️";
        indicator.style.color = label.color || "orange";
        indicator.style.fontSize = "14px"; // Adjust emoji size to match image height
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
            // Check if this author link already has status indicators
            if (
              authorStatus[authorName] &&
              !authorLink.nextElementSibling?.classList.contains(
                "author-status-container"
              )
            ) {
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

  // Enhanced status types and icons
  const STATUS_TYPES = {
    BROKEN: {
      icons: ["⚠️"],
      color: "#ff0000",
      class: "severe",
    },
    LAME: {
      icons: ["👎"],
      color: "#ffa500",
      class: "warning",
    },
    ABANDONED: {
      icons: ["🪦"],
      color: "#808080",
      class: "severe",
    },
  };

  // Create warning banner
  function createWarningBanner(status) {
    const banner = document.createElement("div");
    const statusType = STATUS_TYPES[status.type] || STATUS_TYPES.WARNING;

    banner.className = `mod-warning-banner ${statusType.class}`;

    const iconContainer = document.createElement("div");
    iconContainer.className = "warning-icon-container";
    statusType.icons.forEach((icon) => {
      const span = document.createElement("span");
      span.className = "warning-icon";
      span.textContent = icon;
      iconContainer.appendChild(span);
    });

    const textContainer = document.createElement("div");
    textContainer.className = "warning-text";
    textContainer.innerHTML = `<strong>${status.type}:</strong> ${status.reason}`;

    const actionsContainer = document.createElement("div");
    actionsContainer.className = "warning-actions";

    if (status.alternative) {
      const altLink = document.createElement("a");
      altLink.href = `https://www.nexusmods.com/${
        getGameAndModId().gameId
      }/mods/${status.alternative}`;
      altLink.className = "warning-button";
      altLink.textContent = "View Alternative";
      altLink.target = "_blank";
      actionsContainer.appendChild(altLink);
    }

    if (status.url) {
      const moreInfoLink = document.createElement("a");
      moreInfoLink.href = status.url;
      moreInfoLink.className = "warning-button";
      moreInfoLink.textContent = "More Info";
      moreInfoLink.target = "_blank";
      actionsContainer.appendChild(moreInfoLink);
    }

    banner.appendChild(iconContainer);
    banner.appendChild(textContainer);
    banner.appendChild(actionsContainer);

    return banner;
  }

  // Add warning banner to page
  function addWarningBanner(status) {
    const featured = document.querySelector("#featured");
    if (!featured) return;

    const existingBanner = document.querySelector(".mod-warning-banner");
    if (existingBanner) existingBanner.remove();

    const banner = createWarningBanner(status);
    featured.appendChild(banner);
  }

  // DOM Observer setup
  function setupDOMObserver() {
    let checkTimeout;
    const observer = new MutationObserver((mutations) => {
      // Clear any pending timeout
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }

      // Set a new timeout to run checks after mutations have settled
      checkTimeout = setTimeout(() => {
        const pageTitle = document.querySelector("#pagetitle");
        if (pageTitle && !document.querySelector(".mod-warning-banner")) {
          checkModStatus();
        }

        // Only check author status if we don't have all labels yet
        const authorLinks = document.querySelectorAll("a[href*='/users/']");
        const unlabeledAuthors = Array.from(authorLinks).some(
          (link) =>
            !link.nextElementSibling?.classList.contains(
              "author-status-container"
            )
        );

        if (unlabeledAuthors) {
          checkAuthorStatus();
        }
      }, 100); // Wait 100ms after mutations stop before running checks
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
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
              const indicatorStatus = {
                type: status.type || "BROKEN",
                reason: status.reason || "This mod is marked as broken",
                color:
                  status.color || STATUS_TYPES[status.type]?.color || "#ff0000",
                icon: status.icon,
                url: status.url,
                alternative: status.alternative,
              };

              addWarningBanner(indicatorStatus);
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
  setupDOMObserver();
})();
