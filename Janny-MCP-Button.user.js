// ==UserScript==
// @name         RPGHQ - Add MCP Button Everywhere
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds the MCP button to the New and Unread posts pages
// @author       Your Name
// @match        https://rpghq.org/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABmUExURQCqAQCqAACwDHKocgCrAipPBRggKidQBjgvEkIzDDkvEihQBjkuEjouESpQBTwuEUAtEUMtEEcsEEosEA9fAUsrEEssEEUsEEEtET0uESIkIipOBUItESxOBSUjIitOBS8qHAAAAGMEP4sAAAAidFJOU////////////////////////////////////////////wAN0MNxAAAACXBIWXMAAA7CAAAOwgEVKEqAAAABJklEQVRIS92V6U7DMBCEy+GFBChXucrp939JNju701CxYCNVqphfnsl8iew4zqJ26l8Ai4NJ7mo1d4jx0VchRH8LOMbYiyGE3wJuvRhC6EARgYc9kVOUhhEaYFPgTM7RGAUaYVOgyAUarcBSLtFQADlt9oQrNpDTZsA1G8hpM+CGDeS0GXDLBnJaB1al4AJskTs2kNM6sKU/APdsNAINczCtYJtWyVTCPrDRCHS/uEc2kNNmQOdeWspTNNbIw6YAt/f0JewAKL3A82YO/nFCPwBcpVbgBY0hDhgoBV7lTcfeCukZtc6Ad7NeDOntVf2AXtBt/RGAam7n56QCmkyAkRtgbm3oC9UN6KQ1afoDAVDpeE8AlS2XvTgPfpPNftLOAGrvgFo/AYmjmfleeiNOAAAAAElFTkSuQmCC
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function addMCPButton() {
    const navMain = document.getElementById("nav-main");
    if (!navMain) return;

    const existingMCPButton = navMain.querySelector('a[href*="mcp.php"]');
    if (existingMCPButton) return;

    const newMCPButton = document.createElement("li");
    newMCPButton.innerHTML = `
            <a href="https://rpghq.org/forums/mcp.php?i=mcp_main" title="Moderator Control Panel" role="menuitem">
                <i class="icon fa-gavel fa-fw" aria-hidden="true"></i><span>MCP</span>
            </a>
        `;

    // Find a suitable insertion point
    let insertionPoint = navMain.querySelector(
      'li[data-last-responsive="true"]'
    );
    if (!insertionPoint) {
      insertionPoint = navMain.lastElementChild;
    }

    if (insertionPoint) {
      navMain.insertBefore(newMCPButton, insertionPoint.nextSibling);
    } else {
      // If we can't find a suitable insertion point, just append to the end
      navMain.appendChild(newMCPButton);
    }
  }

  function init() {
    // Wait a short time to ensure the DOM is fully loaded
    addMCPButton();
  }

  // Run the init function when the page loads
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // If the document is already ready, execute the function after a short delay
    setTimeout(init, 100);
  } else {
    // Otherwise, wait for the DOM to be fully loaded
    window.addEventListener("load", init);
  }
})();
