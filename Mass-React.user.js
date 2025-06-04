// ==UserScript==
// @name         RPGHQ - Mass Reactor
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Mass tag/untag posts with reactions on rpghq.org - Multi-reaction support & random order
// @author       You
// @match        https://rpghq.org/*
// @grant        none
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/ghosted-users/Mass-React.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/ghosted-users/Mass-React.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Reaction data
    const reactions = [
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

    // Array to store selected reactions
    let selectedReactions = [];

    // Shuffle array function
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Update selected reactions display
    function updateSelectedDisplay() {
        const selectedText = document.getElementById('mt-selected-text');
        if (selectedReactions.length === 0) {
            selectedText.textContent = 'None';
        } else {
            const names = selectedReactions.map(r => r.name).join(', ');
            selectedText.textContent = `${names} (${selectedReactions.length} selected)`;
        }
    }

    // Create popup HTML
    function createPopup() {
        const wrapper = document.createElement('div');
        wrapper.id = 'mass-tagger-wrapper';

        // Generate reaction buttons HTML
        const reactionButtons = reactions.map(reaction => `
            <li>
                <a href="#" class="mt-reaction-item" data-reaction-id="${reaction.id}" title="${reaction.name}">
                    <img src="${reaction.img}" alt="${reaction.name}">
                    <span class="mt-reaction-id">${reaction.id}</span>
                </a>
            </li>
        `).join('');

        wrapper.innerHTML = `
            <div id="darkenwrapper" class="mt-darkenwrapper" data-ajax-error-title="AJAX error" data-ajax-error-text="Something went wrong when processing your request." data-ajax-error-text-abort="User aborted request." data-ajax-error-text-timeout="Your request timed out; please try again." data-ajax-error-text-parsererror="Something went wrong with the request and the server returned an invalid reply.">
                <div id="darken" class="mt-darken">&nbsp;</div>
            </div>

            <div id="phpbb_alert" class="mt-modal phpbb_alert">
                <a href="#" class="alert_close">
                    <i class="icon fa-times-circle fa-fw" aria-hidden="true"></i>
                </a>
                <h3 class="alert_title">Mass Tagger v5.0</h3>
                <div class="alert_text">
                    <div class="panel">
                        <div class="inner">
                            <fieldset class="fields1">
                                <label><input type="radio" name="mt_mode" value="add" checked> Add Reaction</label>
                                <label><input type="radio" name="mt_mode" value="remove"> Remove All Reactions</label>
                            </fieldset>
                        </div>
                    </div>

                    <div id="mt-reaction-panel" class="panel">
                        <div class="inner">
                            <h3>Select Reactions (click multiple to select pool)</h3>
                            <ul class="mt-reaction-selector">
                                ${reactionButtons}
                            </ul>
                            <p class="mt-selected">Selected: <strong id="mt-selected-text">None</strong></p>
                            <p class="mt-help">💡 Select multiple reactions to randomly pick from for each post</p>
                            <div class="mt-actions">
                                <button type="button" id="mt-select-all" class="button2">Select All</button>
                                <button type="button" id="mt-clear-all" class="button2">Clear All</button>
                            </div>
                        </div>
                    </div>

                    <div class="panel">
                        <div class="inner">
                            <fieldset class="fields1">
                                <dl>
                                    <dt><label for="mt-post-numbers">Post Numbers (one per line):</label></dt>
                                    <dd><textarea id="mt-post-numbers" rows="6" cols="40" placeholder="Loading default post numbers..."></textarea></dd>
                                </dl>
                                <dl>
                                    <dt><label for="mt-post-count">Number of posts to process (random selection):</label></dt>
                                    <dd>
                                        <input type="number" id="mt-post-count" size="5" min="0" max="9999" value="50"> posts
                                        <br><small>Set to 0 to process all available posts</small>
                                    </dd>
                                </dl>
                                <dl>
                                    <dt><label for="mt-delay-min">Delay between reactions:</label></dt>
                                    <dd>
                                        <input type="number" id="mt-delay-min" size="5" min="100" max="50000" step="100" value="3000"> ms
                                        to
                                        <input type="number" id="mt-delay-max" size="5" min="100" max="50000" step="100" value="8000"> ms
                                        <br><small>Random delay will be picked between these values for each reaction</small>
                                    </dd>
                                </dl>
                            </fieldset>
                        </div>
                    </div>

                    <div id="mt-progress-panel" class="panel" style="display: none;">
                        <div class="inner">
                            <p id="mt-progress-info"></p>
                            <div class="mt-progress-bar">
                                <div class="mt-progress-fill"></div>
                            </div>
                            <p id="mt-current-action" class="mt-current-action"></p>
                        </div>
                    </div>
                </div>
                <div class="clear"></div>
                <div class="alert_buttons">
                    <input type="button" class="button1" id="mt-start" value="Start Processing">
                    <input type="button" class="button2" id="mt-cancel" value="Cancel">
                </div>
            </div>
        `;

        // Add minimal custom styles
        const style = document.createElement('style');
        style.textContent = `
            .mt-darkenwrapper {
                display: block !important;
            }

            .mt-darken {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: #000;
                opacity: 0.5;
                z-index: 5000;
            }

            .mt-modal {
                position: fixed;
                display: block !important;
                top: 10%;
                left: 50%;
                width: 650px;
                margin-left: -325px;
                z-index: 5001;
                max-height: 80vh;
                overflow-y: auto;
            }

            .mt-reaction-selector {
                list-style: none;
                padding: 0;
                margin: 10px 0;
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
            }

            .mt-reaction-item {
                display: inline-block;
                padding: 5px;
                border: 2px solid transparent;
                border-radius: 3px;
                text-align: center;
                text-decoration: none;
                transition: all 0.2s;
            }

            .mt-reaction-item:hover {
                background-color: rgba(0,0,0,0.05);
            }

            .mt-reaction-item.selected {
                border-color: #105289;
                background-color: #d7e8f4;
                box-shadow: 0 0 5px rgba(16, 82, 137, 0.3);
            }

            .mt-reaction-item img {
                display: block;
                width: 24px;
                height: 24px;
                margin: 0 auto 2px;
            }

            .mt-reaction-id {
                font-size: 10px;
                color: #666;
            }

            .mt-selected {
                margin-top: 10px;
            }

            .mt-help {
                font-size: 11px;
                color: #666;
                margin: 5px 0;
                font-style: italic;
            }

            .mt-actions {
                margin: 10px 0;
            }

            .mt-actions button {
                margin-right: 5px;
                padding: 3px 8px;
                font-size: 11px;
            }

            .mt-progress-bar {
                height: 20px;
                background: #ddd;
                border-radius: 3px;
                overflow: hidden;
                margin-top: 10px;
            }

            .mt-progress-fill {
                height: 100%;
                background: #105289;
                width: 0;
                transition: width 0.3s;
            }

            .mt-current-action {
                font-size: 11px;
                color: #666;
                margin-top: 5px;
                min-height: 16px;
            }

            #mt-reaction-panel.hidden {
                display: none;
            }

            #mass-tagger-wrapper {
                display: none;
            }

            #mass-tagger-wrapper.active {
                display: block;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(wrapper);

        // Add event listeners
        wrapper.querySelector('.alert_close').addEventListener('click', function(e) {
            e.preventDefault();
            closePopup();
        });

        wrapper.querySelector('.mt-darken').addEventListener('click', closePopup);
        document.getElementById('mt-cancel').addEventListener('click', closePopup);
        document.getElementById('mt-start').addEventListener('click', startProcessing);

        // Reaction selection (multi-select)
        wrapper.querySelectorAll('.mt-reaction-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const reactionId = parseInt(this.dataset.reactionId);
                const reaction = reactions.find(r => r.id === reactionId);

                if (this.classList.contains('selected')) {
                    // Remove from selection
                    this.classList.remove('selected');
                    selectedReactions = selectedReactions.filter(r => r.id !== reactionId);
                } else {
                    // Add to selection
                    this.classList.add('selected');
                    selectedReactions.push(reaction);
                }

                updateSelectedDisplay();
            });
        });

        // Select All button
        document.getElementById('mt-select-all').addEventListener('click', function() {
            wrapper.querySelectorAll('.mt-reaction-item').forEach(item => {
                if (!item.classList.contains('selected')) {
                    item.classList.add('selected');
                    const reactionId = parseInt(item.dataset.reactionId);
                    const reaction = reactions.find(r => r.id === reactionId);
                    selectedReactions.push(reaction);
                }
            });
            updateSelectedDisplay();
        });

        // Clear All button
        document.getElementById('mt-clear-all').addEventListener('click', function() {
            wrapper.querySelectorAll('.mt-reaction-item').forEach(item => {
                item.classList.remove('selected');
            });
            selectedReactions = [];
            updateSelectedDisplay();
        });

        // Mode change listener
        wrapper.querySelectorAll('input[name="mt_mode"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const reactionPanel = document.getElementById('mt-reaction-panel');
                if (this.value === 'remove') {
                    reactionPanel.classList.add('hidden');
                } else {
                    reactionPanel.classList.remove('hidden');
                }
            });
        });
    }

    function showPopup() {
        const wrapper = document.getElementById('mass-tagger-wrapper');
        wrapper.classList.add('active');

        // Load default post numbers when popup opens
        fetchDefaultPostNumbers();
    }

    function closePopup() {
        const wrapper = document.getElementById('mass-tagger-wrapper');
        wrapper.classList.remove('active');
        document.getElementById('mt-progress-info').textContent = '';
        document.getElementById('mt-current-action').textContent = '';
        document.querySelector('.mt-progress-fill').style.width = '0';
        document.getElementById('mt-progress-panel').style.display = 'none';
    }

    // Get current user ID
    function getCurrentUserId() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name.startsWith('hq_phpbb_') && name.endsWith('_u')) {
                return value;
            }
        }
        return '551';
    }

    async function processReaction(postNumber, mode, reactionId, userId) {
        const body = mode === 'add'
            ? `mode=add_reaction&reaction=${reactionId}`
            : 'mode=remove_reaction';

        const response = await fetch(`https://rpghq.org/forums/reactions?post=${postNumber}&user=${userId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: body,
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async function startProcessing() {
        const mode = document.querySelector('input[name="mt_mode"]:checked').value;
        const postNumbersText = document.getElementById('mt-post-numbers').value;
        const postCount = parseInt(document.getElementById('mt-post-count').value);
        const delayMin = parseInt(document.getElementById('mt-delay-min').value);
        const delayMax = parseInt(document.getElementById('mt-delay-max').value);

        if (!postNumbersText.trim()) {
            alert('Please enter some post numbers');
            return;
        }

        if (isNaN(postCount) || postCount < 0) {
            alert('Please enter a valid number of posts (0 for all, or any positive number)');
            return;
        }

        if (isNaN(delayMin) || isNaN(delayMax) || delayMin < 30 || delayMax < 30) {
            alert('Please enter valid delay values (minimum 30ms each)');
            return;
        }

        if (delayMin > delayMax) {
            alert('Minimum delay cannot be greater than maximum delay');
            return;
        }

        if (mode === 'add' && selectedReactions.length === 0) {
            alert('Please select at least one reaction');
            return;
        }

        // Parse post numbers
        const postNumbers = postNumbersText
            .split('\n')
            .map(num => num.trim())
            .filter(num => num && !isNaN(num));

        if (postNumbers.length === 0) {
            alert('No valid post numbers found');
            return;
        }

        // Handle "0 = all posts" logic
        let numToProcess;
        if (postCount === 0) {
            numToProcess = postNumbers.length;
        } else {
            numToProcess = Math.min(postCount, postNumbers.length);

            if (postCount > postNumbers.length) {
                const proceed = confirm(`You requested ${postCount} posts but only ${postNumbers.length} are available. Process all ${postNumbers.length} posts?`);
                if (!proceed) return;
            }
        }

        // Randomly select posts
        const selectedPosts = [];
        const availablePosts = [...postNumbers];

        for (let i = 0; i < numToProcess && availablePosts.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availablePosts.length);
            selectedPosts.push(availablePosts[randomIndex]);
            availablePosts.splice(randomIndex, 1);
        }

        // RANDOMIZE THE ORDER OF PROCESSING
        const randomizedPosts = shuffleArray(selectedPosts);

        // Get current user ID
        const userId = getCurrentUserId();

        // Show progress
        document.getElementById('mt-progress-panel').style.display = 'block';
        const progressInfo = document.getElementById('mt-progress-info');
        const currentAction = document.getElementById('mt-current-action');
        const progressBar = document.querySelector('.mt-progress-fill');

        // Process posts in random order
        let completed = 0;
        const errors = [];

        for (const postNumber of randomizedPosts) {
            try {
                let reactionId = null;
                let reactionName = 'reactions removed';

                if (mode === 'add') {
                    // Randomly pick one reaction from selected reactions
                    const randomReaction = selectedReactions[Math.floor(Math.random() * selectedReactions.length)];
                    reactionId = randomReaction.id;
                    reactionName = randomReaction.name;
                }

                currentAction.textContent = `Processing post ${postNumber} with ${reactionName}...`;

                await processReaction(postNumber, mode, reactionId, userId);
                completed++;
                progressInfo.textContent = `Progress: ${completed}/${randomizedPosts.length} posts processed`;
                progressBar.style.width = `${(completed / randomizedPosts.length) * 100}%`;

                // Generate random delay between min and max
                const randomDelay = Math.floor(Math.random() * (delayMax - delayMin + 1)) + delayMin;
                await new Promise(resolve => setTimeout(resolve, randomDelay));
            } catch (error) {
                errors.push(postNumber);
                console.error(`Error processing post ${postNumber}:`, error);
                currentAction.textContent = `Error on post ${postNumber}, continuing...`;
            }
        }

        // Show completion
        currentAction.textContent = '';
        const action = mode === 'add' ? 'tagged' : 'had reactions removed';
        if (errors.length === 0) {
            progressInfo.innerHTML = `<strong>✓ Successfully ${action} ${completed} posts!</strong>`;
        } else {
            progressInfo.innerHTML = `<strong>Completed with ${errors.length} errors.</strong><br>${completed}/${randomizedPosts.length} posts ${action}.`;
        }

        if (mode === 'add' && selectedReactions.length > 1) {
            progressInfo.innerHTML += '<br><em>Reactions were randomly selected from your chosen pool for each post.</em>';
        }

        // Update completion message based on whether all posts were processed
        if (postCount === 0) {
            progressInfo.innerHTML += `<br><em>Processed all ${numToProcess} available posts in random order.</em>`;
        } else {
            progressInfo.innerHTML += `<br><em>Processed ${numToProcess} randomly selected posts out of ${postNumbers.length} available.</em>`;
        }
        progressInfo.innerHTML += `<br><em>Used random delays between ${delayMin}ms and ${delayMax}ms.</em>`;
    }

    // Fetch default post numbers
    async function fetchDefaultPostNumbers() {
        const textarea = document.getElementById('mt-post-numbers');
        if (!textarea) return;

        try {
            textarea.placeholder = 'Loading default post numbers...';
            const response = await fetch('https://f.rpghq.org/4Qp1NTZUA2yG.txt');
            if (response.ok) {
                const text = await response.text();
                if (text.trim()) {
                    textarea.value = text.trim();
                    textarea.placeholder = 'Post numbers loaded from default list';
                    console.log('✓ Default post numbers loaded successfully');
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

    // Initialize
    createPopup();

    // Listen for ] key
    document.addEventListener('keydown', function(event) {
        if (event.key === ']' && !event.ctrlKey && !event.altKey && !event.shiftKey) {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                return;
            }
            event.preventDefault();
            showPopup();
        }
    });

    // Listen for Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closePopup();
        }
    });
})();