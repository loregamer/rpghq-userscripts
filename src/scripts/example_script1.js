// Example Script 1
/**
 * This is a simple example script that demonstrates how a script
 * can be loaded by the manager. It exports an init function that
 * will be called when the script is enabled.
 */

export function init() {
  console.log("Example Script 1 initialized!");

  // Read settings if needed
  // const enableFeatureX = GM_getValue("RPGHQ_Manager_script1_setting1", true);

  // Example DOM manipulation
  const addWelcomeMessage = () => {
    // Only add if on the homepage
    if (!window.location.pathname.match(/^\/(index\.php)?$/)) return;

    // Check if already added
    if (document.querySelector(".example-script-banner")) return;

    const banner = document.createElement("div");
    banner.className = "example-script-banner";
    banner.style.cssText =
      "padding: 10px; margin: 10px 0; background: #f0f8ff; border: 1px solid #add8e6; border-radius: 5px; text-align: center;";
    banner.innerHTML =
      "<b>Hello from Example Script 1!</b> This banner was added by the userscript manager.";

    // Try to find a good insertion point (varies based on site structure)
    const container = document.querySelector(".forumbg, .forabg, .panel");
    if (container) {
      container.parentNode.insertBefore(banner, container);
    } else {
      // Fallback: just add to body
      document.body.insertBefore(banner, document.body.firstChild);
    }
  };

  // Wait a bit for the page to be fully ready
  setTimeout(addWelcomeMessage, 1000);

  return {
    // Optional cleanup function that gets called if script is disabled at runtime
    cleanup: () => {
      console.log("Example Script 1 cleanup");
      // Remove any DOM elements or event listeners we added
      const banner = document.querySelector(".example-script-banner");
      if (banner) banner.remove();
    },
  };
}
