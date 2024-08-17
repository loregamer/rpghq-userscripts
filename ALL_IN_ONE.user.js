 // ==UserScript==
 // @name         RPGHQ Unified Userscript
 // @namespace    http://tampermonkey.net/
 // @version      1.0.0
 // @description  Unified userscript for RPGHQ, combining multiple functionalities
 // @author       loregamer
 // @match        https://rpghq.org/forums/*
 // @match        https://rpghq.org/*/*
 // @match        https://chat.rpghq.org/*
 // @grant        GM_xmlhttpRequest
 // @grant        GM_setValue
 // @grant        GM_getValue
 // @icon
 data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxK
 9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAc
 JOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZb
 ra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7
 h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3
 7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
 // @license      MIT
 // @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Unified-Userscript.user.js
 // @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Unified-Userscript.user.js
 // ==/UserScript==

 /*
 MIT License

 Copyright (c) 2024 loregamer

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

 (function () {
   "use strict";

   // Utility function to check if the current URL matches a pattern
   function urlMatches(pattern) {
     return new RegExp(pattern.replace(/\*/g, ".*")).test(window.location.href);
   }

   // Function to get a random topic ID
   function getRandomTopicId() {
     return Math.floor(Math.random() * 2800) + 1;
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

       a.onclick = async function (e) {
         e.preventDefault();
         this.style.textDecoration = "none";
         this.innerHTML =
           '<i class="icon fa-spinner fa-spin fa-fw" aria-hidden="true"></i><span>Loading...</span>';
         try {
           const validTopic = await getValidRandomTopic();
           window.location.href = validTopic;
         } catch (error) {
           console.error("Error finding random topic:", error);
           this.innerHTML =
             '<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>';
         }
       };
       li.appendChild(a);
       navMain.appendChild(li);
     }
   }

   // Run the function when the page is loaded
   addRandomTopicButton();

   // Add Subscribed Topics Button
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

         console.log(
           `Fetched ${topicRows.length} topic rows from start=${start}`
         );

         allTopicRows = allTopicRows.concat(topicRows);

         console.log(`Total topic rows: ${allTopicRows.length}`);

         // Display content immediately
         replaceContent(allTopicRows);
         updatePagination(allTopicRows.length);
         updateTitle();

         // Check for next page and fetch if available
         const nextPageLink = doc.querySelector(".pagination .next a");
         if (nextPageLink) {
           const nextStart = new URLSearchParams(nextPageLink.href).get("start");
           fetchSubscribedTopics(nextStart);
         } else {
           console.log("No more pages to fetch");
         }
       },
       onerror: function (error) {
         console.error("Error fetching subscribed topics:", error);
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
         const markDD = clonedRow.querySelector("dd.mark");
         if (markDD) markDD.remove();

         const topicLink = clonedRow.querySelector("a.topictitle");
         if (topicLink) {
           topicLink.href += "&view=unread#unread";
         }

         // Add display: none to read topics
         const isUnread = clonedRow.querySelector(
           ".topic_unread, .topic_unread_mine, .topic_unread_hot, .topic_unread_hot_mine"
         );
         if (!isUnread) {
           clonedRow.style.display = "none";
         }

         ul.appendChild(clonedRow);
       });
       panel.appendChild(ul);
     }
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

   function checkContentLoaded() {
     const panel = document.querySelector(".panel");
     if (panel && panel.innerHTML.trim() === "") {
       console.warn("Panel is empty. Attempting to reload content...");
       fetchSubscribedTopics();
     }
   }

   function initSubscribedTopics() {
     // Only run the main script on the subscribed topics page
     if (window.location.href.includes("search.php?search_id=subscribed")) {
       fetchSubscribedTopics();
       addToggleButton();
       // Check if content was loaded after a short delay
       setTimeout(checkContentLoaded, 2000);
     }

     // Add the "Subscribed topics" button to the navigation bar and quick links
     addSubscribedTopicsButton();
   }

   // Run the init function when the page loads
   if (
     document.readyState === "complete" ||
     document.readyState === "interactive"
   ) {
     // If the document is already ready, execute the function immediately
     initSubscribedTopics();
   } else {
     // Otherwise, wait for the DOM to be fully loaded
     window.addEventListener("load", initSubscribedTopics);
   }

   // Notifications Customization
   function customizeNotificationPanel() {
     let notificationBlocks = document.querySelectorAll(
       ".notification-block, a.notification-block"
     );

     notificationBlocks.forEach((block) => {
       if (block.dataset.customized === "true") return;

       let titleElement = block.querySelector(".notification-title");
       let referenceElement = block.querySelector(".notification-reference");

       if (titleElement) {
         let titleText = titleElement.innerHTML;

         if (titleText.includes("reacted to a message you posted")) {
           let isUnread = block.href && block.href.includes("mark_notification");

           let postId;
           if (block.hasAttribute("data-real-url")) {
             let match = block.getAttribute("data-real-url").match(/p=(\d+)/);
             postId = match ? match[1] : null;
           } else {
             let postIdMatch = block.href ? block.href.match(/p=(\d+)/) : null;
             postId = postIdMatch ? postIdMatch[1] : null;
           }

           // Extract usernames from the title
           let usernames = Array.from(
             titleElement.querySelectorAll(".username, .username-coloured")
           ).map((el) => el.textContent.trim());

           fetchReactions(postId, isUnread).then((reactions) => {

           fetchReactions(postId, isUnread).then((reactions) => {
             // Filter reactions to only include those from mentioned usernames
             let filteredReactions = reactions.filter((reaction) =>
               usernames