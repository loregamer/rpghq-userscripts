export function init() {
  // Apply quote box styling
  const style = document.createElement("style");
  style.textContent = `
    blockquote {
      background-color: #2a2e36;
      border-left: 3px solid #4a90e2;
      padding: 10px;
      margin: 10px 0;
      font-size: 0.9em;
      line-height: 1.4;
    }
    blockquote cite {
      display: flex;
      align-items: center;
    }
    .quote-divider {
      border: none;
      border-top: 1px solid #3a3f4c;
      margin: 10px 0;
    }
    .quote-toggle {
      cursor: pointer;
      color: #4a90e2;
      font-size: 0.8em;
      margin-top: 5px;
      display: block;
    }

    .quote-read-more {
      cursor: pointer;
      color: #4a90e2;
      font-size: 0.9em;
      text-align: center;
      padding: 5px;
      background-color: rgba(74, 144, 226, 0.1);
      border-top: 1px solid rgba(74, 144, 226, 0.3);
      margin-top: 10px;
    }

    .quote-read-more:hover {
      background-color: rgba(74, 144, 226, 0.2);
    }

    .quote-content {
      transition: max-height 0.3s ease-out;
    }

    .quote-content.collapsed {
      max-height: 300px;
      overflow: hidden;
    }

    .quote-content.expanded {
      max-height: none;
    }

    /* Limit image height in collapsed quotes */
    .quote-content.collapsed img {
      max-height: 200px;
      width: auto;
      object-fit: contain;
    }

    /* Allow full image size in expanded quotes */
    .quote-content.expanded img {
      max-height: none;
    }

    blockquote cite a {
      display: inline-flex;
      align-items: center;
      font-weight: bold;
    }
    .quote-avatar {
      width: 16px;
      height: 16px;
      margin-left: 4px;
      margin-right: 3px;
      border-radius: 50%;
      object-fit: cover;
    }
    blockquote cite {
      display: flex;
      align-items: center;
      margin-bottom: 8px; // Add some space below the citation
    }
  `;
  document.head.appendChild(style);

  // Helper functions for user colors and avatars
  function getUserColor(username) {
    const key = `userColor_${username.toLowerCase()}`;
    const storedColor = localStorage.getItem(key);
    if (storedColor) {
      const { color, timestamp } = JSON.parse(storedColor);
      // Check if the stored color is less than 7 days old
      if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
        return color;
      }
    }
    return null;
  }

  function storeUserColor(username, color) {
    const key = `userColor_${username.toLowerCase()}`;
    const data = JSON.stringify({ color, timestamp: Date.now() });
    localStorage.setItem(key, data);
  }

  function getUserAvatar(username) {
    const key = `userAvatar_${username.toLowerCase()}`;
    const storedAvatar = localStorage.getItem(key);
    if (storedAvatar) {
      const { avatar, timestamp } = JSON.parse(storedAvatar);
      // Check if the stored avatar is less than 7 days old
      if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
        return avatar;
      }
    }
    return null;
  }

  function storeUserAvatar(username, avatar) {
    const key = `userAvatar_${username.toLowerCase()}`;
    const data = JSON.stringify({ avatar, timestamp: Date.now() });
    localStorage.setItem(key, data);
  }

  // Process user avatars
  async function processAvatars() {
    const avatarMap = new Map();

    // First, collect all avatars from the page
    document.querySelectorAll(".avatar-container img.avatar").forEach((img) => {
      const postprofile = img.closest(".postprofile");
      if (postprofile) {
        const usernameElement = postprofile.querySelector(
          "a.username-coloured, a.username",
        );
        if (usernameElement) {
          const username = usernameElement.textContent.trim();
          avatarMap.set(username.toLowerCase(), img.src);
          storeUserAvatar(username, img.src);
        }
      }
    });

    // Then, apply avatars to usernames in blockquotes
    document.querySelectorAll("blockquote cite").forEach(async (citation) => {
      restructureCitation(citation);
      const link = citation.querySelector("a");
      if (link) {
        const username = link.textContent.trim();
        let avatar =
          avatarMap.get(username.toLowerCase()) || getUserAvatar(username);

        if (!avatar) {
          avatar = await fetchUserAvatar(link.href);
          if (avatar) {
            storeUserAvatar(username, avatar);
          }
        }

        if (avatar) {
          const avatarImg = document.createElement("img");
          avatarImg.src = avatar;
          avatarImg.className = "quote-avatar";
          avatarImg.alt = `${username}'s avatar`;
          citation
            .querySelector(".quote-citation-container")
            .insertBefore(
              avatarImg,
              citation.querySelector(".quote-citation-container").firstChild,
            );
        }
      }
    });
  }

  // Restructure citation to prepare for avatar
  function restructureCitation(citation) {
    const container = document.createElement("div");
    container.className = "quote-citation-container";

    while (citation.firstChild) {
      container.appendChild(citation.firstChild);
    }

    citation.appendChild(container);
  }

  // Fetch avatar from user profile
  async function fetchUserAvatar(profileUrl) {
    try {
      const response = await fetch(profileUrl);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const avatarImg = doc.querySelector(".profile-avatar img.avatar");
      if (avatarImg) {
        return avatarImg.src;
      }
    } catch (error) {
      console.error("Error fetching user avatar:", error);
    }
    return null;
  }

  // Colorize usernames in quotes
  async function colorizeUsernames() {
    const colorMap = new Map();

    // First, collect all colored usernames from the page
    document.querySelectorAll("a.username-coloured").forEach((link) => {
      const username = link.textContent.trim();
      const color = link.style.color;
      if (color) {
        colorMap.set(username.toLowerCase(), color);
        storeUserColor(username, color);
      }
    });

    // Then, apply colors to usernames in blockquotes
    document.querySelectorAll("blockquote cite a").forEach(async (link) => {
      const username = link.textContent.trim();
      let color =
        colorMap.get(username.toLowerCase()) || getUserColor(username);

      if (!color) {
        // If color not found in map or localStorage, fetch from user profile
        color = await fetchUserColor(link.href);
        if (color) {
          storeUserColor(username, color);
        }
      }

      if (color) {
        link.style.color = color;
        link.classList.add("username-coloured");
      }
    });
  }

  // Fetch user color from profile
  async function fetchUserColor(profileUrl) {
    try {
      const response = await fetch(profileUrl);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const coloredUsername = doc.querySelector(
        '.left-box.details.profile-details dd span[style^="color:"]',
      );
      if (coloredUsername) {
        return coloredUsername.style.color;
      }
    } catch (error) {
      console.error("Error fetching user color:", error);
    }
    return null;
  }

  // Fix spacing in quote links
  function fixQuoteLinks() {
    const quoteLinks = document.querySelectorAll("blockquote cite a");
    const isMobile = window.matchMedia("(max-width: 700px)").matches;

    quoteLinks.forEach((link) => {
      const linkText = link.textContent.trim();
      if (linkText.startsWith("↑") && !linkText.startsWith("↑ ")) {
        if (isMobile) {
          link.textContent = " ↑ ";
        } else {
          link.textContent = "↑  " + linkText.slice(1);
        }
      }
    });
  }

  // Process all quote boxes
  function processQuoteBoxes() {
    const allQuotes = document.querySelectorAll("blockquote");
    allQuotes.forEach(processQuote);
    fixQuoteLinks();
  }

  // Process a single quote based on nesting
  function processQuote(quoteBox) {
    const isNested = quoteBox.closest("blockquote blockquote") !== null;
    if (isNested) {
      processNestedQuote(quoteBox);
    } else {
      processOuterQuote(quoteBox);
    }
  }

  // Process a nested quote
  function processNestedQuote(quoteBox) {
    const citation = quoteBox.querySelector("cite");
    const nestedContent = document.createElement("div");
    nestedContent.className = "nested-quote-content";

    while (quoteBox.firstChild) {
      if (quoteBox.firstChild !== citation) {
        nestedContent.appendChild(quoteBox.firstChild);
      } else {
        quoteBox.removeChild(quoteBox.firstChild);
      }
    }

    if (citation) {
      quoteBox.appendChild(citation);
    }
    quoteBox.appendChild(nestedContent);
    addQuoteToggle(quoteBox, nestedContent);
  }

  // Process an outer quote
  function processOuterQuote(quoteBox) {
    const quoteContent = document.createElement("div");
    quoteContent.className = "quote-content";

    while (quoteBox.firstChild) {
      quoteContent.appendChild(quoteBox.firstChild);
    }

    quoteBox.appendChild(quoteContent);

    updateReadMoreToggle(quoteBox, quoteContent);

    // Create a MutationObserver to watch for changes in the quote content
    const observer = new MutationObserver(() => {
      updateReadMoreToggle(quoteBox, quoteContent);
    });

    observer.observe(quoteContent, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  // Update read more toggle based on content height
  function updateReadMoreToggle(quoteBox, quoteContent) {
    let readMoreToggle = quoteBox.querySelector(".quote-read-more");

    // Check if there are images in the quote
    const hasImages = quoteContent.querySelectorAll("img").length > 0;

    // Use a lower threshold if the quote contains images
    const heightThreshold = hasImages ? 350 : 400;

    if (quoteContent.scrollHeight > heightThreshold) {
      if (!readMoreToggle) {
        readMoreToggle = createReadMoreToggle(quoteContent);
        quoteBox.appendChild(readMoreToggle);
      }
      if (!quoteContent.classList.contains("expanded")) {
        quoteContent.classList.add("collapsed");
      }
    } else {
      if (readMoreToggle) {
        readMoreToggle.remove();
      }
      quoteContent.classList.remove("collapsed", "expanded");
    }
  }

  // Create read more toggle button
  function createReadMoreToggle(quoteContent) {
    const readMoreToggle = document.createElement("div");
    readMoreToggle.className = "quote-read-more";
    readMoreToggle.textContent = "Read more...";

    readMoreToggle.addEventListener("click", () => {
      const quoteBox = quoteContent.closest("blockquote");
      if (quoteContent.classList.contains("expanded")) {
        quoteContent.classList.remove("expanded");
        quoteContent.classList.add("collapsed");
        readMoreToggle.textContent = "Read more...";

        // Collapse inner blockquotes
        const innerQuotes = quoteContent.querySelectorAll("blockquote");
        innerQuotes.forEach((innerQuote) => {
          const nestedContent = innerQuote.querySelector(
            ".nested-quote-content",
          );
          if (nestedContent) {
            nestedContent.style.display = "none";
            const toggle = innerQuote.querySelector(".quote-toggle");
            if (toggle) {
              toggle.textContent = "Expand Quote";
            }
          }
        });

        if (quoteBox) {
          const quoteBoxRect = quoteBox.getBoundingClientRect();
          if (quoteBoxRect.top < 0) {
            quoteBox.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      } else {
        quoteContent.classList.remove("collapsed");
        quoteContent.classList.add("expanded");
        readMoreToggle.textContent = "Show less...";
      }
    });

    return readMoreToggle;
  }

  // Add toggle for nested quotes
  function addQuoteToggle(quoteBox, nestedContent) {
    const toggle = document.createElement("span");
    toggle.className = "quote-toggle";
    toggle.textContent = "Expand Quote";
    nestedContent.style.display = "none";

    toggle.onclick = function () {
      if (nestedContent.style.display === "none") {
        nestedContent.style.display = "block";
        this.textContent = "Collapse Quote";

        // Expand all parent quote contents
        let parentQuoteContent = quoteBox.closest(".quote-content");
        while (parentQuoteContent) {
          if (parentQuoteContent.classList.contains("collapsed")) {
            const parentReadMoreToggle = parentQuoteContent.nextElementSibling;
            if (
              parentReadMoreToggle &&
              parentReadMoreToggle.classList.contains("quote-read-more")
            ) {
              parentReadMoreToggle.click();
            } else {
              // Force update of read more toggle
              updateReadMoreToggle(
                parentQuoteContent.closest("blockquote"),
                parentQuoteContent,
              );
            }
          }
          parentQuoteContent = parentQuoteContent
            .closest("blockquote")
            ?.closest(".quote-content");
        }

        // Automatically trigger "Read More..." if applicable, including newly created ones
        setTimeout(() => {
          let currentQuoteContent = quoteBox.closest(".quote-content");
          while (currentQuoteContent) {
            if (currentQuoteContent.classList.contains("collapsed")) {
              const readMoreToggle = currentQuoteContent.nextElementSibling;
              if (
                readMoreToggle &&
                readMoreToggle.classList.contains("quote-read-more")
              ) {
                readMoreToggle.click();
              }
            }
            currentQuoteContent = currentQuoteContent
              .closest("blockquote")
              ?.closest(".quote-content");
          }
        }, 0);
      } else {
        nestedContent.style.display = "none";
        this.textContent = "Expand Quote";
      }

      // Scroll to ensure the quote is visible
      setTimeout(() => {
        quoteBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 0);
    };
    quoteBox.appendChild(toggle);
  }

  // Remove compatibility with other quote-related scripts
  function removeReadMoreButtons() {
    document
      .querySelectorAll(".imcger-quote-button")
      .forEach((button) => button.remove());
    document
      .querySelectorAll(".imcger-quote-shadow")
      .forEach((shadow) => shadow.remove());
    document.querySelectorAll(".imcger-quote-text").forEach((text) => {
      text.style.maxHeight = "none";
      text.style.overflow = "visible";
    });
  }

  // Scroll to a post if it's in the URL
  function scrollToPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("p") || window.location.hash.slice(1);
    if (postId) {
      const postElement = document.getElementById(postId);
      if (postElement) {
        setTimeout(() => {
          postElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    }
  }

  // Run the main functions
  processQuoteBoxes();
  removeReadMoreButtons();
  colorizeUsernames();
  processAvatars();
  scrollToPost();
}
