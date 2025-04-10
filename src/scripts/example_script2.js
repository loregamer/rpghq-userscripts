// Example Script 2
/**
 * This is another example script that is disabled by default.
 * It demonstrates how a script can perform simple DOM manipulations.
 */

export function init() {
  console.log("Example Script 2 initialized!");

  // Example feature: Add post timestamps in a nicer format
  const enhanceTimestamps = () => {
    // Get all post timestamps
    const timestamps = document.querySelectorAll(".postbody .author time");

    timestamps.forEach((timestamp) => {
      // Skip if already processed
      if (timestamp.dataset.enhanced) return;

      // Get the timestamp value
      const datetime = timestamp.getAttribute("datetime");
      if (!datetime) return;

      // Parse the date
      const date = new Date(datetime);

      // Format it nicely
      const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);

      // Store original text
      const originalText = timestamp.textContent;
      timestamp.dataset.originalText = originalText;

      // Update the text
      timestamp.textContent = formattedDate;
      timestamp.dataset.enhanced = "true";

      // Add a hover effect to show original format
      timestamp.style.cursor = "help";
      timestamp.title = `Original: ${originalText}`;
    });
  };

  // Run once immediately and then set up a mutation observer
  enhanceTimestamps();

  // Set up a MutationObserver to handle dynamically loaded content
  const observer = new MutationObserver((mutations) => {
    let shouldEnhance = false;

    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        shouldEnhance = true;
      }
    });

    if (shouldEnhance) {
      enhanceTimestamps();
    }
  });

  // Start observing the document with configured parameters
  observer.observe(document.body, { childList: true, subtree: true });

  // Return cleanup function
  return {
    cleanup: () => {
      console.log("Example Script 2 cleanup");
      // Stop the observer
      observer.disconnect();

      // Restore original timestamps
      document
        .querySelectorAll('.postbody .author time[data-enhanced="true"]')
        .forEach((timestamp) => {
          if (timestamp.dataset.originalText) {
            timestamp.textContent = timestamp.dataset.originalText;
          }
          timestamp.removeAttribute("data-enhanced");
          timestamp.removeAttribute("data-original-text");
          timestamp.style.cursor = "";
          timestamp.title = "";
        });
    },
  };
}
