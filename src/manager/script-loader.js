// ===== Script Loading & Management =====
const ScriptLoader = {
  manifest: null,
  loadedScripts: {},

  loadManifest: function () {
    return new Promise((resolve, reject) => {
      fetch(`${SCRIPT_BASE_PATH}manifest.json`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to load manifest.json: ${response.status} ${response.statusText}`
            );
          }
          return response.json();
        })
        .then((data) => {
          this.manifest = data;
          resolve(data);
        })
        .catch((error) => {
          console.error("Error loading manifest:", error);
          reject(error);
        });
    });
  },

  loadScript: function (scriptId) {
    return new Promise((resolve, reject) => {
      if (this.loadedScripts[scriptId]) {
        resolve(this.loadedScripts[scriptId]);
        return;
      }

      if (!this.manifest) {
        reject(new Error("Manifest not loaded"));
        return;
      }

      const scriptInfo = this.manifest.scripts.find(
        (script) => script.id === scriptId
      );
      if (!scriptInfo) {
        reject(new Error(`Script not found in manifest: ${scriptId}`));
        return;
      }

      fetch(`${SCRIPT_BASE_PATH}${scriptInfo.filename}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to load script ${scriptId}: ${response.status} ${response.statusText}`
            );
          }
          return response.text();
        })
        .then((code) => {
          this.loadedScripts[scriptId] = {
            ...scriptInfo,
            code,
          };
          resolve(this.loadedScripts[scriptId]);
        })
        .catch((error) => {
          console.error(`Error loading script ${scriptId}:`, error);
          reject(error);
        });
    });
  },

  executeScript: function (scriptId, scriptData) {
    if (!scriptData.code) {
      console.error(`No code available for script ${scriptId}`);
      return false;
    }

    try {
      // Create a new function with the script's code
      const scriptFunction = new Function(
        "scriptId",
        "scriptData",
        "scriptSettings",
        scriptData.code
      );

      // Execute the script function with the appropriate context
      scriptFunction(scriptId, scriptData, Storage.getScriptSettings(scriptId));
      return true;
    } catch (error) {
      console.error(`Error executing script ${scriptId}:`, error);
      return false;
    }
  },

  loadAllScripts: async function () {
    if (!this.manifest) {
      await this.loadManifest();
    }

    const installedScripts = Storage.getInstalledScripts();
    const loadPromises = [];

    for (const scriptId in installedScripts) {
      if (installedScripts.hasOwnProperty(scriptId)) {
        loadPromises.push(this.loadScript(scriptId));
      }
    }

    return Promise.all(loadPromises);
  },

  initScripts: async function () {
    try {
      const loadedScripts = await this.loadAllScripts();

      // Register scripts with the execution framework
      loadedScripts.forEach((scriptData) => {
        const executeFunction = (id, data) => {
          this.executeScript(id, data);
        };

        ExecutionFramework.register(
          scriptData.executionPhase,
          scriptData.id,
          scriptData,
          executeFunction
        );
      });

      return true;
    } catch (error) {
      console.error("Error initializing scripts:", error);
      return false;
    }
  },
};
