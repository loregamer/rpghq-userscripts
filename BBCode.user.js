// ==UserScript==
// @name         RPGHQ - BBCode Highlighter
// @namespace    http://rpghq.org/
// @version      4.3
// @description  Highlight BBCode tags in the text editor on RPGHQ forum with consistent colors for matching tags
// @author       loregamer
// @match        https://rpghq.org/forums/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        none
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

  // Simplified customSmileys array
  const customSmileys = [
    "📥",
    "https://f.rpghq.org/ZCwL8DUzfCeg.png?n=pepe-classy.png",
    "https://f.rpghq.org/1O52kDUFh8s5.png?n=nexus.png",
    "https://f.rpghq.org/5Niz8ii3t0cN.png?n=HQ%20Official.png",
    "https://f.rpghq.org/ZgRYx3ztDLyD.png?n=cancel_forum.png",
    "https://f.rpghq.org/W5kvLDYCwg8G.png",
    "https://f.rpghq.org/Ww4ZA0bBUxKL.png?n=lorecoffee.png",
    "https://f.rpghq.org/bZCN2SzMvb9G.png?n=vault-boy-sad.png",
    "https://f.rpghq.org/sxb076pVcR8l.png?n=grr.png",
    "https://f.rpghq.org/AhUt723RJSgS.png?n=mhm.png",
    "https://f.rpghq.org/FzMC7rrQZBh0.gif?n=waving.gif",
    "https://f.rpghq.org/2cuorF4EWm0a.png?n=copium.png",
    "https://f.rpghq.org/GsWJAucvHZpr.png?n=joe-handshake.png",
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
              padding: 10px;
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
      /\[(img|media)\](.*?)\[\/\1\]/gi,
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
    const newTextarea = document.getElementById("message");
    const highlightDiv = document.getElementById("bbcode-highlight");

    // Adjust textarea height
    newTextarea.style.height = "auto";
    newTextarea.style.height = newTextarea.scrollHeight + "px";

    // Match highlight div to textarea
    highlightDiv.style.width = newTextarea.offsetWidth + "px";
    highlightDiv.style.height = newTextarea.offsetHeight + "px";
    highlightDiv.style.padding = window.getComputedStyle(newTextarea).padding;
    highlightDiv.style.borderWidth =
      window.getComputedStyle(newTextarea).borderWidth;
    highlightDiv.style.borderStyle =
      window.getComputedStyle(newTextarea).borderStyle;
    highlightDiv.style.borderColor = "transparent";
    highlightDiv.style.fontFamily =
      window.getComputedStyle(newTextarea).fontFamily;
    highlightDiv.style.fontSize = window.getComputedStyle(newTextarea).fontSize;
    highlightDiv.style.lineHeight =
      window.getComputedStyle(newTextarea).lineHeight;

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
    const replacement = `[${tag}]${selectedText}[/${tag}]`;
    textarea.value =
      textarea.value.substring(0, start) +
      replacement +
      textarea.value.substring(end);
    textarea.setSelectionRange(
      start + tag.length + 2,
      start + replacement.length - tag.length - 3
    );
  }

  function positionSmileyBox() {
    const smileyBox = document.getElementById("smiley-box");
    const textarea = document.getElementById("message");
    if (smileyBox && textarea) {
      const textareaRect = textarea.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // Define the point at which the smiley box should start scrolling
      const scrollStartPoint = textareaRect.top + scrollTop;

      // Calculate the left position to avoid overlap
      const smileyBoxWidth = 220; // Width of the smiley box plus some padding
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
      // Find the "View more smilies" link
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
          const hr = document.createElement("hr");
          hr.className = "smiley-group-separator";
          smileyBox.insertBefore(hr, viewMoreLink);
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

      // Add a horizontal line before custom smileys
      const customSmileyHr = document.createElement("hr");
      customSmileyHr.className = "smiley-group-separator";
      smileyBox.insertBefore(customSmileyHr, viewMoreLink);

      // Create a container for custom smileys
      const customSmileyContainer = document.createElement("div");
      customSmileyContainer.className = "custom-smiley-container";

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

      // Insert the custom smiley container before the "View more smilies" link
      if (viewMoreLink) {
        smileyBox.insertBefore(customSmileyContainer, viewMoreLink);
      } else {
        // If the "View more smilies" link is not found, append to the end
        smileyBox.appendChild(customSmileyContainer);
      }
    }
  }

  function addCustomButtons() {
    const smileyBox = document.getElementById("smiley-box");
    if (smileyBox) {
      const bbcodeStatus = smileyBox.querySelector(".bbcode-status");
      if (bbcodeStatus) {
        bbcodeStatus.innerHTML = `
            <hr>
          <button type="button" class="button button-secondary custom-button" id="insert-mod-template">Insert Mod Template</button>
          <button type="button" class="button button-secondary custom-button" id="insert-table">Insert Table</button>
          <button type="button" class="button button-secondary custom-button" id="ping-bloomery">Ping Bloomery</button>
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

  function initialize() {
    const originalTextarea = document.getElementById("message");
    if (originalTextarea) {
      // Create a new textarea element
      const newTextarea = document.createElement("textarea");
      newTextarea.id = "message";
      newTextarea.name = "message";
      newTextarea.className = originalTextarea.className;
      newTextarea.value = originalTextarea.value;
      newTextarea.setAttribute(
        "tabindex",
        originalTextarea.getAttribute("tabindex")
      );
      newTextarea.setAttribute(
        "onselect",
        originalTextarea.getAttribute("onselect")
      );
      newTextarea.setAttribute(
        "onclick",
        originalTextarea.getAttribute("onclick")
      );
      newTextarea.setAttribute(
        "onkeyup",
        originalTextarea.getAttribute("onkeyup")
      );
      newTextarea.setAttribute(
        "onfocus",
        originalTextarea.getAttribute("onfocus")
      );

      // Set the style for the new textarea
      newTextarea.style.overflow = "hidden";
      newTextarea.style.resize = "none";
      newTextarea.style.minHeight = "500px"; // Set a minimum height

      newTextarea.addEventListener("keydown", function (e) {
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
      });

      const container = document.createElement("div");
      container.className = "editor-container";

      const highlightDiv = document.createElement("div");
      highlightDiv.id = "bbcode-highlight";

      container.appendChild(highlightDiv);
      originalTextarea.parentNode.replaceChild(container, originalTextarea);
      container.appendChild(newTextarea);

      // Add mention functionality
      let mentionTimeout;
      let mentionBox;

      newTextarea.addEventListener("input", function (e) {
        clearTimeout(updateTimer);
        checkForUpdates();

        // Check for mention
        const cursorPosition = this.selectionStart;
        const textBeforeCursor = this.value.substring(0, cursorPosition);
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

        if (mentionMatch) {
          clearTimeout(mentionTimeout);
          mentionTimeout = setTimeout(
            () => fetchMentions(mentionMatch[1]),
            300
          );
        } else {
          closeMentionBox();
        }
      });

      newTextarea.addEventListener("keydown", function (e) {
        if (mentionBox && mentionBox.style.display !== "none") {
          const activeItem = mentionBox.querySelector(".mention-item.active");
          switch (e.key) {
            case "ArrowDown":
              e.preventDefault();
              selectNextMention(activeItem);
              break;
            case "ArrowUp":
              e.preventDefault();
              selectPreviousMention(activeItem);
              break;
            case "Enter":
              e.preventDefault();
              if (activeItem) {
                insertMention(
                  activeItem.dataset.userId,
                  activeItem.textContent
                );
              }
              break;
            case "Escape":
              closeMentionBox();
              break;
          }
        }
      });

      function fetchMentions(query) {
        fetch(`https://rpghq.org/forums/mentionloc?q=${query}`, {
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "x-requested-with": "XMLHttpRequest",
          },
          credentials: "include",
        })
          .then((response) => response.json())
          .then((data) => displayMentions(data, query));
      }

      // Modify the displayMentions function
      function displayMentions(mentions, query) {
        if (!mentionBox) {
          mentionBox = document.createElement("div");
          mentionBox.className = "mention-box";
          document.body.appendChild(mentionBox); // Append to body instead of container
        }

        mentionBox.innerHTML = "";
        mentionBox.style.display = mentions.length ? "block" : "none";

        mentions.forEach((mention, index) => {
          const item = document.createElement("div");
          item.className = "mention-item";
          item.textContent = mention.value;
          item.dataset.userId = mention.user_id;
          if (index === 0) item.classList.add("active");
          item.addEventListener("click", () =>
            insertMention(mention.user_id, mention.value)
          );
          mentionBox.appendChild(item);
        });

        positionMentionBox();
      }

      // Modify the positionMentionBox function
      function positionMentionBox() {
        if (mentionBox && mentionBox.style.display !== "none") {
          const cursorPosition = newTextarea.selectionStart;
          const textBeforeCursor = newTextarea.value.substring(
            0,
            cursorPosition
          );
          const lines = textBeforeCursor.split("\n");
          const currentLine = lines.length;
          const currentColumn = lines[lines.length - 1].length;

          const textareaRect = newTextarea.getBoundingClientRect();
          const lineHeight = parseInt(
            window.getComputedStyle(newTextarea).lineHeight
          );

          const left = textareaRect.left + currentColumn * 7; // Approximate character width
          const top =
            textareaRect.top +
            (currentLine - 1) * lineHeight -
            newTextarea.scrollTop;

          mentionBox.style.left = `${left}px`;
          mentionBox.style.top = `${top + lineHeight}px`; // Position below the current line
          mentionBox.style.position = "fixed"; // Use fixed positioning
          mentionBox.style.zIndex = "9999"; // Ensure it's above other elements
        }
      }

      function selectNextMention(activeItem) {
        if (activeItem && activeItem.nextElementSibling) {
          activeItem.classList.remove("active");
          activeItem.nextElementSibling.classList.add("active");
        }
      }

      function selectPreviousMention(activeItem) {
        if (activeItem && activeItem.previousElementSibling) {
          activeItem.classList.remove("active");
          activeItem.previousElementSibling.classList.add("active");
        }
      }

      function insertMention(userId, username) {
        const cursorPosition = newTextarea.selectionStart;
        const textBeforeCursor = newTextarea.value.substring(0, cursorPosition);
        const textAfterCursor = newTextarea.value.substring(cursorPosition);
        const mentionText = `[smention u=${userId}]${username}[/smention] `;
        const mentionStart = textBeforeCursor.lastIndexOf("@");
        const newText =
          textBeforeCursor.substring(0, mentionStart) +
          mentionText +
          textAfterCursor;

        newTextarea.value = newText;
        newTextarea.setSelectionRange(
          mentionStart + mentionText.length,
          mentionStart + mentionText.length
        );
        closeMentionBox();
        updateHighlight();
        adjustTextareaAndHighlight();
      }

      function closeMentionBox() {
        if (mentionBox) {
          mentionBox.style.display = "none";
        }
      }

      // Add CSS for mention box
      const mentionStyle = document.createElement("style");
      mentionStyle.textContent = `
        .mention-box {
          position: fixed;
          background-color: #2b2b2b;
          border: 1px solid #444;
          max-height: 200px;
          overflow-y: auto;
          z-index: 9999;
          width: 200px; // Set a fixed width
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .mention-item {
          padding: 5px 10px;
          cursor: pointer;
          color: #fff; // Ensure text is visible
        }
        .mention-item:hover, .mention-item.active {
          background-color: #3a3a3a;
        }
      `;
      document.head.appendChild(mentionStyle);

      let lastContent = "";
      let updateTimer = null;

      function checkForUpdates() {
        const currentContent = newTextarea.value;
        if (currentContent !== lastContent) {
          updateHighlight();
          adjustTextareaAndHighlight();
          lastContent = currentContent;
        }
        updateTimer = setTimeout(checkForUpdates, 100); // Check every 100ms
      }

      newTextarea.addEventListener("input", function () {
        clearTimeout(updateTimer);
        checkForUpdates();
      });

      window.addEventListener("resize", adjustTextareaAndHighlight);

      // Initial adjustment and highlight
      adjustTextareaAndHighlight();
      updateHighlight();
      lastContent = newTextarea.value;

      // Start checking for updates
      checkForUpdates();

      // Add custom smiley buttons
      addCustomSmileyButtons();

      // Add custom buttons
      addCustomButtons();

      // Position the smiley box and editor header initially
      positionSmileyBox();
      positionEditorHeader();

      // Modify the "Add image to post" link
      const addImageContainer = document.querySelector(
        'div[style*="margin-bottom: 0.5em; margin-top: 0.5em;"]'
      );
      if (addImageContainer) {
        // Update the image
        const img = addImageContainer.querySelector("img");
        if (img) {
          img.src = `https://f.rpghq.org/V4gHDnvTTgpf.webp`;
          img.alt = "Vault";
        }

        // Update the link
        const link = addImageContainer.querySelector("a");
        if (link) {
          link.textContent = "Open Vault";
          link.href = "javascript:void(0);";
          link.onclick = function (e) {
            e.preventDefault();
            window.open(
              "https://vault.rpghq.org/",
              "RPGHQVault",
              "width=800,height=600,resizable=yes,scrollbars=yes"
            );
          };
        }
      }

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
