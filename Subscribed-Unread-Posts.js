// ==UserScript==
// @name         RPGHQ - Subscribed Threads with Unread Posts
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Display subscribed threads with unread posts on RPGHQ
// @match        https://rpghq.org/forums/search.php?search_id=subscribed
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";

  function fetchSubscribedTopics() {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://rpghq.org/forums/ucp.php?i=ucp_main&mode=subscribed",
      onload: function (response) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.responseText, "text/html");
        const topiclist = doc.querySelector(".topiclist.cplist.missing-column");

        if (topiclist) {
          replaceContent(topiclist);
          filterUnreadTopics();
          addToggleButton();
        }
      },
    });
  }

  function replaceContent(topiclist) {
    const panel = document.querySelector(".panel");
    if (panel) {
      panel.innerHTML = "";
      panel.appendChild(topiclist);
    }
  }

  function filterUnreadTopics() {
    const topics = document.querySelectorAll(
      ".topiclist.cplist.missing-column li.row"
    );
    topics.forEach((topic) => {
      const isUnread = topic.querySelector(
        ".topic_unread, .topic_unread_mine, .topic_unread_hot, .topic_unread_hot_mine"
      );
      if (!isUnread) {
        topic.style.display = "none";
      }
    });
  }

  function addToggleButton() {
    const actionBar = document.querySelector(".action-bar.bar-top");
    if (actionBar) {
      const button = document.createElement("button");
      button.textContent = "Show All Topics";
      button.style.float = "right";
      button.onclick = toggleTopics;
      actionBar.appendChild(button);
    }
  }

  function toggleTopics() {
    const topics = document.querySelectorAll(
      ".topiclist.cplist.missing-column li.row"
    );
    const button = document.querySelector(".action-bar.bar-top button");
    const showAll = button.textContent === "Show All Topics";

    topics.forEach((topic) => {
      const isUnread = topic.querySelector(
        ".topic_unread, .topic_unread_mine, .topic_unread_hot, .topic_unread_hot_mine"
      );
      topic.style.display = showAll || isUnread ? "" : "none";
    });

    button.textContent = showAll ? "Show Only Unread" : "Show All Topics";
  }

  fetchSubscribedTopics();
})();
