// ==UserScript==
// @name         Fix YouTube Embeds
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Fix YouTube embeds on chat.rpghq.org
// @author       Your Name
// @match        https://chat.rpghq.org/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Function to replace YouTube links with embeds
  function replaceYouTubeLinks() {
    const links = document.querySelectorAll('a[href*="youtube.com/watch"]');
    links.forEach((link) => {
      const url = new URL(link.href);
      const videoId = url.searchParams.get("v");
      if (videoId) {
        const embed = document.createElement("iframe");
        embed.src = `https://www.youtube.com/embed/${videoId}`;
        embed.width = "560";
        embed.height = "315";
        embed.frameBorder = "0";
        embed.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        embed.allowFullscreen = true;

        // Replace the link with the embed
        link.parentNode.replaceChild(embed, link);
      }
    });
  }

  // Run the function on page load
  window.addEventListener("load", replaceYouTubeLinks);

  // Run the function when new messages are added
  const observer = new MutationObserver(replaceYouTubeLinks);
  observer.observe(document.body, { childList: true, subtree: true });
})();