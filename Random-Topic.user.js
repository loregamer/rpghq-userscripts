// ==UserScript==
// @name         RPGHQ Random Topic (Improved)
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Adds a Random Topic button to RPGHQ that ensures the topic exists
// @match        https://rpghq.org/forums/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";

  // Function to get a random topic ID
  function getRandomTopicId() {
    return Math.floor(Math.random() * 10000) + 1;
  }

  // Function to check if a topic exists
  function checkTopicExists(topicId) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "HEAD",
        url: `https://rpghq.org/forums/viewtopic.php?t=${topicId}`,
        onload: function (response) {
          resolve(response.status === 200);
        },
        onerror: function (error) {
          reject(error);
        },
      });
    });
  }

  // Function to get a valid random topic
  async function getValidRandomTopic() {
    let topicExists = false;
    let topicId;

    while (!topicExists) {
      topicId = getRandomTopicId();
      topicExists = await checkTopicExists(topicId);
    }

    return `https://rpghq.org/forums/viewtopic.php?t=${topicId}`;
  }

  // Function to create and add the button
  function addRandomTopicButton() {
    const navMain = document.getElementById("nav-main");
    if (navMain) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.role = "menuitem";
      a.innerHTML =
        '<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>';

      // Add custom styles to the anchor and icon
      a.style.cssText = `
            display: flex;
            align-items: center;
            height: 100%;
        `;

      // Apply styles after a short delay to ensure the icon is loaded
      setTimeout(() => {
        const icon = a.querySelector(".icon");
        if (icon) {
          icon.style.cssText = `
                    font-size: 14px;
                `;
        }
      }, 100);

      a.onclick = async function (e) {
        e.preventDefault();
        a.innerHTML =
          '<i class="icon fa-spinner fa-spin fa-fw" aria-hidden="true"></i><span>Loading...</span>';
        try {
          const validTopic = await getValidRandomTopic();
          window.location.href = validTopic;
        } catch (error) {
          console.error("Error finding random topic:", error);
          a.innerHTML =
            '<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>';
        }
      };
      li.appendChild(a);
      navMain.appendChild(li);
    }
  }

  // Run the function when the page is loaded
  addRandomTopicButton();
})();
