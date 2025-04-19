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
      js: [
        "codemirror.min.js",
        // Add the simple mode addon for custom BBCode mode
        "addon/mode/simple.min.js",
      ],
    },
    editorOptions: {
      lineWrapping: true,
      lineNumbers: false,
      mode: "bbcode", // Changed to bbcode mode
      theme: "default",
      inputStyle: "contenteditable",
      spellcheck: true,
      viewportMargin: Infinity, // This removes the max size constraint
      scrollbarStyle: "null", // Disable scrollbars completely
    },
    // Hard-coded styling options
    style: {
      backgroundColor: "#171B24", // Dark background matching RPGHQ
      fontFamily: "Verdana, Helvetica, Arial, sans-serif", // Font matching RPGHQ forum
      fontSize: "11px", // Font size
      lineHeight: "15.4px", // Line height
      color: "#CCCCCC", // Text color
      padding: "3px", // Padding inside editor
      borderColor: "#3a3f4b", // Border color
    },
    // BBCode configuration
    bbcode: {
      // Common BBCode tags
      tags: [
        // Format: [tag, description, openTag, closeTag, buttonIcon]
        ["b", "Bold", "[b]", "[/b]", "bold"],
        ["i", "Italic", "[i]", "[/i]", "italic"],
        ["u", "Underline", "[u]", "[/u]", "underline"],
        ["s", "Strike", "[s]", "[/s]", "strikethrough"],
        ["url", "URL", "[url]", "[/url]", "link"],
        ["img", "Image", "[img]", "[/img]", "image"],
        ["quote", "Quote", "[quote]", "[/quote]", "quote-left"],
        ["code", "Code", "[code]", "[/code]", "code"],
        ["list", "List", "[list]", "[/list]", "list"],
        ["*", "List item", "[*]", "", "circle"],
        ["color", "Color", "[color=]", "[/color]", "palette"],
        ["size", "Size", "[size=]", "[/size]", "text-height"],
        ["smention", "Mention", "[smention]", "[/smention]", "at"],
      ],
    },
    // Tag color mapping (imported from old script)
    tagColorMap: {
      img: "1",
      url: "4",
      color: "3",
      smention: "smention", // Special case for mentions
    },
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
          min-height: 500px;
          background-color: ${config.style.backgroundColor} !important; /* Change from 'transparent' to use the configured background color */
          font-family: ${config.style.fontFamily} !important;
          font-size: ${config.style.fontSize} !important;
          line-height: ${config.style.lineHeight} !important;
          color: ${config.style.color} !important;
          padding: ${config.style.padding} !important;
          border-color: ${config.style.borderColor} !important;
          position: relative;
          z-index: 2;
          caret-color: white;
        }
        .CodeMirror-scroll {
          padding: 0 !important;
        }
        /* Style for the cursor */
        .CodeMirror-cursor {
          border-left: 2px solid #fff !important;
        }
        /* Style for selected text */
        .CodeMirror-selected {
          background-color: #3A404A !important;
        }
  
        /* Editor container for dual-layer highlighting */
        .editor-container {
          position: relative;
          width: 100%;
          height: auto;
          background-color: ${config.style.backgroundColor};
        }
  
        /* BBCode Tag Highlighting - RPGHQ Colors */
        .cm-bbcode-tag-0 { color: #569CD6; }
        .cm-bbcode-tag-1 { color: #CE9178; }
        .cm-bbcode-tag-2 { color: #DCDCAA; }
        .cm-bbcode-tag-3 { color: #C586C0; }
        .cm-bbcode-tag-4 { color: #4EC9B0; }
        .cm-bbcode-tag-smention { color: #FFC107; }
        .cm-bbcode-bracket { color: #D4D4D4; }
        .cm-bbcode-attribute { color: #9CDCFE; }
        .cm-bbcode-list-item { color: #FFD700; }
        .cm-bbcode-url { color: #5D8FBD; }
  
        /* BBCode Toolbar Styling - Dark Theme */
        .bbcode-toolbar {
          margin-bottom: 5px;
          padding: 5px;
          background-color: #3A404A;
          border: 1px solid #4a5464;
          border-radius: 3px;
          display: flex;
          flex-wrap: wrap;
        }
  
        .bbcode-toolbar button {
          margin: 2px;
          padding: 3px 8px;
          background-color: #4a5464;
          color: #c5d0db;
          border: 1px solid #5a6474;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
        }
  
        .bbcode-toolbar button:hover {
          background-color: #5a6474;
          border-color: #6a7484;
        }
  
        .bbcode-toolbar button i {
          margin-right: 3px;
        }
  
        /* Custom color preview in attributes */
        .bbcode-color-preview {
          display: inline-block;
          padding: 0 3px;
          border-radius: 2px;
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

  // Get color index for BBCode tags - imported from original script
  const getColorIndex = (tagName) => {
    if (tagName === "*") return "list-item";
    if (tagName.toLowerCase() === "smention") return "smention";

    if (!(tagName in config.tagColorMap)) {
      // Use modulo operation to assign a color index if not in the map
      const colorIndex = Object.keys(config.tagColorMap).length % 5;
      config.tagColorMap[tagName] = colorIndex.toString();
    }

    return config.tagColorMap[tagName];
  };

  // Define BBCode mode for CodeMirror
  function defineBBCodeMode() {
    // If CodeMirror is loaded and SimpleMode addon is available
    if (
      typeof CodeMirror !== "undefined" &&
      typeof CodeMirror.defineSimpleMode !== "undefined"
    ) {
      CodeMirror.defineSimpleMode("bbcode", {
        // Start state
        start: [
          // Special handling for list items ([*])
          {
            regex: /(\[)(\*)(\])/i,
            token: ["bbcode-bracket", "bbcode-list-item", "bbcode-bracket"],
          },
          // BBCode tags with attributes: [tag=value]
          {
            regex: /(\[)([a-z0-9]+)(=)([^\]]+)(\])/i,
            token: function (match) {
              const tagName = match[2].toLowerCase();
              const colorIndex = getColorIndex(tagName);

              // Special handling for color tags with hex values
              if (tagName === "color") {
                const paramValue = match[4].trim();
                const hexMatch = paramValue.match(/^(#[0-9A-Fa-f]{6})/);

                if (hexMatch) {
                  return [
                    "bbcode-bracket",
                    `bbcode-tag-${colorIndex}`,
                    "bbcode-attribute",
                    "bbcode-color-value",
                    "bbcode-bracket",
                  ];
                }
              }

              return [
                "bbcode-bracket",
                `bbcode-tag-${colorIndex}`,
                "bbcode-attribute",
                "bbcode-attribute",
                "bbcode-bracket",
              ];
            },
          },
          // Opening BBCode tags: [tag]
          {
            regex: /(\[)([a-z0-9]+)(\])/i,
            token: function (match) {
              const tagName = match[2].toLowerCase();
              const colorIndex = getColorIndex(tagName);
              return [
                "bbcode-bracket",
                `bbcode-tag-${colorIndex}`,
                "bbcode-bracket",
              ];
            },
          },
          // Closing BBCode tags: [/tag]
          {
            regex: /(\[)(\/)([a-z0-9]+)(\])/i,
            token: function (match) {
              const tagName = match[3].toLowerCase();
              const colorIndex = getColorIndex(tagName);
              return [
                "bbcode-bracket",
                "bbcode-bracket",
                `bbcode-tag-${colorIndex}`,
                "bbcode-bracket",
              ];
            },
          },
          // URLs
          {
            regex: /(https?:\/\/[^\s]+)/i,
            token: "bbcode-url",
          },
        ],
      });

      console.log("RPGHQ BBCode mode defined for CodeMirror");
    } else {
      console.error(
        "SimpleMode addon not loaded, BBCode highlighting not available"
      );
    }
  }

  // Create BBCode toolbar
  function createBBCodeToolbar(editor) {
    const textarea = document.getElementById("message");
    if (!textarea) return;

    // Create toolbar container
    const toolbar = document.createElement("div");
    toolbar.className = "bbcode-toolbar";

    // Add buttons for each BBCode tag
    config.bbcode.tags.forEach((tag) => {
      const [tagName, description, openTag, closeTag, icon] = tag;

      const button = document.createElement("button");
      button.type = "button";
      button.title = description;

      // Assign tag color class based on color index
      const colorIndex = getColorIndex(tagName);
      button.innerHTML = `<span style="color: var(--tag-color-${colorIndex}, inherit);">${tagName.toUpperCase()}</span>`;

      // Insert tag on button click
      button.addEventListener("click", function (e) {
        e.preventDefault();

        // Handle tags with attributes
        if (openTag.includes("=")) {
          const tagWithoutEqual = openTag.replace("=", "");
          let value = "";

          if (tagName === "color") {
            value = prompt("Enter color (name or hex code):", "#F5575D");
          } else if (tagName === "size") {
            value = prompt("Enter size (1-7):", "3");
          } else if (tagName === "url") {
            value = prompt("Enter URL:", "http://");
          } else if (tagName === "smention") {
            value = prompt("Enter username to mention:", "");
          } else {
            value = prompt(`Enter ${tagName} value:`, "");
          }

          if (value !== null) {
            window.codeMirrorHelpers.wrapSelection(
              tagWithoutEqual + value + "]",
              closeTag
            );
          }
        } else {
          // Regular tag without attributes
          window.codeMirrorHelpers.wrapSelection(openTag, closeTag);
        }
      });

      toolbar.appendChild(button);
    });

    // Add auto-format button
    const formatBtn = document.createElement("button");
    formatBtn.type = "button";
    formatBtn.title = "Auto-format BBCode (F8)";
    formatBtn.innerHTML = "Format";
    formatBtn.addEventListener("click", function (e) {
      e.preventDefault();
      autoFormatBBCode(editor);
    });
    toolbar.appendChild(formatBtn);

    // Insert before the editor
    textarea.parentNode.insertBefore(toolbar, textarea);
  }

  // Auto-format BBCode (imported from original script)
  function autoFormatBBCode(editor) {
    if (!editor) return;

    const text = editor.getValue();
    const lines = text.split("\n");
    let formattedLines = [];
    let indentLevel = 0;
    let insideCodeBlock = false;
    let insideList = false;

    // Define tags that affect indentation and require line breaks
    const blockTags = [
      "list",
      "spoiler",
      "quote",
      "table",
      "indent",
      "tab",
      "tabmenu",
      "tabs",
    ];

    // Non-breaking space character
    const nbsp = "\u00A0";

    // Regex to find BBCode tags
    const tagRegex = /\[(\/)?([a-zA-Z0-9*]+)(?:=([^]]*))?\]/g;

    // Track the stack of open tags to handle proper closing
    const openTagStack = [];

    // Process each line
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Preserve empty lines
      if (!line.trim()) {
        formattedLines.push(line);
        continue;
      }

      // Handle code blocks separately to preserve formatting
      if (insideCodeBlock) {
        formattedLines.push(line);
        if (line.toLowerCase().includes("[/code]")) {
          insideCodeBlock = false;
        }
        continue;
      }

      // Check for code block start
      if (
        line.toLowerCase().includes("[code]") &&
        !line.toLowerCase().includes("[/code]")
      ) {
        insideCodeBlock = true;
        formattedLines.push("\t".repeat(indentLevel) + line.trim());
        continue;
      }

      // Process the line to find all tags
      const matches = [...line.matchAll(tagRegex)];

      // If no tags, just add the line with current indentation
      if (matches.length === 0) {
        formattedLines.push("\t".repeat(indentLevel) + line.trim());
        continue;
      }

      // Process each match to separate tags and content
      let segments = [];
      let lastIndex = 0;

      for (const match of matches) {
        const [fullMatch, isClosing, tag, attribute] = match;
        const matchIndex = match.index;

        // Add text before this tag if any
        if (matchIndex > lastIndex) {
          const textBefore = line.substring(lastIndex, matchIndex).trim();
          if (textBefore) {
            segments.push({
              text: textBefore,
              isTag: false,
            });
          }
        }

        // Add the tag
        segments.push({
          text: fullMatch,
          isTag: true,
          isClosing: !!isClosing,
          tag: tag.toLowerCase(),
          isBlockTag: blockTags.includes(tag.toLowerCase()),
          isList: tag.toLowerCase() === "list",
          isListItem: tag === "*",
        });

        lastIndex = matchIndex + fullMatch.length;
      }

      // Add any remaining text after the last tag
      if (lastIndex < line.length) {
        const textAfter = line.substring(lastIndex).trim();
        if (textAfter) {
          segments.push({
            text: textAfter,
            isTag: false,
          });
        }
      }

      // Process segments and add to formatted lines
      let lineBuffer = "";
      let indentChange = 0;

      for (let j = 0; j < segments.length; j++) {
        const segment = segments[j];

        if (segment.isTag && segment.isBlockTag) {
          // For block tags, we want them on their own lines
          if (lineBuffer) {
            formattedLines.push("\t".repeat(indentLevel) + lineBuffer);
            lineBuffer = "";
          }

          if (segment.isClosing) {
            // Closing block tag decreases indent before adding
            indentLevel = Math.max(0, indentLevel - 1);
            formattedLines.push("\t".repeat(indentLevel) + segment.text);

            // Track if we're leaving a list
            if (segment.isList) {
              insideList = false;
            }

            // Track tag closing for potential spacing
            if (openTagStack.length > 0) {
              openTagStack.pop();
            }
          } else {
            // Opening block tag gets added at current indent, then increases indent
            formattedLines.push("\t".repeat(indentLevel) + segment.text);
            indentLevel++;

            // Track if we're entering a list
            if (segment.isList) {
              insideList = true;
            }

            // Track tag opening
            openTagStack.push(segment.tag);
          }
        } else if (segment.isTag && segment.isListItem) {
          // Handle list items specially for consistent formatting
          if (lineBuffer) {
            formattedLines.push("\t".repeat(indentLevel) + lineBuffer);
            lineBuffer = "";
          }

          // Add list item with a non-breaking space after it
          lineBuffer = segment.text + nbsp;
        } else {
          // Regular tags and text get added to the current line buffer without nbsp
          if (lineBuffer && segment.text) {
            // Don't add any nbsp between segments
            lineBuffer += segment.text;
          } else {
            lineBuffer += segment.text;
          }
        }
      }

      // Add any remaining buffered content
      if (lineBuffer) {
        formattedLines.push("\t".repeat(indentLevel) + lineBuffer);
      }
    }

    // One final pass to ensure there's spacing between major sections
    let cleanedLines = formattedLines;
    formattedLines = [];

    for (let i = 0; i < cleanedLines.length; i++) {
      const line = cleanedLines[i];

      // Add the current line
      formattedLines.push(line);

      // Check if we need to add spacing after certain elements
      const lineContent = line.trim();
      const isClosingMajorBlock = lineContent.match(
        /^\[\/(?:list|tabmenu|tabs|table|quote|spoiler)\]$/i
      );
      const isFollowedByNewSection =
        i < cleanedLines.length - 1 &&
        !cleanedLines[i + 1].trim().startsWith("[/") &&
        cleanedLines[i + 1].trim() !== "";

      // Add blank line after major block closings when followed by new content
      if (
        isClosingMajorBlock &&
        isFollowedByNewSection &&
        (i >= cleanedLines.length - 1 || cleanedLines[i + 1].trim() !== "")
      ) {
        formattedLines.push(""); // Add blank line for spacing
      }
    }

    const formattedText = formattedLines.join("\n");

    // Only update if text changed
    if (editor.getValue() !== formattedText) {
      // Save cursor position
      const cursor = editor.getCursor();

      // Update the text
      editor.setValue(formattedText);

      // Try to restore cursor position approximately
      editor.setCursor(cursor);

      // Update UI
      editor.refresh();
    }
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

    // Define BBCode mode
    defineBBCodeMode();

    // Create CodeMirror instance
    const editor = CodeMirror.fromTextArea(textarea, config.editorOptions);

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

        // Update preview if it's visible
        const previewPanel = document.querySelector(".bbcode-preview");
        if (previewPanel && previewPanel.style.display !== "none") {
          updatePreview(editor);
        }
      });
    }

    // Handle focus and initInsertions
    if (typeof originalFunctions.initInsertions === "function") {
      editor.on("focus", function () {
        originalFunctions.initInsertions();
      });
    }

    // Add key handlers for special shortcuts
    editor.setOption("extraKeys", {
      F8: function (cm) {
        autoFormatBBCode(cm);
      },
      "Ctrl-B": function (cm) {
        window.codeMirrorHelpers.wrapSelection("[b]", "[/b]");
      },
      "Ctrl-I": function (cm) {
        window.codeMirrorHelpers.wrapSelection("[i]", "[/i]");
      },
      "Ctrl-U": function (cm) {
        window.codeMirrorHelpers.wrapSelection("[u]", "[/u]");
      },
      "Alt-G": function (cm) {
        window.codeMirrorHelpers.wrapSelection("[color=#80BF00]", "[/color]");
      },
      Tab: function (cm) {
        // Handle indentation
        if (cm.somethingSelected()) {
          cm.indentSelection("add");
        } else {
          cm.replaceSelection("\t");
        }
      },
      "Shift-Tab": function (cm) {
        cm.indentSelection("subtract");
      },
    });

    // Add helper functions for BBCode
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

    // Create BBCode toolbar
    createBBCodeToolbar(editor);

    // Add warning for unsaved changes when leaving the page
    window.addEventListener("beforeunload", function (e) {
      // Check if the form is being submitted
      if (!window.isFormSubmitting && editor.getValue().trim()) {
        const msg = "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = msg;
        return msg;
      }
    });

    // Track form submission
    const postForm = document.getElementById("postform");
    if (postForm) {
      window.isFormSubmitting = false;
      postForm.addEventListener("submit", function () {
        window.isFormSubmitting = true;
      });
    }

    // Set up a mutation observer to handle dynamic content changes
    setTimeout(() => {
      editor.refresh();
    }, 100);

    return editor;
  }

  // Function to update editor style
  function updateEditorStyle() {
    const editor = document.querySelector(".CodeMirror");
    if (!editor) return;

    // Update the editor container background color
    const editorContainer = document.querySelector(".editor-container");
    if (editorContainer) {
      editorContainer.style.backgroundColor = config.style.backgroundColor;
    }

    // Refresh the editor to apply changes
    const textArea = document.getElementById("message");
    if (textArea && textArea.codemirror) {
      textArea.codemirror.refresh();
    }
  }

  // Update page title (from original script)
  function updatePageTitle() {
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
  }

  // Remove interfering event listeners from original textarea (from original script)
  function removeInterferingEventListeners() {
    const textarea = document.getElementById("message");
    if (textarea) {
      if (typeof $ !== "undefined") {
        $(textarea).off("focus change keyup");
      }
      textarea.classList.remove("auto-resized");
      textarea.style.height = "";
      textarea.style.resize = "none";
    }
  }

  // Start loading resources
  function init() {
    // Update the page title
    updatePageTitle();

    // Remove any existing event listeners that might interfere
    removeInterferingEventListeners();

    // Load styles and scripts
    loadStyles();
    loadScripts(0, function () {
      // Initialize CodeMirror
      initializeCodeMirror();

      // Add custom color palette
      setTimeout(() => {
        addCustomColorsToPalette();
      }, 500);
    });
  }

  // Add custom colors to palette (simplified version of original script)
  function addCustomColorsToPalette() {
    // Add any color palettes that appear automatically or on button click
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const palette =
                node.classList && node.classList.contains("colour-palette")
                  ? node
                  : node.querySelector(".colour-palette");

              if (palette && !palette.dataset.customColorsAdded) {
                // Add our custom colors to the palette
                const customColors = [
                  "#F5575D", // Red
                  "#3889ED", // Blue
                  "#FFC107", // Yellow/Gold
                  "#00AA00", // Green
                  "#FC8A92", // Light Red
                  "#F7E6E7", // Very Light
                ];

                // Create a new row for our colors
                const tbody = palette.querySelector("tbody") || palette;
                const newRow = document.createElement("tr");

                customColors.forEach((color) => {
                  const td = document.createElement("td");
                  td.style.backgroundColor = color;
                  td.style.width = "15px";
                  td.style.height = "12px";

                  const a = document.createElement("a");
                  a.href = "#";
                  a.dataset.color = color.substring(1); // Remove # from color
                  a.style.display = "block";
                  a.style.width = "15px";
                  a.style.height = "12px";
                  a.title = color;

                  a.onclick = function (e) {
                    e.preventDefault();
                    const textarea = document.getElementById("message");
                    if (textarea && textarea.codemirror) {
                      window.codeMirrorHelpers.wrapSelection(
                        `color=${color}]`,
                        "[/color]"
                      );
                    }
                    // Close palette
                    document.body.click();
                    return false;
                  };

                  td.appendChild(a);
                  newRow.appendChild(td);
                });

                tbody.appendChild(newRow);
                palette.dataset.customColorsAdded = "true";
              }
            }
          });
        }
      });
    });

    // Start observing for palette additions
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Execute when the DOM is fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // If the document is already loaded
    init();
  }
})();
