// ==UserScript==
// @name         RPGHQ - Use Gear Browser on iOS
// @namespace    http://rpghq.org/
// @version      1.1
// @description  Redirects iOS users to use Gear browser for RPGHQ
// @author       You
// @match        https://rpghq.org/*
// @match        https://chat.rpghq.org/*
// @grant        none
// @run-at       document-start
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/ghosted-users/RPGHQ-GearBrowser.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/ghosted-users/RPGHQ-GearBrowser.user.js
// ==/UserScript==

(function () {
  "use strict";

  // Check if user is on iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (isIOS) {
    // Clear everything in the document
    document.documentElement.innerHTML = "";
    document.body = document.createElement("body");

    // Create and style the message container
    const messageContainer = document.createElement("div");
    messageContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #222833;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 20px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        `;

    // Create message content
    const message = document.createElement("h1");
    message.textContent = "Open site in Gear browser";
    message.style.cssText = `
            font-size: 24px;
            margin-bottom: 20px;
        `;

    const subMessage = document.createElement("p");
    subMessage.textContent = "Switch to Gear Browser, dumbass";
    subMessage.style.cssText = `
            font-size: 16px;
            line-height: 1.5;
            max-width: 80%;
            margin: 0 auto;
        `;

    // Assemble the message container
    messageContainer.appendChild(message);
    messageContainer.appendChild(subMessage);

    // Add to the new body
    document.body.appendChild(messageContainer);
  }
})();
