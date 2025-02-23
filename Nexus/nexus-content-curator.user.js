// ==UserScript==
// @name         Nexus Mods - Content Curator
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adds warning labels to mods marked as broken or not recommended based on a GitHub-hosted database
// @author       You
// @match        https://www.nexusmods.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
  "use strict";

  // Configuration - Replace with your GitHub raw JSON URL
  const MOD_STATUS_URL =
    "https://raw.githubusercontent.com/loregamer/rpghq-userscripts/refs/heads/main/Nexus/Resources/mod-status.json";

  const AUTHOR_STATUS_URL =
    "https://raw.githubusercontent.com/loregamer/rpghq-userscripts/refs/heads/main/Nexus/Resources/author-status.json";

  // Flag to track if we've checked the current mod
  let hasCheckedCurrentMod = false;
  let lastUrl = window.location.href;

  // Storage keys
  const STORAGE_KEYS = {
    MOD_STATUS: "nexus_mod_status_data",
    AUTHOR_STATUS: "nexus_author_status_data",
    LAST_UPDATE: "nexus_data_last_update",
  };

  // Cache duration in milliseconds (24 hours)
  const CACHE_DURATION = 24 * 60 * 60 * 1000;

  // Function to store data with timestamp
  function storeData(key, data) {
    GM_setValue(key, JSON.stringify(data));
    GM_setValue(STORAGE_KEYS.LAST_UPDATE, Date.now());
  }

  // Function to get stored data
  function getStoredData(key) {
    try {
      const data = GM_getValue(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`[Debug] Error parsing stored data for ${key}:`, error);
      return null;
    }
  }

  // Function to check if cache is valid
  function isCacheValid() {
    const lastUpdate = GM_getValue(STORAGE_KEYS.LAST_UPDATE, 0);
    return Date.now() - lastUpdate < CACHE_DURATION;
  }

  // Function to fetch and store JSON data
  function fetchAndStoreJSON(url, storageKey, callback) {
    GM_xmlhttpRequest({
      method: "GET",
      url: url,
      onload: function (response) {
        try {
          const data = JSON.parse(response.responseText);
          storeData(storageKey, data);
          callback(data);
        } catch (error) {
          console.error(
            `[Debug] Error fetching/parsing JSON from ${url}:`,
            error
          );
          // Fall back to cached data
          const cachedData = getStoredData(storageKey);
          if (cachedData) {
            console.log(`[Debug] Using cached data for ${storageKey}`);
            callback(cachedData);
          }
        }
      },
      onerror: function (error) {
        console.error(`[Debug] Error fetching ${url}:`, error);
        // Fall back to cached data
        const cachedData = getStoredData(storageKey);
        if (cachedData) {
          console.log(`[Debug] Using cached data for ${storageKey}`);
          callback(cachedData);
        }
      },
    });
  }

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
      background: linear-gradient(45deg, rgba(255, 0, 0, 0.05), rgba(255, 0, 0, 0.1));
      border: 2px solid rgba(255, 0, 0, 0.3);
      box-shadow: inset 0 0 20px rgba(255, 0, 0, 0.1);
      pointer-events: none;
    }

    .mod-warning-banner.warning {
      background: linear-gradient(45deg, rgba(255, 165, 0, 0.05), rgba(255, 165, 0, 0.1));
      border: 2px solid rgba(255, 165, 0, 0.3);
      box-shadow: inset 0 0 20px rgba(255, 165, 0, 0.1);
    }

    .mod-warning-banner.info {
      background: linear-gradient(45deg, rgba(0, 136, 255, 0.05), rgba(0, 136, 255, 0.1));
      border: 2px solid rgba(0, 136, 255, 0.3);
      box-shadow: inset 0 0 20px rgba(0, 136, 255, 0.1);
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
      text-shadow: -1px -1px 0 #000,  
                   1px -1px 0 #000,
                   -1px 1px 0 #000,
                   1px 1px 0 #000,
                   2px 2px 4px rgba(0, 0, 0, 0.8);
      font-size: 1.2em;
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
      overflow: hidden; /* Contain the gradient effect */
    }

    /* Container for warning banners */
    .mod-warning-banners {
      position: absolute;
      z-index: 10;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0;
      top: 0;
      left: 0;
      pointer-events: none;
    }

    /* Individual warning text containers */
    .warning-text-container {
      position: relative;
      z-index: 10;
      width: 100%;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 4px;
      margin-bottom: 5px;
      pointer-events: auto;
    }

    .mod-warning-banner {
      position: relative;
      width: 100%;
      margin: 0;
      padding: 10px;
      border-radius: 0;
      display: flex;
      align-items: center;
      gap: 15px;
      z-index: 5;
    }

    /* Gradient overlays */
    #featured.has-severe-warning {
      background: linear-gradient(45deg, rgba(255, 0, 0, 0.05), rgba(255, 0, 0, 0.1));
      border: 2px solid rgba(255, 0, 0, 0.3);
      box-shadow: inset 0 0 20px rgba(255, 0, 0, 0.1);
    }

    #featured.has-warning {
      background: linear-gradient(45deg, rgba(255, 165, 0, 0.05), rgba(255, 165, 0, 0.1));
      border: 2px solid rgba(255, 165, 0, 0.3);
      box-shadow: inset 0 0 20px rgba(255, 165, 0, 0.1);
    }

    #featured.has-info {
      background: linear-gradient(45deg, rgba(0, 136, 255, 0.05), rgba(0, 136, 255, 0.1));
      border: 2px solid rgba(0, 136, 255, 0.3);
      box-shadow: inset 0 0 20px rgba(0, 136, 255, 0.1);
    }

    .mod-tile {
      position: relative;
    }

    .mod-tile .mod-warning-banner {
      font-size: 0.9em;
      padding: 10px;
      z-index: 10;
    }

    .mod-tile .warning-icon {
      font-size: 18px;
    }
    .mod-tile .warning-text {
      font-size: 1em;
    }

    .mod-tile .warning-button {
      font-size: 0.9em;
      padding: 3px 8px;
    }

    /* Smaller author icons in tiles */
    .mod-tile .author-status-container {
      transform: scale(0.8);
      transform-origin: left center;
      margin-left: 3px !important;
    }

    /* Red highlight for broken mods */
    .mod-tile.has-broken-warning {
      position: relative;
    }

    .mod-tile.has-broken-warning::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(255, 0, 0, 0.03), rgba(255, 0, 0, 0.08));
      border: 2px solid rgba(255, 0, 0, 0.2);
      pointer-events: none;
      z-index: 1;
    }

    .mod-tile.has-broken-warning .mod-image {
      position: relative;
    }

    .mod-tile.has-broken-warning .mod-warning-banner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.7);
      border-radius: 4px;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 10px;
      white-space: nowrap;
    }

    .mod-tile.has-broken-warning .warning-text {
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      font-weight: bold;
      color: white;
      font-size: 1.2em;
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
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 14px;
    max-width: 300px;
    box-shadow: 0 3px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    pointer-events: none;
    border: 1px solid #444;
    line-height: 1.4;
    white-space: pre-line;
  `;
  document.body.appendChild(tooltip);

  // Helper function to format tooltip text
  function formatTooltipText(text, additionalInfo = "") {
    const formattedText = text
      .replace(/\\n/g, "\n")
      .replace(/\((.*?)\)/g, '<span style="font-size: 0.65em;">($1)</span>');
    return `<div style="font-size: 14px; margin-bottom: 6px;">${formattedText}</div>${
      additionalInfo
        ? `<div style="font-size: 12px; color: #aaa; margin-top: 4px;">${additionalInfo}</div>`
        : ""
    }`;
  }

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
    const match = window.location.href.match(
      /nexusmods\.com\/([^\/]+)\/mods\/(\d+)/
    );
    if (!match) {
      console.warn("[Debug] Could not parse game/mod ID from URL");
      return {};
    }
    return { gameId: match[1], modId: match[2] };
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
      height: 16px;
    `;
    container.classList.add("author-status-container");

    authorInfo.labels.forEach((label) => {
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
        console.log("[Debug] Showing tooltip for label:", label);
        indicator.style.transform = "scale(1.2)";
        tooltip.innerHTML = formatTooltipText(
          label.tooltip,
          label.url ? "Click to learn more" : ""
        );
        tooltip.style.display = "block";
        console.log("[Debug] Tooltip text set to:", tooltip.innerHTML);
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

    // Function to process author status data
    function processAuthorStatus(authorStatus) {
      if (!authorStatus) return;

      authorLinks.forEach((authorLink) => {
        const authorName = authorLink.textContent.trim();

        // Skip if this author link already has status indicators
        if (
          authorLink.nextElementSibling?.classList.contains(
            "author-status-container"
          )
        ) {
          return;
        }

        // Build array of labels for this author
        const authorLabels = [];

        // Check each label to see if this author is included
        for (const [labelKey, labelData] of Object.entries(
          authorStatus.Labels
        )) {
          if (labelData.authors.includes(authorName)) {
            const label = {
              label: labelData.label,
              icon: labelData.icon,
            };

            // Check if there's a custom tooltip for this author and label
            if (authorStatus.Tooltips?.[authorName]?.[labelKey]) {
              const tooltip = authorStatus.Tooltips[authorName][labelKey];
              label.tooltip = tooltip.label;
              label.url = tooltip.referenceLink;
            } else {
              label.tooltip = labelData.label;
            }

            authorLabels.push(label);
          }
        }

        // If we found any labels, add them to the author element
        if (authorLabels.length > 0) {
          addAuthorStatusIndicator(authorLink, { labels: authorLabels });
        }
      });
    }

    // Check if we need to fetch fresh data
    if (!isCacheValid()) {
      fetchAndStoreJSON(
        AUTHOR_STATUS_URL,
        STORAGE_KEYS.AUTHOR_STATUS,
        processAuthorStatus
      );
    } else {
      const cachedData = getStoredData(STORAGE_KEYS.AUTHOR_STATUS);
      if (cachedData) {
        processAuthorStatus(cachedData);
      } else {
        fetchAndStoreJSON(
          AUTHOR_STATUS_URL,
          STORAGE_KEYS.AUTHOR_STATUS,
          processAuthorStatus
        );
      }
    }
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
    CLOSED_PERMISSIONS: {
      icons: ["🔒"],
      color: "#ff4400",
      class: "warning",
    },
    OPEN_PERMISSIONS: {
      icons: ["🔓"],
      color: "#00aa00",
      class: "success",
    },
    CUSTOM_PERMISSIONS: {
      icons: ["⚖️"],
      color: "#888888",
      class: "info",
    },
    AUTHOR_SUCKS: {
      icons: ["👿"],
      color: "#ff4400",
      class: "warning",
    },
  };

  // Create warning banner
  function createWarningBanner(status) {
    console.log("[Debug] Creating warning banner with status:", status);
    const banner = document.createElement("div");
    const statusType = STATUS_TYPES[status.type] || STATUS_TYPES.WARNING;
    console.log("[Debug] Using status type:", statusType);

    banner.className = `mod-warning-banner ${statusType.class}`;
    console.log("[Debug] Banner class:", banner.className);

    const iconContainer = document.createElement("div");
    iconContainer.className = "warning-icon-container";
    statusType.icons.forEach((icon) => {
      const span = document.createElement("span");
      span.className = "warning-icon";
      span.textContent = icon;
      if (status.type === "CLOSED_PERMISSIONS") {
        // Add tooltip handlers
        const showTooltip = (e) => {
          tooltip.innerHTML = formatTooltipText(
            `This mod has closed ${status.reason.toLowerCase()}`
          );
          tooltip.style.display = "block";
          updateTooltipPosition(e);
        };

        const hideTooltip = () => {
          tooltip.style.display = "none";
        };

        span.addEventListener("mouseover", showTooltip);
        span.addEventListener("mousemove", updateTooltipPosition);
        span.addEventListener("mouseout", hideTooltip);
        span.style.cursor = "help";
      }
      iconContainer.appendChild(span);
    });

    const textContainer = document.createElement("div");
    textContainer.className = "warning-text";
    // Format parenthetical text in warning banner
    const formattedReason = status.reason.replace(
      /\((.*?)\)/g,
      '<span style="font-size: 0.85em;">($1)</span>'
    );
    // Replace underscores with spaces in status type
    const formattedType = status.type.replace(/_/g, " ");
    textContainer.innerHTML = `<strong>${formattedType}:</strong> ${formattedReason}`;

    const actionsContainer = document.createElement("div");
    actionsContainer.className = "warning-actions";

    if (status.alternative) {
      const altLink = document.createElement("a");
      altLink.href = `${status.alternative}`;
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
    if (!status || !status.type) {
      console.warn("[Debug] Invalid status object:", status);
      return;
    }

    console.log("[Debug] Adding warning banner to page");
    const featured = document.querySelector("#featured");
    if (!featured) {
      console.warn("[Debug] Featured element not found");
      return;
    }

    // Create a container for all banners if it doesn't exist
    let bannerContainer = document.querySelector(".mod-warning-banners");
    if (!bannerContainer) {
      bannerContainer = document.createElement("div");
      bannerContainer.className = "mod-warning-banners";
      featured.insertBefore(bannerContainer, featured.firstChild);
    }

    // Check for existing banner of the same type
    const existingBanner = document.querySelector(
      `.mod-warning-banner.${status.type.toLowerCase()}`
    );
    if (existingBanner) {
      console.log("[Debug] Removing existing banner of same type");
      existingBanner.closest(".warning-text-container").remove();
    }

    const banner = createWarningBanner(status);
    if (!banner) {
      console.warn("[Debug] Failed to create warning banner");
      return;
    }

    banner.classList.add(status.type.toLowerCase());

    // Create a container for the warning text
    const textContainer = document.createElement("div");
    textContainer.className = "warning-text-container";
    textContainer.appendChild(banner);

    // If this is a BROKEN status, make all banners severe and update Featured class
    if (status.type === "BROKEN") {
      featured.className = "has-severe-warning";
      bannerContainer.insertBefore(textContainer, bannerContainer.firstChild);
    }
    // Insert CLOSED_PERMISSIONS after BROKEN but before others
    else if (status.type === "CLOSED_PERMISSIONS") {
      if (!featured.className.includes("has-severe-warning")) {
        featured.className = "has-warning";
      }
      const brokenBanner = bannerContainer.querySelector(
        ".warning-text-container"
      );
      if (brokenBanner) {
        bannerContainer.insertBefore(textContainer, brokenBanner.nextSibling);
      } else {
        bannerContainer.insertBefore(textContainer, bannerContainer.firstChild);
      }
    } else {
      if (!featured.className.includes("has-severe-warning")) {
        featured.className =
          status.type === "INFO" ? "has-info" : "has-warning";
      }
      bannerContainer.appendChild(textContainer);
    }

    console.log("[Debug] Banner added to featured element");
  }

  // Add warning banner to mod tile
  function addWarningBannerToTile(modTile, status) {
    console.log("[Debug] Adding warning banner to mod tile");

    // Check for existing banner
    const existingBanner = modTile.querySelector(".mod-warning-banner");
    if (existingBanner) {
      console.log("[Debug] Removing existing banner");
      existingBanner.remove();
    }

    // Create a simplified banner for tiles
    const banner = document.createElement("div");
    banner.className = `mod-warning-banner ${status.type.toLowerCase()}`;

    const iconContainer = document.createElement("div");
    iconContainer.className = "warning-icon-container";
    const icon = document.createElement("span");
    icon.className = "warning-icon";
    icon.textContent = STATUS_TYPES[status.type]?.icons[0] || "⚠️";
    iconContainer.appendChild(icon);

    const textContainer = document.createElement("div");
    textContainer.className = "warning-text";
    textContainer.textContent = status.type;

    banner.appendChild(iconContainer);
    banner.appendChild(textContainer);

    // Add tooltip with full details
    const showTooltip = (e) => {
      tooltip.innerHTML = formatTooltipText(status.reason);
      tooltip.style.display = "block";
      updateTooltipPosition(e);
    };

    const hideTooltip = () => {
      tooltip.style.display = "none";
    };

    banner.addEventListener("mouseover", showTooltip);
    banner.addEventListener("mousemove", updateTooltipPosition);
    banner.addEventListener("mouseout", hideTooltip);
    banner.style.cursor = "help";

    // Add banner to tile's image
    modTile.querySelector(".mod-image")?.appendChild(banner);

    // Add warning class to tile for highlighting
    if (status.type === "BROKEN") {
      modTile.classList.add("has-broken-warning");
    }
  }

  // Extend DOM Observer setup
  function setupDOMObserver() {
    let checkTimeout;
    const observer = new MutationObserver((mutations) => {
      // Clear any pending timeout
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }

      // Check if URL has changed
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        hasCheckedCurrentMod = false;
      }

      // Set a new timeout to run checks after mutations have settled
      checkTimeout = setTimeout(() => {
        // Check if we're on a mod page and haven't checked it yet
        const pageTitle = document.querySelector("#pagetitle");
        if (
          pageTitle &&
          !hasCheckedCurrentMod &&
          !document.querySelector(".mod-warning-banner")
        ) {
          checkModStatus();
          hasCheckedCurrentMod = true;
        }

        // Check mod tiles - both on mod pages and search results
        const modTiles = document.querySelectorAll(".mod-tile, .tile");
        modTiles.forEach((tile) => {
          if (!tile.querySelector(".mod-warning-banner")) {
            checkModTileStatus(tile);
          }
        });

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

    // Initial check for search results
    if (window.location.href.includes("/search")) {
      const searchResults = document.querySelectorAll(".mod-tile, .tile");
      searchResults.forEach((tile) => {
        checkModTileStatus(tile);
      });
    }
  }

  // Function to check if a mod matches any keyword rules
  function checkKeywordRules(modStatusData, gameName, modTitle) {
    const gameRules = modStatusData["Keyword Rules"]?.[gameName];
    if (!gameRules) return null;

    // Get all text from breadcrumb categories
    const breadcrumbText = Array.from(
      document.querySelectorAll("#breadcrumb li a, #breadcrumb li")
    )
      .map((el) => el.textContent.trim())
      .join(" ");

    // Get the mod title
    const h1Title =
      document.querySelector("#pagetitle h1")?.textContent.trim() || "";

    // Get any category text
    const categoryText =
      document.querySelector(".category")?.textContent.trim() || "";

    // Combine all text to search through
    const fullText =
      `${breadcrumbText} ${h1Title} ${modTitle} ${categoryText}`.toLowerCase();

    for (const [statusType, rules] of Object.entries(gameRules)) {
      for (const rule of rules) {
        if (fullText.includes(rule.pattern.toLowerCase())) {
          return {
            type: statusType,
            reason: rule.reason,
            color: STATUS_TYPES[statusType]?.color || "#ff0000",
          };
        }
      }
    }
    return null;
  }

  // Modify checkModTileStatus to include keyword checking
  function checkModTileStatus(modTile) {
    const titleLink = modTile.querySelector(".tile-name a");
    if (!titleLink) {
      console.warn("[Debug] Could not find title link in tile");
      return;
    }

    const match = titleLink.href.match(/nexusmods\.com\/([^\/]+)\/mods\/(\d+)/);
    if (!match) {
      console.warn("[Debug] Could not parse game/mod ID from URL");
      return;
    }

    const gameName = match[1];
    const modId = match[2];
    const modTitle = titleLink.textContent.trim();

    // Get category text from tile if available
    const categoryText =
      modTile.querySelector(".category")?.textContent.trim() || "";
    const combinedTitle = `${categoryText} ${modTitle}`;

    console.log(
      "[Debug] Checking mod tile status for game:",
      gameName,
      "mod:",
      modId
    );

    GM_xmlhttpRequest({
      method: "GET",
      url: MOD_STATUS_URL,
      onload: function (response) {
        try {
          const modStatusData = JSON.parse(response.responseText);
          console.log("[Debug] Received mod status data:", modStatusData);

          // First check explicit mod statuses
          const gameStatuses = modStatusData["Mod Statuses"]?.[gameName];
          let foundStatus = null;

          if (gameStatuses) {
            for (const [statusType, modList] of Object.entries(gameStatuses)) {
              if (modList.includes(modId)) {
                foundStatus = statusType;
                break;
              }
            }
          }

          if (foundStatus) {
            // Create base status object
            const indicatorStatus = {
              type: foundStatus,
              reason: `This mod is marked as ${foundStatus.toLowerCase()}`,
              color: STATUS_TYPES[foundStatus]?.color || "#ff0000",
            };

            // Check if we have additional descriptor info
            const modDescriptor =
              modStatusData["Mod Descriptors"]?.[gameName]?.[modId];
            if (modDescriptor) {
              if (modDescriptor.reason)
                indicatorStatus.reason = modDescriptor.reason;
              if (modDescriptor.alternative)
                indicatorStatus.alternative = modDescriptor.alternative;
              if (modDescriptor.url) indicatorStatus.url = modDescriptor.url;
              if (modDescriptor.icon) indicatorStatus.icon = modDescriptor.icon;
            }

            console.log("[Debug] Created indicator status:", indicatorStatus);
            addWarningBannerToTile(modTile, indicatorStatus);
          } else {
            // Check keyword rules if no explicit status was found
            const keywordStatus = checkKeywordRules(
              modStatusData,
              gameName,
              combinedTitle
            );
            if (keywordStatus) {
              console.log("[Debug] Found keyword match:", keywordStatus);
              addWarningBannerToTile(modTile, keywordStatus);
            } else {
              console.log("[Debug] No status found for mod tile");
            }
          }
        } catch (error) {
          console.error("[Debug] Error processing mod tile status:", error);
        }
      },
      onerror: function (error) {
        console.error("[Debug] Error fetching mod tile status:", error);
      },
    });
  }

  // Function to clean permission title
  function cleanPermissionTitle(title) {
    return title
      .replace(" permission", "") // Remove standalone "permission"
      .replace(" in mods/files that", " for files that"); // Clean up the "in mods/files that" phrase
  }

  // Function to filter unwanted permissions
  function shouldIncludePermission(title) {
    const excludedPermissions = [
      "Asset use for files that are being sold",
      "Asset use for files that earn donation points",
      "Asset use permission in mods/files that are being sold",
      "Asset use permission in mods/files that earn donation points",
      "Asset use permission for files that are being sold",
      "Asset use permission for files that earn donation points",
    ];

    const cleanedTitle = cleanPermissionTitle(title);
    return !excludedPermissions.includes(cleanedTitle);
  }

  // Function to fetch permissions from a specific mod page
  function fetchPermissionsFromModPage(modPageUrl) {
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: modPageUrl,
        onload: function (response) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(
            response.responseText,
            "text/html"
          );
          const permissionsList = doc.querySelectorAll(
            ".permissions .permission-no, .permissions .permission-maybe, .permissions .permission-yes"
          );
          const closedPermissions = [];
          let openPermissions = [];
          let customPermissions = [];

          permissionsList.forEach((permission) => {
            const titleElement = permission.querySelector(".permissions-title");
            if (titleElement) {
              const title = titleElement.textContent.trim();
              if (shouldIncludePermission(title)) {
                if (permission.classList.contains("permission-yes")) {
                  openPermissions.push(cleanPermissionTitle(title));
                } else if (permission.classList.contains("permission-no")) {
                  closedPermissions.push(cleanPermissionTitle(title));
                } else {
                  customPermissions.push(cleanPermissionTitle(title));
                }
              }
            }
          });

          resolve({ closedPermissions, openPermissions, customPermissions });
        },
        onerror: function () {
          resolve({
            closedPermissions: [],
            openPermissions: [],
            customPermissions: [],
          });
        },
      });
    });
  }

  // Function to check if current page is a mod page
  function isModPage() {
    return /nexusmods\.com\/[^\/]+\/mods\/\d+/.test(window.location.href);
  }

  // Function to check mod permissions
  async function checkModPermissions() {
    // Only check permissions on mod pages
    if (!isModPage()) {
      return null;
    }

    // Check if the mod has id="nofeature"
    const noFeatureElement = document.getElementById("nofeature");

    // First try to get permissions from current page
    const permissionsList = document.querySelectorAll(
      ".permissions .permission-no, .permissions .permission-maybe, .permissions .permission-yes"
    );
    let closedPermissions = [];
    let openPermissions = [];
    let customPermissions = [];

    if (permissionsList.length === 0) {
      // If no permissions found on current page, fetch from the current mod's description tab
      const currentUrl = window.location.href;
      const descriptionUrl = currentUrl.split("?")[0] + "?tab=description";
      const {
        closedPermissions: fetchedClosedPermissions,
        openPermissions: fetchedOpenPermissions,
        customPermissions: fetchedCustomPermissions,
      } = await fetchPermissionsFromModPage(descriptionUrl);
      closedPermissions = fetchedClosedPermissions;
      openPermissions = fetchedOpenPermissions;
      customPermissions = fetchedCustomPermissions;
    } else {
      // Get permissions from current page
      permissionsList.forEach((permission) => {
        const titleElement = permission.querySelector(".permissions-title");
        if (titleElement) {
          const title = titleElement.textContent.trim();
          if (shouldIncludePermission(title)) {
            if (permission.classList.contains("permission-yes")) {
              openPermissions.push(cleanPermissionTitle(title));
            } else if (permission.classList.contains("permission-no")) {
              closedPermissions.push(cleanPermissionTitle(title));
            } else {
              customPermissions.push(cleanPermissionTitle(title));
            }
          }
        }
      });
    }

    // Add lock icon to permissions header
    const permissionsHeaders = document.querySelectorAll("dt");
    const permissionsHeader = Array.from(permissionsHeaders).find((dt) =>
      dt.textContent.trim().startsWith("Permissions and credits")
    );

    if (permissionsHeader) {
      // Check if we already added a lock icon
      const existingLock = permissionsHeader.querySelector(".permissions-lock");
      if (!existingLock) {
        const lockSpan = document.createElement("span");
        lockSpan.className = "permissions-lock";
        lockSpan.style.marginLeft = "5px";
        lockSpan.style.cursor = "help";

        // Choose icon based on permissions status
        if (closedPermissions.length > 0) {
          lockSpan.textContent = "🔒";
        } else if (
          openPermissions.length > 0 &&
          customPermissions.length === 0
        ) {
          lockSpan.textContent = "🔓";
        } else {
          lockSpan.textContent = "⚖️";
        }

        // Add tooltip handlers
        const showTooltip = (e) => {
          let tooltipText = "";
          if (closedPermissions.length > 0) {
            tooltipText = `This mod has closed or restricted permissions <span style="font-size: 0.85em;">(${closedPermissions.join(
              ", "
            )})</span>`;
          } else if (
            openPermissions.length > 0 &&
            customPermissions.length === 0
          ) {
            tooltipText = `This mod has open permissions <span style="font-size: 0.85em;">(${openPermissions.join(
              ", "
            )})</span>`;
          } else {
            const allPermissions = [...openPermissions, ...customPermissions];
            tooltipText = `This mod has custom permissions <span style="font-size: 0.85em;">(${allPermissions.join(
              ", "
            )})</span>`;
          }
          tooltip.innerHTML = formatTooltipText(tooltipText);
          tooltip.style.display = "block";
          updateTooltipPosition(e);
        };

        const hideTooltip = () => {
          tooltip.style.display = "none";
        };

        lockSpan.addEventListener("mouseover", showTooltip);
        lockSpan.addEventListener("mousemove", updateTooltipPosition);
        lockSpan.addEventListener("mouseout", hideTooltip);

        permissionsHeader.insertBefore(
          lockSpan,
          permissionsHeader.querySelector(".acc-status")
        );
      }
    }

    if (closedPermissions.length > 0) {
      return {
        type: "CLOSED_PERMISSIONS",
        reason: `This mod has closed or restricted permissions <span style="font-style: italic; font-size: 0.85em;">(${closedPermissions.join(
          ", "
        )})</span>.<br>Please consider bullying and harassing this mod author into being <a href="https://www.youtube.com/watch?v=edea7yMqOY8" target="_blank" style="color: inherit; text-decoration: underline;">Cathedral</a>, and perhaps reupload on ModHQ if you are feeling spiteful.`,
        color: STATUS_TYPES.CLOSED_PERMISSIONS.color,
        skipBanner: noFeatureElement ? true : false,
      };
    } else if (openPermissions.length > 0 && customPermissions.length === 0) {
      return {
        type: "OPEN_PERMISSIONS",
        reason: `This mod has open permissions <span style="font-style: italic; font-size: 0.85em;">(${openPermissions.join(
          ", "
        )})</span>`,
        color: STATUS_TYPES.OPEN_PERMISSIONS.color,
        skipBanner: true,
      };
    } else if (permissionsList.length > 0) {
      const allPermissions = [...openPermissions, ...customPermissions];
      return {
        type: "CUSTOM_PERMISSIONS",
        reason: `This mod has custom permissions <span style="font-style: italic; font-size: 0.85em;">(${allPermissions.join(
          ", "
        )})</span>`,
        color: STATUS_TYPES.CUSTOM_PERMISSIONS.color,
        skipBanner: true,
      };
    }
    return null;
  }

  // Create warning tag element
  function createWarningTag(status) {
    const tagLi = document.createElement("li");

    const tagBtn = document.createElement("a");
    tagBtn.className = "btn inline-flex";

    // Use the same background colors as the warning banners
    let bgColor;
    switch (status.type) {
      case "BROKEN":
        bgColor =
          "linear-gradient(45deg, rgba(255, 0, 0, 0.8), rgba(255, 0, 0, 0.9))";
        break;
      case "CLOSED_PERMISSIONS":
      case "LAME":
        bgColor =
          "linear-gradient(45deg, rgba(255, 165, 0, 0.8), rgba(255, 165, 0, 0.9))";
        break;
      case "ABANDONED":
        bgColor =
          "linear-gradient(45deg, rgba(128, 128, 128, 0.8), rgba(128, 128, 128, 0.9))";
        break;
      case "OPEN_PERMISSIONS":
        bgColor =
          "linear-gradient(45deg, rgba(0, 170, 0, 0.8), rgba(0, 170, 0, 0.9))";
        break;
      case "CUSTOM_PERMISSIONS":
        bgColor =
          "linear-gradient(45deg, rgba(136, 136, 136, 0.8), rgba(136, 136, 136, 0.9))";
        break;
      default:
        bgColor =
          "linear-gradient(45deg, rgba(0, 136, 255, 0.8), rgba(0, 136, 255, 0.9))";
    }

    tagBtn.style.cssText = `
      background: ${bgColor};
      border: 1px solid rgba(255, 255, 255, 0.2);
      pointer-events: none;
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    `;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon icon-tag");
    svg.setAttribute("title", "");

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      "https://www.nexusmods.com/assets/images/icons/icons.svg#icon-tag"
    );
    svg.appendChild(use);

    const label = document.createElement("span");
    label.className = "flex-label";
    label.textContent = status.type.replace(/_/g, " ");

    tagBtn.appendChild(svg);
    tagBtn.appendChild(label);
    tagLi.appendChild(tagBtn);

    return tagLi;
  }

  // Function to check if any author has warning labels
  function hasAuthorWarnings() {
    const authorStatusContainers = document.querySelectorAll(
      ".author-status-container"
    );
    return authorStatusContainers.length > 0;
  }

  // Add warning tags to the page
  function addWarningTags(warnings) {
    const tagsContainer = document.querySelector(
      ".sideitem.clearfix .tags span:first-child"
    );
    if (!tagsContainer) {
      console.warn("[Debug] Tags container not found");
      return;
    }

    // Remove any existing warning tags
    const existingWarningTags = tagsContainer.querySelectorAll(
      "li[data-warning-tag]"
    );
    existingWarningTags.forEach((tag) => tag.remove());

    // Check if any author has warnings and add the AUTHOR_SUCKS tag if needed
    if (hasAuthorWarnings()) {
      const badAuthorWarning = {
        type: "AUTHOR_SUCKS",
        reason: "This mod is from an author with warning labels",
        color: "#ff4400",
      };
      warnings.unshift(badAuthorWarning); // Add to beginning of warnings array
    }

    // Add new warning tags at the start of the tags list
    warnings.forEach((warning) => {
      const warningTag = createWarningTag(warning);
      warningTag.setAttribute("data-warning-tag", warning.type);
      tagsContainer.insertBefore(warningTag, tagsContainer.firstChild);
    });
  }

  // Function to add all warnings at once
  function addAllWarnings(warnings) {
    if (!warnings || warnings.length === 0) return;

    // Clear any existing warning banners
    const existingBanners = document.querySelector(".mod-warning-banners");
    if (existingBanners) {
      existingBanners.remove();
    }

    // Add all warnings in order (BROKEN first, then CLOSED_PERMISSIONS, then others)
    warnings
      .filter((warning) => warning && warning.type && !warning.skipBanner) // Don't show banner if skipBanner is true
      .sort((a, b) => {
        if (a.type === "BROKEN") return -1;
        if (b.type === "BROKEN") return 1;
        if (a.type === "CLOSED_PERMISSIONS") return -1;
        if (b.type === "CLOSED_PERMISSIONS") return 1;
        return 0;
      })
      .forEach((warning) => {
        addWarningBanner(warning);
      });

    // Add warning tags for all warnings, including those with skipBanner
    addWarningTags(warnings.filter((warning) => warning && warning.type));
  }

  // Modify checkModStatus to include keyword checking
  async function checkModStatus() {
    const { gameId, modId } = getGameAndModId();
    console.log("[Debug] Checking mod status for game:", gameId, "mod:", modId);

    // Get all text from breadcrumb categories
    const breadcrumbText = Array.from(
      document.querySelectorAll("#breadcrumb li a")
    )
      .map((a) => a.textContent.trim())
      .join(" ");

    // Get the mod title
    const h1Title =
      document.querySelector("#pagetitle h1")?.textContent.trim() || "";

    // Combine all text to search through
    const fullText = `${breadcrumbText} ${h1Title}`;

    // Collect all warnings that apply to this mod
    const warnings = [];

    // Check permissions first
    const permissionsWarning = await checkModPermissions();
    if (permissionsWarning) {
      warnings.push(permissionsWarning);
    }

    // Function to process mod status data
    function processModStatus(modStatusData) {
      if (!modStatusData) {
        addAllWarnings(warnings);
        return;
      }

      console.log("[Debug] Processing mod status data:", modStatusData);

      // Check explicit mod statuses
      const gameStatuses = modStatusData["Mod Statuses"]?.[gameId];
      let foundStatus = null;

      if (gameStatuses) {
        for (const [statusType, modList] of Object.entries(gameStatuses)) {
          if (modList.includes(modId)) {
            foundStatus = statusType;
            break;
          }
        }
      }

      if (foundStatus) {
        // Create base status object
        const indicatorStatus = {
          type: foundStatus,
          reason: `This mod is marked as ${foundStatus.toLowerCase()}`,
          color: STATUS_TYPES[foundStatus]?.color || "#ff0000",
        };

        // Check if we have additional descriptor info
        const modDescriptor =
          modStatusData["Mod Descriptors"]?.[gameId]?.[modId];
        if (modDescriptor) {
          if (modDescriptor.reason)
            indicatorStatus.reason = modDescriptor.reason;
          if (modDescriptor.alternative)
            indicatorStatus.alternative = modDescriptor.alternative;
          if (modDescriptor.url) indicatorStatus.url = modDescriptor.url;
          if (modDescriptor.icon) indicatorStatus.icon = modDescriptor.icon;
        }

        console.log("[Debug] Created indicator status:", indicatorStatus);
        warnings.push(indicatorStatus);
      } else {
        // Check keyword rules if no explicit status was found
        const keywordStatus = checkKeywordRules(
          modStatusData,
          gameId,
          fullText
        );
        if (keywordStatus) {
          console.log("[Debug] Found keyword match:", keywordStatus);
          warnings.push(keywordStatus);
        }
      }

      // Add all collected warnings after we've gathered everything
      addAllWarnings(warnings);
    }

    // Check if we need to fetch fresh data
    if (!isCacheValid()) {
      fetchAndStoreJSON(
        MOD_STATUS_URL,
        STORAGE_KEYS.MOD_STATUS,
        processModStatus
      );
    } else {
      const cachedData = getStoredData(STORAGE_KEYS.MOD_STATUS);
      if (cachedData) {
        processModStatus(cachedData);
      } else {
        fetchAndStoreJSON(
          MOD_STATUS_URL,
          STORAGE_KEYS.MOD_STATUS,
          processModStatus
        );
      }
    }
  }

  // Run when the page loads
  checkModStatus();
  hasCheckedCurrentMod = true;
  checkAuthorStatus();
  setupDOMObserver();
})();
