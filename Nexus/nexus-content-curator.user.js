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
      margin: 10px 0;
      padding: 15px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      gap: 15px;
      animation: warning-pulse 2s infinite;
    }

    .mod-warning-banner.severe {
      background: linear-gradient(45deg, #ff000033, #ff000066);
      border: 2px solid #ff0000;
    }

    .mod-warning-banner.warning {
      background: linear-gradient(45deg, #ffa50033, #ffa50066);
      border: 2px solid #ffa500;
    }

    .mod-warning-banner.info {
      background: linear-gradient(45deg, #0088ff33, #0088ff66);
      border: 2px solid #0088ff;
    }

    .warning-icon-container {
      display: flex;
      gap: 5px;
    }

    .warning-icon {
      font-size: 24px;
      animation: bounce 1s infinite;
    }

    .warning-text {
      flex-grow: 1;
      color: white;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }

    .warning-actions {
      display: flex;
      gap: 10px;
    }

    .warning-button {
      padding: 5px 10px;
      border-radius: 3px;
      color: white;
      text-decoration: none;
      background: rgba(255,255,255,0.2);
      transition: background 0.3s;
    }

    .warning-button:hover {
      background: rgba(255,255,255,0.3);
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
    container.classList.add("author-status-container"); // Add class for identification

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
    MALICIOUS: {
      icons: ["⚠️", "☠️", "⚠️"],
      color: "#ff0000",
      class: "severe",
    },
    BROKEN: {
      icons: ["⚠️", "💔", "⚠️"],
      color: "#ff0000",
      class: "severe",
    },
    WARNING: {
      icons: ["⚡", "⚠️"],
      color: "#ffa500",
      class: "warning",
    },
    INFO: {
      icons: ["ℹ️"],
      color: "#0088ff",
      class: "info",
    },
    ABANDONED: {
      icons: ["🚫", "⛔"],
      color: "#ff0000",
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
    const pageTitle = document.querySelector("#pagetitle");
    if (!pageTitle) return;

    const existingBanner = document.querySelector(".mod-warning-banner");
    if (existingBanner) existingBanner.remove();

    const banner = createWarningBanner(status);
    pageTitle.insertAdjacentElement("afterend", banner);
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

              addModStatusIndicator(indicatorStatus);
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
