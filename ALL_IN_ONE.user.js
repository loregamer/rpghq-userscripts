// ==UserScript==
// @name         RPGHQ All-in-One Enhancement Suite
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Combines multiple RPGHQ enhancement scripts
// @match        https://rpghq.org/forums/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// ... (add all other necessary @grant permissions)
// ==/UserScript==

(function () {
  "use strict";

  // Utility function to check if the current URL matches a pattern
  function urlMatches(pattern) {
    return new RegExp(pattern.replace(/\*/g, ".*")).test(window.location.href);
  }

  function initBBCode() {
    if (urlMatches("https://rpghq.org/forums/*")) {
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
                  ? `<span class="bbcode-attribute">${escapeHTML(
                      attribute
                    )}</span>`
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
        text = text.replace(
          /\[CODE_PLACEHOLDER_(\d+)\]/g,
          function (match, index) {
            return `<span class="bbcode-bracket">[</span><span class="bbcode-tag-0">code</span><span class="bbcode-bracket">]</span><span style="color: #2E8B57;">${escapeHTML(
              codeBlocks[index]
            )}</span><span class="bbcode-bracket">[</span><span class="bbcode-tag-0">/code</span><span class="bbcode-bracket">]</span>`;
          }
        );

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
        highlightDiv.style.padding =
          window.getComputedStyle(newTextarea).padding;
        highlightDiv.style.borderWidth =
          window.getComputedStyle(newTextarea).borderWidth;
        highlightDiv.style.borderStyle =
          window.getComputedStyle(newTextarea).borderStyle;
        highlightDiv.style.borderColor = "transparent";
        highlightDiv.style.fontFamily =
          window.getComputedStyle(newTextarea).fontFamily;
        highlightDiv.style.fontSize =
          window.getComputedStyle(newTextarea).fontSize;
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
            const editorRows =
              editorHeader.querySelectorAll(".abbc3_buttons_row");
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

          const viewMoreLink = smileyBox.querySelector(
            'a[href*="mode=smilies"]'
          );

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
          let customSmileyHr = smileyBox.querySelector(
            ".custom-smiley-separator"
          );

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
          const usernameElement = document.querySelector("span.username");
          const isLoregamer =
            usernameElement &&
            usernameElement.textContent.trim() === "loregamer";

          if (bbcodeStatus) {
            bbcodeStatus.innerHTML = `
            <hr>
          <button type="button" class="button button-secondary custom-button" id="insert-mod-template">Insert Mod Template</button>
          <button type="button" class="button button-secondary custom-button" id="insert-table">Insert Table</button>
        `;

            if (isLoregamer) {
              bbcodeStatus.innerHTML += `
            <button type="button" class="button button-secondary custom-button" id="ping-bloomery">Ping Bloomery</button>
          `;
            }

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
        newSmileyInput.placeholder =
          "Enter new smiley or emoji and press Enter";
        newSmileyInput.style.cssText = `
    width: 100%;
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
              const activeItem = mentionBox.querySelector(
                ".mention-item.active"
              );
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
            const textBeforeCursor = newTextarea.value.substring(
              0,
              cursorPosition
            );
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
          // Modify the "Add image to post" link and add "Open Vault" button
          const addImageContainer = document.querySelector(
            'div[style*="margin-bottom: 0.5em; margin-top: 0.5em;"]'
          );
          if (addImageContainer) {
            // Create a new container for both elements
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.flexDirection = "column";
            container.style.alignItems = "flex-start";
            container.style.gap = "5px";

            // Move the existing "Add image to post" link to the new container
            const existingContent = addImageContainer.innerHTML;
            const existingDiv = document.createElement("div");
            existingDiv.innerHTML = existingContent;
            container.appendChild(existingDiv);

            // Create the new "Open Vault" link
            const vaultDiv = document.createElement("div");
            vaultDiv.innerHTML = `
    <img src="https://f.rpghq.org/V4gHDnvTTgpf.webp" width="16" height="16" style="vertical-align: middle; margin-left: 0.5em;">
    <a href="javascript:void(0);" style="color: rgb(58, 128, 234); vertical-align: middle; font-size: 1em;">Open Vault</a>
  `;
            vaultDiv.querySelector("a").onclick = function (e) {
              e.preventDefault();
              window.open(
                "https://vault.rpghq.org/",
                "RPGHQVault",
                "width=800,height=800,resizable=yes,scrollbars=yes"
              );
            };

            // Add the new link to the container
            container.appendChild(vaultDiv);

            // Replace the content of addImageContainer with the new container
            addImageContainer.innerHTML = "";
            addImageContainer.appendChild(container);
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

      initialize();
    }
  }

  function initBetterBloomery() {
    if (urlMatches("https://rpghq.org/forums/*")) {
      const colorMap = {
        "【 Userscript 】": "#00AA00",
        "【 Resource 】": "#3889ED",
        "【 Project 】": "#FF4A66",
        "【 Tutorial 】": "#FFC107",
        "[ Select for merge ]": "#A50000",
      };

      function colorizeTopicTitles() {
        // Select all topic titles, including those in sticky rows, h2, h3, dd elements, and the tabs-container
        const topicTitles = document.querySelectorAll(
          "a.topictitle, h2.topic-title a, h3.first a, dd.lastpost a.lastsubject, .tabs-container h2 a"
        );

        topicTitles.forEach((title) => {
          for (const [text, color] of Object.entries(colorMap)) {
            if (title.textContent.includes(text)) {
              const coloredText = `<span style="color: ${color};">${text}</span>`;
              title.innerHTML = title.innerHTML.replace(text, coloredText);
            }
          }
        });
      }

      colorizeTopicTitles();
    }
  }

  function initNotifications() {
    if (urlMatches("https://rpghq.org/*/*")) {
      function customizeNotificationPanel() {
        let notificationBlocks = document.querySelectorAll(
          ".notification-block, a.notification-block"
        );

        notificationBlocks.forEach((block) => {
          if (block.dataset.customized === "true") return;

          let titleElement = block.querySelector(".notification-title");
          let referenceElement = block.querySelector(".notification-reference");

          if (titleElement) {
            let titleText = titleElement.innerHTML;

            if (titleText.includes("reacted to a message you posted")) {
              let isUnread =
                block.href && block.href.includes("mark_notification");

              let postId;
              if (block.hasAttribute("data-real-url")) {
                let match = block
                  .getAttribute("data-real-url")
                  .match(/p=(\d+)/);
                postId = match ? match[1] : null;
              } else {
                let postIdMatch = block.href
                  ? block.href.match(/p=(\d+)/)
                  : null;
                postId = postIdMatch ? postIdMatch[1] : null;
              }

              // Extract usernames from the title
              let usernames = Array.from(
                titleElement.querySelectorAll(".username, .username-coloured")
              ).map((el) => el.textContent.trim());

              fetchReactions(postId, isUnread).then((reactions) => {
                // Filter reactions to only include those from mentioned usernames
                let filteredReactions = reactions.filter((reaction) =>
                  usernames.includes(reaction.username)
                );
                let reactionHTML = formatReactions(filteredReactions);
                let newTitleText = titleText.replace(
                  /(have|has)\s+reacted.*$/,
                  `<b style="color: #3889ED;">reacted</b> ${reactionHTML} to:`
                );
                titleElement.innerHTML = newTitleText;
              });
            } else if (titleText.includes("You were mentioned by")) {
              let topicMatch = titleText.match(/in:?\s*"(.*)"/);
              let topicName = topicMatch ? topicMatch[1] : "";
              titleElement.innerHTML = `You were <b style="color: #FFC107;">mentioned</b><br>in <span class="notification-reference">${topicName}</span>`;
            } else if (titleText.includes("Private Message")) {
              let subject = referenceElement
                ? referenceElement.textContent.trim().replace(/^"(.*)"$/, "$1")
                : "";

              if (subject === "Board warning issued") {
                titleElement.innerHTML = titleText
                  .replace(
                    /<strong>Private Message<\/strong>/,
                    '<strong style="color: #D31141;">Board warning issued</strong>'
                  )
                  .replace(/from/, "by")
                  .replace(/:$/, "");
                if (referenceElement) referenceElement.remove();
              }
            } else if (titleText.includes("Report closed")) {
              titleElement.innerHTML = titleText.replace(
                /Report closed/,
                '<strong style="color: #f58c05;">Report closed</strong>'
              );
            }

            titleElement.innerHTML = titleElement.innerHTML
              .replace(
                /<strong>Quoted<\/strong>/,
                '<strong style="color: #FF4A66;">Quoted</strong>'
              )
              .replace(
                /<strong>Reply<\/strong>/,
                '<strong style="color: #FFD866;">Reply</strong>'
              );
          }

          if (referenceElement) {
            Object.assign(referenceElement.style, {
              background: "rgba(23, 27, 36, 0.5)",
              color: "#ffffff",
              padding: "2px 4px",
              borderRadius: "2px",
              zIndex: "-1",
              display: "inline-block",
              whiteSpace: "nowrap",
            });
          }

          block.querySelectorAll(".username-coloured").forEach((el) => {
            el.classList.remove("username-coloured");
            el.classList.add("username");
            el.style.color = "";
          });

          block.dataset.customized = "true";
        });
      }

      function customizeNotificationPage() {
        let notificationRows = document.querySelectorAll(".cplist .row");
        notificationRows.forEach((row) => {
          if (row.dataset.customized === "true") return;

          let notificationBlock = row.querySelector(".notifications");
          let anchorElement = notificationBlock.querySelector("a");

          if (anchorElement) {
            let titleElement = anchorElement.querySelector(
              ".notifications_title"
            );
            let titleText = titleElement.innerHTML; // Use innerHTML to preserve existing HTML elements

            // Process the title text
            titleText = titleText
              .replace(/\bReply\b/g, '<b style="color: #FFD866;">Reply</b>')
              .replace(/\bQuoted\b/g, '<b style="color: #FF4A66;">Quoted</b>')
              .replace(/\breacted\b/g, '<b style="color: #3889ED;">reacted</b>')
              .replace(
                /\bReport closed\b/g,
                '<b style="color: #f58c05;">Report closed</b>'
              );

            // Handle quoted text
            let quoteMatch = titleText.match(/in topic: "([^"]*)"/);
            if (quoteMatch) {
              let quote = quoteMatch[1];
              let trimmedQuote =
                quote.length > 50 ? quote.substring(0, 50) + "..." : quote;
              titleText = titleText.replace(
                /in topic: "([^"]*)"/,
                `<br><span class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; display: inline-block; margin-top: 5px;">"${trimmedQuote}"</span>`
              );
            }

            // Handle "to a message you posted" text
            titleText = titleText.replace(
              /(to a message you posted) "([^"]*)"/g,
              '$1 <br><span class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; display: inline-block; margin-top: 5px;">"$2"</span>'
            );

            // Create new content
            let newContent = `
                      <div class="notification-block">
                          <div class="notification-title">${titleText}</div>
                      </div>
                  `;

            // Replace the entire content of the anchor element
            anchorElement.innerHTML = newContent;
          }

          row.dataset.customized = "true";
        });
      }

      // Add this function to handle local storage operations
      function getStoredReactions(postId) {
        const storedReactions = localStorage.getItem(`reactions_${postId}`);
        if (storedReactions) {
          const { reactions, timestamp } = JSON.parse(storedReactions);
          // Check if the stored data is less than 24 hours old
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            return reactions;
          }
        }
        return null;
      }

      function storeReactions(postId, reactions) {
        localStorage.setItem(
          `reactions_${postId}`,
          JSON.stringify({
            reactions,
            timestamp: Date.now(),
          })
        );
      }

      function fetchReactions(postId, isUnread) {
        const fetchAndProcessReactions = () => {
          return fetch(
            `https://rpghq.org/forums/reactions?mode=view&post=${postId}`,
            {
              method: "POST",
              headers: {
                accept: "application/json, text/javascript, */*; q=0.01",
                "x-requested-with": "XMLHttpRequest",
              },
              credentials: "include",
            }
          )
            .then((response) => response.json())
            .then((data) => {
              let parser = new DOMParser();
              let doc = parser.parseFromString(data.htmlContent, "text/html");
              let reactions = [];
              doc
                .querySelectorAll('.tab-content[data-id="0"] li')
                .forEach((li) => {
                  reactions.push({
                    username:
                      li.querySelector(".cbb-helper-text a").textContent,
                    image: li.querySelector(".reaction-image").src,
                    name: li.querySelector(".reaction-image").alt,
                  });
                });
              // Store all reactions in local storage
              storeReactions(postId, reactions);
              return reactions;
            });
        };

        if (isUnread) {
          return fetchAndProcessReactions();
        } else {
          const storedReactions = getStoredReactions(postId);
          if (storedReactions) {
            return Promise.resolve(storedReactions);
          }
          return fetchAndProcessReactions();
        }
      }

      function formatReactions(reactions) {
        let reactionHTML =
          '<span style="display: inline-flex; margin-left: 2px; vertical-align: middle;">';
        reactions.forEach((reaction) => {
          reactionHTML += `
              <img src="${reaction.image}" alt="${reaction.name}" title="${reaction.name}" 
                   style="height: 1em !important; width: auto !important; vertical-align: middle !important; margin-right: 2px !important;">
            `;
        });
        reactionHTML += "</span>";
        return reactionHTML;
      }

      // Function to extract post IDs from the page
      function getDisplayedPostIds() {
        const postElements = document.querySelectorAll('div[id^="p"]');
        return Array.from(postElements).map((el) => el.id.substring(1));
      }

      // Function to extract notification data
      function getNotificationData() {
        const notificationLinks = document.querySelectorAll(
          ".notification-block"
        );
        return Array.from(notificationLinks)
          .map((link) => {
            const href = link.getAttribute("href");
            let postId = null;
            const realUrl = link.getAttribute("data-real-url");
            if (realUrl) {
              const match = realUrl.match(/p=(\d+)/);
              postId = match ? match[1] : null;
            }
            return { href, postId };
          })
          .filter((data) => data.href && data.postId); // Only keep notifications with both href and postId
      }

      // Function to mark a notification as read
      function markNotificationAsRead(href) {
        GM_xmlhttpRequest({
          method: "GET",
          url: "https://rpghq.org/forums/" + href,
          onload: function (response) {
            console.log("Notification marked as read:", response.status);
          },
        });
      }

      // Main function
      function checkAndMarkNotifications() {
        const displayedPostIds = getDisplayedPostIds();
        const notificationData = getNotificationData();

        notificationData.forEach((notification) => {
          if (displayedPostIds.includes(notification.postId)) {
            markNotificationAsRead(notification.href);
          }
        });
      }

      function init() {
        customizeNotificationPanel();
        checkAndMarkNotifications();

        // Check if we're on the full notifications page
        if (window.location.href.includes("ucp.php?i=ucp_notifications")) {
          customizeNotificationPage();
        }

        // Set up a MutationObserver to handle dynamically loaded notifications
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
              customizeNotificationPanel();
            }
          });
        });

        const config = { childList: true, subtree: true };
        observer.observe(document.body, config);
      }

      init();
    }
  }

  function initRandomTopic() {
    if (urlMatches("https://rpghq.org/forums/*")) {
      // Function to get a random topic ID
      function getRandomTopicId() {
        return Math.floor(Math.random() * 2800) + 1;
      }

      // Function to check if a topic exists
      function checkTopicExists(topicId) {
        return new Promise((resolve, reject) => {
          GM_xmlhttpRequest({
            method: "HEAD",
            url: `https://rpghq.org/forums/viewtopic.php?t=${topicId}`,
            onload: function (response) {
              resolve(response.status === 200);
            },
            onerror: function (error) {
              reject(error);
            },
          });
        });
      }

      // Function to get a valid random topic
      async function getValidRandomTopic() {
        let topicExists = false;
        let topicId;

        while (!topicExists) {
          topicId = getRandomTopicId();
          topicExists = await checkTopicExists(topicId);
        }

        return `https://rpghq.org/forums/viewtopic.php?t=${topicId}`;
      }

      // Function to create and add the button
      function addRandomTopicButton() {
        const navMain = document.getElementById("nav-main");
        if (navMain) {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = "#";
          a.role = "menuitem";
          a.innerHTML =
            '<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>';

          // Add custom styles to the anchor and icon
          a.style.cssText = `
                  display: flex;
                  align-items: center;
                  height: 100%;
                  text-decoration: none;
              `;

          // Apply styles after a short delay to ensure the icon is loaded
          setTimeout(() => {
            const icon = a.querySelector(".icon");
            if (icon) {
              icon.style.cssText = `
                          font-size: 14px;
                      `;
            }
          }, 100);

          a.onclick = async function (e) {
            e.preventDefault();
            this.style.textDecoration = "none";
            this.innerHTML =
              '<i class="icon fa-spinner fa-spin fa-fw" aria-hidden="true"></i><span>Loading...</span>';
            try {
              const validTopic = await getValidRandomTopic();
              window.location.href = validTopic;
            } catch (error) {
              console.error("Error finding random topic:", error);
              this.innerHTML =
                '<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>';
            }
          };
          li.appendChild(a);
          navMain.appendChild(li);
        }
      }

      addRandomTopicButton();
    }
  }

  function initSeparateReactions() {
    if (urlMatches("https://rpghq.org/forums/*")) {
      function createReactionList(postId, reactions) {
        return `
              <div class="reaction-score-list" data-post-id="${postId}" data-title="Reactions">
                  <div class="list-scores" style="display: flex; flex-wrap: wrap; gap: 4px;">
                      ${reactions
                        .map(
                          (reaction) => `
                          <div class="reaction-group" style="display: flex; align-items: center; background-color: rgba(255,255,255,0.1); border-radius: 8px; padding: 2px 6px; position: relative;">
                              <img src="${reaction.image}" alt="${
                            reaction.title
                          }" style="width: auto; height: 16px; margin-right: 4px; object-fit: contain;">
                              <span style="font-size: 12px; color: #dcddde;">${
                                reaction.count
                              }</span>
                              <div class="reaction-users-popup" style="display: none; position: fixed; background-color: #191919; border: 1px solid #202225; border-radius: 4px; padding: 8px; z-index: 1000; color: #dcddde; font-size: 12px; width: 200px; max-height: 300px; overflow-y: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                  <div style="font-weight: bold; margin-bottom: 8px;">${
                                    reaction.title
                                  }</div>
                                  <div style="display: flex; flex-direction: column; gap: 8px;">
                                      ${reaction.users
                                        .map(
                                          (user) => `
                                          <div style="display: flex; align-items: center;">
                                              <div style="width: 24px; height: 24px; margin-right: 8px; flex-shrink: 0;">
                                                  ${
                                                    user.avatar
                                                      ? `<img src="${user.avatar}" alt="${user.username}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">`
                                                      : ""
                                                  }
                                              </div>
                                              <a href="${
                                                user.profileUrl
                                              }" style="${
                                            user.isColoured
                                              ? `color: ${user.color};`
                                              : ""
                                          }" class="${
                                            user.isColoured
                                              ? "username-coloured"
                                              : "username"
                                          }">${user.username}</a>
                                          </div>
                                      `
                                        )
                                        .join("")}
                                  </div>
                              </div>
                          </div>
                      `
                        )
                        .join("")}
                  </div>
              </div>
          `;
      }

      function parseReactions(htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");
        const reactions = [];

        doc.querySelectorAll(".tab-header a:not(.active)").forEach((a) => {
          const image = a.querySelector("img")?.src || "";
          const title = a.getAttribute("title") || "";
          const count = a.querySelector(".tab-counter")?.textContent || "0";
          const dataId = a.getAttribute("data-id");
          if (dataId) {
            const users = [];
            doc
              .querySelectorAll(`.tab-content[data-id="${dataId}"] li`)
              .forEach((li) => {
                const userLink = li.querySelector(".cbb-helper-text a");
                if (userLink) {
                  const username = userLink.textContent || "";
                  const profileUrl = userLink.href || "";
                  const avatarImg = li.querySelector(".user-avatar img");
                  const avatar = avatarImg ? avatarImg.src : "";
                  const isColoured =
                    userLink.classList.contains("username-coloured");
                  const color = isColoured ? userLink.style.color : null;
                  users.push({
                    username,
                    avatar,
                    profileUrl,
                    isColoured,
                    color,
                  });
                }
              });
            reactions.push({ image, title, count, users });
          }
        });

        return reactions;
      }

      function fetchReactions(postId) {
        return fetch(
          `https://rpghq.org/forums/reactions?mode=view&post=${postId}`,
          {
            method: "POST",
            headers: {
              accept: "application/json, text/javascript, */*; q=0.01",
              "x-requested-with": "XMLHttpRequest",
            },
            credentials: "include",
          }
        )
          .then((response) => response.json())
          .then((data) => {
            if (!data.htmlContent) {
              console.error("No HTML content in response:", data);
              return [];
            }
            return parseReactions(data.htmlContent);
          })
          .catch((error) => {
            console.error("Error fetching reactions:", error);
            return [];
          });
      }

      function processPost(post) {
        const postId = post.id.substring(1);
        const existingReactionList = post.querySelector(".reaction-score-list");
        if (existingReactionList && !existingReactionList.dataset.processed) {
          updateReactions(post, postId);
        }
      }

      function updateReactions(post, postId) {
        const existingReactionList = post.querySelector(".reaction-score-list");
        if (existingReactionList.dataset.processed) return;

        fetchReactions(postId)
          .then((reactions) => {
            if (reactions.length > 0) {
              const reactionListHtml = createReactionList(postId, reactions);
              existingReactionList.outerHTML = reactionListHtml;

              const newReactionList = post.querySelector(
                ".reaction-score-list"
              );
              newReactionList.dataset.processed = "true";

              // Add hover effect to reaction groups
              newReactionList
                .querySelectorAll(".reaction-group")
                .forEach((group) => {
                  const popup = group.querySelector(".reaction-users-popup");
                  let isHovering = false;

                  group.addEventListener("mouseenter", (e) => {
                    isHovering = true;
                    showPopup(group, popup);
                  });

                  group.addEventListener("mouseleave", () => {
                    isHovering = false;
                    hidePopup(popup);
                  });

                  // Add scroll event listener
                  window.addEventListener("scroll", () => {
                    if (isHovering) {
                      showPopup(group, popup);
                    }
                  });
                });
            }
          })
          .catch((error) => console.error("Error fetching reactions:", error));
      }

      function showPopup(group, popup) {
        // Show the popup
        popup.style.display = "block";

        // Position the popup
        const rect = group.getBoundingClientRect();

        let top = rect.bottom;
        let left = rect.left;

        // Adjust if popup goes off-screen
        if (left + popup.offsetWidth > window.innerWidth) {
          left = window.innerWidth - popup.offsetWidth;
        }

        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;
      }

      function hidePopup(popup) {
        popup.style.display = "none";
      }

      function observePosts() {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  if (node.classList.contains("post")) {
                    processPost(node);
                  } else if (node.classList.contains("reaction-score-list")) {
                    const post = node.closest(".post");
                    if (post) {
                      processPost(post);
                    }
                  }
                }
              });
            }
          });
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        // Process existing posts
        document.querySelectorAll(".post").forEach(processPost);
      }

      observePosts();
    }
  }

  function initSubscribedUnreadPosts() {
    if (urlMatches("https://rpghq.org/forums/*")) {
      function addSubscribedTopicsButton() {
        // Add to quick links dropdown
        const quickLinks = document.querySelector(
          "#quick-links .dropdown-contents"
        );
        if (quickLinks) {
          const listItem = document.createElement("li");
          listItem.innerHTML = `
                      <a href="https://rpghq.org/forums/search.php?search_id=subscribed" role="menuitem">
                          <i class="icon fa-check-square-o fa-fw" aria-hidden="true"></i><span>Subscribed topics</span>
                      </a>
                  `;
          // Insert after "Unread posts" in the dropdown
          const unreadPostsItem = quickLinks
            .querySelector('a[href*="search_id=unreadposts"]')
            .closest("li");
          unreadPostsItem.parentNode.insertBefore(
            listItem,
            unreadPostsItem.nextSibling
          );
        }

        // Add as a separate button in the main navigation
        const navMain = document.getElementById("nav-main");
        if (navMain) {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = "https://rpghq.org/forums/search.php?search_id=subscribed";
          a.role = "menuitem";
          a.innerHTML =
            '<i class="icon fa-check-square-o fa-fw" aria-hidden="true"></i><span>Subscribed topics</span>';

          // Add custom styles to the anchor and icon
          a.style.cssText = `
                      display: flex;
                      align-items: center;
                      height: 100%;
                      text-decoration: none;
                  `;

          // Apply styles after a short delay to ensure the icon is loaded
          setTimeout(() => {
            const icon = a.querySelector(".icon");
            if (icon) {
              icon.style.cssText = `
                              font-size: 14px;
                          `;
            }
          }, 100);

          li.appendChild(a);

          // Insert after "Unread posts" and before "Chat (IRC)" in the main navigation
          const unreadPostsItem = navMain
            .querySelector('a[href*="search_id=unreadposts"]')
            .closest("li");
          const chatItem = navMain
            .querySelector('a[href*="/chat"]')
            .closest("li");
          navMain.insertBefore(li, chatItem);
        }
      }

      function fetchSubscribedTopics(start = 0) {
        GM_xmlhttpRequest({
          method: "GET",
          url: `https://rpghq.org/forums/ucp.php?i=ucp_main&mode=subscribed&start=${start}`,
          onload: function (response) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(
              response.responseText,
              "text/html"
            );
            const topicRows = Array.from(doc.querySelectorAll("li.row")).filter(
              (row) => {
                // Exclude forum sections
                return !row.querySelector(
                  ".row-item.forum_read, .row-item.forum_unread"
                );
              }
            );

            console.log(
              `Fetched ${topicRows.length} topic rows from start=${start}`
            );

            allTopicRows = allTopicRows.concat(topicRows);

            console.log(`Total topic rows: ${allTopicRows.length}`);

            // Display content immediately
            replaceContent(allTopicRows);
            updatePagination(allTopicRows.length);
            updateTitle();

            // Check for next page and fetch if available
            const nextPageLink = doc.querySelector(".pagination .next a");
            if (nextPageLink) {
              const nextStart = new URLSearchParams(nextPageLink.href).get(
                "start"
              );
              fetchSubscribedTopics(nextStart);
            } else {
              console.log("No more pages to fetch");
            }
          },
          onerror: function (error) {
            console.error("Error fetching subscribed topics:", error);
          },
        });
      }

      function replaceContent(topicRows) {
        const panel = document.querySelector(".panel");
        if (panel) {
          panel.innerHTML = "";
          const ul = document.createElement("ul");
          ul.className = "topiclist cplist missing-column";
          topicRows.forEach((row) => {
            const clonedRow = row.cloneNode(true);
            const markDD = clonedRow.querySelector("dd.mark");
            if (markDD) markDD.remove();

            const topicLink = clonedRow.querySelector("a.topictitle");
            if (topicLink) {
              topicLink.href += "&view=unread#unread";
            }

            // Add display: none to read topics
            const isUnread = clonedRow.querySelector(
              ".topic_unread, .topic_unread_mine, .topic_unread_hot, .topic_unread_hot_mine"
            );
            if (!isUnread) {
              clonedRow.style.display = "none";
            }

            ul.appendChild(clonedRow);
          });
          panel.appendChild(ul);
        }
      }

      function addToggleButton() {
        const actionBar = document.querySelector(".action-bar.bar-top");
        if (actionBar) {
          const button = document.createElement("button");
          button.textContent = "Show All Topics";
          button.className = "button";
          button.onclick = toggleTopics;
          // Insert the button at the beginning of the action bar
          actionBar.insertBefore(button, actionBar.firstChild);
        }
      }

      function updatePagination(topicCount) {
        const paginationDiv = document.querySelector(
          ".action-bar.bar-top .pagination"
        );
        if (paginationDiv) {
          paginationDiv.innerHTML = `Search found ${topicCount} matches • Page <strong>1</strong> of <strong>1</strong>`;
        }
      }

      function updateTitle() {
        const titleElement = document.querySelector("h2.searchresults-title");
        if (titleElement) {
          titleElement.textContent = "Subscribed topics";
        }
      }

      function toggleTopics() {
        const topics = document.querySelectorAll(".panel li.row");
        const button = document.querySelector(".action-bar.bar-top button");
        const showAll = button.textContent === "Show All Topics";

        topics.forEach((topic) => {
          const isUnread = topic.querySelector(
            ".topic_unread, .topic_unread_mine, .topic_unread_hot, .topic_unread_hot_mine"
          );
          topic.style.display = showAll || isUnread ? "" : "none";
        });

        button.textContent = showAll ? "Show Only Unread" : "Show All Topics";
      }

      function checkContentLoaded() {
        const panel = document.querySelector(".panel");
        if (panel && panel.innerHTML.trim() === "") {
          console.warn("Panel is empty. Attempting to reload content...");
          fetchSubscribedTopics();
        }
      }

      function init() {
        // Only run the main script on the subscribed topics page
        if (window.location.href.includes("search.php?search_id=subscribed")) {
          fetchSubscribedTopics();
          addToggleButton();
          // Check if content was loaded after a short delay
          setTimeout(checkContentLoaded, 2000);
        }

        // Add the "Subscribed topics" button to the navigation bar and quick links
        addSubscribedTopicsButton();
      }

      init();
    }
  }

  function initAllScripts() {
    initNotifications();
    initBetterBloomery();
    initBBCode();
    initRandomTopic();
    initSeparateReactions();
    initSubscribedUnreadPosts();
  }

  // Run the init function when the page loads
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    initAllScripts();
  } else {
    window.addEventListener("load", initAllScripts);
  }
})();
