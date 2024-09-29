// ==UserScript==
// @name         RPGHQ - No Lazy Loading
// @version      1.1
// @description  Disable lazy loading for images on rpghq.org and scroll to specific posts after full page load
// @match        https://rpghq.org/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @license     MIT
// @updateURL    https://raw.githubusercontent.com/loregamer/rpghq-userscripts/main/NoLazyLoading.user.js
// @downloadURL  https://raw.githubusercontent.com/loregamer/rpghq-userscripts/main/NoLazyLoading.user.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Function to disable lazy loading for all images
  function disableLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach((img) => {
      img.loading = "eager";
      if (img.dataset.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
    });
  }

  // Function to scroll to a specific post
  function scrollToPost() {
    const postMatch = window.location.href.match(/p(\d+)/);

    if (postMatch) {
      const postId = postMatch[1];
      const postElement = document.getElementById(`p${postId}`);

      if (postElement) {
        setTimeout(() => {
          const headerHeight = document.querySelector("header").offsetHeight;
          const yOffset =
            postElement.getBoundingClientRect().top +
            window.pageYOffset -
            headerHeight;
          window.scrollTo({ top: yOffset, behavior: "smooth" });
        }, 1000); // 1 second delay
      }
    }
  }

  // Run disableLazyLoading immediately
  disableLazyLoading();

  // Use a MutationObserver to handle dynamically loaded content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        disableLazyLoading();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Wait for the window to fully load before scrolling to the post
  window.addEventListener("load", function () {
    scrollToPost();
  });
})();
