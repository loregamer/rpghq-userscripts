// ==UserScript==
// @name         RPGHQ - Subscribed Threads with Unread Posts
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Display subscribed threads with unread posts on RPGHQ
// @match        https://rpghq.org/forums/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";

  let allTopicRows = [];

  function addSubscribedTopicsButton() {
    // Add to quick links dropdown
    const quickLinks = document.querySelector(
      "#quick-links .dropdown-contents"
    );
    if (quickLinks) {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
            <a href="https://rpghq.org/forums/search.php?search_id=subscribed" role="menuitem">
                <i class="icon fa-check-square-o fa-fw" aria-hidden="true"></i><span>Subscribed topics</span>
            </a>
        `;
      // Insert after "Unread posts" in the dropdown
      const unreadPostsItem = quickLinks
        .querySelector('a[href*="search_id=unreadposts"]')
        .closest("li");
      unreadPostsItem.parentNode.insertBefore(
        listItem,
        unreadPostsItem.nextSibling
      );
    }

    // Add as a separate button in the main navigation
    const navMain = document.getElementById("nav-main");
    if (navMain) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "https://rpghq.org/forums/search.php?search_id=subscribed";
      a.role = "menuitem";
      a.innerHTML =
        '<i class="icon fa-check-square-o fa-fw" aria-hidden="true"></i><span>Subscribed topics</span>';

      // Add custom styles to the anchor and icon
      a.style.cssText = `
            display: flex;
            align-items: center;
            height: 100%;
            text-decoration: none;
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

      li.appendChild(a);

      // Insert after "Unread posts" and before "Chat (IRC)" in the main navigation
      const unreadPostsItem = navMain
        .querySelector('a[href*="search_id=unreadposts"]')
        .closest("li");
      const chatItem = navMain.querySelector('a[href*="/chat"]').closest("li");
      navMain.insertBefore(li, chatItem);
    }
  }

  function fetchSubscribedTopics(start = 0) {
    GM_xmlhttpRequest({
      method: "GET",
      url: `https://rpghq.org/forums/ucp.php?i=ucp_main&mode=subscribed&start=${start}`,
      onload: function (response) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.responseText, "text/html");
        const topicRows = Array.from(doc.querySelectorAll("li.row")).filter(
          (row) => {
            // Exclude forum sections
            return !row.querySelector(
              ".row-item.forum_read, .row-item.forum_unread"
            );
          }
        );

        allTopicRows = allTopicRows.concat(topicRows);

        const nextPageLink = doc.querySelector(".pagination .next a");
        if (nextPageLink) {
          const nextStart = new URLSearchParams(nextPageLink.href).get("start");
          fetchSubscribedTopics(nextStart);
        } else {
          replaceContent(allTopicRows);
          filterUnreadTopics();
          addToggleButton();
          updatePagination(allTopicRows.length);
          updateTitle();
        }
      },
    });
  }

  function replaceContent(topicRows) {
    const panel = document.querySelector(".panel");
    if (panel) {
      panel.innerHTML = "";
      const ul = document.createElement("ul");
      ul.className = "topiclist cplist missing-column";
      topicRows.forEach((row) => {
        const clonedRow = row.cloneNode(true);
        // Remove the checkmark row
        const markDD = clonedRow.querySelector("dd.mark");
        if (markDD) markDD.remove();
        ul.appendChild(clonedRow);
      });
      panel.appendChild(ul);
    }
  }

  function filterUnreadTopics() {
    const topics = document.querySelectorAll(".panel li.row");
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
      button.className = "button";
      button.onclick = toggleTopics;
      // Insert the button at the beginning of the action bar
      actionBar.insertBefore(button, actionBar.firstChild);
    }
  }

  function updatePagination(topicCount) {
    const paginationDiv = document.querySelector(
      ".action-bar.bar-top .pagination"
    );
    if (paginationDiv) {
      paginationDiv.innerHTML = `Search found ${topicCount} matches • Page <strong>1</strong> of <strong>1</strong>`;
    }
  }

  function updateTitle() {
    const titleElement = document.querySelector("h2.searchresults-title");
    if (titleElement) {
      titleElement.textContent = "Subscribed topics";
    }
  }

  function toggleTopics() {
    const topics = document.querySelectorAll(".panel li.row");
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

  // Add the "Subscribed topics" button to the navigation bar
  addSubscribedTopicsButton();

  // Only run the main script on the subscribed topics page
  if (window.location.href.includes("search.php?search_id=subscribed")) {
    fetchSubscribedTopics();
  }
})();
