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
/**
 * CodeMirror integration for rpghq.org
 * Replaces the message textarea with a CodeMirror editor
 */
(function () {
  // Configuration
  const config = {
    cdnBase: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/",
    resources: {
      css: ["codemirror.min.css"],
      js: ["codemirror.min.js", "addon/mode/simple.min.js"],
    },
    editorOptions: {
      lineWrapping: true,
      lineNumbers: false,
      mode: "bbcode",
      theme: "default",
      inputStyle: "contenteditable",
      spellcheck: true,
      viewportMargin: Infinity, // This removes the max size constraint
    },
    // Custom styling options
    customStyle: {
      backgroundColor: "#f7f7f7", // Light gray background
      fontFamily: "Arial, sans-serif", // Font family
      fontSize: "14px", // Font size
      lineHeight: "1.5", // Line height
      color: "#333", // Text color
      padding: "10px", // Padding inside editor
      borderColor: "#ccc", // Border color
    },
    // BBCode tags to highlight
    bbcodeTags: [
      { tag: "b", display: "Bold", cssClass: "cm-bold" },
      { tag: "i", display: "Italic", cssClass: "cm-italic" },
      { tag: "u", display: "Underline", cssClass: "cm-underline" },
      { tag: "s", display: "Strikethrough", cssClass: "cm-strikethrough" },
      { tag: "color", display: "Color", cssClass: "cm-color" },
      { tag: "size", display: "Size", cssClass: "cm-size" },
      { tag: "font", display: "Font", cssClass: "cm-font" },
      { tag: "url", display: "URL", cssClass: "cm-url" },
      { tag: "img", display: "Image", cssClass: "cm-img" },
      { tag: "quote", display: "Quote", cssClass: "cm-quote" },
      { tag: "code", display: "Code", cssClass: "cm-code-tag" },
      { tag: "list", display: "List", cssClass: "cm-list" },
      { tag: "*", display: "List Item", cssClass: "cm-list-item" },
      { tag: "center", display: "Center", cssClass: "cm-center" },
      { tag: "right", display: "Right", cssClass: "cm-right" },
      { tag: "justify", display: "Justify", cssClass: "cm-justify" },
      { tag: "youtube", display: "YouTube", cssClass: "cm-youtube" },
      { tag: "spoiler", display: "Spoiler", cssClass: "cm-spoiler" },
    ],
  };
  // Load CSS files
  function loadStyles() {
    config.resources.css.forEach((file) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = config.cdnBase + file;
      document.head.appendChild(link);
    });

    // Add custom CSS to ensure CodeMirror expands properly and apply custom styling
    const customCSS = document.createElement("style");
    customCSS.textContent = `
        .CodeMirror {
          height: auto !important;
          min-height: 100px;
          background-color: ${config.customStyle.backgroundColor} !important;
          font-family: ${config.customStyle.fontFamily} !important;
          font-size: ${config.customStyle.fontSize} !important;
          line-height: ${config.customStyle.lineHeight} !important;
          color: ${config.customStyle.color} !important;
          padding: ${config.customStyle.padding} !important;
          border-color: ${config.customStyle.borderColor} !important;
        }
        .CodeMirror-scroll {
          padding: 0 !important;
        }
        /* Style for the cursor */
        .CodeMirror-cursor {
          border-left: 2px solid #000 !important;
        }
        /* Style for selected text */
        .CodeMirror-selected {
          background-color: #b3d4fc !important;
        }
        
        /* BBCode syntax highlighting styles */
        .cm-bbcode-tag {
          color: #0000ff !important;
          font-weight: bold !important;
        }
        .cm-bbcode-attribute {
          color: #660066 !important;
        }
        .cm-bbcode-equals {
          color: #000000 !important;
        }
        .cm-bbcode-value {
          color: #008800 !important;
        }
        .cm-bbcode-bracket {
          color: #0000ff !important;
          font-weight: bold !important;
        }
        
        /* Tag-specific styles */
        .cm-bold {
          color: #0000cc !important;
        }
        .cm-italic {
          color: #0066cc !important;
        }
        .cm-underline {
          color: #006699 !important;
        }
        .cm-strikethrough {
          color: #660066 !important;
        }
        .cm-color {
          color: #cc0000 !important;
        }
        .cm-size {
          color: #cc6600 !important;
        }
        .cm-font {
          color: #cc6600 !important;
        }
        .cm-url {
          color: #0000ff !important;
        }
        .cm-img {
          color: #cc00cc !important;
        }
        .cm-quote {
          color: #008800 !important;
        }
        .cm-code-tag {
          color: #666699 !important;
        }
        .cm-list, .cm-list-item {
          color: #cc6600 !important;
        }
        .cm-spoiler {
          color: #333333 !important;
          background-color: #f0f0f0 !important;
        }
      `;
    document.head.appendChild(customCSS);
  }
  // Load JS files sequentially
  function loadScripts(index, callback) {
    if (index >= config.resources.js.length) {
      if (typeof callback === "function") callback();
      return;
    }
    const script = document.createElement("script");
    script.src = config.cdnBase + config.resources.js[index];
    script.onload = function () {
      loadScripts(index + 1, callback);
    };
    document.head.appendChild(script);
  }
  // Initialize CodeMirror
  function initializeCodeMirror() {
    const textarea = document.getElementById("message");
    if (!textarea) return;
    // Store original functions for reference
    const originalFunctions = {
      storeCaret: window.storeCaret,
      initInsertions: window.initInsertions,
    };
    // Create CodeMirror instance
    const editor = CodeMirror.fromTextArea(textarea, config.editorOptions);

    // Note: We're no longer setting a fixed height
    // Instead, it will automatically adjust to content

    // Setup wrapper to match textarea styles
    const wrapper = editor.getWrapperElement();
    wrapper.classList.add("inputbox");
    wrapper.setAttribute("data-tribute", "true");
    wrapper.style.position = "relative";

    // Bridge original functions with CodeMirror
    if (typeof originalFunctions.storeCaret === "function") {
      // Override original storeCaret
      window.storeCaret = function (element) {
        if (element === textarea) {
          textarea.value = editor.getValue();
          return originalFunctions.storeCaret(textarea);
        }
        return originalFunctions.storeCaret(element);
      };
      // Sync to textarea and call storeCaret when cursor moves
      editor.on("cursorActivity", function () {
        textarea.value = editor.getValue();
        window.storeCaret(textarea);
      });
      // Also sync on changes
      editor.on("change", function () {
        textarea.value = editor.getValue();
        editor.refresh(); // Add refresh to ensure editor adjusts to content
      });
    }
    // Handle focus and initInsertions
    if (typeof originalFunctions.initInsertions === "function") {
      editor.on("focus", function () {
        originalFunctions.initInsertions();
      });
    }
    // Add helper functions for BBCode (for future use)
    window.codeMirrorHelpers = {
      // Insert text at cursor position
      insertAtCursor: function (text) {
        const doc = editor.getDoc();
        const cursor = doc.getCursor();
        doc.replaceRange(text, cursor);
        editor.focus();
        editor.refresh(); // Refresh editor after insertion
      },
      // Wrap selected text with prefix and suffix
      wrapSelection: function (prefix, suffix) {
        const doc = editor.getDoc();
        const selection = doc.getSelection();
        if (selection) {
          // If text is selected, wrap it
          doc.replaceSelection(prefix + selection + suffix);
        } else {
          // If no selection, insert prefix+suffix and place cursor in between
          const cursor = doc.getCursor();
          doc.replaceRange(prefix + suffix, cursor);
          doc.setCursor({
            line: cursor.line,
            ch: cursor.ch + prefix.length,
          });
        }
        editor.focus();
        editor.refresh(); // Refresh editor after modification
      },
      // Get editor instance
      getEditor: function () {
        return editor;
      },
    };
    // Store reference to the editor on the textarea
    textarea.codemirror = editor;

    // Set up a mutation observer to handle dynamic content changes
    setTimeout(() => {
      editor.refresh();
    }, 100);

    return editor;
  }
  // Add user customization form
  function addCustomizationControls() {
    const textarea = document.getElementById("message");
    if (!textarea) return;

    // Create customization container
    const container = document.createElement("div");
    container.style.margin = "10px 0";
    container.style.padding = "10px";
    container.style.border = "1px solid #ddd";
    container.style.borderRadius = "4px";
    container.style.backgroundColor = "#f9f9f9";

    // Add title
    const title = document.createElement("div");
    title.textContent = "Editor Customization";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "10px";
    container.appendChild(title);

    // Add controls
    const controls = [
      {
        name: "backgroundColor",
        label: "Background Color:",
        type: "color",
        value: config.customStyle.backgroundColor,
      },
      {
        name: "color",
        label: "Text Color:",
        type: "color",
        value: config.customStyle.color,
      },
      {
        name: "fontSize",
        label: "Font Size (px):",
        type: "number",
        min: "10",
        max: "24",
        value: parseInt(config.customStyle.fontSize),
      },
      {
        name: "fontFamily",
        label: "Font:",
        type: "select",
        options: [
          { value: "Arial, sans-serif", label: "Arial" },
          { value: "Georgia, serif", label: "Georgia" },
          { value: "Courier New, monospace", label: "Courier New" },
          { value: "Verdana, sans-serif", label: "Verdana" },
          { value: "Times New Roman, serif", label: "Times New Roman" },
        ],
      },
    ];

    // Create controls
    controls.forEach((control) => {
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "5px";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";

      const label = document.createElement("label");
      label.textContent = control.label;
      label.style.marginRight = "10px";
      label.style.width = "120px";
      wrapper.appendChild(label);

      let input;

      if (control.type === "select") {
        input = document.createElement("select");
        control.options.forEach((option) => {
          const opt = document.createElement("option");
          opt.value = option.value;
          opt.textContent = option.label;
          if (option.value === config.customStyle[control.name]) {
            opt.selected = true;
          }
          input.appendChild(opt);
        });
      } else {
        input = document.createElement("input");
        input.type = control.type;
        if (control.type === "number") {
          input.min = control.min;
          input.max = control.max;
          input.value = control.value;
        } else {
          input.value = control.value;
        }
        if (control.type === "color") {
          input.style.width = "50px";
        }
      }

      input.id = "cm-custom-" + control.name;
      input.addEventListener("change", function () {
        let value = this.value;
        if (control.type === "number") {
          value = value + "px";
        }
        config.customStyle[control.name] = value;
        updateEditorStyle();

        // Save preferences
        try {
          GM_setValue("cmCustomStyle", JSON.stringify(config.customStyle));
        } catch (e) {
          console.error("Failed to save preferences:", e);
        }
      });

      wrapper.appendChild(input);
      container.appendChild(wrapper);
    });

    // Apply button
    const applyBtn = document.createElement("button");
    applyBtn.textContent = "Apply Styles";
    applyBtn.style.marginTop = "10px";
    applyBtn.style.padding = "5px 10px";
    applyBtn.style.cursor = "pointer";
    applyBtn.addEventListener("click", function (e) {
      e.preventDefault();
      updateEditorStyle();
    });
    container.appendChild(applyBtn);

    // Reset button
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset to Default";
    resetBtn.style.marginTop = "10px";
    resetBtn.style.marginLeft = "10px";
    resetBtn.style.padding = "5px 10px";
    resetBtn.style.cursor = "pointer";
    resetBtn.addEventListener("click", function (e) {
      e.preventDefault();
      config.customStyle = {
        backgroundColor: "#f7f7f7",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        lineHeight: "1.5",
        color: "#333",
        padding: "10px",
        borderColor: "#ccc",
      };
      updateEditorStyle();

      // Update form controls
      document.getElementById("cm-custom-backgroundColor").value =
        config.customStyle.backgroundColor;
      document.getElementById("cm-custom-color").value =
        config.customStyle.color;
      document.getElementById("cm-custom-fontSize").value = parseInt(
        config.customStyle.fontSize
      );

      // Save reset preferences
      try {
        GM_setValue("cmCustomStyle", JSON.stringify(config.customStyle));
      } catch (e) {
        console.error("Failed to save preferences:", e);
      }
    });
    container.appendChild(resetBtn);

    // Insert before the textarea
    textarea.parentNode.insertBefore(container, textarea);
  }

  // Function to update editor style
  function updateEditorStyle() {
    const editor = document.querySelector(".CodeMirror");
    if (!editor) return;

    editor.style.backgroundColor = config.customStyle.backgroundColor;
    editor.style.fontFamily = config.customStyle.fontFamily;
    editor.style.fontSize = config.customStyle.fontSize;
    editor.style.lineHeight = config.customStyle.lineHeight;
    editor.style.color = config.customStyle.color;
    editor.style.padding = config.customStyle.padding;
    editor.style.borderColor = config.customStyle.borderColor;
  }

  // Load saved preferences
  function loadSavedPreferences() {
    try {
      const savedStyle = GM_getValue("cmCustomStyle");
      if (savedStyle) {
        config.customStyle = JSON.parse(savedStyle);
      }
    } catch (e) {
      console.error("Failed to load preferences:", e);
    }
  }

  // Start loading resources
  function init() {
    loadSavedPreferences();
    loadStyles();
    loadScripts(0, function () {
      // *** ADDED: Define the BBCode mode using the simple mode addon ***
      CodeMirror.defineSimpleMode("bbcode", {
        start: [
          // Opening tag with value: [tag=value] or [tag="value"]
          {
            regex: /(\[)([a-zA-Z0-9_]+)\s*(=)\s*("?)([^"\]]+?)(\4)(\])/,
            token: [
              "bbcode-bracket",
              "bbcode-tag",
              "bbcode-equals",
              null,
              "bbcode-value",
              null,
              "bbcode-bracket",
            ],
            sol: false,
          },
          // Opening tag without value: [tag] or [*]
          {
            regex: /(\[)(\*|[a-zA-Z0-9_]+)(\])/,
            token: ["bbcode-bracket", "bbcode-tag", "bbcode-bracket"],
            sol: false,
          },
          // Closing tag: [/tag]
          {
            regex: /(\[\/)([a-zA-Z0-9_]+)(\])/,
            token: ["bbcode-bracket", "bbcode-tag", "bbcode-bracket"],
            sol: false,
          },
          // URLs outside tags
          {
            regex: /((?:https?|ftp):\/\/[^\s\[\]<]+)/,
            token: "link", // Can be styled separately if needed
            sol: false,
          },
          // Plain text content
          {
            regex: /[^\[]+/, // Match any character that is not '['
            token: null,
          },
          // Single unmatched bracket (treat as plain text or error)
          {
            regex: /\[/,
            token: null, // Or assign an 'error' token if desired
          },
        ],
      });

      initializeCodeMirror();
      addCustomizationControls();
    });
  }
  // Execute when the DOM is fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // If the document is already loaded
    init();
  }
})();
