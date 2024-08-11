// ==UserScript==
// @name         Ignore Dolor
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Remove "by dolor" in recent topics and lastpost while keeping timestamp and button
// @author       You
// @match        https://rpghq.org/*/*
// @grant        GM_xmlhttpRequest
// @license      MIT
// ==/UserScript==

(function() {
    "use strict";

    function processDolorContent() {
        // Process notifications
        const notificationItems = document.querySelectorAll('.notification-block');
        notificationItems.forEach(item => {
            const usernameElement = item.querySelector('.username');
            if (usernameElement && usernameElement.textContent.trim().toLowerCase() === 'dolor') {
                const markReadLink = item.getAttribute('href');
                if (markReadLink) {
                    markAsRead(markReadLink);
                }
                const listItem = item.closest('li');
                if (listItem) {
                    listItem.remove();
                }
            }
        });

        // Process recent topics and lastpost
        const topicElements = document.querySelectorAll('#recent-topics li, dd.lastpost');
        topicElements.forEach(element => {
            const usernameElement = element.querySelector('.username');
            if (usernameElement && usernameElement.textContent.trim().toLowerCase() === 'dolor') {
                // Replace the "by" text with an empty string
                element.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        node.textContent = node.textContent.replace(/\s*by\s*/i, '');
                    }
                });

                // Remove the line break after "by"
                const br = element.querySelector('br');
                if (br) {
                    br.remove();
                }

                // Remove the mas-wrap element (avatar and username)
                const masWrap = element.querySelector('.mas-wrap');
                if (masWrap) {
                    masWrap.remove();
                }
            }
        });
    }

    function markAsRead(href) {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://rpghq.org/forums/" + href,
            onload: function(response) {
                console.log("Dolor notification marked as read:", response.status);
            }
        });
    }

    function init() {
        processDolorContent();

        // Set up a MutationObserver to handle dynamically