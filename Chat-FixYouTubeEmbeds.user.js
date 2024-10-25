// ==UserScript==
// @name         Fix YouTube Embeds
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Fix YouTube embeds on chat.rpghq.org
// @author       Your Name
// @match        https://chat.rpghq.org/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function fixYouTubeEmbeds() {
    const brokenEmbeds = document.querySelectorAll(
      'div.prxiv40 img[alt*="YouTube"]'
    );
    brokenEmbeds.forEach((img) => {
      let embedContainer = img.closest("div.prxiv40");
      if (embedContainer) {
        const link = embedContainer.querySelector(
          'a[href*="youtube.com/watch"]'
        );
        if (link) {
          const url = new URL(link.href);
          const videoId = url.searchParams.get("v");
          if (videoId) {
            // Create new embed
            const embed = document.createElement("iframe");
            embed.src = `https://www.youtube.com/embed/${videoId}`;
            embed.width = "320";
            embed.height = "180";
            embed.frameBorder = "0";
            embed.allow =
              "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            embed.allowFullscreen = true;

            // Replace content of the embed container
            embedContainer.innerHTML = "";
            embedContainer.appendChild(embed);
            embedContainer.style.display = "flex";
            embedContainer.style.justifyContent = "center";
            embedContainer.style.alignItems = "center";
            embedContainer.style.padding = "10px 0";
          }
        }
      }
    });
  }

  // Run the function on page load
  window.addEventListener("load", fixYouTubeEmbeds);

  // Run the function when new messages are added
  const observer = new MutationObserver(fixYouTubeEmbeds);
  observer.observe(document.body, { childList: true, subtree: true });
})();
