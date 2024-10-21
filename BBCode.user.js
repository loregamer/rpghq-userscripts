// ==UserScript==
// @name         RPGHQ - BBCode Highlighter
// @namespace    http://rpghq.org/
// @version      5.0
// @description  Highlight BBCode tags in the text editor on RPGHQ forum with consistent colors for matching tags
// @author       loregamer
// @match        https://rpghq.org/forums/posting.php?mode=post*
// @match        https://rpghq.org/forums/posting.php?mode=quote*
// @match        https://rpghq.org/forums/posting.php?mode=reply*
// @match        https://rpghq.org/forums/posting.php?mode=edit*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        GM_setValue
// @grant        GM_getValue
// @license     MIT
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/BBCode.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/BBCode.user.js
// ==/UserScript==

/*
MIT License

Copyright (c) 2024 loregamer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function () {
  "use strict";

  window.resizeTextArea = function ($items, options) {
    return;
  };

  // In case the function is defined on the phpbb object
  if (typeof phpbb !== "undefined") {
    phpbb.resizeTextArea = window.resizeTextArea;
  }

  // Simplified customSmileys array
  let customSmileys = [
    "📥",
    "https://f.rpghq.org/ZgRYx3ztDLyD.png?n=cancel_forum.png",
    "https://f.rpghq.org/W5kvLDYCwg8G.png",
    // Add more custom smiley URLs here
  ];

  // Add custom CSS to highlight BBCode tags with multiple colors
  const style = document.createElement("style");
  style.textContent = `
            .bbcode-bracket {
                color: #D4D4D4; /* Light grey */
            }
            .bbcode-tag-0 {
                color: #569CD6; /* Blue */
            }
            .bbcode-tag-1 {
                color: #CE9178; /* Light orange */
            }
            .bbcode-tag-2 {
                color: #DCDCAA; /* Yellow */
            }
            .bbcode-tag-3 {
                color: #C586C0; /* Light purple */
            }
            .bbcode-tag-4 {
                color: #4EC9B0; /* Light green */
            }
            .bbcode-attribute {
                color: #9CDCFE; /* Light blue */
            }
            .bbcode-list-item {
                color: #FFD700; /* Gold color for list items */
            }
            .bbcode-smiley {
                color: #FFD700; /* Gold color for smileys */
            }
            #bbcode-highlight {
                white-space: pre-wrap;
                word-wrap: break-word;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 3; /* Ensure it is above the textarea */
                width: 100%;
                height: 100%;
                overflow: hidden;
                pointer-events: none; /* Allow interaction with textarea */
                box-sizing: border-box;
                padding: 3px;
                font-family: Verdana, Helvetica, Arial, sans-serif;
                font-size: 11px;
                font-style: normal;
                font-variant-caps: normal;
                font-variant-east-asian: normal;
                font-variant-ligatures: normal;
                font-variant-numeric: normal;
                font-weight: 400;
                line-height: 15.4px;
                background-color: transparent; /* Make background transparent */
                color: transparent; /* Make text color transparent */
                transition: all 0.5s ease, height 0.001s linear;
            }
            #message {
                position: relative;
                z-index: 2;
                background: transparent;
                color: rgb(204, 204, 204);
                caret-color: white; /* Change cursor color to white */
                width: 100%;
                height: 100%;
                padding: 3px;
                box-sizing: border-box;
                resize: none;
                overflow: auto;
                font-family: Verdana, Helvetica, Arial, sans-serif;
                font-size: 11px;
                font-style: normal;
                font-variant-caps: normal;
                font-variant-east-asian: normal;
                font-variant-ligatures: normal;
                font-variant-numeric: normal;
                font-weight: 400;
                line-height: 15.4px;
            }
            .editor-container {
                position: relative;
                width: 100%;
                height: auto; /* Allow dynamic height */
            }
            .bbcode-link {
                color: #5D8FBD; /* Light blue */
            }

            .smiley-button {
              display: inline-block;
              justify-content: center;
              align-items: center;
              width: 22px;
              height: 22px;
              margin: 2px;
              text-decoration: none;
              vertical-align: middle;
              line-height: 1;
              overflow: hidden;
            }

            .smiley-button img {
              width: 80%;
              height: 80%;
              object-fit: contain;
            }

            .custom-smiley-container {
              margin-top: 5px;
              margin-bottom: 5px;
            }

            .custom-smiley-button {
              display: inline-block;
              justify-content: center;
              align-items: center;
              width: 22px;
              height: 22px;
              margin: 2px;
              text-decoration: none;
              vertical-align: middle;
              line-height: 1;
              overflow: hidden;
            }

            .custom-smiley-button img {
              max-width: 80%;
              max-height: 80%;
              object-fit: contain;
            }

            .custom-smiley-button:hover {
              text-decoration: none;
            }

            .emoji-smiley {
              font-size: 18px;
              display: flex;
              justify-content: center;
              align-items: center;
              width: 80%;
              height: 80%;
            }

            #smiley-box {
              position: absolute;
              max-height: 80vh; /* Adjust this value as needed */
              width: 17%;
              overflow-y: auto;
              border-radius: 5px;
              z-index: 1000;
            }

            .smiley-group {
              margin-bottom: 10px;
            }

            #smiley-box a {
              color: #5D8FBD; /* Light blue color for links, adjust as needed */
              text-decoration: none;
            }

            #smiley-box a:hover {
              text-decoration: underline;
            }

            #abbc3_buttons.fixed {
              position: fixed;
              top: 0;
              z-index: 1000;
              margin-top: 0;
              padding-top: 0;
              background-color: #3A404A !important;
            }

            .abbc3_buttons_row {
              margin: 0;
              padding: 0;
              background-color: #3A404A !important;
            }

            .abbc3_buttons_row.fixed {
              background-color: #3A404A !important;
              position: fixed;
              top: 0;
              z-index: 1000;
              margin-top: 0;
              padding-top: 0;
            }

            .custom-buttons-container {
              margin-top: 10px;
            }

            .custom-buttons-container button {
              margin: 5px;
            }

            .custom-button {
              margin-bottom: 5px;
              margin-right: 5px;
            }

            .custom-button:hover {
            }

            .smiley-group {
              margin-bottom: 10px;
            }

            .smiley-group-separator {
              margin: 10px 0;
            }

            #smiley-box {
            }

            .smiley-button, .custom-smiley-button {
              display: inline-flex;
              justify-content: center;
              align-items: center;
              width: 22px;
              height: 22px;
              margin: 2px;
              text-decoration: none;
              vertical-align: middle;
              line-height: 1;
              overflow: hidden;
            }

            .smiley-button img, .custom-smiley-button img {
              max-width: 80%;
              max-height: 80%;
              object-fit: contain;
            } 
        `;
  document.head.appendChild(style);

  // Function to get a consistent color index for each tag name
  const tagColorMap = {
    img: 1,
    url: 4,
    color: 3,
    // Add more tag-color mappings as needed
  };
  function getColorIndex(tagName) {
    if (tagName === "*") {
      return "list-item";
    }
    if (!(tagName in tagColorMap)) {
      const colorIndex = Object.keys(tagColorMap).length % 5;
      tagColorMap[tagName] = colorIndex;
    }
    return tagColorMap[tagName];
  }

  function getContrastColor(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "black" : "white";
  }

  function highlightBBCode(text) {
    // First, let's separate code blocks and replace them with placeholders
    const codeBlocks = [];
    text = text.replace(
      /\[code\]([\s\S]*?)\[\/code\]/gi,
      function (match, code) {
        codeBlocks.push(code);
        return `[CODE_PLACEHOLDER_${codeBlocks.length - 1}]`;
      }
    );

    const escapeHTML = (str) =>
      str.replace(
        /[&<>"']/g,
        (m) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[m])
      );

    // Handle smileys
    text = text.replace(/:([a-z0-9-]+):/gi, function (match, smileyName) {
      const customSmiley = customSmileys.find((url) =>
        url.includes(smileyName)
      );
      if (customSmiley) {
        return `<span class="bbcode-smiley" title="${match}"><img src="${customSmiley}" alt="${match}" /></span>`;
      }
      return `<span class="bbcode-smiley">${escapeHTML(match)}</span>`;
    });

    // Handle [img] and [media] tags separately
    text = text.replace(
      /\[(img|media|webm)\](.*?)\[\/\1\]/gi,
      function (match, tagName, url) {
        const colorIndex = getColorIndex(tagName);
        return `<span class="bbcode-bracket">[</span><span class="bbcode-tag-${colorIndex}">${tagName}</span><span class="bbcode-bracket">]</span><span class="bbcode-link">${escapeHTML(
          url
        )}</span><span class="bbcode-bracket">[</span><span class="bbcode-tag-${colorIndex}">/${tagName}</span><span class="bbcode-bracket">]</span>`;
      }
    );

    // Handle [img] and [media] tags with attributes
    text = text.replace(
      /\[(img|media)(\s+[a-z]+=[^\]]+)+\](.*?)\[\/\1\]/gi,
      function (match, tagName, attributes, url) {
        const colorIndex = getColorIndex(tagName);
        return `<span class="bbcode-bracket">[</span><span class="bbcode-tag-${colorIndex}">${tagName}</span><span class="bbcode-attribute">${escapeHTML(
          attributes
        )}</span><span class="bbcode-bracket">]</span><span class="bbcode-link">${escapeHTML(
          url
        )}</span><span class="bbcode-bracket">[</span><span class="bbcode-tag-${colorIndex}">/${tagName}</span><span class="bbcode-bracket">]</span>`;
      }
    );

    // Then, handle the rest of the BBCode tags
    text = text.replace(
      /\[([a-zA-Z0-9*]+)((?:=[^\]]+)?|(?:\s+[a-z]+=[^\]]+)+)?\]|\[\/([a-zA-Z0-9*]+)\]|(https?:\/\/[^\s\]]+)/g,
      function (match, openTag, attribute, closeTag) {
        if (openTag) {
          const colorIndex = getColorIndex(openTag);
          if (openTag.toLowerCase() === "color" && attribute) {
            const colorMatch = attribute.match(/=(#[0-9A-Fa-f]{6})/i);
            if (colorMatch) {
              const hexColor = colorMatch[1];
              return `<span class="bbcode-bracket">[</span><span class="bbcode-tag-${colorIndex}">${escapeHTML(
                openTag
              )}</span><span class="bbcode-attribute">=</span><span class="bbcode-color-preview" style="background-color:${hexColor}; color: ${getContrastColor(
                hexColor
              )};">${escapeHTML(
                hexColor
              )}</span><span class="bbcode-bracket">]</span>`;
            }
          }
          if (openTag === "*") {
            return `<span class="bbcode-bracket">[</span><span class="bbcode-list-item">*</span><span class="bbcode-bracket">]</span>`;
          }
          if (openTag.toLowerCase() === "url" && attribute) {
            const urlMatch = attribute.match(/=(https?:\/\/[^\]]+)/);
            if (urlMatch) {
              return `<span class="bbcode-bracket">[</span><span class="bbcode-tag-${colorIndex}">${escapeHTML(
                openTag
              )}</span><span class="bbcode-attribute">=<span class="bbcode-link">${escapeHTML(
                urlMatch[1]
              )}</span></span><span class="bbcode-bracket">]</span>`;
            }
          }
          if (openTag.toLowerCase() === "smention") {
            return `<span class="bbcode-bracket">[</span><span class="bbcode-tag-smention" style="color: #FFC107;">${escapeHTML(
              openTag
            )}</span>${
              attribute
                ? `<span class="bbcode-attribute">${escapeHTML(
                    attribute
                  )}</span>`
                : ""
            }<span class="bbcode-bracket">]</span>`;
          }
          return `<span class="bbcode-bracket">[</span><span class="bbcode-tag-${colorIndex}">${escapeHTML(
            openTag
          )}</span>${
            attribute
              ? `<span class="bbcode-attribute">${escapeHTML(attribute)}</span>`
              : ""
          }<span class="bbcode-bracket">]</span>`;
        }

        if (closeTag) {
          const colorIndex = getColorIndex(closeTag);
          if (closeTag.toLowerCase() === "smention") {
            return `<span class="bbcode-bracket">[</span><span class="bbcode-tag-smention" style="color: #FFC107;">/${escapeHTML(
              closeTag
            )}</span><span class="bbcode-bracket">]</span>`;
          }
          return `<span class="bbcode-bracket">[</span><span class="bbcode-tag-${colorIndex}">/${escapeHTML(
            closeTag
          )}</span><span class="bbcode-bracket">]</span>`;
        }

        return match;
      }
    );

    // Finally, replace code placeholders with non-highlighted code blocks
    text = text.replace(/\[CODE_PLACEHOLDER_(\d+)\]/g, function (match, index) {
      return `<span class="bbcode-bracket">[</span><span class="bbcode-tag-0">code</span><span class="bbcode-bracket">]</span><span style="color: #2E8B57;">${escapeHTML(
        codeBlocks[index]
      )}</span><span class="bbcode-bracket">[</span><span class="bbcode-tag-0">/code</span><span class="bbcode-bracket">]</span>`;
    });

    return text;
  }

  // Function to adjust textarea and highlight div
  function adjustTextareaAndHighlight() {
    const textArea = document.getElementById("message");
    const highlightDiv = document.getElementById("bbcode-highlight");

    // Adjust textarea height
    textArea.style.height = "auto";
    textArea.style.height = textArea.scrollHeight + "px";

    // Match highlight div to textarea
    highlightDiv.style.width = textArea.offsetWidth + "px";
    highlightDiv.style.height = textArea.offsetHeight + "px";
    highlightDiv.style.padding = window.getComputedStyle(textArea).padding;
    highlightDiv.style.borderWidth =
      window.getComputedStyle(textArea).borderWidth;
    highlightDiv.style.borderStyle =
      window.getComputedStyle(textArea).borderStyle;
    highlightDiv.style.borderColor = "transparent";
    highlightDiv.style.fontFamily =
      window.getComputedStyle(textArea).fontFamily;
    highlightDiv.style.fontSize = window.getComputedStyle(textArea).fontSize;
    highlightDiv.style.lineHeight =
      window.getComputedStyle(textArea).lineHeight;

    // Reposition smiley box
    positionSmileyBox();
    positionEditorHeader();
  }

  function updateHighlight() {
    const textarea = document.getElementById("message");
    const highlightDiv = document.getElementById("bbcode-highlight");
    const content = textarea.value;
    highlightDiv.innerHTML = highlightBBCode(content);
  }

  function wrapSelectedText(textarea, tag) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement;

    if (tag.includes("=")) {
      const [tagName, attribute] = tag.split("=");
      replacement = `[${tagName}=${attribute}]${selectedText}[/${tagName}]`;
    } else {
      replacement = `[${tag}]${selectedText}[/${tag}]`;
    }

    textarea.value =
      textarea.value.substring(0, start) +
      replacement +
      textarea.value.substring(end);

    const newCursorPos = start + tag.length + 2;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  }

  function positionSmileyBox() {
    const smileyBox = document.getElementById("smiley-box");
    const textarea = document.getElementById("message");
    if (smileyBox && textarea) {
      const isMobile = window.innerWidth <= 768; // Adjust this breakpoint as needed

      if (isMobile) {
        // Mobile styling
        smileyBox.style.position = "static";
        smileyBox.style.width = "100%";
        smileyBox.style.maxHeight = "none";
        smileyBox.style.overflowY = "visible";
        smileyBox.style.marginBottom = "10px";
      } else {
        // Desktop styling
        const textareaRect = textarea.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;

        const scrollStartPoint = textareaRect.top + scrollTop;
        const smileyBoxWidth = 220;
        const leftPosition = Math.min(
          textareaRect.right + 10,
          windowWidth - smileyBoxWidth
        );

        if (scrollTop >= scrollStartPoint) {
          const scrollDistance = scrollTop - scrollStartPoint;
          const maxScroll = textarea.offsetHeight - smileyBox.offsetHeight;
          const newTop = Math.min(scrollDistance, maxScroll);

          smileyBox.style.position = "absolute";
          smileyBox.style.top = scrollStartPoint + newTop + "px";
          smileyBox.style.left = leftPosition + "px";
        } else {
          smileyBox.style.position = "absolute";
          smileyBox.style.top = scrollStartPoint + "px";
          smileyBox.style.left = leftPosition + "px";
        }

        // smileyBox.style.width = smileyBoxWidth + "px";
        smileyBox.style.maxHeight = "80vh";
        smileyBox.style.overflowY = "auto";
      }
    }
  }

  function positionEditorHeader() {
    const editorHeader = document.getElementById("abbc3_buttons");
    const textarea = document.getElementById("message");
    if (editorHeader && textarea) {
      const textareaRect = textarea.getBoundingClientRect();
      const headerRect = editorHeader.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // Calculate the offset between the header and the textarea
      const offset = headerRect.top - textareaRect.top;

      // Define the point at which the header should start scrolling
      const scrollStartPoint = textareaRect.top + scrollTop - offset;

      if (scrollTop >= scrollStartPoint) {
        if (!editorHeader.classList.contains("fixed")) {
          editorHeader.classList.add("fixed");
          // Add a placeholder to prevent content jump
          const placeholder = document.createElement("div");
          placeholder.style.height = editorHeader.offsetHeight + "px";
          placeholder.id = "abbc3_buttons_placeholder";
          editorHeader.parentNode.insertBefore(placeholder, editorHeader);
        }
        // Match the width of the textarea for the header
        editorHeader.style.width = textarea.offsetWidth + "px";
        editorHeader.style.left = textareaRect.left + "px";
        editorHeader.style.top = "0px"; // Ensure it's at the very top

        // Set the width and position for each row
        const editorRows = editorHeader.querySelectorAll(".abbc3_buttons_row");
        let cumulativeHeight = 0;
        editorRows.forEach((row, index) => {
          row.style.width = textarea.offsetWidth + "px";
          row.classList.add("fixed");
          row.style.top = cumulativeHeight + "px";
          row.style.position = "fixed";
          cumulativeHeight += row.offsetHeight;
        });
      } else {
        if (editorHeader.classList.contains("fixed")) {
          editorHeader.classList.remove("fixed");
          editorHeader.style.width = "";
          editorHeader.style.left = "";
          editorHeader.style.top = "";
          // Remove the placeholder
          const placeholder = document.getElementById(
            "abbc3_buttons_placeholder"
          );
          if (placeholder) {
            placeholder.parentNode.removeChild(placeholder);
          }

          // Reset the styles for each row
          const editorRows =
            editorHeader.querySelectorAll(".abbc3_buttons_row");
          editorRows.forEach((row) => {
            row.style.width = "";
            row.style.top = "";
            row.style.position = "";
            row.classList.remove("fixed");
          });
        }
      }
    }
  }

  function insertSmiley(smiley) {
    const textarea = document.getElementById("message");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop; // Store the current scroll position
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const insertText = smiley.startsWith("http")
      ? `[img]${smiley}[/img]`
      : smiley;

    // Insert the smiley
    textarea.value = before + insertText + after;

    // Set the cursor position after the inserted smiley
    const newCursorPos = start + insertText.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);

    // Restore the scroll position
    textarea.scrollTop = scrollTop;

    // Maintain focus on the textarea
    textarea.focus();

    // Update the highlight and adjust textarea size
    updateHighlight();
    adjustTextareaAndHighlight();
  }

  function addCustomSmileyButtons() {
    const smileyBox = document.getElementById("smiley-box");
    if (smileyBox) {
      // Hide the "Topic review" link
      const topicReviewLink = smileyBox.querySelector('a[href="#review"]');
      if (topicReviewLink) {
        topicReviewLink.parentElement.style.display = "none";
      }

      const viewMoreLink = smileyBox.querySelector('a[href*="mode=smilies"]');

      // Group existing smileys
      const existingSmileys = smileyBox.querySelectorAll(
        'a[onclick^="insert_text"]'
      );
      const groupedSmileys = {};

      existingSmileys.forEach((smiley) => {
        const imgSrc = smiley.querySelector("img").src;
        const directory = imgSrc.split("/").slice(0, -1).join("/");
        if (!groupedSmileys[directory]) {
          groupedSmileys[directory] = [];
        }
        groupedSmileys[directory].push(smiley);
      });

      // Clear existing smileys
      existingSmileys.forEach((smiley) => smiley.remove());

      // Create containers for grouped smileys
      let isFirstGroup = true;
      for (const [directory, smileys] of Object.entries(groupedSmileys)) {
        if (!isFirstGroup) {
          // Add a horizontal line between groups (except before the first group)
          const groupSeparator = document.createElement("hr");
          groupSeparator.className = "smiley-group-separator";
          smileyBox.insertBefore(groupSeparator, viewMoreLink);
        }
        isFirstGroup = false;

        const groupContainer = document.createElement("div");
        groupContainer.className = "smiley-group";

        smileys.forEach((smiley) => {
          const newSmiley = document.createElement("a");
          newSmiley.href = "#";
          newSmiley.className = "smiley-button";
          newSmiley.onclick = smiley.onclick;
          const img = smiley.querySelector("img");
          newSmiley.innerHTML = `<img src="${img.src}" alt="${img.alt}" title="${img.title}">`;
          groupContainer.appendChild(newSmiley);
        });

        smileyBox.insertBefore(groupContainer, viewMoreLink);
      }

      // Handle custom smileys
      let customSmileyContainer = smileyBox.querySelector(
        ".custom-smiley-container"
      );
      let customSmileyHr = smileyBox.querySelector(".custom-smiley-separator");

      if (customSmileys.length > 0) {
        // Add a horizontal line before custom smileys if it doesn't exist
        if (!customSmileyHr) {
          customSmileyHr = document.createElement("hr");
          customSmileyHr.className = "custom-smiley-separator";
          smileyBox.insertBefore(customSmileyHr, viewMoreLink);
        }

        // Create or update the container for custom smileys
        if (!customSmileyContainer) {
          customSmileyContainer = document.createElement("div");
          customSmileyContainer.className = "custom-smiley-container";
          smileyBox.insertBefore(customSmileyContainer, viewMoreLink);
        } else {
          customSmileyContainer.innerHTML = ""; // Clear existing custom smileys
        }

        // Add custom smileys
        for (const smiley of customSmileys) {
          const smileyButton = document.createElement("a");
          smileyButton.href = "#";
          smileyButton.className = "custom-smiley-button";
          if (smiley.startsWith("http")) {
            smileyButton.innerHTML = `<img src="${smiley}" alt="Custom Smiley" title="Custom Smiley">`;
          } else {
            smileyButton.innerHTML = `<span class="emoji-smiley">${smiley}</span>`;
          }
          smileyButton.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation(); // Stop event bubbling
            insertSmiley(smiley);
          });

          customSmileyContainer.appendChild(smileyButton);
        }

        // Add responsive styling
        const responsiveStyle = document.createElement("style");
        responsiveStyle.textContent = `
          @media (max-width: 768px) {
            #smiley-box {
              position: static !important;
              width: 100% !important;
              max-height: none !important;
              overflow-y: visible !important;
              margin-bottom: 10px;
            }
            .smiley-button, .custom-smiley-button {
              width: 36px;
              height: 36px;
            }
            .smiley-button img, .custom-smiley-button img {
              width: 30px;
              height: 30px;
            }
            .emoji-smiley {
              font-size: 24px;
            }
          }
        `;
        document.head.appendChild(responsiveStyle);
      } else {
        // Remove custom smiley container and separator if no custom smileys exist
        if (customSmileyContainer) customSmileyContainer.remove();
        if (customSmileyHr) customSmileyHr.remove();
      }
    }
  }

  function addCustomButtons() {
    const smileyBox = document.getElementById("smiley-box");
    if (smileyBox) {
      const bbcodeStatus = smileyBox.querySelector(".bbcode-status");
      const usernameElement = document.querySelector(".username-coloured");
      const isLoregamer =
        usernameElement && usernameElement.textContent.trim() === "loregamer";

      if (bbcodeStatus) {
        bbcodeStatus.innerHTML = `
          <hr />
          <button
            type="button"
            class="button button-secondary custom-button"
            id="insert-mod-template"
          >
            Insert Mod Template
          </button>
          <button
            type="button"
            class="button button-secondary custom-button"
            id="insert-table"
          >
            Insert Table
          </button>
          <button
            type="button"
            class="button button-secondary custom-button"
            id="ping-bloomery"
            style="display: ${isLoregamer ? "inline-block" : "none"};"
          >
            Ping Bloomery
          </button>
        `;

        document
          .getElementById("insert-mod-template")
          .addEventListener("click", function (e) {
            e.preventDefault();
            insertModTemplate();
          });
        document
          .getElementById("insert-table")
          .addEventListener("click", function (e) {
            e.preventDefault();
            insertTable();
          });
        document
          .getElementById("ping-bloomery")
          .addEventListener("click", function (e) {
            e.preventDefault();
            insertBloomeryPing();
          });

        document.head.appendChild(style);
      }
    }
  }

  function insertModTemplate() {
    const template = `[align=center][img] MOD IMAGE URL HERE [/img][/align]


[hr]


[size=150][b][color=#FE545D] Overview [/color][/b][/size]
MOD DESCRIPTION HERE


[hr]


[size=150][b][color=#FE545D] Downloads [/color][/b][/size]
| Files | Version | Type | Description |
|-------|-----------|-------|---------------|
|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |
|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |
|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |
|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |


[hr]


[size=150][b][color=#FE545D] Installation Instructions [/color][/b][/size]
[list=1]
[*] Instruction Number 1
[*] Instruction Number 2
[*] Instruction Number 3
[/list]


[hr]


[size=150][b][color=#FE545D] Changelog [/color][/b][/size]
[spoiler]
[b]VERSION NUMBER HERE[/b]
[list]
[*] CHANGE HERE
[*] CHANGE HERE
[*] CHANGE HERE
[/list]

[b]VERSION NUMBER HERE[/b]
[list]
[*] CHANGE HERE
[*] CHANGE HERE
[*] CHANGE HERE
[/list]
[/spoiler]


[hr]


[size=150][b][color=#FE545D] To Do [/color][/b][/size]
[list]
[*] TO DO
[*] TO DO
[*] TO DO
[/list]


[hr]

[size=150][b][color=#FE545D] Reporting Bugs [/color][/b][/size]
To report any bugs, please submit a post in the [url=https://rpghq.org/forums/posting.php?mode=post&f=40]Mod Support section[/url] and mention my username.


[hr]


[size=150][b][color=#FE545D]Credits[/color][/b][/size]
[list]
[*] CREDIT
[*] CREDIT
[*] CREDIT
[/list]


[hr]


[size=150][b][color=#FE545D] My Other Mods [/color][/b][/size]
[list]
[*] [url=MOD URL] MOD NAME [/url]
[*] [url=MOD URL] MOD NAME [/url]
[*] [url=MOD URL] MOD NAME [/url]
[*] [url=MOD URL] MOD NAME [/url]
[*] [url=MOD URL] MOD NAME [/url]
[/list]


[hr]
`;
    insertTextAtCursor(template);
  }

  function insertTable() {
    const table = `| Files | Version | Type | Description |
|-------|-----------|-------|---------------|
|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |
|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |
|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |
|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |
`;

    insertTextAtCursor(table);
  }

  function insertBloomeryPing() {
    const pingText = `[smention]Bloomery[/smention]
    [size=1] [smention u=459][/smention] [smention u=510][/smention] [smention u=897][/smention] [smention u=515][/smention] [smention u=548][/smention] [smention u=555][/smention] [smention u=615][/smention] [smention u=753][/smention] [smention u=918][/smention] [smention u=919][/smention] [smention u=3114][/smention] [smention u=58][/smention] [smention u=256][/smention] [smention u=63][/smention]  [/size]`;

    insertTextAtCursor(pingText);
  }

  function insertTextAtCursor(text) {
    const textarea = document.getElementById("message");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop; // Store the current scroll position
    const textBefore = textarea.value.substring(0, start);
    const textAfter = textarea.value.substring(end);

    // Insert the text
    textarea.value = textBefore + text + textAfter;

    // Set the cursor position after the inserted text
    const newCursorPos = start + text.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);

    // Restore the scroll position
    textarea.scrollTop = scrollTop;

    // Maintain focus on the textarea
    textarea.focus();

    // Update the highlight and adjust textarea size
    updateHighlight();
    adjustTextareaAndHighlight();
  }

  function showCustomSmileysPopup(event) {
    event.preventDefault();

    // Create popup container
    const popup = document.createElement("div");
    popup.id = "custom-smileys-popup";
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #2a2e36;
      border: 1px solid #3a3f4b;
      border-radius: 5px;
      width: 80%;
      max-width: 600px;
      height: 80%;
      max-height: 600px;
      display: flex;
      flex-direction: column;
      z-index: 9999;
      font-family: 'Open Sans', 'Droid Sans', Arial, Verdana, sans-serif;
    `;

    // Create header
    const header = document.createElement("div");
    header.style.cssText = `
      padding: 20px;
      background-color: #2a2e36;
      border-bottom: 1px solid #3a3f4b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1;
    `;

    const title = document.createElement("h2");
    title.textContent = "Manage Custom Smileys";
    title.style.margin = "0";
    title.style.color = "#c5d0db";

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.cssText = `
      background-color: #4a5464;
      color: #c5d0db;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    `;
    closeButton.onclick = (e) => {
      e.preventDefault();
      document.body.removeChild(popup);
    };

    header.appendChild(title);
    header.appendChild(closeButton);

    // Create content
    const content = document.createElement("div");
    content.style.cssText = `
    padding: 20px;
    overflow-y: auto;
    flex-grow: 1;
  `;

    const smileyList = document.createElement("ul");
    smileyList.style.cssText = `
    list-style-type: none;
    padding: 0;
    margin: 0;
  `;

    function updateSmileyList() {
      smileyList.innerHTML = "";

      customSmileys.forEach((smiley, index) => {
        const listItem = document.createElement("li");
        listItem.style.cssText = `
        margin-bottom: 10px;
        display: flex;
        align-items: center;
      `;

        if (isSingleEmoji(smiley)) {
          const emojiSpan = document.createElement("span");
          emojiSpan.textContent = smiley;
          emojiSpan.style.fontSize = "18px";
          emojiSpan.style.marginRight = "10px";
          listItem.appendChild(emojiSpan);
        } else {
          const smileyPreview = document.createElement("img");
          smileyPreview.src = smiley;
          smileyPreview.alt = "Smiley";
          smileyPreview.style.cssText = `
          width: 20px;
          height: 20px;
          margin-right: 10px;
        `;
          listItem.appendChild(smileyPreview);
        }

        const smileyInput = document.createElement("input");
        smileyInput.type = "text";
        smileyInput.value = smiley;
        smileyInput.disabled = true;
        smileyInput.style.cssText = `
        flex-grow: 1;
        margin-right: 10px;
        padding: 5px;
        background-color: #2a2e36;
        color: #a0a0a0;
        border: 1px solid #3a3f4b;
        border-radius: 3px;
        cursor: default;
      `;

        const buttonStyle = `
        background-color: #4a5464;
        color: #c5d0db;
        border: none;
        padding: 5px 10px;
        margin-left: 5px;
        border-radius: 3px;
        cursor: pointer;
      `;

        const upButton = document.createElement("button");
        upButton.textContent = "↑";
        upButton.style.cssText = buttonStyle;
        upButton.onclick = () => {
          if (index > 0) {
            [customSmileys[index - 1], customSmileys[index]] = [
              customSmileys[index],
              customSmileys[index - 1],
            ];
            saveCustomSmileys();
            updateSmileyList();
          }
        };

        const downButton = document.createElement("button");
        downButton.textContent = "↓";
        downButton.style.cssText = buttonStyle;
        downButton.onclick = () => {
          if (index < customSmileys.length - 1) {
            [customSmileys[index], customSmileys[index + 1]] = [
              customSmileys[index + 1],
              customSmileys[index],
            ];
            saveCustomSmileys();
            updateSmileyList();
          }
        };

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.style.cssText = buttonStyle;
        removeButton.onclick = () => {
          customSmileys.splice(index, 1);
          saveCustomSmileys();
          updateSmileyList();
        };

        listItem.appendChild(smileyInput);
        listItem.appendChild(upButton);
        listItem.appendChild(downButton);
        listItem.appendChild(removeButton);

        smileyList.appendChild(listItem);
      });
    }

    content.appendChild(smileyList);

    // Add new smiley input
    const newSmileyInput = document.createElement("input");
    newSmileyInput.type = "text";
    newSmileyInput.placeholder = "Enter new smiley or emoji and press Enter";
    newSmileyInput.style.cssText = `
    margin-top: 15px;
    padding: 5px;
    background-color: #3a3f4b;
    color: #c5d0db;
    border: 1px solid #4a5464;
    border-radius: 3px;
  `;

    newSmileyInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (newSmileyInput.value.trim()) {
          customSmileys.push(newSmileyInput.value.trim());
          saveCustomSmileys();
          newSmileyInput.value = "";
          updateSmileyList();
        }
      }
    });

    content.appendChild(newSmileyInput);

    // Initial update of smiley list
    updateSmileyList();

    // Assemble popup
    popup.appendChild(header);
    popup.appendChild(content);
    document.body.appendChild(popup);
  }

  function isSingleEmoji(str) {
    const emojiRegex =
      /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])$/;
    return emojiRegex.test(str);
  }

  // Add this function to save custom smileys
  function saveCustomSmileys() {
    GM_setValue("customSmileys", JSON.stringify(customSmileys));
    addCustomSmileyButtons(); // Refresh the smiley buttons
  }

  function initialize() {
    const textArea = document.getElementById("message");
    if (textArea) {
      // Wrap the original textarea with a container div
      const container = document.createElement("div");
      container.className = "editor-container";

      // Create the highlightDiv
      const highlightDiv = document.createElement("div");
      highlightDiv.id = "bbcode-highlight";

      // Replace the original textarea with the container
      textArea.parentNode.replaceChild(container, textArea);

      // Append the highlightDiv and the original textarea to the container
      container.appendChild(highlightDiv);
      container.appendChild(textArea);

      // Set the style for the textarea
      textArea.style.overflow = "hidden";
      textArea.style.resize = "none";
      textArea.style.minHeight = "500px"; // Set a minimum height

      // Additional styles to match the new textarea
      textArea.style.position = "relative";
      textArea.style.zIndex = "2";
      textArea.style.background = "transparent";
      textArea.style.color = "rgb(204, 204, 204)";
      textArea.style.caretColor = "white";
      textArea.style.width = "100%";
      textArea.style.height = "100%";
      textArea.style.padding = "3px";
      textArea.style.boxSizing = "border-box";
      textArea.style.resize = "none";
      textArea.style.overflow = "auto";
      textArea.style.fontFamily = "Verdana, Helvetica, Arial, sans-serif";
      textArea.style.fontSize = "11px";
      textArea.style.fontStyle = "normal";
      textArea.style.fontVariantCaps = "normal";
      textArea.style.fontVariantEastAsian = "normal";
      textArea.style.fontVariantLigatures = "normal";
      textArea.style.fontVariantNumeric = "normal";
      textArea.style.fontWeight = "400";
      textArea.style.lineHeight = "15.4px";

      textArea.addEventListener("keydown", function (e) {
        if (e.ctrlKey) {
          let tag = "";
          if (e.key === "b") tag = "b";
          else if (e.key === "i") tag = "i";
          else if (e.key === "u") tag = "u";

          if (tag) {
            e.preventDefault();
            wrapSelectedText(this, tag);
            updateHighlight();
            adjustTextareaAndHighlight();
          }
        }

        if (e.altKey && e.key === "g") {
          e.preventDefault();
          wrapSelectedText(this, "color=#80BF00");
          updateHighlight();
          adjustTextareaAndHighlight();
        }
      });

      let lastContent = "";
      let updateTimer = null;

      const storedSmileys = GM_getValue("customSmileys");
      if (storedSmileys) {
        customSmileys = JSON.parse(storedSmileys);
      }

      const smileyBox = document.getElementById("smiley-box");
      if (smileyBox) {
        const manageButton = document.createElement("button");
        manageButton.textContent = "Manage Custom Smileys";
        manageButton.style.cssText = `
      margin-top: 10px;
      background-color: #4a5464;
      color: #c5d0db;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    `;
        manageButton.onclick = showCustomSmileysPopup;
        smileyBox.appendChild(manageButton);
      }

      function checkForUpdates() {
        const currentContent = textArea.value;
        if (currentContent !== lastContent) {
          updateHighlight();
          adjustTextareaAndHighlight();
          lastContent = currentContent;
        }
        updateTimer = setTimeout(checkForUpdates, 100); // Check every 100ms
      }

      textArea.addEventListener("input", function () {
        clearTimeout(updateTimer);
        checkForUpdates();
      });

      window.addEventListener("resize", adjustTextareaAndHighlight);

      // Initial adjustment and highlight
      adjustTextareaAndHighlight();
      updateHighlight();
      lastContent = textArea.value;

      // Start checking for updates
      checkForUpdates();

      // Add custom smiley buttons
      addCustomSmileyButtons();

      // Add custom buttons
      addCustomButtons();

      // Position the smiley box and editor header initially
      positionSmileyBox();
      positionEditorHeader();

      // Create the container for the Open Vault link
      const vaultContainer = document.createElement("div");
      vaultContainer.style.marginTop = "10px";

      // Create the Open Vault link
      const vaultLink = document.createElement("a");
      vaultLink.href = "javascript:void(0);";
      vaultLink.style.color = "rgb(58, 128, 234)";
      vaultLink.style.fontSize = "1em";
      vaultLink.style.display = "inline-flex";
      vaultLink.style.alignItems = "center";
      vaultLink.style.textDecoration = "none";
      vaultLink.innerHTML = `
      <img src="https://f.rpghq.org/V4gHDnvTTgpf.webp" width="16" height="16" style="margin-right: 5px;">
      Open Vault
    `;
      vaultLink.onclick = function (e) {
        e.preventDefault();
        window.open(
          "https://vault.rpghq.org/",
          "RPGHQVault",
          "width=800,height=800,resizable=yes,scrollbars=yes"
        );
      };

      // Add the link to the container
      vaultContainer.appendChild(vaultLink);

      // Insert the container after the textarea
      textArea.parentNode.insertBefore(vaultContainer, textArea.nextSibling);

      // Add event listeners for repositioning
      window.addEventListener("resize", function () {
        positionSmileyBox();
        positionEditorHeader();
      });
      window.addEventListener("scroll", function () {
        positionSmileyBox();
        positionEditorHeader();
      });
    } else {
      setTimeout(initialize, 500);
    }
  }

  // Run the initialize function on page load
  window.addEventListener("load", function () {
    initialize();
  });
})();
