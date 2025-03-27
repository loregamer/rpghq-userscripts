// ===== UI Management =====
const UI = {
  createButton: function () {
    const button = document.createElement("a");
    button.innerText = "Userscripts";
    button.className = "userscripts-button";
    button.href = "#";
    button.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleUI();
    });

    // Add some basic styles
    GM_addStyle(`
      .userscripts-button {
        margin-left: 5px;
        background-color: #4CAF50;
        color: white;
        padding: 5px 10px;
        border-radius: 3px;
        text-decoration: none;
      }
      
      .userscripts-ui {
        position: fixed;
        top: 50px;
        right: 10px;
        width: 400px;
        max-height: 80vh;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        display: none;
        overflow-y: auto;
        padding: 10px;
      }
      
      .userscripts-ui.visible {
        display: block;
      }
      
      .userscripts-ui h3 {
        margin-top: 0;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
      }
      
      .userscript-item {
        padding: 10px;
        border-bottom: 1px solid #eee;
      }
      
      .userscript-item:last-child {
        border-bottom: none;
      }
    `);

    return button;
  },

  createUI: function () {
    const container = document.createElement("div");
    container.className = "userscripts-ui";

    const heading = document.createElement("h3");
    heading.innerText = "RPGHQ Userscripts";
    container.appendChild(heading);

    // Add tabs for installed scripts, gallery, and settings
    const tabContainer = document.createElement("div");
    tabContainer.className = "userscripts-tabs";

    const installedTab = document.createElement("a");
    installedTab.innerText = "Installed";
    installedTab.href = "#";
    installedTab.className = "active";
    installedTab.addEventListener("click", (e) => {
      e.preventDefault();
      this.showInstalledScripts(container);
    });

    const galleryTab = document.createElement("a");
    galleryTab.innerText = "Gallery";
    galleryTab.href = "#";
    galleryTab.addEventListener("click", (e) => {
      e.preventDefault();
      this.showGallery(container);
    });

    const settingsTab = document.createElement("a");
    settingsTab.innerText = "Settings";
    settingsTab.href = "#";
    settingsTab.addEventListener("click", (e) => {
      e.preventDefault();
      this.showSettings(container);
    });

    tabContainer.appendChild(installedTab);
    tabContainer.appendChild(galleryTab);
    tabContainer.appendChild(settingsTab);
    container.appendChild(tabContainer);

    // Add content container
    const content = document.createElement("div");
    content.className = "userscripts-content";
    container.appendChild(content);

    // Add close button
    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.className = "userscripts-close";
    closeButton.addEventListener("click", () => {
      this.toggleUI();
    });
    container.appendChild(closeButton);

    document.body.appendChild(container);

    // Show installed scripts by default
    this.showInstalledScripts(container);

    return container;
  },

  showInstalledScripts: function (container) {
    const content = container.querySelector(".userscripts-content");
    content.innerHTML = "";

    const installedScripts = Storage.getInstalledScripts();
    const scriptIds = Object.keys(installedScripts);

    if (scriptIds.length === 0) {
      content.innerHTML =
        "<p>No scripts installed. Check the Gallery tab to discover scripts.</p>";
      return;
    }

    scriptIds.forEach((scriptId) => {
      const scriptData = installedScripts[scriptId];
      const scriptElement = document.createElement("div");
      scriptElement.className = "userscript-item";

      const title = document.createElement("h4");
      title.innerText = scriptData.name;

      const version = document.createElement("span");
      version.innerText = ` v${scriptData.version}`;
      version.style.fontSize = "small";
      title.appendChild(version);

      const description = document.createElement("p");
      description.innerText = scriptData.description;

      scriptElement.appendChild(title);
      scriptElement.appendChild(description);

      content.appendChild(scriptElement);
    });
  },

  showGallery: function (container) {
    const content = container.querySelector(".userscripts-content");
    content.innerHTML = "<p>Loading scripts gallery...</p>";

    ScriptLoader.loadManifest()
      .then((manifest) => {
        content.innerHTML = "";
        const installedScripts = Storage.getInstalledScripts();

        manifest.scripts.forEach((scriptData) => {
          const scriptElement = document.createElement("div");
          scriptElement.className = "userscript-item";

          const title = document.createElement("h4");
          title.innerText = scriptData.name;

          const version = document.createElement("span");
          version.innerText = ` v${scriptData.version}`;
          version.style.fontSize = "small";
          title.appendChild(version);

          const description = document.createElement("p");
          description.innerText = scriptData.description;

          const isInstalled = !!installedScripts[scriptData.id];
          const button = document.createElement("button");
          button.innerText = isInstalled ? "Uninstall" : "Install";
          button.addEventListener("click", () => {
            if (isInstalled) {
              // TODO: Implement uninstall functionality
              alert("Uninstall not implemented in this example");
            } else {
              // TODO: Implement install functionality
              alert("Install not implemented in this example");
            }
          });

          scriptElement.appendChild(title);
          scriptElement.appendChild(description);
          scriptElement.appendChild(button);

          content.appendChild(scriptElement);
        });
      })
      .catch((error) => {
        content.innerHTML = `<p>Error loading gallery: ${error.message}</p>`;
      });
  },

  showSettings: function (container) {
    const content = container.querySelector(".userscripts-content");
    content.innerHTML =
      "<h4>Global Settings</h4><p>Settings management not implemented in this example.</p>";
  },

  toggleUI: function () {
    let uiContainer = document.querySelector(".userscripts-ui");

    if (!uiContainer) {
      uiContainer = this.createUI();
    }

    uiContainer.classList.toggle("visible");
  },

  init: function () {
    // Wait for the dropdown to be available
    const waitForDropdown = setInterval(() => {
      const dropdown = document.querySelector("#nav-main .dropdown");

      if (dropdown) {
        clearInterval(waitForDropdown);
        const button = this.createButton();
        dropdown.appendChild(button);
      }
    }, 100);
  },
};
