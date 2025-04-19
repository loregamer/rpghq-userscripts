// ==UserScript==
// @name         RPGHQ - BBCode Editor
// @namespace    http://rpghq.org/
// @version      7.0
// @description  Enhanced BBCode editor with real-time parsing and syntax highlighting for RPGHQ forums
// @author       loregamer (modified by Claude)
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

Copyright (c) 2024 loregamer (modified by Claude)

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
  // Constants & Configuration
  // =============================
  const TAG_COLORS = {
    img: 1,
    url: 4,
    color: 3,
    "*": "list-item",
  };

  const DEFAULT_COLOR_INDEX = 2; // Default color for tags not in TAG_COLORS
  const DEBOUNCE_DELAY = 150; // Milliseconds to wait before processing input
  const URL_REGEX = /(https?:\/\/[^\s<]+)/g;
  const BBCODE_REGEX = /\[(\/?)([a-zA-Z0-9*]+)([^\]]*)\]/g;
  const WHITESPACE_REGEX = /\s+/g;

  // =============================
  // BBCode Parsing & Rendering
  // =============================

  // Get color index for a tag
  const getColorIndex = (tagName) => {
    const lowerTagName = tagName.toLowerCase();
    if (lowerTagName in TAG_COLORS) {
      return TAG_COLORS[lowerTagName];
    }

    // Add new tag to our color map
    TAG_COLORS[lowerTagName] = Object.keys(TAG_COLORS).length % 5;
    return TAG_COLORS[lowerTagName];
  };

  // Parse BBCode and convert it to HTML for the editor
  const parseBBCode = (text) => {
    if (!text) return "";

    let html = "";
    let lastIndex = 0;
    let match;

    // Reset regex lastIndex
    BBCODE_REGEX.lastIndex = 0;

    while ((match = BBCODE_REGEX.exec(text)) !== null) {
      const [fullMatch, slash, tagName, attributes] = match;
      const startIndex = match.index;

      // Process text before the tag
      if (startIndex > lastIndex) {
        const textBefore = text.substring(lastIndex, startIndex);
        html += processTextWithUrls(textBefore);
      }

      // Process the tag
      const isClosingTag = slash === "/";
      const colorIndex = getColorIndex(tagName);

      // Start with the opening bracket
      html += `<span class="bbcode-bracket" style="color:#A0A0A0;">[</span>`;

      // Add slash for closing tags and tag name
      if (isClosingTag) {
        html += `<span class="bbcode-tag-${colorIndex}">/`;
      } else {
        html += `<span class="bbcode-tag-${colorIndex}">`;
      }

      // Special handling for list items
      if (tagName === "*") {
        html =
          `<span class="bbcode-bracket" style="color:#A0A0A0;">[</span>` +
          `<span class="bbcode-list-item">*</span>` +
          `<span class="bbcode-bracket" style="color:#A0A0A0;">]</span>`;
      } else {
        html += `${escapeHTML(tagName)}</span>`;

        // Process attributes if any
        if (attributes) {
          const leadingWs = attributes.match(/^\s*/)[0];
          const params = attributes.slice(leadingWs.length);

          if (params) {
            if (params.startsWith("=")) {
              const paramValue = params.slice(1).trim();

              if (tagName.toLowerCase() === "color") {
                const hexMatch = paramValue.match(/^(#[0-9A-Fa-f]{6})/);
                if (hexMatch) {
                  const hex = hexMatch[1];
                  html +=
                    leadingWs +
                    `<span class="bbcode-attribute">=</span>` +
                    `<span class="bbcode-color-preview" style="background-color:${hex}; color:${getContrastColor(hex)};">${escapeHTML(hex)}</span>`;

                  const extra = paramValue.slice(hex.length);
                  if (extra) {
                    html += `<span class="bbcode-attribute">${escapeHTML(extra)}</span>`;
                  }
                } else {
                  html +=
                    leadingWs +
                    `<span class="bbcode-attribute">=</span>` +
                    `<span class="bbcode-attribute">${escapeHTML(paramValue)}</span>`;
                }
              } else {
                html +=
                  leadingWs +
                  `<span class="bbcode-attribute">=</span>` +
                  `<span class="bbcode-attribute">${escapeHTML(paramValue)}</span>`;
              }
            } else {
              html +=
                leadingWs +
                `<span class="bbcode-attribute">${escapeHTML(params)}</span>`;
            }
          } else {
            html += leadingWs;
          }
        }

        html += `<span class="bbcode-bracket" style="color:#A0A0A0;">]</span>`;
      }

      lastIndex = startIndex + fullMatch.length;
    }

    // Process any remaining text
    if (lastIndex < text.length) {
      html += processTextWithUrls(text.substring(lastIndex));
    }

    return html;
  };

  // Process text and highlight URLs
  const processTextWithUrls = (text) => {
    if (!text) return "";

    let result = "";
    let lastIndex = 0;
    let match;

    // Reset regex lastIndex
    URL_REGEX.lastIndex = 0;

    while ((match = URL_REGEX.exec(text)) !== null) {
      const url = match[0];
      const startIndex = match.index;

      // Add text before URL
      if (startIndex > lastIndex) {
        result += escapeHTML(text.substring(lastIndex, startIndex));
      }

      // Add highlighted URL
      result += `<span class="bbcode-link">${escapeHTML(url)}</span>`;

      lastIndex = startIndex + url.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      result += escapeHTML(text.substring(lastIndex));
    }

    return result;
  };

  // Escape HTML special characters
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

  // Get contrast color (black or white) for a background color
  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16),
      g = parseInt(hexColor.slice(3, 5), 16),
      b = parseInt(hexColor.slice(5, 7), 16),
      yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "black" : "white";
  };

  // =============================
  // Editor Implementation
  // =============================

  // Create a custom editor that preserves BBCode
  class BBCodeEditor {
    constructor(originalTextarea) {
      this.textarea = originalTextarea;
      this.container = null;
      this.editor = null;
      this.hiddenInput = null;
      this.lastText = "";
      this.isComposing = false;
      this.undoStack = [];
      this.redoStack = [];
      this.maxStackSize = 100;

      this.initialize();
    }

    initialize() {
      // Create container
      this.container = document.createElement("div");
      this.container.className = "bbcode-editor-container";

      // Create editor element
      this.editor = document.createElement("div");
      this.editor.className = "bbcode-editor";
      this.editor.contentEditable = true;
      this.editor.spellcheck = false;
      this.editor.autocomplete = "off";
      this.editor.autocorrect = "off";
      this.editor.autocapitalize = "off";
      this.editor.dataset.gramm = false; // Disable Grammarly

      // Create hidden input to store raw BBCode
      this.hiddenInput = document.createElement("textarea");
      this.hiddenInput.name = this.textarea.name;
      this.hiddenInput.id = this.textarea.id;
      this.hiddenInput.style.display = "none";

      // Replace textarea with our editor
      this.textarea.parentNode.replaceChild(this.container, this.textarea);
      this.container.appendChild(this.editor);
      this.container.appendChild(this.hiddenInput);

      // Initialize with existing content
      this.setText(this.textarea.value || "");

      // Set up event handlers
      this.setupEventHandlers();

      // Store initial state in undo stack
      this.saveUndoState();
    }

    setupEventHandlers() {
      // Input event - update content
      this.editor.addEventListener("input", this.handleInput.bind(this));

      // Key events for special handling
      this.editor.addEventListener("keydown", this.handleKeyDown.bind(this));
      this.editor.addEventListener("keyup", this.handleKeyUp.bind(this));

      // Composition events (for IME input)
      this.editor.addEventListener("compositionstart", () => {
        this.isComposing = true;
      });

      this.editor.addEventListener("compositionend", () => {
        this.isComposing = false;
        this.handleInput();
      });

      // Paste event to handle BBCode pasting
      this.editor.addEventListener("paste", this.handlePaste.bind(this));

      // Focus/blur events
      this.editor.addEventListener("focus", () => {
        this.container.classList.add("focused");
      });

      this.editor.addEventListener("blur", () => {
        this.container.classList.remove("focused");
        this.updateTextarea();
      });

      // Form submission - ensure textarea is updated
      const form = this.hiddenInput.form;
      if (form) {
        form.addEventListener("submit", () => {
          this.updateTextarea();
        });
      }
    }

    handleInput() {
      if (this.isComposing) return;

      const currentContent = this.getRawContent();

      // Only process if content has changed
      if (currentContent !== this.lastText) {
        this.lastText = currentContent;
        this.updateHiddenInput(currentContent);

        // Update the highlighting with debounce
        clearTimeout(this.inputTimeout);
        this.inputTimeout = setTimeout(() => {
          this.renderHighlighting(currentContent);
          this.saveUndoState();
        }, DEBOUNCE_DELAY);
      }
    }

    handleKeyDown(e) {
      // Handle special keys
      if (e.key === "Tab") {
        e.preventDefault();
        document.execCommand("insertText", false, "    "); // Insert 4 spaces
      }

      // Handle undo/redo
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
      }

      // Handle line breaks
      if (e.key === "Enter") {
        e.preventDefault();
        document.execCommand("insertText", false, "\n");
      }
    }

    handleKeyUp(e) {
      // For arrow keys, Enter, etc., update cursor position
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
          "Enter",
        ].includes(e.key)
      ) {
        this.saveCursorPosition();
      }
    }

    handlePaste(e) {
      e.preventDefault();

      // Get clipboard content as text
      const clipboardData = e.clipboardData || window.clipboardData;
      const text = clipboardData.getData("text/plain");

      // Insert text at cursor position
      document.execCommand("insertText", false, text);
    }

    // Get raw BBCode content from the editor
    getRawContent() {
      // Use textContent to get raw text (ignoring HTML)
      return this.editor.textContent || "";
    }

    // Set content of the editor
    setText(text) {
      this.lastText = text;
      this.updateHiddenInput(text);
      this.renderHighlighting(text);
    }

    // Update the hidden input with raw BBCode
    updateHiddenInput(text) {
      this.hiddenInput.value = text;
    }

    // Update original textarea (for form submission)
    updateTextarea() {
      const content = this.getRawContent();
      this.updateHiddenInput(content);
    }

    // Render syntax highlighting
    renderHighlighting(text) {
      // Save selection
      const selection = this.saveSelection();

      // Apply highlighting
      this.editor.innerHTML = parseBBCode(text);

      // Restore selection
      if (selection) {
        this.restoreSelection(selection);
      }
    }

    // Save current selection range
    saveSelection() {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        return sel.getRangeAt(0);
      }
      return null;
    }

    // Restore selection range
    restoreSelection(range) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // Save cursor position
    saveCursorPosition() {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        this.cursorPosition = selection.getRangeAt(0).cloneRange();
      }
    }

    // Restore cursor position
    restoreCursorPosition() {
      if (this.cursorPosition) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(this.cursorPosition);
      }
    }

    // Save current state to undo stack
    saveUndoState() {
      const content = this.getRawContent();

      // Don't save if content hasn't changed
      if (
        this.undoStack.length > 0 &&
        this.undoStack[this.undoStack.length - 1] === content
      ) {
        return;
      }

      // Save state
      this.undoStack.push(content);

      // Clear redo stack when new changes are made
      this.redoStack = [];

      // Limit stack size
      if (this.undoStack.length > this.maxStackSize) {
        this.undoStack.shift();
      }
    }

    // Undo last change
    undo() {
      if (this.undoStack.length <= 1) return; // Keep at least one state

      // Move current state to redo stack
      const currentState = this.undoStack.pop();
      this.redoStack.push(currentState);

      // Apply previous state
      const previousState = this.undoStack[this.undoStack.length - 1];
      this.setText(previousState);
    }

    // Redo previously undone change
    redo() {
      if (this.redoStack.length === 0) return;

      // Get state from redo stack
      const nextState = this.redoStack.pop();
      this.undoStack.push(nextState);

      // Apply the state
      this.setText(nextState);
    }

    // Resize the editor to fit content
    resize() {
      this.editor.style.height = "auto";
      this.editor.style.height = Math.max(this.editor.scrollHeight, 500) + "px";
    }
  }

  // =============================
  // Debounce Implementation
  // =============================
  const debounce = (func, wait) => {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
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
  
          .bbcode-editor-container {
              position: relative;
              width: 100%;
              height: auto;
              border: 1px solid #525252;
              border-radius: 2px;
              background-color: #3A404A;
          }
  
          .bbcode-editor-container.focused {
              border-color: #8898aa;
          }
  
          .bbcode-editor {
              width: 100%;
              min-height: 500px;
              padding: 3px;
              font-family: Verdana, Helvetica, Arial, sans-serif;
              font-size: 11px;
              line-height: 15.4px;
              color: rgb(204, 204, 204);
              background-color: #3A404A;
              white-space: pre-wrap;
              word-break: break-word;
              overflow-wrap: break-word;
              overflow-y: auto;
              box-sizing: border-box;
              outline: none;
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
  
          /* Match forum styling */
          ::selection {
              background-color: #525252;
              color: white;
          }
        `;
    document.head.appendChild(style);
  };

  // =============================
  // Layout Adjustment Functions
  // =============================
  // Update page title based on URL parameters
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

  // Position smiley box
  const positionSmileyBox = () => {
    const smileyBox = document.getElementById("smiley-box");
    const editor = document.querySelector(".bbcode-editor");

    if (!smileyBox || !editor) return;

    if (window.innerWidth <= 768) {
      Object.assign(smileyBox.style, {
        position: "static",
        width: "100%",
        maxHeight: "none",
        overflowY: "visible",
        marginBottom: "10px",
      });
    } else {
      const { top, right } = editor.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollStart = top + scrollTop;
      const smileyBoxWidth = 220;
      const leftPosition = Math.min(right + 10, windowWidth - smileyBoxWidth);

      Object.assign(smileyBox.style, {
        position: "absolute",
        top: scrollStart + "px",
        left: leftPosition + "px",
        maxHeight: "80vh",
        overflowY: "auto",
      });
    }
  };

  // Editor header positioning
  const positionEditorHeader = () => {
    const editorHeader = document.getElementById("abbc3_buttons");
    const editor = document.querySelector(".bbcode-editor");

    if (!editorHeader || !editor) return;

    const editorRect = editor.getBoundingClientRect();
    const headerRect = editorHeader.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const offset = headerRect.top - editorRect.top;
    const scrollStart = editorRect.top + scrollTop - offset;

    if (scrollTop >= scrollStart) {
      if (!editorHeader.classList.contains("fixed")) {
        editorHeader.classList.add("fixed");
        const placeholder = document.createElement("div");
        placeholder.style.height = editorHeader.offsetHeight + "px";
        placeholder.id = "abbc3_buttons_placeholder";
        editorHeader.parentNode.insertBefore(placeholder, editorHeader);
      }

      Object.assign(editorHeader.style, {
        width: editor.offsetWidth + "px",
        left: editorRect.left + "px",
        top: "0px",
      });

      let cumulative = 0;
      editorHeader.querySelectorAll(".abbc3_buttons_row").forEach((row) => {
        Object.assign(row.style, {
          width: editor.offsetWidth + "px",
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
  // Forum BBCode Button Integration
  // =============================

  // Hook into forum's BBCode buttons to insert BBCode into our editor
  const hookBBCodeButtons = () => {
    // Find all BBCode buttons
    const bbcodeButtons = document.querySelectorAll(".abbc3_button");
    const editor = document.querySelector(".bbcode-editor");

    if (!bbcodeButtons.length || !editor) return;

    // Get original click handlers and replace them
    for (const button of bbcodeButtons) {
      // Skip certain buttons like "Add file" that have special behavior
      if (
        button.id === "abbc3_addfile" ||
        button.classList.contains("special-button")
      ) {
        continue;
      }

      // Clone button to remove all event listeners
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);

      // Add our own click handler
      newButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const bbcodeAttr = newButton.getAttribute("data-bbcode");
        if (!bbcodeAttr) return;

        // Get BBCode to insert
        const bbcodeData = JSON.parse(bbcodeAttr);
        let { open, close } = bbcodeData;

        // Handle special case for URL button
        if (open === "[url=]" && close === "[/url]") {
          insertURL();
          return;
        }

        // Focus editor and insert BBCode
        editor.focus();
        insertBBCode(open, close);
      });
    }

    // Special handler for URL button
    const insertURL = () => {
      const editor = document.querySelector(".bbcode-editor");
      const selection = window.getSelection();
      const selectedText = selection.toString();

      let url = prompt("Enter the URL:", "https://");

      if (!url) return;

      if (selectedText) {
        // Selected text becomes the link text
        insertBBCode(`[url=${url}]`, "[/url]");
      } else {
        // URL becomes both the URL and the link text
        insertBBCode("[url]", "[/url]");
        const range = selection.getRangeAt(0);
        range.insertNode(document.createTextNode(url));
      }
    };

    // Function to insert BBCode at cursor
    const insertBBCode = (openTag, closeTag) => {
      const selection = window.getSelection();

      if (selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const selectedText = range.toString();

      // Delete selected text
      range.deleteContents();

      // Create text nodes for BBCode tags
      const openNode = document.createTextNode(openTag);
      const closeNode = document.createTextNode(closeTag);

      // Insert the tags and selected text
      range.insertNode(closeNode);

      if (selectedText) {
        range.insertNode(document.createTextNode(selectedText));
      }

      range.insertNode(openNode);

      // Reposition cursor between tags if no text was selected
      if (!selectedText) {
        range.setStartAfter(openNode);
        range.setEndAfter(openNode);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      // Trigger input event to update highlighting
      editor.dispatchEvent(new Event("input"));
    };
  };

  // =============================
  // Initialization
  // =============================
  const initialize = () => {
    updatePageTitle();

    const textArea = document.getElementById("message");
    if (!textArea) return setTimeout(initialize, 500);

    removeInterferingEventListeners();

    // Create our custom editor
    const bbcodeEditor = new BBCodeEditor(textArea);

    // Integrate with forum's BBCode buttons
    hookBBCodeButtons();

    // Set up resize observer to handle window resizing
    const resizeObserver = new ResizeObserver(() => {
      bbcodeEditor.resize();
      positionSmileyBox();
      positionEditorHeader();
    });

    resizeObserver.observe(bbcodeEditor.editor);

    // Optimized event listeners for window events
    const throttledResize = debounce(() => {
      bbcodeEditor.resize();
      positionSmileyBox();
      positionEditorHeader();
    }, 100);

    const throttledScroll = debounce(() => {
      positionSmileyBox();
      positionEditorHeader();
    }, 100);

    window.addEventListener("resize", throttledResize);
    window.addEventListener("scroll", throttledScroll);

    // Initial rendering
    bbcodeEditor.resize();
    positionSmileyBox();
    positionEditorHeader();
  };

  // =============================
  // Run on Page Load
  // =============================
  window.addEventListener("load", () => {
    addStyles();
    initialize();
  });
})();
