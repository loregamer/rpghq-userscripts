// ==UserScript==
// @name         RPGHQ - BBCode Highlighter
// @namespace    http://rpghq.org/
// @version      6.0
// @description  Highlight BBCode tags in the text editor on RPGHQ forum with consistent colors for matching tags
// @author       loregamer
// @match        https://rpghq.org/forums/posting.php?mode=post*
// @match        https://rpghq.org/forums/posting.php?mode=quote*
// @match        https://rpghq.org/forums/posting.php?mode=reply*
// @match        https://rpghq.org/forums/posting.php?mode=edit*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
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
  // Global Utility Functions
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
  // BBCode Tag Color Management
  // =============================
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
  // CSS Styles
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
            .bbcode-list-item { color: #FFD700; }
            .bbcode-link { color: #5D8FBD; }
            
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
            
            .editor-container { 
                position: relative; 
                width: 100%; 
                height: auto; 
            }
            
            #abbc3_buttons.fixed { 
                position: fixed; 
                top: 0; 
                z-index: 1000; 
                background-color: #3A404A !important; 
            }
            
            .abbc3_buttons_row.fixed { 
                background-color: #3A404A !important; 
                position: fixed; 
                top: 0; 
                z-index: 1000; 
            }
        `;
    document.head.appendChild(style);
  };

  // =============================
  // BBCode Highlighting
  // =============================
  const highlightBBCode = (text) => {
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

        const colorIndex = getColorIndex(keyword);
        let out =
          `<span class="bbcode-bracket" style="color:#A0A0A0;">[</span>` +
          `<span class="bbcode-tag-${colorIndex}">${escapeHTML(slash + keyword)}</span>`;

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
                    `<span class="bbcode-color-preview" style="background-color:${hex}; color:${getContrastColor(hex)};">${escapeHTML(hex)}</span>`;
                  const extra = paramValue.slice(hex.length);
                  if (extra) {
                    out += `<span class="bbcode-attribute">${escapeHTML(extra)}</span>`;
                  }
                } else {
                  out +=
                    leadingWs +
                    `<span class="bbcode-attribute">=</span>` +
                    `<span class="bbcode-attribute">${escapeHTML(paramValue)}</span>`;
                }
              } else {
                out +=
                  leadingWs +
                  `<span class="bbcode-attribute">=</span>` +
                  `<span class="bbcode-attribute">${escapeHTML(paramValue)}</span>`;
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

    // Second pass: Wrap URLs with a span using the "bbcode-link" class
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

      Object.assign(smileyBox.style, {
        position: "absolute",
        top: scrollStart + "px",
        left: leftPosition + "px",
        maxHeight: "80vh",
        overflowY: "auto",
      });
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

    let lastContent = textArea.value,
      updateTimer = null;

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
    window.addEventListener("scroll", () => {
      positionSmileyBox();
      positionEditorHeader();
    });

    updateHighlight();
    adjustTextareaAndHighlight();
    checkForUpdates();
  };

  // =============================
  // Run on Page Load
  // =============================
  window.addEventListener("load", () => {
    addStyles();
    initialize();
  });
})();
