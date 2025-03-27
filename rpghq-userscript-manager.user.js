// ==UserScript==
// @name         RPGHQ Userscript Manager (Popup Only)
// @namespace    https://rpghq.org/
// @version      3.0.1
// @description  A simple popup that displays the MANIFEST of available scripts without any functional components
// @author       loregamer
// @match        https://rpghq.org/forums/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  "use strict";

  // Hard-coded manifest - just for display purposes
  const MANIFEST = {
    scripts: [
      {
        id: "notifications",
        name: "Notifications Improved",
        version: "1.1.0",
        description:
          "Adds reaction smileys to notifications and makes them formatted better",
        filename: "notifications.js",
        matches: ["https://rpghq.org/forums/*"],
        executionPhase: "document-ready",
        category: "Aesthetic",
        image: "https://f.rpghq.org/rso7uNB6S4H9.png",
        settings: [],
      },
      {
        id: "bbcode",
        name: "BBCode Highlighter",
        version: "1.1.0",
        description:
          "Adds reaction smileys to notifications and makes them formatted better",
        filename: "bbcode.js",
        matches: [
          "https://rpghq.org/forums/posting.php?mode=post*",
          "https://rpghq.org/forums/posting.php?mode=quote*",
          "https://rpghq.org/forums/posting.php?mode=reply*",
          "https://rpghq.org/forums/posting.php?mode=edit*",
        ],
        executionPhase: "document-ready",
        category: "Aesthetic",
        image: "https://f.rpghq.org/bEm69Td9mEGU.png?n=pasted-file.png",
        settings: [],
      },
      {
        id: "ignore-threads",
        name: "Ignore Threads",
        version: "1.0.0",
        description: "Ignore threads",
        filename: "ignore-threads.js",
        matches: ["https://rpghq.org/forums/*"],
        executionPhase: "document-start",
        category: "Iggy Stuff",
        image: "https://f.rpghq.org/nZiGcejzrfWJ.png?n=pasted-file.png",
        settings: [],
      },
      {
        id: "ignore-users",
        name: "Ignore Users",
        version: "1.0.0",
        description: "(Actually) ignore users",
        filename: "ignore-users.js",
        matches: ["https://rpghq.org/forums/*"],
        executionPhase: "document-start",
        category: "Iggy Stuff",
        image: "https://f.rpghq.org/v4iqrprFCWq0.png?n=pasted-file.png",
        settings: [],
      },
      {
        id: "number-commas",
        name: "Commas on Numbers",
        version: "2.1.2",
        description: "Add commas to numbers",
        filename: "number-commas.js",
        matches: ["https://rpghq.org/forums/*"],
        executionPhase: "document-ready",
        category: "Aesthetic",
        image: "https://f.rpghq.org/olnCVAbEzbkt.png?n=pasted-file.png",
        settings: [
          {
            id: "formatFourDigits",
            label: "Format 4-digit numbers",
            description:
              "Whether to add commas to 4-digit numbers (e.g., 1,000) or only 5+ digit numbers",
            type: "boolean",
            default: false,
          },
        ],
      },
      {
        id: "pin-threads",
        name: "Pin Threads",
        version: "1.0.0",
        description: "Adds a pin button to the forum",
        filename: "pin-threads.js",
        matches: ["https://rpghq.org/forums/index.php/*"],
        executionPhase: "document-ready",
        category: "Utility",
        image: "https://f.rpghq.org/nZiGcejzrfWJ.png?n=pasted-file.png",
        settings: [],
      },
      {
        id: "member-search",
        name: "Member Search Button",
        version: "1.0.0",
        description: "Adds a member search button to the forum",
        filename: "member-search.js",
        matches: ["https://rpghq.org/forums/*"],
        executionPhase: "document-ready",
        category: "Utility",
        image: "https://f.rpghq.org/nZiGcejzrfWJ.png?n=pasted-file.png",
        settings: [],
      },
      {
        id: "random-topic",
        name: "Random Topic Button",
        version: "1.0.0",
        description: "Adds a random topic button to the forum",
        filename: "random-topic.js",
        matches: ["https://rpghq.org/forums/*"],
        executionPhase: "document-ready",
        category: "Utility",
        image: "https://f.rpghq.org/nZiGcejzrfWJ.png?n=pasted-file.png",
        settings: [],
      },
    ],
    schema: {
      version: "1.0.0",
      executionPhases: [
        {
          id: "document-start",
          name: "Document Start",
          description: "Executes before DOM parsing begins",
        },
        {
          id: "document-ready",
          name: "Document Ready",
          description:
            "Executes when basic DOM is available but before resources are loaded",
        },
        {
          id: "document-loaded",
          name: "Document Loaded",
          description: "Executes after page is fully loaded",
        },
        {
          id: "document-idle",
          name: "Document Idle",
          description: "Executes after a short delay when page is idle",
        },
        {
          id: "custom-event",
          name: "Custom Event",
          description: "Executes when a specific custom event is triggered",
        },
      ],
    },
  };

  // Add CSS for the modal
  function addStyles() {
    GM_addStyle(`
      /* Import Font Awesome */
      @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

      :root {
          --primary-color: #2196F3;
          --primary-dark: #1976D2;
          --text-primary: #FFFFFF;
          --text-secondary: #B0BEC5;
          --bg-dark: #1E1E1E;
          --bg-card: #2D2D2D;
          --border-color: #444444;
          --success-color: #4CAF50;
          --warning-color: #FFC107;
          --danger-color: #F44336;
      }
      /* Modal container */
      .mod-manager-modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
      }
      /* Modal content box */
      .mod-manager-modal-content {
          background-color: var(--bg-dark);
          margin: 2% auto;
          padding: 10px;
          border: 1px solid var(--border-color);
          width: 80%;
          max-height: 90vh;
          border-radius: 4px;
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
      }
      /* Header and close button */
      .mod-manager-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
      }
      .mod-manager-title {
          margin: 0;
          font-size: 1.8em;
      }
      .mod-manager-close {
          font-size: 1.8em;
          cursor: pointer;
      }
      /* Content area */
      .mod-manager-content {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
      }
      /* Gallery filter styles */
      .mod-gallery-filters {
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
      }
      .mod-gallery-filters select,
      .mod-gallery-filters input {
          padding: 4px;
          border: 1px solid var(--border-color);
          border-radius: 3px;
          background-color: var(--bg-dark);
          color: var(--text-primary);
      }
      /* Gallery view styles */
      .mod-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
      }
      .mod-gallery-item {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 12px;
          display: flex;
          flex-direction: column;
      }
      .mod-gallery-item img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 10px;
      }
      .mod-gallery-item-title {
          font-size: 1.1em;
          font-weight: bold;
          margin-bottom: 5px;
      }
      .mod-gallery-item-version {
          font-size: 0.85em;
          color: var(--text-secondary);
          margin-bottom: 5px;
      }
      .mod-gallery-item-description {
          font-size: 0.9em;
          margin-bottom: 10px;
          flex-grow: 1;
      }
      .mod-gallery-item-category {
          display: inline-block;
          background-color: var(--primary-dark);
          color: var(--text-primary);
          padding: 3px 6px;
          border-radius: 3px;
          font-size: 0.8em;
          margin-top: 5px;
      }
      /* Table view styles */
      .manifest-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
      }
      .manifest-table th, .manifest-table td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
      }
      .manifest-table th {
          background-color: var(--bg-card);
          font-weight: bold;
      }
      .manifest-table tr:hover {
          background-color: rgba(255, 255, 255, 0.05);
      }
      /* Info note */
      .info-note {
          background-color: rgba(33, 150, 243, 0.1);
          border-left: 4px solid var(--primary-color);
          padding: 10px;
          margin-bottom: 15px;
          border-radius: 0 4px 4px 0;
      }
      .btn-primary {
          background-color: var(--primary-color);
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 6px 10px;
          cursor: pointer;
      }
    `);
  }

  // Create and show the modal with script information
  function showModal() {
    let modal = document.getElementById("mod-manager-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "mod-manager-modal";
      modal.className = "mod-manager-modal";
      modal.innerHTML = `
        <div class="mod-manager-modal-content">
          <div class="mod-manager-header">
            <h2 class="mod-manager-title">RPGHQ Userscript Manager - MANIFEST Viewer</h2>
            <span class="mod-manager-close">&times;</span>
          </div>
          <div class="mod-manager-content" id="mod-manager-content">
            <div class="info-note">
              <strong>Note:</strong> This is a view-only display of available userscripts. No scripts will be installed or executed.
            </div>
            <div class="mod-gallery-filters">
              <select id="view-type-selector">
                <option value="gallery">Gallery View</option>
                <option value="table">Table View</option>
                <option value="json">JSON View</option>
              </select>
              <select id="category-filter">
                <option value="all">All Categories</option>
                ${getCategoryOptions()}
              </select>
              <input type="text" id="search-filter" placeholder="Search scripts...">
              <button id="apply-filter" class="btn-primary"><i class="fa fa-filter"></i> Filter</button>
            </div>
            <div id="view-container"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Add event listeners
      modal.querySelector(".mod-manager-close").addEventListener("click", () => {
        hideModal();
      });
      
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          hideModal();
        }
      });
      
      document.getElementById("view-type-selector").addEventListener("change", updateView);
      document.getElementById("apply-filter").addEventListener("click", updateView);
    }
    
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
    
    // Initial view
    updateView();
  }

  // Hide the modal
  function hideModal() {
    const modal = document.getElementById("mod-manager-modal");
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  }
  
  // Get unique categories for the filter dropdown
  function getCategoryOptions() {
    const categories = new Set();
    MANIFEST.scripts.forEach(script => {
      if (script.category) {
        categories.add(script.category);
      }
    });
    
    return Array.from(categories).map(category => 
      `<option value="${category}">${category}</option>`
    ).join('');
  }
  
  // Filter scripts based on category and search term
  function filterScripts() {
    const category = document.getElementById("category-filter").value;
    const searchTerm = document.getElementById("search-filter").value.toLowerCase();
    
    return MANIFEST.scripts.filter(script => {
      const matchesCategory = category === "all" || script.category === category;
      const matchesSearch = (
        script.name.toLowerCase().includes(searchTerm) || 
        (script.description && script.description.toLowerCase().includes(searchTerm))
      );
      
      return matchesCategory && matchesSearch;
    });
  }
  
  // Update the view based on selected view type and filters
  function updateView() {
    const viewType = document.getElementById("view-type-selector").value;
    const filteredScripts = filterScripts();
    const container = document.getElementById("view-container");
    
    switch (viewType) {
      case "gallery":
        container.innerHTML = renderGalleryView(filteredScripts);
        break;
      case "table":
        container.innerHTML = renderTableView(filteredScripts);
        break;
      case "json":
        container.innerHTML = renderJsonView(filteredScripts);
        break;
    }
  }
  
  // Render gallery view of scripts
  function renderGalleryView(scripts) {
    if (scripts.length === 0) {
      return '<p>No scripts match your filter criteria.</p>';
    }
    
    let html = '<div class="mod-gallery">';
    
    scripts.forEach(script => {
      html += `
        <div class="mod-gallery-item">
          <img src="${script.image || "https://via.placeholder.com/200x120?text=No+Image"}" alt="${script.name}">
          <div class="mod-gallery-item-title">${script.name}</div>
          <div class="mod-gallery-item-version">Version ${script.version}</div>
          <div class="mod-gallery-item-description">${script.description || "No description available."}</div>
          <div class="mod-gallery-item-category">${script.category || "Uncategorized"}</div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }
  
  // Render table view of scripts
  function renderTableView(scripts) {
    if (scripts.length === 0) {
      return '<p>No scripts match your filter criteria.</p>';
    }
    
    let html = `
      <table class="manifest-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Version</th>
            <th>Category</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    scripts.forEach(script => {
      html += `
        <tr>
          <td>${script.name}</td>
          <td>${script.version}</td>
          <td>${script.category || "Uncategorized"}</td>
          <td>${script.description || "No description available."}</td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    return html;
  }
  
  // Render JSON view of scripts
  function renderJsonView(scripts) {
    const jsonData = JSON.stringify(scripts, null, 2);
    return `<pre style="background-color: var(--bg-card); padding: 15px; border-radius: 4px; overflow: auto;">${jsonData}</pre>`;
  }

  // Initialize
  function init() {
    addStyles();
    GM_registerMenuCommand("RPGHQ Userscript Manager (View Only)", showModal);
    
    // Add menu button to the page when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addMenuButton);
    } else {
      addMenuButton();
    }
  }
  
  // Add menu button to the page
  function addMenuButton() {
    const profileDropdown = document.querySelector('.header-profile.dropdown-container .dropdown-contents[role="menu"]');
    if (!profileDropdown) return;
    
    const logoutButton = Array.from(profileDropdown.querySelectorAll("li")).find(li => {
      return li.textContent.trim().includes("Logout") || li.querySelector('a[title="Logout"]');
    });
    
    if (!logoutButton) return;
    
    const userscriptsButton = document.createElement("li");
    userscriptsButton.innerHTML = `
      <a href="#" title="View Userscripts" role="menuitem" style="font-size:0.9em;">
        <i class="fa fa-code fa-fw"></i><span> View Userscripts</span>
      </a>
    `;
    
    logoutButton.parentNode.insertBefore(userscriptsButton, logoutButton);
    userscriptsButton.querySelector("a").addEventListener("click", (e) => {
      e.preventDefault();
      showModal();
    });
  }

  // Run initialization
  init();
})();
