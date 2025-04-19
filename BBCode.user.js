// ==UserScript==
// @name         RPGHQ - BBCode Highlighter
// @namespace    http://rpghq.org/
// @version      5.6
// @description  Highlight BBCode tags in the text editor on RPGHQ forum with consistent colors for matching tags, save/restore form content, and prevent accidental tab closing
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

  // =============================
  // Update Page Title
  // =============================
  const updatePageTitle = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    const postingTitleElement = document.querySelector(".posting-title a");
    if (postingTitleElement) {
      const threadTitle = postingTitleElement.textContent.trim();
      if (mode === "reply" || mode === "quote") {
        document.title = `RPGHQ - Replying to "${threadTitle}"`;
      } else if (mode === "edit") {
        document.title = `RPGHQ - Editing post in "${threadTitle}"`;
      }
    }
  };

  // =============================
  // Utility Functions
  // =============================
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
        })[m]
    );

  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16),
      g = parseInt(hexColor.slice(3, 5), 16),
      b = parseInt(hexColor.slice(5, 7), 16),
      yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "black" : "white";
  };

  // =============================
  // Global Variables & Settings
  // =============================
  let customSmileys = [
    "📥",
    "https://f.rpghq.org/ZgRYx3ztDLyD.png?n=cancel_forum.png",
    "https://f.rpghq.org/W5kvLDYCwg8G.png",
  ];

  const tagColorMap = { img: 1, url: 4, color: 3 };
  const getColorIndex = (tagName) => {
    if (tagName === "*") return "list-item";
    if (!(tagName in tagColorMap)) {
      const colorIndex = Object.keys(tagColorMap).length % 5;
      tagColorMap[tagName] = colorIndex;
    }
    return tagColorMap[tagName];
  };

  // =============================
  // CSS Injection
  // =============================
  const addStyles = () => {
    const style = document.createElement("style");
    style.textContent = `
      .bbcode-bracket { color: #D4D4D4; }
      .bbcode-tag-0 { color: #569CD6; }
      .bbcode-tag-1 { color: #CE9178; }
      .bbcode-tag-2 { color: #DCDCAA; }
      .bbcode-tag-3 { color: #C586C0; }
      .bbcode-tag-4 { color: #4EC9B0; }
      .bbcode-attribute { color: #9CDCFE; }
      .bbcode-list-item, .bbcode-smiley { color: #FFD700; }
      #bbcode-highlight {
        white-space: pre-wrap;
        word-wrap: break-word;
        position: absolute;
        top: 0; left: 0;
        z-index: 3;
        width: 100%; height: 100%;
        overflow: hidden;
        pointer-events: none;
        box-sizing: border-box;
        padding: 3px;
        font-family: Verdana, Helvetica, Arial, sans-serif;
        font-size: 11px;
        line-height: 15.4px;
        background-color: transparent;
        color: transparent;
        transition: all 0.5s ease, height 0.001s linear;
      }
      #message {
        position: relative;
        z-index: 2;
        background: transparent;
        color: rgb(204, 204, 204);
        caret-color: white;
        width: 100%;
        height: 100%;
        padding: 3px;
        box-sizing: border-box;
        resize: none;
        overflow: auto;
        font-family: Verdana, Helvetica, Arial, sans-serif;
        font-size: 11px;
        line-height: 15.4px;
      }
      .editor-container { position: relative; width: 100%; height: auto; }
      .bbcode-link { color: #5D8FBD; }
      .smiley-button, .custom-smiley-button {
        display: inline-flex; justify-content: center; align-items: center;
        width: 22px; height: 22px; margin: 2px;
        text-decoration: none; vertical-align: middle; overflow: hidden;
      }
      .smiley-button img, .custom-smiley-button img {
        max-width: 80%; max-height: 80%; object-fit: contain;
      }
      .emoji-smiley { font-size: 18px; display: flex; justify-content: center; align-items: center; width: 80%; height: 80%; }
      #smiley-box {
        position: absolute; max-height: 80vh; width: 17%;
        overflow-y: auto; border-radius: 5px; z-index: 1000;
      }
      .smiley-group { margin-bottom: 10px; }
      #smiley-box a { color: #5D8FBD; text-decoration: none; }
      #smiley-box a:hover { text-decoration: underline; }
      #abbc3_buttons.fixed { position: fixed; top: 0; z-index: 1000; background-color: #3A404A !important; }
      .abbc3_buttons_row.fixed { background-color: #3A404A !important; position: fixed; top: 0; z-index: 1000; }
      .custom-buttons-container { margin-top: 10px; }
      .custom-button { margin-bottom: 5px; margin-right: 5px; }
      .smiley-group-separator { margin: 10px 0; }
      @media (max-width: 768px) {
        #smiley-box {
          position: static !important; width: 100% !important;
          max-height: none !important; overflow-y: visible !important; margin-bottom: 10px;
        }
        .smiley-button, .custom-smiley-button { width: 36px; height: 36px; }
        .smiley-button img, .custom-smiley-button img { width: 30px; height: 30px; }
        .emoji-smiley { font-size: 24px; }
      }
    `;
    document.head.appendChild(style);
  };

  // =============================
  // BBCode Highlighting
  // =============================
  const highlightBBCode = (text) => {
    // First, process all BBCode tags.
    let output = text.replace(
      /\[(\/?)([a-zA-Z0-9*]+)([^\]]*)\]/g,
      (match, slash, keyword, rest) => {
        // Special handling for list items ([*])
        if (keyword === "*") {
          return (
            `<span class="bbcode-bracket" style="color:#A0A0A0;">[</span>` +
            `<span class="bbcode-list-item">*</span>` +
            `<span class="bbcode-bracket" style="color:#A0A0A0;">]</span>`
          );
        }

        // Special handling for smention: force a fixed color.
        if (keyword.toLowerCase() === "smention") {
          let out =
            `<span class="bbcode-bracket" style="color:#A0A0A0;">[</span>` +
            `<span class="bbcode-tag-smention" style="color:#FFC107;">${escapeHTML(
              slash + keyword
            )}</span>`;
          if (rest) {
            const leadingWs = rest.match(/^\s*/)[0];
            const params = rest.slice(leadingWs.length);
            if (params) {
              if (params.startsWith("=")) {
                const paramValue = params.slice(1).trim();
                out +=
                  leadingWs +
                  `<span class="bbcode-attribute">=</span>` +
                  `<span class="bbcode-attribute">${escapeHTML(
                    paramValue
                  )}</span>`;
              } else {
                out +=
                  leadingWs +
                  `<span class="bbcode-attribute">${escapeHTML(params)}</span>`;
              }
            }
          }
          out += `<span class="bbcode-bracket" style="color:#A0A0A0;">]</span>`;
          return out;
        }

        // For all other tags, assign colors using the tagColorMap.
        const colorIndex = getColorIndex(keyword);
        let out =
          `<span class="bbcode-bracket" style="color:#A0A0A0;">[</span>` +
          `<span class="bbcode-tag-${colorIndex}">${escapeHTML(
            slash + keyword
          )}</span>`;
        if (rest) {
          const leadingWs = rest.match(/^\s*/)[0];
          const params = rest.slice(leadingWs.length);
          if (params) {
            if (params.startsWith("=")) {
              const paramValue = params.slice(1).trim();
              if (keyword.toLowerCase() === "color") {
                const hexMatch = paramValue.match(/^(#[0-9A-Fa-f]{6})/);
                if (hexMatch) {
                  const hex = hexMatch[1];
                  out +=
                    leadingWs +
                    `<span class="bbcode-attribute">=</span>` +
                    `<span class="bbcode-color-preview" style="background-color:${hex}; color:${getContrastColor(
                      hex
                    )};">${escapeHTML(hex)}</span>`;
                  const extra = paramValue.slice(hex.length);
                  if (extra) {
                    out += `<span class="bbcode-attribute">${escapeHTML(
                      extra
                    )}</span>`;
                  }
                } else {
                  out +=
                    leadingWs +
                    `<span class="bbcode-attribute">=</span>` +
                    `<span class="bbcode-attribute">${escapeHTML(
                      paramValue
                    )}</span>`;
                }
              } else {
                out +=
                  leadingWs +
                  `<span class="bbcode-attribute">=</span>` +
                  `<span class="bbcode-attribute">${escapeHTML(
                    paramValue
                  )}</span>`;
              }
            } else {
              out +=
                leadingWs +
                `<span class="bbcode-attribute">${escapeHTML(params)}</span>`;
            }
          }
        }
        out += `<span class="bbcode-bracket" style="color:#A0A0A0;">]</span>`;
        return out;
      }
    );

    // Second pass: Wrap any URLs in the output with a span using the "bbcode-link" class.
    output = output.replace(/(https?:\/\/[^\s<]+)/g, (match) => {
      return `<span class="bbcode-link">${match}</span>`;
    });

    return output;
  };

  // =============================
  // Textarea & Highlight Adjustment
  // =============================
  const adjustTextareaAndHighlight = () => {
    const textArea = document.getElementById("message"),
      highlightDiv = document.getElementById("bbcode-highlight");
    if (!textArea || !highlightDiv) return;
    textArea.style.height = "auto";
    textArea.style.height = textArea.scrollHeight + "px";
    const computed = window.getComputedStyle(textArea);
    Object.assign(highlightDiv.style, {
      width: textArea.offsetWidth + "px",
      height: textArea.offsetHeight + "px",
      padding: computed.padding,
      borderWidth: computed.borderWidth,
      borderStyle: computed.borderStyle,
      borderColor: "transparent",
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      lineHeight: computed.lineHeight,
    });
    positionSmileyBox();
    positionEditorHeader();
  };

  const updateHighlight = () => {
    const textarea = document.getElementById("message"),
      highlightDiv = document.getElementById("bbcode-highlight");
    if (textarea && highlightDiv) {
      highlightDiv.innerHTML = highlightBBCode(textarea.value);
    }
  };

  // =============================
  // Text Wrapping & Insert Functions
  // =============================
  const wrapSelectedText = (textarea, tag) => {
    const start = textarea.selectionStart,
      end = textarea.selectionEnd,
      selected = textarea.value.substring(start, end);
    const replacement = tag.includes("=")
      ? `[${tag}]${selected}[/${tag.split("=")[0]}]`
      : `[${tag}]${selected}[/${tag}]`;
    textarea.value =
      textarea.value.substring(0, start) +
      replacement +
      textarea.value.substring(end);
    textarea.setSelectionRange(start + tag.length + 2, start + tag.length + 2);
  };

  const insertTextAtCursor = (text) => {
    const textarea = document.getElementById("message");
    if (!textarea) return;
    const { selectionStart: start, selectionEnd: end, value } = textarea,
      before = value.substring(0, start),
      after = value.substring(end);
    textarea.value = before + text + after;
    textarea.setSelectionRange(start + text.length, start + text.length);
    textarea.focus();
    updateHighlight();
    adjustTextareaAndHighlight();
  };

  const insertSmiley = (smiley) => {
    const textarea = document.getElementById("message");
    if (!textarea) return;
    const start = textarea.selectionStart,
      end = textarea.selectionEnd,
      scrollTop = textarea.scrollTop,
      text = textarea.value,
      before = text.substring(0, start),
      after = text.substring(end),
      insert = smiley.startsWith("http") ? `[img]${smiley}[/img]` : smiley;
    textarea.value = before + insert + after;
    textarea.setSelectionRange(start + insert.length, start + insert.length);
    textarea.scrollTop = scrollTop;
    textarea.focus();
    updateHighlight();
    adjustTextareaAndHighlight();
  };

  // =============================
  // BBCode Auto-Formatting (F8)
  // =============================
  const autoFormatBBCode = () => {
    const textarea = document.getElementById("message");
    if (!textarea) return;

    const text = textarea.value;
    const lines = text.split("\n");
    const formattedLines = [];
    let indentLevel = 0;
    let insideCodeBlock = false;

    // Define tags that affect indentation and require line breaks
    const blockTags = ["list", "spoiler", "quote", "table", "indent", "tab"];

    // Regex to find BBCode tags
    const tagRegex = /\[(\/)?([a-zA-Z0-9*]+)(=[^]]*)?\]/g;

    // Process each line
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Handle code blocks separately to preserve formatting
      if (insideCodeBlock) {
        formattedLines.push(line);
        if (line.toLowerCase().includes("[/code]")) {
          insideCodeBlock = false;
        }
        continue;
      }

      let trimmedLine = line.trim();

      // Skip empty lines but preserve them
      if (!trimmedLine) {
        formattedLines.push("");
        continue;
      }

      // Find all tags in the line
      const tagsOnLine = [...trimmedLine.matchAll(tagRegex)];

      // Check for opening/closing code blocks
      const hasCodeOpen = tagsOnLine.some(
        (match) => match[2].toLowerCase() === "code" && !match[1]
      );
      const hasCodeClose = tagsOnLine.some(
        (match) => match[2].toLowerCase() === "code" && match[1] === "/"
      );

      // Handle start of code block
      if (hasCodeOpen && !hasCodeClose) {
        insideCodeBlock = true;
        formattedLines.push("\t".repeat(indentLevel) + trimmedLine);
        continue;
      }

      // Process the line for proper formatting
      let currentLineIndent = indentLevel;
      let nextIndentLevel = indentLevel;

      // Check for block tags that need special handling
      let processedLine = trimmedLine;
      let lineSplit = false;

      // Process opening block tags that need line breaks
      for (const tag of blockTags) {
        const openTagRegex = new RegExp(`\\[${tag}(=[^\\]]*)?(\\s*)\\]`, "i");
        const match = processedLine.match(openTagRegex);

        if (match && !processedLine.toLowerCase().includes(`[/${tag}]`)) {
          // If tag is at start of line, just keep it there
          if (match.index === 0) {
            nextIndentLevel++;
          } else {
            // Split the line at the tag
            const beforeTag = processedLine.substring(0, match.index).trim();
            const tagAndAfter = processedLine.substring(match.index).trim();

            if (beforeTag) {
              formattedLines.push("\t".repeat(currentLineIndent) + beforeTag);
            }

            processedLine = tagAndAfter;
            lineSplit = true;
            nextIndentLevel++;
          }
        }
      }

      // Process closing block tags
      for (const tag of blockTags) {
        const closeTagRegex = new RegExp(`\\[/${tag}\\](\\s*)(.*?)$`, "i");
        const match = processedLine.match(closeTagRegex);

        if (match) {
          if (match.index === 0) {
            // Closing tag at beginning of line - reduce indent for this line
            currentLineIndent = Math.max(0, indentLevel - 1);
            nextIndentLevel = currentLineIndent;
          } else {
            // Split the line at the closing tag
            const beforeTag = processedLine.substring(0, match.index).trim();
            const tagAndAfter = processedLine.substring(match.index).trim();
            const afterTag = match[2] ? match[2].trim() : "";

            if (beforeTag) {
              formattedLines.push("\t".repeat(currentLineIndent) + beforeTag);
            }

            // Add the closing tag with reduced indent
            const closingIndent = Math.max(0, currentLineIndent - 1);
            formattedLines.push("\t".repeat(closingIndent) + `[/${tag}]`);

            // If there's content after the closing tag, process it on a new line
            if (afterTag) {
              processedLine = afterTag;
              lineSplit = true;
            } else {
              processedLine = "";
              lineSplit = true;
            }

            nextIndentLevel = closingIndent;
          }
        }
      }

      // Add the processed line if it's not empty and hasn't been completely handled
      if (processedLine) {
        formattedLines.push("\t".repeat(currentLineIndent) + processedLine);
      }

      // Handle special case: first tag on line is a closing block tag
      if (!lineSplit && tagsOnLine.length > 0) {
        const firstTag = tagsOnLine[0];
        if (
          firstTag[1] === "/" &&
          blockTags.includes(firstTag[2].toLowerCase()) &&
          trimmedLine.startsWith(firstTag[0])
        ) {
          nextIndentLevel = Math.max(0, currentLineIndent - 1);
        }
      }

      // Update indent level for next line
      indentLevel = nextIndentLevel;
    }

    const formattedText = formattedLines.join("\n");

    // Only update if text changed
    if (textarea.value !== formattedText) {
      // Save cursor position
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      textarea.value = formattedText;

      // Restore cursor position (simple approach)
      textarea.setSelectionRange(start, end);

      updateHighlight();
      adjustTextareaAndHighlight();
    }
  };

  // =============================
  // Positioning Functions
  // =============================
  const positionSmileyBox = () => {
    const smileyBox = document.getElementById("smiley-box"),
      textarea = document.getElementById("message");
    if (!smileyBox || !textarea) return;
    if (window.innerWidth <= 768) {
      Object.assign(smileyBox.style, {
        position: "static",
        width: "100%",
        maxHeight: "none",
        overflowY: "visible",
        marginBottom: "10px",
      });
    } else {
      const { top, right } = textarea.getBoundingClientRect(),
        windowWidth = window.innerWidth,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop,
        scrollStart = top + scrollTop,
        smileyBoxWidth = 220,
        leftPosition = Math.min(right + 10, windowWidth - smileyBoxWidth);
      if (scrollTop >= scrollStart) {
        const scrollDistance = scrollTop - scrollStart,
          maxScroll = textarea.offsetHeight - smileyBox.offsetHeight,
          newTop = Math.min(scrollDistance, maxScroll);
        Object.assign(smileyBox.style, {
          position: "absolute",
          top: scrollStart + newTop + "px",
          left: leftPosition + "px",
        });
      } else {
        Object.assign(smileyBox.style, {
          position: "absolute",
          top: scrollStart + "px",
          left: leftPosition + "px",
        });
      }
      smileyBox.style.maxHeight = "80vh";
      smileyBox.style.overflowY = "auto";
    }
  };

  const positionEditorHeader = () => {
    const editorHeader = document.getElementById("abbc3_buttons"),
      textarea = document.getElementById("message");
    if (!editorHeader || !textarea) return;
    const textareaRect = textarea.getBoundingClientRect(),
      headerRect = editorHeader.getBoundingClientRect(),
      scrollTop = window.pageYOffset || document.documentElement.scrollTop,
      offset = headerRect.top - textareaRect.top,
      scrollStart = textareaRect.top + scrollTop - offset;
    if (scrollTop >= scrollStart) {
      if (!editorHeader.classList.contains("fixed")) {
        editorHeader.classList.add("fixed");
        const placeholder = document.createElement("div");
        placeholder.style.height = editorHeader.offsetHeight + "px";
        placeholder.id = "abbc3_buttons_placeholder";
        editorHeader.parentNode.insertBefore(placeholder, editorHeader);
      }
      Object.assign(editorHeader.style, {
        width: textarea.offsetWidth + "px",
        left: textareaRect.left + "px",
        top: "0px",
      });
      let cumulative = 0;
      editorHeader.querySelectorAll(".abbc3_buttons_row").forEach((row) => {
        Object.assign(row.style, {
          width: textarea.offsetWidth + "px",
          position: "fixed",
          top: cumulative + "px",
        });
        row.classList.add("fixed");
        cumulative += row.offsetHeight;
      });
    } else if (editorHeader.classList.contains("fixed")) {
      editorHeader.classList.remove("fixed");
      editorHeader.style = "";
      const placeholder = document.getElementById("abbc3_buttons_placeholder");
      if (placeholder) placeholder.remove();
      editorHeader.querySelectorAll(".abbc3_buttons_row").forEach((row) => {
        row.style = "";
        row.classList.remove("fixed");
      });
    }
  };

  // =============================
  // Custom Smileys & Buttons
  // =============================
  const addCustomSmileyButtons = () => {
    const smileyBox = document.getElementById("smiley-box");
    if (!smileyBox) return;
    const topicReviewLink = smileyBox.querySelector('a[href="#review"]');
    if (topicReviewLink) topicReviewLink.parentElement.style.display = "none";
    const viewMoreLink = smileyBox.querySelector('a[href*="mode=smilies"]');
    const existing = Array.from(
      smileyBox.querySelectorAll('a[onclick^="insert_text"]')
    );
    const groups = {};
    existing.forEach((smiley) => {
      const imgSrc = smiley.querySelector("img")?.src || "";
      const dir = imgSrc.split("/").slice(0, -1).join("/");
      groups[dir] = groups[dir] || [];
      groups[dir].push(smiley);
    });
    existing.forEach((smiley) => smiley.remove());
    let firstGroup = true;
    for (const group of Object.values(groups)) {
      if (!firstGroup) {
        const hr = document.createElement("hr");
        hr.className = "smiley-group-separator";
        smileyBox.insertBefore(hr, viewMoreLink);
      }
      firstGroup = false;
      const groupContainer = document.createElement("div");
      groupContainer.className = "smiley-group";
      group.forEach((smiley) => {
        const btn = document.createElement("a");
        btn.href = "#";
        btn.className = "smiley-button";
        btn.onclick = smiley.onclick;
        const img = smiley.querySelector("img");
        btn.innerHTML = `<img src="${img.src}" alt="${img.alt}" title="${img.title}">`;
        groupContainer.appendChild(btn);
      });
      smileyBox.insertBefore(groupContainer, viewMoreLink);
    }
    let customContainer = smileyBox.querySelector(".custom-smiley-container"),
      customHr = smileyBox.querySelector(".custom-smiley-separator");
    if (customSmileys.length > 0) {
      if (!customHr) {
        customHr = document.createElement("hr");
        customHr.className = "custom-smiley-separator";
        smileyBox.insertBefore(customHr, viewMoreLink);
      }
      if (!customContainer) {
        customContainer = document.createElement("div");
        customContainer.className = "custom-smiley-container";
        smileyBox.insertBefore(customContainer, viewMoreLink);
      } else {
        customContainer.innerHTML = "";
      }
      customSmileys.forEach((smiley) => {
        const btn = document.createElement("a");
        btn.href = "#";
        btn.className = "custom-smiley-button";
        btn.innerHTML = smiley.startsWith("http")
          ? `<img src="${smiley}" alt="Custom Smiley" title="Custom Smiley">`
          : `<span class="emoji-smiley">${smiley}</span>`;
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          insertSmiley(smiley);
        });
        customContainer.appendChild(btn);
      });
    } else {
      if (customContainer) customContainer.remove();
      if (customHr) customHr.remove();
    }
  };

  const addCustomButtons = () => {
    const smileyBox = document.getElementById("smiley-box");
    if (!smileyBox) return;
    const bbcodeStatus = smileyBox.querySelector(".bbcode-status"),
      usernameElement = document.querySelector(".username-coloured"),
      isLoregamer =
        usernameElement && usernameElement.textContent.trim() === "loregamer";
    if (bbcodeStatus) {
      bbcodeStatus.innerHTML = `
        <hr />
        <button type="button" class="button button-secondary custom-button" id="insert-mod-template">Insert Mod Template</button>
        <button type="button" class="button button-secondary custom-button" id="insert-table">Insert Table</button>
        <button type="button" class="button button-secondary custom-button" id="ping-bloomery" style="display: ${
          isLoregamer ? "inline-block" : "none"
        };">Ping Bloomery</button>
      `;
      document
        .getElementById("insert-mod-template")
        .addEventListener("click", (e) => {
          e.preventDefault();
          insertModTemplate();
        });
      document.getElementById("insert-table").addEventListener("click", (e) => {
        e.preventDefault();
        insertTable();
      });
      document
        .getElementById("ping-bloomery")
        .addEventListener("click", (e) => {
          e.preventDefault();
          insertBloomeryPing();
        });
    }
  };

  const insertModTemplate = () => {
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
  };

  const insertTable = () => {
    const table = `| Files | Version | Type | Description |
|-------|-----------|-------|---------------|
|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |
|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |
|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |
|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |
`;
    insertTextAtCursor(table);
  };

  const insertBloomeryPing = () => {
    const pingText = `[smention]Bloomery[/smention]
[size=1] [smention u=459][/smention] [smention u=510][/smention] [smention u=897][/smention] [smention u=515][/smention] [smention u=548][/smention] [smention u=555][/smention] [smention u=615][/smention] [smention u=753][/smention] [smention u=918][/smention] [smention u=919][/smention] [smention u=3114][/smention] [smention u=58][/smention] [smention u=256][/smention] [smention u=63][/smention]  [/size]`;
    insertTextAtCursor(pingText);
  };

  // =============================
  // Custom Smileys Management Popup
  // =============================
  const showCustomSmileysPopup = (e) => {
    e.preventDefault();
    const popup = document.createElement("div");
    popup.id = "custom-smileys-popup";
    Object.assign(popup.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#2a2e36",
      border: "1px solid #3a3f4b",
      borderRadius: "5px",
      width: "80%",
      maxWidth: "600px",
      height: "80%",
      maxHeight: "600px",
      display: "flex",
      flexDirection: "column",
      zIndex: "9999",
      fontFamily: "'Open Sans', 'Droid Sans', Arial, Verdana, sans-serif",
    });
    const header = document.createElement("div");
    Object.assign(header.style, {
      padding: "20px",
      backgroundColor: "#2a2e36",
      borderBottom: "1px solid #3a3f4b",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: "0",
      zIndex: "1",
    });
    const title = document.createElement("h2");
    title.textContent = "Manage Custom Smileys";
    title.style.margin = "0";
    title.style.color = "#c5d0db";
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    Object.assign(closeButton.style, {
      backgroundColor: "#4a5464",
      color: "#c5d0db",
      border: "none",
      padding: "5px 10px",
      borderRadius: "3px",
      cursor: "pointer",
    });
    closeButton.onclick = (e) => {
      e.preventDefault();
      popup.remove();
    };
    header.append(title, closeButton);
    const content = document.createElement("div");
    Object.assign(content.style, {
      padding: "20px",
      overflowY: "auto",
      flexGrow: "1",
    });
    const smileyList = document.createElement("ul");
    Object.assign(smileyList.style, {
      listStyleType: "none",
      padding: "0",
      margin: "0",
    });
    const updateSmileyList = () => {
      smileyList.innerHTML = "";
      customSmileys.forEach((smiley, index) => {
        const li = document.createElement("li");
        Object.assign(li.style, {
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
        });
        if (isSingleEmoji(smiley)) {
          const emojiSpan = document.createElement("span");
          emojiSpan.textContent = smiley;
          emojiSpan.style.fontSize = "18px";
          emojiSpan.style.marginRight = "10px";
          li.appendChild(emojiSpan);
        } else {
          const img = document.createElement("img");
          img.src = smiley;
          img.alt = "Smiley";
          Object.assign(img.style, {
            width: "20px",
            height: "20px",
            marginRight: "10px",
          });
          li.appendChild(img);
        }
        const input = document.createElement("input");
        input.type = "text";
        input.value = smiley;
        input.disabled = true;
        Object.assign(input.style, {
          flexGrow: "1",
          marginRight: "10px",
          padding: "5px",
          backgroundColor: "#2a2e36",
          color: "#a0a0a0",
          border: "1px solid #3a3f4b",
          borderRadius: "3px",
          cursor: "default",
        });
        const btnStyle = `
          background-color: #4a5464;
          color: #c5d0db;
          border: none;
          padding: 5px 10px;
          margin-left: 5px;
          border-radius: 3px;
          cursor: pointer;
        `;
        const upBtn = document.createElement("button");
        upBtn.textContent = "↑";
        upBtn.style.cssText = btnStyle;
        upBtn.onclick = () => {
          if (index > 0) {
            [customSmileys[index - 1], customSmileys[index]] = [
              customSmileys[index],
              customSmileys[index - 1],
            ];
            saveCustomSmileys();
            updateSmileyList();
          }
        };
        const downBtn = document.createElement("button");
        downBtn.textContent = "↓";
        downBtn.style.cssText = btnStyle;
        downBtn.onclick = () => {
          if (index < customSmileys.length - 1) {
            [customSmileys[index], customSmileys[index + 1]] = [
              customSmileys[index + 1],
              customSmileys[index],
            ];
            saveCustomSmileys();
            updateSmileyList();
          }
        };
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.style.cssText = btnStyle;
        removeBtn.onclick = () => {
          customSmileys.splice(index, 1);
          saveCustomSmileys();
          updateSmileyList();
        };
        li.append(input, upBtn, downBtn, removeBtn);
        smileyList.appendChild(li);
      });
    };
    content.appendChild(smileyList);
    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.placeholder = "Enter new smiley or emoji and press Enter";
    Object.assign(newInput.style, {
      marginTop: "15px",
      padding: "5px",
      backgroundColor: "#3a3f4b",
      color: "#c5d0db",
      border: "1px solid #4a5464",
      borderRadius: "3px",
    });
    newInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && newInput.value.trim()) {
        customSmileys.push(newInput.value.trim());
        saveCustomSmileys();
        newInput.value = "";
        updateSmileyList();
      }
    });
    content.appendChild(newInput);
    updateSmileyList();
    popup.append(header, content);
    document.body.appendChild(popup);
  };

  const isSingleEmoji = (str) => {
    const emojiRegex =
      /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])$/;
    return emojiRegex.test(str);
  };

  const saveCustomSmileys = () => {
    GM_setValue("customSmileys", JSON.stringify(customSmileys));
    addCustomSmileyButtons();
  };

  // =============================
  // Remove Interfering Event Listeners
  // =============================
  const removeInterferingEventListeners = () => {
    const textarea = document.getElementById("message");
    if (textarea) {
      $(textarea).off("focus change keyup");
      textarea.classList.remove("auto-resized");
      textarea.style.height = "";
      textarea.style.resize = "none";
    }
  };

  // =============================
  // Custom Color Palette
  // =============================
  const addCustomColorsToPalette = () => {
    // Immediate check for existing palette
    const colorPalette = document.querySelector(
      ".colour-palette.horizontal-palette"
    );
    if (colorPalette) {
      addCustomColorsToExistingPalette(colorPalette);
    }

    // Set up a mutation observer to watch for the palette being added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const palette =
                node.classList && node.classList.contains("colour-palette")
                  ? node
                  : node.querySelector(".colour-palette.horizontal-palette");

              if (palette) {
                addCustomColorsToExistingPalette(palette);
              }
            }
          });
        }
      });
    });

    // Start observing the document body for palette additions
    observer.observe(document.body, { childList: true, subtree: true });

    // Add direct event listeners to color buttons - but only once
    const addColorButtonListeners = () => {
      // Use a more specific selector to find color buttons
      const colorButtons = document.querySelectorAll(
        '.bbcode-palette-colour, .color-palette-trigger, [data-bbcode="color"], .colour-palette-trigger'
      );

      colorButtons.forEach((button) => {
        // Skip if we've already added a listener
        if (button.dataset.customListenerAdded === "true") return;

        // Add a click listener that will add our custom colors when the palette appears
        button.addEventListener(
          "click",
          () => {
            // Wait a short time for the palette to be added to the DOM
            setTimeout(() => {
              const palette = document.querySelector(
                ".colour-palette.horizontal-palette"
              );
              if (palette) {
                addCustomColorsToExistingPalette(palette);
              }
            }, 50);
          },
          { once: false }
        ); // Allow multiple clicks

        // Mark this button as having a listener added
        button.dataset.customListenerAdded = "true";
      });
    };

    // Initial call
    addColorButtonListeners();

    // Set up an interval to check for new color buttons, but limit it to run for 30 seconds
    // after page load to avoid unnecessary processing
    let checkCount = 0;
    const intervalId = setInterval(() => {
      addColorButtonListeners();
      checkCount++;
      if (checkCount >= 30) {
        clearInterval(intervalId);
      }
    }, 1000);
  };

  // Helper function to add custom colors to an existing palette
  const addCustomColorsToExistingPalette = (colorPalette) => {
    // Check if we've already added our custom row to this palette
    if (colorPalette.dataset.customColorsAdded === "true") {
      return;
    }

    // Also check if our custom colors are already present in the palette
    const existingColors = Array.from(
      colorPalette.querySelectorAll("a[data-color]")
    ).map((a) => `#${a.getAttribute("data-color")}`.toUpperCase());

    // Custom colors to add
    const customColors = [
      "#F5575D", // Red
      "#3889ED", // Blue
      "#FFC107", // Yellow/Gold
      "#00AA00", // Green
      "#FC8A92",
      "#F7E6E7",
    ];

    // If all our custom colors are already present, mark as added and exit
    if (
      customColors.every((color) =>
        existingColors.includes(color.toUpperCase())
      )
    ) {
      colorPalette.dataset.customColorsAdded = "true";
      return;
    }

    // Create a new row for custom colors
    let tbody = colorPalette.querySelector("tbody");

    // If there's no tbody, create one
    if (!tbody) {
      tbody = document.createElement("tbody");
      colorPalette.appendChild(tbody);
    }

    // Get the first row to determine the number of cells
    const firstRow = tbody.querySelector("tr");
    if (!firstRow) {
      // If there are no rows, we can't determine the cell count
      // Create a default row with 25 cells (standard palette width)
      const newRow = document.createElement("tr");

      // Create cells for each custom color
      customColors.forEach((color) => {
        const td = document.createElement("td");
        td.style.backgroundColor = color;
        td.style.width = "15px";
        td.style.height = "12px";

        const a = document.createElement("a");
        a.href = "#";
        a.setAttribute("data-color", color.substring(1)); // Remove # from color code
        a.style.display = "block";
        a.style.width = "15px";
        a.style.height = "12px";
        a.setAttribute("alt", color);
        a.setAttribute("title", color);

        // Use the same click behavior as the original color cells
        a.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();

          // This is the standard behavior for color palette links
          const colorCode = this.getAttribute("data-color");
          const textarea = document.getElementById("message");
          if (textarea) {
            // Use the existing wrapSelectedText function
            wrapSelectedText(textarea, `color=#${colorCode}`);
            updateHighlight();
            adjustTextareaAndHighlight();
          }

          // Close the palette
          document.body.click();
          return false;
        };

        td.appendChild(a);
        newRow.appendChild(td);
      });

      // Add the new row to the palette
      tbody.appendChild(newRow);

      // Mark this palette as having custom colors added
      colorPalette.dataset.customColorsAdded = "true";
      return;
    }

    const newRow = document.createElement("tr");

    // Create cells for each custom color
    customColors.forEach((color) => {
      const td = document.createElement("td");
      td.style.backgroundColor = color;
      td.style.width = "15px";
      td.style.height = "12px";

      const a = document.createElement("a");
      a.href = "#";
      a.setAttribute("data-color", color.substring(1)); // Remove # from color code
      a.style.display = "block";
      a.style.width = "15px";
      a.style.height = "12px";
      a.setAttribute("alt", color);
      a.setAttribute("title", color);

      // Use the same click behavior as the original color cells
      a.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();

        // This is the standard behavior for color palette links
        const colorCode = this.getAttribute("data-color");
        const textarea = document.getElementById("message");
        if (textarea) {
          // Use the existing wrapSelectedText function
          wrapSelectedText(textarea, `color=#${colorCode}`);
          updateHighlight();
          adjustTextareaAndHighlight();
        }

        // Close the palette
        document.body.click();
        return false;
      };

      td.appendChild(a);
      newRow.appendChild(td);
    });

    // Add empty cells to fill the row
    const totalCells = firstRow.childElementCount;
    for (let i = customColors.length; i < totalCells; i++) {
      const td = document.createElement("td");
      td.style.width = "15px";
      td.style.height = "12px";
      newRow.appendChild(td);
    }

    // Add the new row to the palette
    tbody.appendChild(newRow);

    // Mark this palette as having custom colors added
    colorPalette.dataset.customColorsAdded = "true";
  };

  // =============================
  // Initialization
  // =============================
  const initialize = () => {
    updatePageTitle();
    const textArea = document.getElementById("message");
    if (!textArea) return setTimeout(initialize, 500);
    removeInterferingEventListeners();
    const container = document.createElement("div");
    container.className = "editor-container";
    const highlightDiv = document.createElement("div");
    highlightDiv.id = "bbcode-highlight";
    textArea.parentNode.replaceChild(container, textArea);
    container.append(highlightDiv, textArea);
    Object.assign(textArea.style, {
      overflow: "hidden",
      resize: "none",
      minHeight: "500px",
      position: "relative",
      zIndex: "2",
      background: "transparent",
      color: "rgb(204, 204, 204)",
      caretColor: "white",
      width: "100%",
      height: "100%",
      padding: "3px",
      boxSizing: "border-box",
      fontFamily: "Verdana, Helvetica, Arial, sans-serif",
      fontSize: "11px",
      lineHeight: "15.4px",
    });
    textArea.addEventListener("keydown", function (e) {
      if (e.ctrlKey && ["b", "i", "u"].includes(e.key)) {
        e.preventDefault();
        wrapSelectedText(this, e.key);
        updateHighlight();
        adjustTextareaAndHighlight();
      }
      if (e.altKey && e.key === "g") {
        e.preventDefault();
        wrapSelectedText(this, "color=#80BF00");
        updateHighlight();
        adjustTextareaAndHighlight();
      }
      // Handle Tab and Shift+Tab for indentation
      if (e.key === "Tab") {
        e.preventDefault(); // Prevent default tab behavior (changing focus)
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = this.value;
        const selectedLines = value.substring(start, end).split("\n");
        const beforeSelection = value.substring(0, start);
        const afterSelection = value.substring(end);

        // Find the start of the line where selection begins
        const lineStart = beforeSelection.lastIndexOf("\n") + 1;
        const lineEnd = afterSelection.indexOf("\n");
        const currentLineEnd = lineEnd === -1 ? value.length : end + lineEnd;

        if (e.shiftKey) {
          // Un-indent: Remove leading tab from the line(s)
          const lines = value.substring(lineStart, currentLineEnd).split("\n");
          let removedChars = 0;
          const modifiedLines = lines.map((line, index) => {
            // Only un-indent lines that are actually part of the selection or the cursor's line
            if (
              index === 0 ||
              (selectedLines.length > 1 &&
                lineStart + value.substring(lineStart).indexOf(line) < end)
            ) {
              if (line.startsWith("\t")) {
                removedChars++;
                return line.substring(1);
              }
            }
            return line;
          });
          this.value =
            value.substring(0, lineStart) +
            modifiedLines.join("\n") +
            value.substring(currentLineEnd);

          // Adjust cursor position
          const newStart = Math.max(lineStart, start - 1);
          const newEnd = Math.max(newStart, end - removedChars);
          this.setSelectionRange(newStart, newEnd);
        } else {
          // Indent: Add tab to the beginning of the line(s)
          if (selectedLines.length > 1) {
            // Multi-line selection: Indent each selected line
            const linesToModify = value.substring(lineStart, end).split("\n");
            let addedChars = 0;
            const modifiedSelection = linesToModify
              .map((line) => {
                // Check if the line actually starts within the selection range to avoid indenting the line *after* the selection ends
                const lineAbsoluteStart = value.indexOf(line, lineStart);
                if (lineAbsoluteStart >= start) {
                  addedChars++;
                  return "\t" + line;
                }
                return line;
              })
              .join("\n");

            // Find the actual start of the first selected line
            const firstSelectedLineStart =
              value.lastIndexOf("\n", start - 1) + 1;

            this.value =
              value.substring(0, firstSelectedLineStart) +
              modifiedSelection +
              value.substring(end);
            this.setSelectionRange(start + 1, end + addedChars);
          } else {
            // Single line or no selection: Insert tab at cursor or indent current line
            this.value =
              beforeSelection.substring(0, lineStart) +
              "\t" +
              beforeSelection.substring(lineStart) +
              value.substring(start);
            this.setSelectionRange(start + 1, start + 1);
          }
        }
        updateHighlight();
        adjustTextareaAndHighlight();
      }

      // Handle F8 for auto-formatting
      if (e.key === "F8") {
        e.preventDefault(); // Prevent any default F8 behavior
        try {
          autoFormatBBCode(); // Call the formatting function
        } catch (error) {
          console.error("Error during BBCode auto-formatting:", error);
        }
      }
    });
    let lastContent = textArea.value,
      updateTimer = null;
    const storedSmileys = GM_getValue("customSmileys");
    if (storedSmileys) customSmileys = JSON.parse(storedSmileys);
    const smileyBox = document.getElementById("smiley-box");
    if (smileyBox) {
      const manageButton = document.createElement("button");
      manageButton.textContent = "Manage Custom Smileys";
      Object.assign(manageButton.style, {
        marginTop: "10px",
        backgroundColor: "#4a5464",
        color: "#c5d0db",
        border: "none",
        padding: "5px 10px",
        borderRadius: "3px",
        cursor: "pointer",
      });
      manageButton.onclick = showCustomSmileysPopup;
      smileyBox.appendChild(manageButton);
    }
    const checkForUpdates = () => {
      if (textArea.value !== lastContent) {
        updateHighlight();
        adjustTextareaAndHighlight();
        lastContent = textArea.value;
      }
      updateTimer = setTimeout(checkForUpdates, 100);
    };
    textArea.addEventListener("input", () => {
      clearTimeout(updateTimer);
      checkForUpdates();
    });
    window.addEventListener("resize", adjustTextareaAndHighlight);
    updateHighlight();
    adjustTextareaAndHighlight();
    checkForUpdates();
    document.querySelectorAll("h3").forEach((heading) => {
      if (heading.textContent.trim() === "Submit a new mod") {
        const headerContainer = document.createElement("div");
        headerContainer.style.display = "flex";
        headerContainer.style.alignItems = "center";
        headerContainer.style.marginBottom = "10px";
        const headingClone = document.createElement("h3");
        headingClone.textContent = heading.textContent;
        headingClone.style.margin = "0 10px 0 0";
        if (heading.className) headingClone.className = heading.className;
        Array.from(heading.style).forEach((prop) => {
          if (prop !== "margin") headingClone.style[prop] = heading.style[prop];
        });
        const copyButton = document.createElement("button");
        copyButton.innerHTML =
          '<i class="icon fa-copy fa-fw" aria-hidden="true"></i> Copy';
        Object.assign(copyButton.style, {
          backgroundColor: "#4a5464",
          color: "#c5d0db",
          border: "none",
          padding: "5px 10px",
          marginRight: "5px",
          borderRadius: "3px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        });
        const pasteButton = document.createElement("button");
        pasteButton.innerHTML =
          '<i class="icon fa-paste fa-fw" aria-hidden="true"></i> Paste';
        Object.assign(pasteButton.style, {
          backgroundColor: "#4a5464",
          color: "#c5d0db",
          border: "none",
          padding: "5px 10px",
          borderRadius: "3px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        });
        copyButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const existingData = GM_getValue("savedFormData", null);
          if (existingData) {
            const confirmDialog = document.createElement("div");
            Object.assign(confirmDialog.style, {
              position: "fixed",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: "10000",
            });
            const dialogContent = document.createElement("div");
            Object.assign(dialogContent.style, {
              backgroundColor: "#3A404A",
              borderRadius: "5px",
              padding: "20px",
              maxWidth: "450px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            });
            const title = document.createElement("h3");
            title.textContent = "Confirm Overwrite";
            Object.assign(title.style, {
              color: "#c5d0db",
              marginTop: "0",
              marginBottom: "15px",
              fontSize: "16px",
              borderBottom: "1px solid #4a5464",
              paddingBottom: "10px",
            });
            const message = document.createElement("p");
            message.textContent =
              "There's already saved form data in your clipboard. Do you want to overwrite it?";
            Object.assign(message.style, {
              color: "#c5d0db",
              marginBottom: "15px",
              fontSize: "14px",
            });
            const parsedData = JSON.parse(existingData);
            const previewContainer = document.createElement("div");
            Object.assign(previewContainer.style, {
              backgroundColor: "#2a2e36",
              borderRadius: "3px",
              padding: "10px",
              marginBottom: "15px",
              maxHeight: "150px",
              overflowY: "auto",
              fontSize: "12px",
              color: "#a0a0a0",
            });
            let previewHTML = "";
            if (parsedData.modName)
              previewHTML += `<strong>Mod Name:</strong> ${parsedData.modName}<br>`;
            if (parsedData.modVersion)
              previewHTML += `<strong>Version:</strong> ${parsedData.modVersion}<br>`;
            if (parsedData.modAuthorName)
              previewHTML += `<strong>Author:</strong> ${parsedData.modAuthorName}<br>`;
            if (parsedData.message) {
              const preview =
                parsedData.message.length > 100
                  ? parsedData.message.substring(0, 100) + "..."
                  : parsedData.message;
              previewHTML += `<strong>Message:</strong> ${preview}<br>`;
            }
            if (parsedData.tags && parsedData.tags.length > 0)
              previewHTML += `<strong>Tags:</strong> ${parsedData.tags.join(
                ", "
              )}<br>`;
            previewContainer.innerHTML = previewHTML || "No preview available";
            const buttonContainer = document.createElement("div");
            Object.assign(buttonContainer.style, {
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            });
            const cancelButton = document.createElement("button");
            cancelButton.textContent = "Cancel";
            Object.assign(cancelButton.style, {
              backgroundColor: "#4a5464",
              color: "#c5d0db",
              border: "none",
              padding: "8px 15px",
              borderRadius: "3px",
              cursor: "pointer",
            });
            const confirmButton = document.createElement("button");
            confirmButton.textContent = "Overwrite";
            Object.assign(confirmButton.style, {
              backgroundColor: "#9C4343",
              color: "#c5d0db",
              border: "none",
              padding: "8px 15px",
              borderRadius: "3px",
              cursor: "pointer",
            });
            cancelButton.addEventListener("click", () =>
              confirmDialog.remove()
            );
            confirmButton.addEventListener("click", () => {
              confirmDialog.remove();
              saveFormData();
            });
            dialogContent.append(
              title,
              message,
              previewContainer,
              buttonContainer
            );
            buttonContainer.append(cancelButton, confirmButton);
            confirmDialog.appendChild(dialogContent);
            document.body.appendChild(confirmDialog);
            return;
          } else {
            saveFormData();
          }
          function saveFormData() {
            const message = document.getElementById("message").value;
            const formData = { message };
            if (document.getElementById("modwrangler-wrapper")) {
              if (document.getElementById("gameSelect"))
                formData.gameSelect =
                  document.getElementById("gameSelect").value;
              if (document.getElementById("modName"))
                formData.modName = document.getElementById("modName").value;
              if (document.getElementById("modVersion"))
                formData.modVersion =
                  document.getElementById("modVersion").value;
              if (document.getElementById("modAuthorName"))
                formData.modAuthorName =
                  document.getElementById("modAuthorName").value;
              formData.tags = [];
              document
                .querySelectorAll('input[type="checkbox"][id^="tag-"]')
                .forEach((checkbox) => {
                  if (checkbox.checked) formData.tags.push(checkbox.value);
                });
              if (document.getElementById("thumbnailURL"))
                formData.thumbnailURL =
                  document.getElementById("thumbnailURL").value;
              if (document.getElementById("vaultFileName"))
                formData.vaultFileName =
                  document.getElementById("vaultFileName").value;
              if (document.getElementById("modDescription"))
                formData.modDescription =
                  document.getElementById("modDescription").value;
            }
            GM_setValue("savedFormData", JSON.stringify(formData));
            const notification = document.createElement("div");
            notification.textContent = "Form data saved!";
            Object.assign(notification.style, {
              position: "fixed",
              top: "20px",
              right: "20px",
              backgroundColor: "#4a5464",
              color: "#c5d0db",
              padding: "10px",
              borderRadius: "5px",
              zIndex: "9999",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            });
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 2000);
          }
        });
        pasteButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const savedData = GM_getValue("savedFormData", "{}");
          const formData = JSON.parse(savedData);
          if (formData.message) {
            document.getElementById("message").value = formData.message;
            updateHighlight();
            adjustTextareaAndHighlight();
          }
          if (document.getElementById("modwrangler-wrapper")) {
            if (document.getElementById("gameSelect") && formData.gameSelect)
              document.getElementById("gameSelect").value = formData.gameSelect;
            if (document.getElementById("modName") && formData.modName)
              document.getElementById("modName").value = formData.modName;
            if (document.getElementById("modVersion") && formData.modVersion)
              document.getElementById("modVersion").value = formData.modVersion;
            if (
              document.getElementById("modAuthorName") &&
              formData.modAuthorName
            )
              document.getElementById("modAuthorName").value =
                formData.modAuthorName;
            if (formData.tags && Array.isArray(formData.tags)) {
              document
                .querySelectorAll('input[type="checkbox"][id^="tag-"]')
                .forEach((checkbox) => (checkbox.checked = false));
              formData.tags.forEach((tag) => {
                const checkbox = document.querySelector(
                  `input[type="checkbox"][value="${tag}"]`
                );
                if (checkbox) checkbox.checked = true;
              });
            }
            if (
              document.getElementById("thumbnailURL") &&
              formData.thumbnailURL
            )
              document.getElementById("thumbnailURL").value =
                formData.thumbnailURL;
            if (
              document.getElementById("vaultFileName") &&
              formData.vaultFileName
            )
              document.getElementById("vaultFileName").value =
                formData.vaultFileName;
            if (
              document.getElementById("modDescription") &&
              formData.modDescription
            )
              document.getElementById("modDescription").value =
                formData.modDescription;
          }
          const notification = document.createElement("div");
          notification.textContent = "Form data restored!";
          Object.assign(notification.style, {
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: "#4a5464",
            color: "#c5d0db",
            padding: "10px",
            borderRadius: "5px",
            zIndex: "9999",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          });
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 2000);
        });
        headerContainer.append(headingClone, copyButton, pasteButton);
        heading.parentNode.replaceChild(headerContainer, heading);
      }
    });
    addCustomSmileyButtons();
    addCustomButtons();
    positionSmileyBox();
    positionEditorHeader();
    const vaultContainer = document.createElement("div");
    vaultContainer.style.marginTop = "10px";
    const vaultLink = document.createElement("a");
    vaultLink.href = "javascript:void(0);";
    Object.assign(vaultLink.style, {
      color: "rgb(58, 128, 234)",
      fontSize: "1em",
      display: "inline-flex",
      alignItems: "center",
      textDecoration: "none",
    });
    vaultLink.innerHTML = `<img src="https://f.rpghq.org/V4gHDnvTTgpf.webp" width="16" height="16" style="margin-right: 5px;"> Open Vault`;
    vaultLink.onclick = (e) => {
      e.preventDefault();
      window.open(
        "https://vault.rpghq.org/",
        "RPGHQVault",
        "width=800,height=800,resizable=yes,scrollbars=yes"
      );
    };
    vaultContainer.appendChild(vaultLink);
    textArea.parentNode.insertBefore(vaultContainer, textArea.nextSibling);
    window.addEventListener("resize", () => {
      positionSmileyBox();
      positionEditorHeader();
    });
    window.addEventListener("scroll", () => {
      positionSmileyBox();
      positionEditorHeader();
    });
  };

  // =============================
  // Form Submission Tracking & Warning
  // =============================
  let isFormSubmitting = false;
  const setupFormSubmitTracking = () => {
    const postForm = document.getElementById("postform");
    if (postForm)
      postForm.addEventListener("submit", () => {
        isFormSubmitting = true;
      });
  };
  window.addEventListener("beforeunload", (e) => {
    if (isFormSubmitting) return;
    const msg = "You have unsaved changes. Are you sure you want to leave?";
    e.returnValue = msg;
    return msg;
  });

  // =============================
  // Run on Page Load
  // =============================
  window.addEventListener("load", () => {
    addStyles();
    initialize();
    setupFormSubmitTracking();
    addCustomColorsToPalette();
  });
})();
