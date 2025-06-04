// ==UserScript==
// @name         RPGHQ - Post Reviewer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Review and react to posts with keyboard navigation on rpghq.org
// @author       You
// @match        https://rpghq.org/*
// @grant        GM_getValue
// @grant        GM_setValue
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/ghosted-users/Post-Review.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/ghosted-users/Post-Review.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Default reaction data
    const defaultReactions = [
        { id: 3, name: 'Care', img: 'https://rpghq.org/forums/ext/canidev/reactions/images/reaction/matter.svg' },
        { id: 8, name: 'Watermelon', img: 'https://rpghq.org/forums/ext/canidev/reactions/images/reaction/care-emoji-watermelon.svg' },
        { id: 10, name: 'Thanks', img: 'https://rpghq.org/forums/ext/canidev/reactions/images/reaction/thanks3.png' },
        { id: 11, name: 'Agree', img: 'https://rpghq.org/forums/ext/canidev/reactions/images/reaction/check-mark.svg' },
        { id: 12, name: 'Disagree', img: 'https://rpghq.org/forums/ext/canidev/reactions/images/reaction/cancel.svg' },
        { id: 13, name: 'Informative', img: 'https://rpghq.org/forums/ext/canidev/reactions/images/reaction/info.svg' },
        { id: 14, name: 'Mad', img: 'https://rpghq.org/forums/ext/canidev/reactions/images/reaction/argh.gif' },
        { id: 15, name: 'Funny', img: 'https://rpghq.org/forums/ext/canidev/reactions/images/reaction/lol.gif' },
        { id: 16, name: 'Sad', img: 'https://rpghq.org/forums/ext/canidev/reactions/images/reaction/frown.gif' },
        { id: 18, name: 'Hmm...', img: 'https://rpghq.org/forums/ext/canidev/reactions/images/reaction/scratch.gif' },
        { id: 19, name: 'Toot', img: 'https://rpghq.org/forums/ext/canidev/reactions/images/reaction/emot-toot.gif' },
        { id: 20, name: '404', img: 'https://rpghq.org/forums/ext/canidev/reactions/images/reaction/broken.svg' },
        { id: 26, name: 'Salute', img: 'https://rpghq.org/forums/ext/canidev/reactions/images/reaction/salute.gif' }
    ];

    // Keyboard keys in order
    const keyboardKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'q', 'w', 'e', 'r'];

    // Get the keyboard key for a position
    function getKeyForPosition(position) {
        return keyboardKeys[position] || null;
    }

    // Load reaction order from GM storage
    function loadReactionOrder() {
        const savedOrder = GM_getValue('reactionOrder', null);
        if (savedOrder) {
            // Map saved order to full reaction objects
            return savedOrder.map(id => defaultReactions.find(r => r.id === id)).filter(Boolean);
        }
        return [...defaultReactions];
    }

    // Save reaction order to GM storage
    function saveReactionOrder() {
        const order = reactions.map(r => r.id);
        GM_setValue('reactionOrder', order);
    }

    // State management
    let loadedPosts = [];
    let processedPosts = [];
    let currentPostIndex = 0;
    let currentPanel = 'setup';
    let isPopupOpen = false;
    let draggedElement = null;
    let reactions = loadReactionOrder();

    // Shuffle array function
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Create popup HTML
    function createPopup() {
        const wrapper = document.createElement('div');
        wrapper.id = 'post-reviewer-wrapper';

        wrapper.innerHTML = `
            <div id="darkenwrapper" class="darkenwrapper pr-active">
                <div id="darken" class="darken">&nbsp;</div>
            </div>

            <div id="phpbb_alert" class="phpbb_alert pr-modal">
                <a href="#" class="alert_close">
                    <i class="icon fa-times-circle fa-fw" aria-hidden="true"></i>
                </a>
                <h3 class="alert_title">Post Reviewer v3.2 - Keyboard Mode</h3>
                <div class="alert_text">
                    <!-- Keyboard hints -->
                    <div id="pr-keyboard-hints" class="pr-keyboard-hints panel bg1">
                        <div class="inner">
                            <span class="pr-hint">←→ Navigate</span>
                            <span class="pr-hint">1-9,Q-R React</span>
                            <span class="pr-hint">O Open Post</span>
                            <span class="pr-hint">Space Next</span>
                            <span class="pr-hint">ESC Close</span>
                            <span class="pr-hint">Drag to Reorder</span>
                        </div>
                    </div>

                    <!-- Setup Panel -->
                    <div id="pr-setup-panel" class="pr-panel panel bg1">
                        <div class="inner">
                            <fieldset class="fields1">
                                <dl>
                                    <dt><label for="pr-post-numbers">Post Numbers (one per line):</label></dt>
                                    <dd><textarea id="pr-post-numbers" rows="6" cols="50" placeholder="Loading default post numbers..."></textarea></dd>
                                </dl>
                                <dl>
                                    <dt><label for="pr-post-count">Number of posts to load:</label></dt>
                                    <dd>
                                        <input type="number" id="pr-post-count" size="5" min="1" max="50" value="20">
                                        <span class="pr-field-desc">Random selection from above</span>
                                    </dd>
                                </dl>
                            </fieldset>
                        </div>
                        <div class="pr-button-group">
                            <input type="button" class="button1" id="pr-start" value="Load Posts (Enter)" tabindex="0">
                            <input type="button" class="button2" id="pr-cancel" value="Cancel (ESC)" tabindex="0">
                        </div>
                    </div>

                    <!-- Feed Panel -->
                    <div id="pr-feed-panel" class="pr-panel" style="display: none;">
                        <div class="pr-feed-header bg3">
                            <div class="pr-stats">
                                <span id="pr-feed-stats"></span>
                                <span class="pr-divider">|</span>
                                <span id="pr-page-info" class="pr-page-info"></span>
                            </div>
                            <div class="pr-post-link">
                                <a href="#" id="pr-open-post" class="button2" target="_blank">Open Post (O)</a>
                            </div>
                        </div>

                        <div id="pr-current-post" class="pr-current-post panel bg2"></div>

                        <div class="pr-controls panel bg1">
                            <div id="pr-post-time" class="pr-post-time"></div>
                            <div id="pr-reaction-buttons" class="pr-reaction-buttons"></div>
                        </div>

                        <div class="pr-button-group">
                            <input type="button" class="button2" id="pr-prev-post" value="← Previous" tabindex="0">
                            <input type="button" class="button1" id="pr-next-post" value="Next → (Space)" tabindex="0">
                            <input type="button" class="button2" id="pr-load-more" value="Load More (L)" tabindex="0">
                        </div>
                    </div>

                    <!-- Loading Panel -->
                    <div id="pr-loading-panel" class="pr-panel panel bg2" style="display: none;">
                        <div class="inner">
                            <p id="pr-loading-text">Loading posts...</p>
                            <div class="pr-progress-bar">
                                <div class="pr-progress-fill"></div>
                            </div>
                            <p id="pr-loading-details"></p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .pr-active {
                display: block !important;
            }

            .pr-modal {
                position: fixed;
                display: block !important;
                top: 3%;
                left: 50%;
                width: 900px;
                margin-left: -450px;
                z-index: 5001;
                max-height: 94vh;
                overflow-y: auto;
            }

            #post-reviewer-wrapper {
                display: none;
            }

            #post-reviewer-wrapper.active {
                display: block;
            }

            .pr-panel {
                margin-bottom: 10px;
            }

            .pr-keyboard-hints {
                margin-bottom: 10px;
                text-align: center;
                font-size: 12px;
            }

            .pr-hint {
                display: inline-block;
                margin: 0 10px;
                padding: 2px 8px;
                background: rgba(0,0,0,0.1);
                border-radius: 3px;
            }

            .pr-feed-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
            }

            .pr-stats {
                font-weight: bold;
            }

            .pr-divider {
                margin: 0 10px;
                color: #999;
            }

            .pr-current-post {
                max-height: 450px;
                overflow-y: auto;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 15px;
            }

            .pr-post-item {
                padding: 10px;
                position: relative;
            }

            .pr-post-item.reacted {
                border-left: 4px solid #28a745;
                background: rgba(40,167,69,0.1);
                margin-left: -4px;
            }

            .pr-post-header {
                font-size: 12px;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(0,0,0,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .pr-post-number {
                font-weight: bold;
            }

            .pr-post-item.reacted .pr-post-number {
                color: #28a745;
            }

            .pr-post-meta {
                color: #666;
            }

            .pr-controls {
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                user-select: none;
            }

            .pr-post-time {
                text-align: center;
                font-size: 13px;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(0,0,0,0.1);
                color: #666;
                font-style: italic;
            }

            .pr-reaction-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: center;
            }

            .pr-reaction-btn {
                position: relative;
                display: inline-flex;
                align-items: center;
                padding: 8px;
                border: 1px solid rgba(0,0,0,0.2);
                cursor: pointer;
                transition: all 0.2s;
                text-decoration: none;
                min-width: 40px;
                height: 40px;
                justify-content: center;
                border-radius: 5px;
            }

            .pr-reaction-btn:hover, .pr-reaction-btn:focus {
                transform: scale(1.1);
                border-color: #105289;
                outline: none;
                box-shadow: 0 0 0 2px rgba(16,82,137,0.3);
            }

            .pr-reaction-btn.dragging {
                opacity: 0.5;
                cursor: grabbing;
            }

            .pr-reaction-btn.drag-over {
                border-color: #105289;
                border-width: 2px;
            }

            .pr-reaction-btn img {
                width: 20px;
                height: 20px;
                margin: 0;
            }

            .pr-reaction-btn.reacted {
                border-color: #28a745;
                border-width: 3px;
                transform: scale(1.05);
            }

            .pr-reaction-btn.processing {
                opacity: 0.5;
                pointer-events: none;
            }

            .pr-reaction-key {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #333;
                color: white;
                font-size: 10px;
                padding: 2px 4px;
                border-radius: 3px;
                font-weight: bold;
            }

            .pr-button-group {
                text-align: center;
                padding: 15px 0;
                display: flex;
                gap: 10px;
                justify-content: center;
            }

            .pr-progress-bar {
                height: 20px;
                background: #ddd;
                border-radius: 3px;
                overflow: hidden;
                margin: 10px 0;
            }

            .pr-progress-fill {
                height: 100%;
                background: #105289;
                width: 0;
                transition: width 0.3s;
            }

            .pr-thumbnail {
                max-width: 100px;
                max-height: 100px;
                cursor: pointer;
                border: 1px solid #ddd;
                margin: 2px;
            }

            .pr-thumbnail:hover {
                opacity: 0.8;
            }

            .pr-field-desc {
                font-size: 11px;
                color: #666;
                margin-left: 10px;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(wrapper);

        // Add event listeners
        setupEventListeners();
    }

    function setupEventListeners() {
        const wrapper = document.getElementById('post-reviewer-wrapper');

        // Close button
        wrapper.querySelector('.alert_close').addEventListener('click', function(e) {
            e.preventDefault();
            closePopup();
        });

        // Background click
        wrapper.querySelector('.darken').addEventListener('click', closePopup);

        // Button clicks
        document.getElementById('pr-cancel').addEventListener('click', closePopup);
        document.getElementById('pr-start').addEventListener('click', startReviewing);
        document.getElementById('pr-load-more').addEventListener('click', loadMorePosts);
        document.getElementById('pr-prev-post').addEventListener('click', previousPost);
        document.getElementById('pr-next-post').addEventListener('click', nextPost);
        document.getElementById('pr-open-post').addEventListener('click', openCurrentPost);

        // Focus on textarea when opening
        const textarea = document.getElementById('pr-post-numbers');
        if (textarea) {
            setTimeout(() => textarea.focus(), 100);
        }
    }

    // Process post content
    function processPostContent(contentHtml) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentHtml;

        // Remove nested blockquotes
        const blockquotes = tempDiv.querySelectorAll('blockquote');
        blockquotes.forEach(blockquote => {
            const nestedBlockquotes = blockquote.querySelectorAll('blockquote');
            nestedBlockquotes.forEach(nested => nested.remove());
        });

        // Convert images to thumbnails
        const images = tempDiv.querySelectorAll('img');
        images.forEach(img => {
            if (!img.classList.contains('smilies')) {
                const originalSrc = img.src;
                img.classList.add('pr-thumbnail');
                img.title = 'Click to view full size';
                img.addEventListener('click', function() {
                    window.open(originalSrc, '_blank');
                });
            }
        });

        return tempDiv.innerHTML;
    }

    // Navigation functions
    function previousPost() {
        if (currentPostIndex > 0) {
            currentPostIndex--;
            displayCurrentPost();
        }
    }

    function nextPost() {
        if (currentPostIndex < loadedPosts.length - 1) {
            currentPostIndex++;
            displayCurrentPost();
        }
    }

    function openCurrentPost(e) {
        if (e) e.preventDefault();
        if (loadedPosts.length === 0) return;

        const currentPost = loadedPosts[currentPostIndex];
        window.open(`https://rpghq.org/forums/viewtopic.php?p=${currentPost.postNumber}#p${currentPost.postNumber}`, '_blank');
    }

    function showPopup() {
        // Verify user is logged in
        try {
            getCurrentUserId();
        } catch (error) {
            alert('You must be logged in to use the Post Reviewer.');
            return;
        }

        const wrapper = document.getElementById('post-reviewer-wrapper');
        wrapper.classList.add('active');
        isPopupOpen = true;
        currentPanel = 'setup';
        fetchDefaultPostNumbers();
    }

    function closePopup() {
        const wrapper = document.getElementById('post-reviewer-wrapper');
        wrapper.classList.remove('active');
        isPopupOpen = false;
        resetReviewer();
    }

    function resetReviewer() {
        loadedPosts = [];
        processedPosts = [];
        currentPostIndex = 0;
        currentPanel = 'setup';
        document.getElementById('pr-setup-panel').style.display = 'block';
        document.getElementById('pr-feed-panel').style.display = 'none';
        document.getElementById('pr-loading-panel').style.display = 'none';
    }

    // Get current user ID
    function getCurrentUserId() {
        // First try cookies
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name.startsWith('hq_phpbb_') && name.endsWith('_u')) {
                return value;
            }
        }

        // If cookies fail, extract from profile link
        const profileLink = document.querySelector('#username_logged_in .dropdown-contents a[href*="memberlist.php?mode=viewprofile"]');
        if (profileLink) {
            const href = profileLink.getAttribute('href');
            const match = href.match(/[&?]u=(\d+)/);
            if (match && match[1]) {
                return match[1];
            }
        }

        // No fallback - throw error if we can't find user ID
        throw new Error('Unable to determine user ID. Please ensure you are logged in.');
    }

    // Fetch post content
    async function fetchPostContent(postNumber) {
        try {
            const response = await fetch(`https://rpghq.org/forums/viewtopic.php?p=${postNumber}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const postContentDiv = doc.querySelector(`#post_content${postNumber}`);
            if (!postContentDiv) {
                throw new Error('Post content not found');
            }

            const contentDiv = postContentDiv.querySelector('.content');
            if (!contentDiv) {
                throw new Error('Content div not found');
            }

            const authorElement = postContentDiv.parentElement.querySelector('.author');
            const timeElement = authorElement ? authorElement.querySelector('time') : null;
            const usernameElement = authorElement ? authorElement.querySelector('.username-coloured, strong a') : null;

            return {
                content: processPostContent(contentDiv.outerHTML),
                author: usernameElement ? usernameElement.textContent.trim() : 'Unknown',
                time: timeElement ? timeElement.textContent.trim() : 'Unknown time',
                postNumber: postNumber
            };
        } catch (error) {
            console.error(`Error fetching post ${postNumber}:`, error);
            return null;
        }
    }

    // Process reaction
    async function processReaction(postNumber, reactionId, userId) {
        try {
            const response = await fetch(`https://rpghq.org/forums/reactions?post=${postNumber}&user=${userId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: `mode=add_reaction&reaction=${reactionId}`,
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error adding reaction to post ${postNumber}:`, error);
            throw error;
        }
    }

    // Create post item HTML
    function createPostItem(postData) {
        const processedPost = processedPosts.find(p => p.postNumber === postData.postNumber);
        let reactionInfo = '';

        if (processedPost) {
            // Find current position of this reaction to get current key
            const currentPosition = reactions.findIndex(r => r.id === processedPost.reactionId);
            const currentKey = currentPosition !== -1 ? getKeyForPosition(currentPosition) : null;
            reactionInfo = ` (${processedPost.reaction}${currentKey ? ' - ' + currentKey.toUpperCase() : ''})`;
        }

        return `
            <div class="pr-post-item ${processedPost ? 'reacted' : ''}" data-post="${postData.postNumber}">
                <div class="pr-post-header">
                    <span class="pr-post-number">Post #${postData.postNumber}${reactionInfo}</span>
                    <span class="pr-post-meta">${postData.author} • ${postData.time}</span>
                </div>
                <div class="pr-post-content">
                    ${postData.content}
                </div>
            </div>
        `;
    }

    // Display current post
    function displayCurrentPost() {
        if (loadedPosts.length === 0) return;

        const currentPost = loadedPosts[currentPostIndex];
        const currentPostDiv = document.getElementById('pr-current-post');
        const pageInfo = document.getElementById('pr-page-info');
        const prevBtn = document.getElementById('pr-prev-post');
        const nextBtn = document.getElementById('pr-next-post');
        const reactionButtonsDiv = document.getElementById('pr-reaction-buttons');
        const postTimeDiv = document.getElementById('pr-post-time');
        const openBtn = document.getElementById('pr-open-post');

        // Update page info
        pageInfo.textContent = `Post ${currentPostIndex + 1} of ${loadedPosts.length}`;

        // Update button states
        prevBtn.disabled = currentPostIndex === 0;
        nextBtn.disabled = currentPostIndex === loadedPosts.length - 1;

        // Update open post link
        openBtn.href = `https://rpghq.org/forums/viewtopic.php?p=${currentPost.postNumber}#p${currentPost.postNumber}`;

        // Display the post
        currentPostDiv.innerHTML = createPostItem(currentPost);

        // Display post time above reactions
        postTimeDiv.innerHTML = `Posted: ${currentPost.time}`;

        // Check if already reacted
        const existingReaction = processedPosts.find(p => p.postNumber === currentPost.postNumber);

        // Create reaction buttons with drag capability
        const reactionButtons = reactions.map((reaction, index) => {
            const key = getKeyForPosition(index);
            return `
                <a href="#" class="pr-reaction-btn ${existingReaction && existingReaction.reactionId === reaction.id ? 'reacted' : ''}"
                   data-post="${currentPost.postNumber}"
                   data-reaction-id="${reaction.id}"
                   data-index="${index}"
                   title="${reaction.name} (${key ? key.toUpperCase() : 'No key'})"
                   draggable="true">
                    <img src="${reaction.img}" alt="${reaction.name}" draggable="false">
                    ${key ? `<span class="pr-reaction-key">${key.toUpperCase()}</span>` : ''}
                </a>
            `;
        }).join('');

        reactionButtonsDiv.innerHTML = reactionButtons;

        // Add reaction button listeners
        reactionButtonsDiv.querySelectorAll('.pr-reaction-btn').forEach(btn => {
            btn.addEventListener('click', handleReactionClick);

            // Drag events
            btn.addEventListener('dragstart', handleDragStart);
            btn.addEventListener('dragover', handleDragOver);
            btn.addEventListener('drop', handleDrop);
            btn.addEventListener('dragend', handleDragEnd);
            btn.addEventListener('dragenter', handleDragEnter);
            btn.addEventListener('dragleave', handleDragLeave);
        });

        // Focus on next button for easy navigation
        if (!nextBtn.disabled) {
            nextBtn.focus();
        } else if (!prevBtn.disabled) {
            prevBtn.focus();
        }
    }

    // Drag and drop handlers
    function handleDragStart(e) {
        draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter(e) {
        if (e.target.classList && e.target.classList.contains('pr-reaction-btn')) {
            e.target.classList.add('drag-over');
        }
    }

    function handleDragLeave(e) {
        if (e.target.classList && e.target.classList.contains('pr-reaction-btn')) {
            e.target.classList.remove('drag-over');
        }
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        const dropTarget = e.target.closest('.pr-reaction-btn');
        if (!dropTarget || draggedElement === dropTarget) {
            return false;
        }

        // Get indices
        const draggedIndex = parseInt(draggedElement.dataset.index);
        const targetIndex = parseInt(dropTarget.dataset.index);

        // Reorder reactions array
        const draggedReaction = reactions[draggedIndex];
        reactions.splice(draggedIndex, 1);
        reactions.splice(targetIndex, 0, draggedReaction);

        // Save new order
        saveReactionOrder();

        // Redisplay current post to update button order
        displayCurrentPost();

        return false;
    }

    function handleDragEnd(e) {
        // Clean up
        document.querySelectorAll('.pr-reaction-btn').forEach(btn => {
            btn.classList.remove('dragging', 'drag-over');
        });
        draggedElement = null;
    }

    async function handleReactionClick(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        if (btn.classList.contains('processing')) return;

        const postNumber = btn.dataset.post;
        const reactionId = parseInt(btn.dataset.reactionId);
        const postItem = document.querySelector('.pr-post-item');
        const reactionButtonsDiv = document.getElementById('pr-reaction-buttons');

        try {
            const userId = getCurrentUserId();
            btn.classList.add('processing');
            await processReaction(postNumber, reactionId, userId);

            // Clear previous reaction styling
            reactionButtonsDiv.querySelectorAll('.pr-reaction-btn').forEach(button => {
                button.classList.remove('processing', 'reacted');
            });

            // Mark this button as reacted
            btn.classList.add('reacted');
            postItem.classList.add('reacted');

            // Update or add reaction in processedPosts
            const existingIndex = processedPosts.findIndex(p => p.postNumber === postNumber);
            const reactionName = reactions.find(r => r.id === reactionId).name;

            if (existingIndex >= 0) {
                // Update existing reaction
                processedPosts[existingIndex] = {
                    postNumber: postNumber,
                    reaction: reactionName,
                    reactionId: reactionId
                };
            } else {
                // Add new reaction
                processedPosts.push({
                    postNumber: postNumber,
                    reaction: reactionName,
                    reactionId: reactionId
                });
            }

            updateFeedStats();

            // Auto advance after 500ms (only if not already reacted)
            if (existingIndex === -1) {
                setTimeout(() => {
                    if (currentPostIndex < loadedPosts.length - 1) {
                        nextPost();
                    }
                }, 500);
            }

        } catch (error) {
            btn.classList.remove('processing');
            alert(`Failed to add reaction: ${error.message}`);
        }
    }

    // Update feed stats
    function updateFeedStats() {
        const feedStats = document.getElementById('pr-feed-stats');
        const uniqueReactedPosts = new Set(processedPosts.map(p => p.postNumber)).size;
        feedStats.textContent = `${uniqueReactedPosts} posts reacted / ${loadedPosts.length} loaded`;
    }

    // Display posts feed
    function displayPostsFeed() {
        currentPanel = 'feed';
        const feedPanel = document.getElementById('pr-feed-panel');

        updateFeedStats();
        currentPostIndex = 0;
        displayCurrentPost();
        feedPanel.style.display = 'block';
    }

    // Start reviewing process
    async function startReviewing() {
        const postNumbersText = document.getElementById('pr-post-numbers').value;
        const postCount = parseInt(document.getElementById('pr-post-count').value);

        if (!postNumbersText.trim()) {
            alert('Please enter some post numbers');
            return;
        }

        // Parse and shuffle post numbers
        const allPostNumbers = postNumbersText
            .split('\n')
            .map(num => num.trim())
            .filter(num => num && !isNaN(num));

        if (allPostNumbers.length === 0) {
            alert('No valid post numbers found');
            return;
        }

        const selectedCount = Math.min(postCount, allPostNumbers.length);
        const shuffled = shuffleArray(allPostNumbers);
        const postsToLoad = shuffled.slice(0, selectedCount);

        // Hide setup and show loading
        currentPanel = 'loading';
        document.getElementById('pr-setup-panel').style.display = 'none';
        document.getElementById('pr-loading-panel').style.display = 'block';

        // Load all posts
        await loadPosts(postsToLoad);
    }

    async function loadPosts(postNumbers) {
        const loadingText = document.getElementById('pr-loading-text');
        const loadingDetails = document.getElementById('pr-loading-details');
        const progressBar = document.querySelector('.pr-progress-fill');

        loadedPosts = [];
        let loaded = 0;

        for (const postNumber of postNumbers) {
            try {
                loadingText.textContent = `Loading posts... (${loaded + 1}/${postNumbers.length})`;
                loadingDetails.textContent = `Fetching post #${postNumber}`;

                const postData = await fetchPostContent(postNumber);
                if (postData) {
                    loadedPosts.push(postData);
                }

                loaded++;
                progressBar.style.width = `${(loaded / postNumbers.length) * 100}%`;

                // Small delay to prevent overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error) {
                console.error(`Error loading post ${postNumber}:`, error);
                loaded++;
                progressBar.style.width = `${(loaded / postNumbers.length) * 100}%`;
            }
        }

        // Show feed
        document.getElementById('pr-loading-panel').style.display = 'none';
        displayPostsFeed();
    }

    function loadMorePosts() {
        currentPanel = 'setup';
        document.getElementById('pr-feed-panel').style.display = 'none';
        document.getElementById('pr-setup-panel').style.display = 'block';
        // Keep loaded posts and processed posts for stats
    }

    // Fetch default post numbers
    async function fetchDefaultPostNumbers() {
        const textarea = document.getElementById('pr-post-numbers');
        if (!textarea) return;

        try {
            textarea.placeholder = 'Loading default post numbers...';
            const response = await fetch('https://f.rpghq.org/4Qp1NTZUA2yG.txt');
            if (response.ok) {
                const text = await response.text();
                if (text.trim()) {
                    textarea.value = text.trim();
                    textarea.placeholder = 'Post numbers loaded from default list';
                } else {
                    textarea.placeholder = 'Enter post numbers (one per line)';
                }
            } else {
                textarea.placeholder = 'Enter post numbers (one per line) - Could not load defaults';
            }
        } catch (error) {
            console.log('Could not fetch default post numbers:', error);
            textarea.placeholder = 'Enter post numbers (one per line) - Could not load defaults';
        }
    }

    // Keyboard handler for reactions
    function handleReactionKeyboard(key) {
        if (currentPanel !== 'feed') return;

        const keyIndex = keyboardKeys.indexOf(key.toLowerCase());
        if (keyIndex === -1 || keyIndex >= reactions.length) return;

        const reaction = reactions[keyIndex];
        const btn = document.querySelector(`.pr-reaction-btn[data-reaction-id="${reaction.id}"]`);
        if (btn && !btn.classList.contains('processing')) {
            btn.click();
        }
    }

    // Initialize
    createPopup();

    // Global keyboard event listener
    document.addEventListener('keydown', function(event) {
        const activeElement = document.activeElement;
        const isInputActive = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');

        // Open popup with ]
        if (event.key === ']' && !event.ctrlKey && !event.altKey && !event.shiftKey && !isInputActive) {
            event.preventDefault();
            showPopup();
            return;
        }

        // Only process other keys if popup is open
        if (!isPopupOpen) return;

        // Escape closes popup
        if (event.key === 'Escape') {
            event.preventDefault();
            closePopup();
            return;
        }

        // Panel-specific keyboard shortcuts
        switch (currentPanel) {
            case 'setup':
                if (event.key === 'Enter' && !isInputActive) {
                    event.preventDefault();
                    startReviewing();
                }
                break;

            case 'feed':
                // Navigation
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    previousPost();
                } else if (event.key === 'ArrowRight' || event.key === ' ') {
                    event.preventDefault();
                    nextPost();
                } else if (event.key.toLowerCase() === 'o') {
                    event.preventDefault();
                    openCurrentPost();
                } else if (event.key.toLowerCase() === 'l') {
                    event.preventDefault();
                    loadMorePosts();
                } else {
                    // Check for reaction keys
                    handleReactionKeyboard(event.key);
                }
                break;
        }
    });
})();