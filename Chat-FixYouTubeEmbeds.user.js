// ==UserScript==
// @name         RPHGQ Chat - Fix YouTube Embeds
// @namespace    http://tampermonkey.net/
// @version      1.2
// @icon         https://www.youtube.com/favicon.ico
// @description  Fix YouTube embeds on chat.rpghq.org
// @author       loregamer
// @match        https://chat.rpghq.org/*
// @updateURL    https://github.com/loregamer/RPHGQ-Chat-FixYouTubeEmbeds/raw/main/Chat-FixYouTubeEmbeds.user.js
// @downloadURL https://github.com/loregamer/RPHGQ-Chat-FixYouTubeEmbeds/raw/main/Chat-FixYouTubeEmbeds.user.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function fixYouTubeEmbeds() {
    const embedContainers = document.querySelectorAll(
      "div.prxiv40._1mqalmd1._1mqalmd0.prxiv41.prxiv41t._1pb2z300"
    );

    embedContainers.forEach((container) => {
      const link = container.querySelector('a[href*="youtu"]');
      if (link) {
        const url = new URL(link.href);
        let videoId;

        if (url.pathname.includes("/watch")) {
          videoId = url.searchParams.get("v");
        } else if (url.pathname.includes("/shorts/")) {
          videoId = url.pathname.split("/shorts/")[1].split("?")[0];
        } else if (url.hostname === "youtu.be") {
          videoId = url.pathname.slice(1).split("?")[0];
        }

        if (videoId) {
          const embed = document.createElement("iframe");
          embed.src = `https://www.youtube.com/embed/${videoId}`;
          embed.width = "480";
          embed.height = "270";
          embed.frameBorder = "0";
          embed.allow =
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
          embed.allowFullscreen = true;

          const scrollContainer = document.querySelector(
            "div._4yxtfd2._1mqalmd1._1mqalmd0._4yxtfd4._4yxtfdc._4yxtfdg._4yxtfdi._4yxtfdn"
          );
          const scrollBottom = scrollContainer
            ? scrollContainer.scrollHeight -
              scrollContainer.scrollTop -
              scrollContainer.clientHeight
            : 0;

          container.innerHTML = "";
          container.appendChild(embed);

          container.className = "";
          container.style.display = "flex";
          container.style.justifyContent = "center";
          container.style.alignItems = "center";

          if (scrollContainer && scrollBottom < 10) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }
      }
    });
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function setupObservers() {
    const debouncedFixEmbeds = debounce(fixYouTubeEmbeds, 100);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          debouncedFixEmbeds();
        }
      },
      { subtree: true, childList: true }
    );

    intersectionObserver.observe(document.body);

    const mutationObserver = new MutationObserver((mutations) => {
      if (
        mutations.some(
          (mutation) =>
            mutation.type === "childList" && mutation.addedNodes.length > 0
        )
      ) {
        debouncedFixEmbeds();
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  function initializeScript() {
    fixYouTubeEmbeds();
    setupObservers();
  }

  initializeScript();
})();
