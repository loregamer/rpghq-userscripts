// ===== Initialization =====
async function init() {
  // Initialize storage
  Storage.init();

  // Add userscript button to nav dropdown when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    UI.init();
  });

  // Initialize scripts
  try {
    await ScriptLoader.initScripts();
    // Initialize execution framework
    ExecutionFramework.init();
  } catch (error) {
    console.error("Failed to initialize scripts:", error);
  }
}
