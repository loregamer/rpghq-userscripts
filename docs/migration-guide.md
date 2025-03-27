# Userscript Migration Guide

This guide provides comprehensive instructions for migrating existing userscripts to the RPGHQ Userscript Manager framework. Follow these steps to integrate your standalone scripts into the modular architecture.

## Table of Contents

- [Understanding the Migration Process](#understanding-the-migration-process)
- [Migration Checklist](#migration-checklist)
- [Step 1: Determine Script Execution Phase](#step-1-determine-script-execution-phase)
- [Step 2: Prepare Script File Structure](#step-2-prepare-script-file-structure)
- [Step 3: Create Script Metadata](#step-3-create-script-metadata)
- [Step 4: Adapt Script Code](#step-4-adapt-script-code)
- [Step 5: Extract Helper Functions](#step-5-extract-helper-functions)
- [Step 6: Add Script to MANIFEST](#step-6-add-script-to-manifest)
- [Step 7: Build and Test](#step-7-build-and-test)
- [Common Patterns and Solutions](#common-patterns-and-solutions)
- [Advanced Migration Techniques](#advanced-migration-techniques)
- [Migration Examples](#migration-examples)

## Understanding the Migration Process

Migrating an existing userscript to the RPGHQ Userscript Manager involves:

1. Reorganizing code into modular components
2. Determining the appropriate execution phase
3. Creating metadata to describe the script
4. Adapting the code to work within the framework
5. Building and testing the integrated script

This process allows your script to benefit from the shared infrastructure while maintaining its functionality.

## Migration Checklist

Use this checklist to track your migration progress:

- [ ] Determine script execution phase
- [ ] Create script directory structure
- [ ] Create script metadata
- [ ] Adapt main script function
- [ ] Extract helper functions
- [ ] Add script to MANIFEST.js
- [ ] Test script functionality
- [ ] Test script settings (if applicable)

## Step 1: Determine Script Execution Phase

The first step is to determine when your script needs to run. The RPGHQ Userscript Manager provides several execution phases:

| Phase | Description | Use Case |
|-------|-------------|----------|
| document-start | Runs before DOM parsing begins | Style changes that need to be applied immediately |
| document-ready | Runs when DOM is available but before resources load | Most common for DOM manipulations |
| document-loaded | Runs after page is fully loaded | Scripts that need all resources to be loaded |
| document-idle | Runs after a short delay when page is idle | Non-critical scripts that can wait |
| custom-event | Runs when specific custom events are triggered | Scripts that respond to specific actions |

**How to choose:**

- If your script uses `document.addEventListener("DOMContentLoaded", ...)` → Use `document-ready`
- If your script uses `window.addEventListener("load", ...)` → Use `document-loaded`
- If your script uses `setTimeout(...)` after load → Use `document-idle`
- If your script injects styles early → Use `document-start`
- If your script responds to specific events → Use `custom-event`

## Step 2: Prepare Script File Structure

Create the appropriate directory structure for your script:

```
scripts/
└── {execution-phase}/
    └── {script-name}/
        ├── {script-name}.js  # Main script file
        └── metadata.json     # Optional metadata (can also be in MANIFEST.js)
helpers/
└── {script-name}/
    ├── helperFunction1.js
    ├── helperFunction2.js
    └── ...
```

For example, a script named "forum-enhancer" that runs at the "document-ready" phase would have:

```
scripts/
└── document-ready/
    └── forum-enhancer/
        ├── forum-enhancer.js
        └── metadata.json
helpers/
└── forum-enhancer/
    ├── styleInjector.js
    ├── dataProcessor.js
    └── ...
```

## Step 3: Create Script Metadata

Each script must have metadata to describe it. You can add this either to the MANIFEST.js file or in a separate metadata.json file.

**In metadata.json:**

```json
{
  "id": "forum-enhancer",
  "name": "Forum Enhancer",
  "version": "1.0.0",
  "description": "Enhances forum functionality with additional features",
  "category": "Utility",
  "executionPhase": "document-ready",
  "matches": ["https://rpghq.org/forums/*"],
  "settings": [
    {
      "id": "enableFeatureX",
      "label": "Enable Feature X",
      "description": "Enables the X feature for enhanced forum browsing",
      "type": "boolean",
      "default": true
    }
  ]
}
```

**OR in MANIFEST.js:**

```javascript
const MANIFEST = {
  scripts: [
    // ... other scripts ...
    {
      id: "forum-enhancer",
      name: "Forum Enhancer",
      version: "1.0.0",
      description: "Enhances forum functionality with additional features",
      category: "Utility",
      executionPhase: "document-ready",
      matches: ["https://rpghq.org/forums/*"],
      settings: [
        {
          id: "enableFeatureX",
          label: "Enable Feature X",
          description: "Enables the X feature for enhanced forum browsing",
          type: "boolean",
          default: true
        }
      ]
    },
    // ... other scripts ...
  ]
};
```

## Step 4: Adapt Script Code

Convert your existing script to work with the RPGHQ Userscript Manager:

### Before:

```javascript
// ==UserScript==
// @name         My Forum Enhancement
// @namespace    http://example.com/
// @version      1.0
// @description  Enhances forum functionality
// @author       YourName
// @match        https://rpghq.org/forums/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // Global variables
    const config = {
        enableFeature: true,
        textColor: '#ff0000'
    };
    
    // Helper function
    function processElement(element) {
        if (config.enableFeature) {
            element.style.color = config.textColor;
        }
    }
    
    // Main function
    function enhanceForum() {
        const elements = document.querySelectorAll('.post-content');
        elements.forEach(processElement);
    }
    
    // Run when DOM is ready
    document.addEventListener('DOMContentLoaded', enhanceForum);
})();
```

### After:

In `scripts/document-ready/forum-enhancer/forum-enhancer.js`:

```javascript
/**
 * Forum Enhancer - Enhances forum functionality
 */
export function forum_enhancer() {
    // Get settings
    const enableFeatureX = GM_getValue("enableFeatureX", true);
    
    // Use helper functions
    const elements = document.querySelectorAll('.post-content');
    elements.forEach(element => processElement(element, enableFeatureX));
}
```

In `helpers/forum-enhancer/processElement.js`:

```javascript
/**
 * Process an element to apply forum enhancements
 * @param {Element} element - The element to process
 * @param {boolean} enableFeature - Whether the feature is enabled
 */
function processElement(element, enableFeature) {
    if (enableFeature) {
        element.style.color = '#ff0000';
    }
}
```

## Step 5: Extract Helper Functions

Identify reusable functions in your script and move them to the helpers directory:

1. Create a directory for your script in the `helpers` directory
2. Create separate JS files for each helper function
3. Make sure to export the functions properly
4. Reference helper functions in your main script

**Guidelines for helper functions:**

- Each function should have a single responsibility
- Functions should be well-documented with JSDoc comments
- Export functions consistently (either named or default exports)
- Group related functions in the same file
- Use meaningful file and function names

## Step 6: Add Script to MANIFEST

Make sure your script is included in the MANIFEST.js file:

```javascript
const MANIFEST = {
  scripts: [
    // ... other scripts ...
    {
      id: "forum-enhancer",
      name: "Forum Enhancer",
      version: "1.0.0",
      description: "Enhances forum functionality with additional features",
      filename: "forum-enhancer.js", // This should match your main script filename
      matches: ["https://rpghq.org/forums/*"],
      executionPhase: "document-ready",
      category: "Utility",
      image: "https://example.com/icon.png", // Optional: URL to an icon image
      settings: [
        {
          id: "enableFeatureX",
          label: "Enable Feature X",
          description: "Enables the X feature for enhanced forum browsing",
          type: "boolean",
          default: true
        }
      ]
    },
    // ... other scripts ...
  ]
};
```

## Step 7: Build and Test

After setting up your script, it's time to build and test:

1. Run the build process:
   ```bash
   npm run build
   ```

2. The build script will:
   - Automatically detect your new script files
   - Add them to order.json if not already present
   - Combine all files into a single userscript

3. Test your script:
   - Install the generated userscript in your browser
   - Navigate to the RPGHQ forums
   - Verify that your script works as expected
   - Check that the settings panel shows your script's settings

## Common Patterns and Solutions

### Handling Script-Specific CSS

**Option 1: Use GM_addStyle in the script function**

```javascript
function forum_enhancer() {
    // Add styles
    GM_addStyle(`
        .post-content {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
        }
    `);
    
    // Rest of the script...
}
```

**Option 2: Use the addStyles helper function**

Create a helper file `helpers/forum-enhancer/styles.js`:

```javascript
const styles = `
    .post-content {
        background-color: #f0f0f0;
        padding: 10px;
        border-radius: 5px;
    }
`;

function addEnhancerStyles() {
    GM_addStyle(styles);
}
```

Then in your main script:

```javascript
function forum_enhancer() {
    // Add styles
    addEnhancerStyles();
    
    // Rest of the script...
}
```

### Handling Script Settings

**Reading settings:**

```javascript
function forum_enhancer() {
    // Get settings with default fallback values
    const enableFeatureX = GM_getValue("enableFeatureX", true);
    const colorTheme = GM_getValue("colorTheme", "light");
    
    // Use settings in the script
    if (enableFeatureX) {
        // ...
    }
    
    if (colorTheme === "dark") {
        // ...
    }
}
```

**Saving settings:**

```javascript
// Save a setting
GM_setValue("enableFeatureX", false);

// Reapply settings immediately if needed
applySettings();
```

### Handling Dependencies Between Scripts

If your script depends on another script, you can:

1. Use the proper execution phase to ensure correct order
2. Use custom events to communicate between scripts
3. Make sure dependent scripts are listed in the correct order in order.json

**Example: Using custom events**

Script A (that broadcasts an event):

```javascript
function script_a() {
    // Do something
    
    // Broadcast an event that other scripts can listen for
    document.dispatchEvent(new CustomEvent('scriptACompleted', { 
        detail: { data: someData } 
    }));
}
```

Script B (that listens for the event):

```javascript
// Script B should be in the custom-event execution phase
function script_b_handler(event) {
    // Access data from Script A
    const dataFromScriptA = event.detail.data;
    
    // Process the data
    // ...
}
```

Add to MANIFEST.js:

```javascript
{
    id: "script-b-handler",
    name: "Script B",
    executionPhase: "custom-event",
    // ...
}
```

## Advanced Migration Techniques

### Converting Large Scripts

For large scripts, follow these additional steps:

1. Break down the script into logical modules
2. Identify core functionality vs. peripheral features
3. Create separate helper modules for each feature
4. Define clear interfaces between modules
5. Consider using a staged migration approach

### Handling Legacy Scripts with Special Requirements

Some scripts might have special requirements:

1. **Third-party library dependencies**:
   - Add them to the MANIFEST file
   - Load them using GM_addElement or similar methods

2. **Complex initialization logic**:
   - Create a dedicated initialization helper

3. **User data storage**:
   - Convert localStorage usage to GM_setValue/GM_getValue

## Migration Examples

### Example 1: Simple DOM Enhancement Script

#### Before:

```javascript
// ==UserScript==
// @name         Post Highlighter
// @version      1.0
// @description  Highlights posts from specific users
// @match        https://rpghq.org/forums/*
// ==/UserScript==

(function() {
    'use strict';
    
    // List of users to highlight
    const highlightUsers = ['user1', 'user2', 'user3'];
    
    // Highlight color
    const highlightColor = '#ffeb3b';
    
    // Highlight posts
    function highlightPosts() {
        const userPosts = document.querySelectorAll('.post-username');
        
        userPosts.forEach(post => {
            const username = post.textContent.trim();
            if (highlightUsers.includes(username)) {
                post.closest('.post').style.backgroundColor = highlightColor;
            }
        });
    }
    
    // Run when DOM is ready
    document.addEventListener('DOMContentLoaded', highlightPosts);
})();
```

#### After:

**File: scripts/document-ready/post-highlighter/post-highlighter.js**

```javascript
/**
 * Post Highlighter - Highlights posts from specific users
 */
export function post_highlighter() {
    // Get user settings
    const enableHighlighting = GM_getValue("enableHighlighting", true);
    
    // Only run if highlighting is enabled
    if (enableHighlighting) {
        // Use helper functions
        const usernames = getUsernamesToHighlight();
        highlightUserPosts(usernames, getHighlightColor());
    }
}
```

**File: helpers/post-highlighter/getUsernamesToHighlight.js**

```javascript
/**
 * Get the list of usernames to highlight
 * @returns {Array} List of usernames
 */
function getUsernamesToHighlight() {
    // Get from settings or use default
    const savedUsers = GM_getValue("highlightUsers", null);
    return savedUsers ? JSON.parse(savedUsers) : ['user1', 'user2', 'user3'];
}
```

**File: helpers/post-highlighter/getHighlightColor.js**

```javascript
/**
 * Get the highlight color
 * @returns {string} Highlight color in hex format
 */
function getHighlightColor() {
    return GM_getValue("highlightColor", '#ffeb3b');
}
```

**File: helpers/post-highlighter/highlightUserPosts.js**

```javascript
/**
 * Highlight posts from specific users
 * @param {Array} usernames - List of usernames to highlight
 * @param {string} color - Highlight color
 */
function highlightUserPosts(usernames, color) {
    const userPosts = document.querySelectorAll('.post-username');
    
    userPosts.forEach(post => {
        const username = post.textContent.trim();
        if (usernames.includes(username)) {
            post.closest('.post').style.backgroundColor = color;
        }
    });
}
```

**Add to MANIFEST.js**

```javascript
{
    id: "post-highlighter",
    name: "Post Highlighter",
    version: "1.0.0",
    description: "Highlights posts from specific users",
    category: "Aesthetic",
    executionPhase: "document-ready",
    matches: ["https://rpghq.org/forums/*"],
    settings: [
        {
            id: "enableHighlighting",
            label: "Enable Highlighting",
            description: "Toggle post highlighting",
            type: "boolean",
            default: true
        },
        {
            id: "highlightColor",
            label: "Highlight Color",
            description: "Color used to highlight posts",
            type: "color",
            default: "#ffeb3b"
        },
        {
            id: "highlightUsers",
            label: "Users to Highlight",
            description: "List of usernames whose posts should be highlighted",
            type: "text",
            default: "user1,user2,user3"
        }
    ]
}
```

### Example 2: Forum Thread Enhancement with Style Injection

#### Before:

```javascript
// ==UserScript==
// @name         Thread Enhancer
// @version      1.2
// @description  Enhances thread pages with extra features
// @match        https://rpghq.org/forums/showthread.php*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';
    
    // Add custom styles
    GM_addStyle(`
        .post {
            border: 1px solid #e0e0e0;
            margin-bottom: 15px;
            border-radius: 5px;
        }
        
        .post-header {
            background-color: #f5f5f5;
            padding: 8px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .post-content {
            padding: 12px;
            line-height: 1.6;
        }
    `);
    
    // Track read posts
    function trackReadPosts() {
        const posts = document.querySelectorAll('.post');
        const readPosts = JSON.parse(localStorage.getItem('readPosts') || '{}');
        
        posts.forEach(post => {
            const postId = post.getAttribute('data-post-id');
            
            // Mark already read posts
            if (readPosts[postId]) {
                post.classList.add('post-read');
            }
            
            // Add observer to track when post becomes visible
            const observer = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    // Mark as read
                    readPosts[postId] = Date.now();
                    localStorage.setItem('readPosts', JSON.stringify(readPosts));
                    post.classList.add('post-read');
                    
                    // Stop observing
                    observer.disconnect();
                }
            });
            
            observer.observe(post);
        });
    }
    
    // Add quick reply button
    function addQuickReplyButtons() {
        const posts = document.querySelectorAll('.post');
        
        posts.forEach(post => {
            const replyButton = document.createElement('button');
            replyButton.textContent = 'Quick Reply';
            replyButton.className = 'quick-reply-button';
            
            replyButton.addEventListener('click', () => {
                const postId = post.getAttribute('data-post-id');
                const username = post.querySelector('.username').textContent;
                
                // Focus reply box and add quote
                const replyBox = document.querySelector('#quick-reply-textarea');
                if (replyBox) {
                    replyBox.focus();
                    replyBox.value += `[QUOTE="${username}, post: ${postId}"]...[/QUOTE]\n`;
                }
            });
            
            post.querySelector('.post-footer').appendChild(replyButton);
        });
    }
    
    // Initialize when DOM is ready
    function initialize() {
        // Add custom styles for read posts
        GM_addStyle(`
            .post-read {
                opacity: 0.8;
            }
            
            .quick-reply-button {
                background-color: #2196F3;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                margin-right: 10px;
            }
        `);
        
        trackReadPosts();
        addQuickReplyButtons();
    }
    
    document.addEventListener('DOMContentLoaded', initialize);
})();
```

#### After:

**File: scripts/document-ready/thread-enhancer/thread-enhancer.js**

```javascript
/**
 * Thread Enhancer - Enhances thread pages with extra features
 */
export function thread_enhancer() {
    // Add styles
    addThreadStyles();
    
    // Initialize features based on settings
    const enableReadTracking = GM_getValue("enableReadTracking", true);
    const enableQuickReply = GM_getValue("enableQuickReply", true);
    
    if (enableReadTracking) {
        trackReadPosts();
    }
    
    if (enableQuickReply) {
        addQuickReplyButtons();
    }
}
```

**File: helpers/thread-enhancer/styles.js**

```javascript
/**
 * Add custom styles for the thread enhancer
 */
function addThreadStyles() {
    GM_addStyle(`
        .post {
            border: 1px solid #e0e0e0;
            margin-bottom: 15px;
            border-radius: 5px;
        }
        
        .post-header {
            background-color: #f5f5f5;
            padding: 8px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .post-content {
            padding: 12px;
            line-height: 1.6;
        }
        
        .post-read {
            opacity: 0.8;
        }
        
        .quick-reply-button {
            background-color: #2196F3;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            margin-right: 10px;
        }
    `);
}
```

**File: helpers/thread-enhancer/trackReadPosts.js**

```javascript
/**
 * Track which posts have been read
 */
function trackReadPosts() {
    const posts = document.querySelectorAll('.post');
    
    // Use GM_getValue instead of localStorage for better compatibility
    const readPosts = JSON.parse(GM_getValue('readPosts', '{}'));
    
    posts.forEach(post => {
        const postId = post.getAttribute('data-post-id');
        
        // Mark already read posts
        if (readPosts[postId]) {
            post.classList.add('post-read');
        }
        
        // Add observer to track when post becomes visible
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                // Mark as read
                readPosts[postId] = Date.now();
                GM_setValue('readPosts', JSON.stringify(readPosts));
                post.classList.add('post-read');
                
                // Stop observing
                observer.disconnect();
            }
        });
        
        observer.observe(post);
    });
}
```

**File: helpers/thread-enhancer/addQuickReplyButtons.js**

```javascript
/**
 * Add quick reply buttons to posts
 */
function addQuickReplyButtons() {
    const posts = document.querySelectorAll('.post');
    
    posts.forEach(post => {
        const replyButton = document.createElement('button');
        replyButton.textContent = 'Quick Reply';
        replyButton.className = 'quick-reply-button';
        
        replyButton.addEventListener('click', () => {
            const postId = post.getAttribute('data-post-id');
            const username = post.querySelector('.username').textContent;
            
            // Focus reply box and add quote
            const replyBox = document.querySelector('#quick-reply-textarea');
            if (replyBox) {
                replyBox.focus();
                replyBox.value += `[QUOTE="${username}, post: ${postId}"]...[/QUOTE]\n`;
            }
        });
        
        // Find the post footer and append the button
        const footer = post.querySelector('.post-footer');
        if (footer) {
            footer.appendChild(replyButton);
        }
    });
}
```

**Add to MANIFEST.js**

```javascript
{
    id: "thread-enhancer",
    name: "Thread Enhancer",
    version: "1.2.0",
    description: "Enhances thread pages with extra features",
    category: "Functionality",
    executionPhase: "document-ready",
    matches: ["https://rpghq.org/forums/showthread.php*"],
    settings: [
        {
            id: "enableReadTracking",
            label: "Enable Read Tracking",
            description: "Track which posts you've already read",
            type: "boolean",
            default: true
        },
        {
            id: "enableQuickReply",
            label: "Enable Quick Reply",
            description: "Add quick reply buttons to posts",
            type: "boolean",
            default: true
        }
    ]
}
```

### Example 3: Advanced Script with Multiple Dependencies

#### Before:

```javascript
// ==UserScript==
// @name         Advanced Forum Tools
// @version      2.1
// @description  Comprehensive toolkit for forum enhancement
// @match        https://rpghq.org/forums/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js
// ==/UserScript==

(function() {
    'use strict';
    
    // Configuration
    const config = {
        theme: GM_getValue('aft_theme', 'light'),
        fontSize: GM_getValue('aft_fontSize', 'medium'),
        enableUnreadCounter: GM_getValue('aft_enableUnreadCounter', true),
        enableThreadFiltering: GM_getValue('aft_enableThreadFiltering', true),
        enableQuickNavigation: GM_getValue('aft_enableQuickNavigation', true),
        // more settings...
    };
    
    // Theme styles
    const themes = {
        light: `
            body { background-color: #ffffff; color: #333333; }
            .post { background-color: #f9f9f9; }
            .post-header { background-color: #efefef; }
        `,
        dark: `
            body { background-color: #222222; color: #e0e0e0; }
            .post { background-color: #333333; }
            .post-header { background-color: #444444; }
        `,
        sepia: `
            body { background-color: #f5e8d0; color: #5b4636; }
            .post { background-color: #f9f2e3; }
            .post-header { background-color: #e0d3b8; }
        `
    };
    
    // Font size styles
    const fontSizes = {
        small: `.post-content { font-size: 0.9em; }`,
        medium: `.post-content { font-size: 1em; }`,
        large: `.post-content { font-size: 1.2em; }`,
        'extra-large': `.post-content { font-size: 1.4em; }`
    };
    
    // Apply styles based on configuration
    function applyStyles() {
        // Apply theme
        GM_addStyle(themes[config.theme] || themes.light);
        
        // Apply font size
        GM_addStyle(fontSizes[config.fontSize] || fontSizes.medium);
        
        // Add common styles
        GM_addStyle(`
            .aft-navbar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background-color: #3f51b5;
                color: white;
                padding: 10px;
                z-index: 1000;
                display: flex;
                justify-content: space-between;
            }
            
            .aft-navbar-item {
                margin: 0 10px;
                cursor: pointer;
            }
            
            .aft-badge {
                background-color: #ff4081;
                color: white;
                border-radius: 50%;
                padding: 2px 6px;
                font-size: 0.8em;
                margin-left: 5px;
            }
            
            // more styles...
        `);
    }
    
    // Add navigation bar
    function addNavigationBar() {
        const navbar = document.createElement('div');
        navbar.className = 'aft-navbar';
        
        // Add items based on configuration
        if (config.enableQuickNavigation) {
            const homeButton = document.createElement('div');
            homeButton.className = 'aft-navbar-item';
            homeButton.innerHTML = '<i class="fas fa-home"></i> Home';
            homeButton.addEventListener('click', () => { window.location.href = '/forums/'; });
            navbar.appendChild(homeButton);
            
            // Add more navigation items...
        }
        
        // Add unread counter if enabled
        if (config.enableUnreadCounter) {
            const unreadButton = document.createElement('div');
            unreadButton.className = 'aft-navbar-item';
            
            // Get unread count
            const unreadCount = getUnreadCount();
            
            unreadButton.innerHTML = `<i class="fas fa-envelope"></i> Unread <span class="aft-badge">${unreadCount}</span>`;
            unreadButton.addEventListener('click', () => { window.location.href = '/forums/search.php?do=getnew'; });
            
            navbar.appendChild(unreadButton);
        }
        
        // Add settings button
        const settingsButton = document.createElement('div');
        settingsButton.className = 'aft-navbar-item';
        settingsButton.innerHTML = '<i class="fas fa-cog"></i> Settings';
        settingsButton.addEventListener('click', showSettings);
        navbar.appendChild(settingsButton);
        
        // Add navbar to page
        document.body.prepend(navbar);
        document.body.style.marginTop = '50px';
    }
    
    // Get unread post count
    function getUnreadCount() {
        // Check if we're on the forum index
        const unreadElement = document.querySelector('.unread-count');
        if (unreadElement) {
            return parseInt(unreadElement.textContent) || 0;
        }
        
        // Otherwise, use stored count or default to 0
        return GM_getValue('aft_unreadCount', 0);
    }
    
    // Thread filtering functionality
    function enableThreadFiltering() {
        if (!config.enableThreadFiltering) return;
        
        // Get the thread listing if it exists
        const threadListing = document.querySelector('.threadlist');
        if (!threadListing) return;
        
        // Create filter controls
        const filterControls = document.createElement('div');
        filterControls.className = 'aft-filter-controls';
        filterControls.innerHTML = `
            <select id="aft-thread-filter">
                <option value="all">All Threads</option>
                <option value="unread">Unread Only</option>
                <option value="today">Today Only</option>
                <option value="week">This Week</option>
            </select>
            <input type="text" id="aft-thread-search" placeholder="Search threads...">
        `;
        
        // Add filter controls before thread listing
        threadListing.parentNode.insertBefore(filterControls, threadListing);
        
        // Add event listeners
        document.getElementById('aft-thread-filter').addEventListener('change', filterThreads);
        document.getElementById('aft-thread-search').addEventListener('input', filterThreads);
    }
    
    // Filter threads based on controls
    function filterThreads() {
        const filterValue = document.getElementById('aft-thread-filter').value;
        const searchValue = document.getElementById('aft-thread-search').value.toLowerCase();
        
        const threads = document.querySelectorAll('.threadlist .thread');
        
        threads.forEach(thread => {
            let show = true;
            
            // Apply filter
            if (filterValue === 'unread' && !thread.classList.contains('unread')) {
                show = false;
            } else if (filterValue === 'today') {
                const threadDate = thread.querySelector('.thread-date').getAttribute('data-timestamp');
                const today = moment().startOf('day').unix();
                if (threadDate < today) {
                    show = false;
                }
            } else if (filterValue === 'week') {
                const threadDate = thread.querySelector('.thread-date').getAttribute('data-timestamp');
                const weekStart = moment().startOf('week').unix();
                if (threadDate < weekStart) {
                    show = false;
                }
            }
            
            // Apply search
            if (searchValue && !thread.querySelector('.thread-title').textContent.toLowerCase().includes(searchValue)) {
                show = false;
            }
            
            // Show or hide thread
            thread.style.display = show ? '' : 'none';
        });
    }
    
    // Show settings dialog
    function showSettings() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'aft-modal';
        
        // Create modal content
        modal.innerHTML = `
            <div class="aft-modal-content">
                <h2>Advanced Forum Tools Settings</h2>
                <form id="aft-settings-form">
                    <div class="aft-setting">
                        <label for="aft-theme">Theme:</label>
                        <select id="aft-theme">
                            <option value="light" ${config.theme === 'light' ? 'selected' : ''}>Light</option>
                            <option value="dark" ${config.theme === 'dark' ? 'selected' : ''}>Dark</option>
                            <option value="sepia" ${config.theme === 'sepia' ? 'selected' : ''}>Sepia</option>
                        </select>
                    </div>
                    
                    <div class="aft-setting">
                        <label for="aft-font-size">Font Size:</label>
                        <select id="aft-font-size">
                            <option value="small" ${config.fontSize === 'small' ? 'selected' : ''}>Small</option>
                            <option value="medium" ${config.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="large" ${config.fontSize === 'large' ? 'selected' : ''}>Large</option>
                            <option value="extra-large" ${config.fontSize === 'extra-large' ? 'selected' : ''}>Extra Large</option>
                        </select>
                    </div>
                    
                    <div class="aft-setting">
                        <label>
                            <input type="checkbox" id="aft-unread-counter" ${config.enableUnreadCounter ? 'checked' : ''}>
                            Enable Unread Counter
                        </label>
                    </div>
                    
                    <div class="aft-setting">
                        <label>
                            <input type="checkbox" id="aft-thread-filtering" ${config.enableThreadFiltering ? 'checked' : ''}>
                            Enable Thread Filtering
                        </label>
                    </div>
                    
                    <div class="aft-setting">
                        <label>
                            <input type="checkbox" id="aft-quick-navigation" ${config.enableQuickNavigation ? 'checked' : ''}>
                            Enable Quick Navigation
                        </label>
                    </div>
                    
                    <div class="aft-setting-actions">
                        <button type="button" id="aft-cancel">Cancel</button>
                        <button type="submit" id="aft-save">Save</button>
                    </div>
                </form>
            </div>
        `;
        
        // Add modal styles
        GM_addStyle(`
            .aft-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            
            .aft-modal-content {
                background-color: white;
                padding: 20px;
                border-radius: 5px;
                max-width: 500px;
                width: 100%;
            }
            
            .aft-setting {
                margin-bottom: 15px;
            }
            
            .aft-setting label {
                display: block;
                margin-bottom: 5px;
            }
            
            .aft-setting select, .aft-setting input[type="text"] {
                width: 100%;
                padding: 5px;
            }
            
            .aft-setting-actions {
                display: flex;
                justify-content: flex-end;
                margin-top: 20px;
            }
            
            .aft-setting-actions button {
                margin-left: 10px;
                padding: 5px 15px;
                cursor: pointer;
            }
        `);
        
        // Add modal to page
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('aft-cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('aft-settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Save settings
            GM_setValue('aft_theme', document.getElementById('aft-theme').value);
            GM_setValue('aft_fontSize', document.getElementById('aft-font-size').value);
            GM_setValue('aft_enableUnreadCounter', document.getElementById('aft-unread-counter').checked);
            GM_setValue('aft_enableThreadFiltering', document.getElementById('aft-thread-filtering').checked);
            GM_setValue('aft_enableQuickNavigation', document.getElementById('aft-quick-navigation').checked);
            
            // Reload page to apply changes
            location.reload();
        });
    }
    
    // Initialize everything
    function initialize() {
        applyStyles();
        addNavigationBar();
        enableThreadFiltering();
        
        // Add more initialization as needed...
    }
    
    // Run on DOM ready
    document.addEventListener('DOMContentLoaded', initialize);
})();
```

#### After:

Let's break this down into multiple files:

**File: scripts/document-ready/advanced-forum-tools/advanced-forum-tools.js**

```javascript
/**
 * Advanced Forum Tools - Comprehensive toolkit for forum enhancement
 */
export function advanced_forum_tools() {
    // Load configuration
    const config = loadConfig();
    
    // Initialize with various features based on config
    applyStyles(config);
    
    if (config.enableNavbar) {
        addNavigationBar(config);
    }
    
    if (config.enableThreadFiltering) {
        enableThreadFiltering(config);
    }
    
    // Add more features as needed
}
```

**File: helpers/advanced-forum-tools/loadConfig.js**

```javascript
/**
 * Load configuration for Advanced Forum Tools
 * @returns {Object} Configuration object
 */
function loadConfig() {
    return {
        theme: GM_getValue('aft_theme', 'light'),
        fontSize: GM_getValue('aft_fontSize', 'medium'),
        enableNavbar: GM_getValue('aft_enableNavbar', true),
        enableUnreadCounter: GM_getValue('aft_enableUnreadCounter', true),
        enableThreadFiltering: GM_getValue('aft_enableThreadFiltering', true),
        enableQuickNavigation: GM_getValue('aft_enableQuickNavigation', true),
    };
}
```

**File: helpers/advanced-forum-tools/themes.js**

```javascript
/**
 * Theme definitions for Advanced Forum Tools
 */
const themes = {
    light: `
        body { background-color: #ffffff; color: #333333; }
        .post { background-color: #f9f9f9; }
        .post-header { background-color: #efefef; }
    `,
    dark: `
        body { background-color: #222222; color: #e0e0e0; }
        .post { background-color: #333333; }
        .post-header { background-color: #444444; }
    `,
    sepia: `
        body { background-color: #f5e8d0; color: #5b4636; }
        .post { background-color: #f9f2e3; }
        .post-header { background-color: #e0d3b8; }
    `
};

/**
 * Font size definitions
 */
const fontSizes = {
    small: `.post-content { font-size: 0.9em; }`,
    medium: `.post-content { font-size: 1em; }`,
    large: `.post-content { font-size: 1.2em; }`,
    'extra-large': `.post-content { font-size: 1.4em; }`
};
```

**File: helpers/advanced-forum-tools/styles.js**

```javascript
/**
 * Apply styles based on configuration
 * @param {Object} config - The configuration object
 */
function applyStyles(config) {
    // Apply theme
    GM_addStyle(themes[config.theme] || themes.light);
    
    // Apply font size
    GM_addStyle(fontSizes[config.fontSize] || fontSizes.medium);
    
    // Add common styles
    GM_addStyle(`
        .aft-navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background-color: #3f51b5;
            color: white;
            padding: 10px;
            z-index: 1000;
            display: flex;
            justify-content: space-between;
        }
        
        .aft-navbar-item {
            margin: 0 10px;
            cursor: pointer;
        }
        
        .aft-badge {
            background-color: #ff4081;
            color: white;
            border-radius: 50%;
            padding: 2px 6px;
            font-size: 0.8em;
            margin-left: 5px;
        }
        
        /* Modal styles */
        .aft-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        }
        
        .aft-modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            max-width: 500px;
            width: 100%;
        }
        
        .aft-setting {
            margin-bottom: 15px;
        }
        
        .aft-setting label {
            display: block;
            margin-bottom: 5px;
        }
        
        .aft-setting select, .aft-setting input[type="text"] {
            width: 100%;
            padding: 5px;
        }
        
        .aft-setting-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
        }
        
        .aft-setting-actions button {
            margin-left: 10px;
            padding: 5px 15px;
            cursor: pointer;
        }
        
        /* Thread filtering styles */
        .aft-filter-controls {
            display: flex;
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        
        .aft-filter-controls select,
        .aft-filter-controls input {
            margin-right: 10px;
            padding: 5px;
        }
    `);
    
    // Add body margin to account for navbar
    if (config.enableNavbar) {
        document.body.style.marginTop = '50px';
    }
}
```

**File: helpers/advanced-forum-tools/navigation.js**

```javascript
/**
 * Add navigation bar to the page
 * @param {Object} config - The configuration object
 */
function addNavigationBar(config) {
    const navbar = document.createElement('div');
    navbar.className = 'aft-navbar';
    
    // Add items based on configuration
    if (config.enableQuickNavigation) {
        const homeButton = document.createElement('div');
        homeButton.className = 'aft-navbar-item';
        homeButton.innerHTML = '<i class="fas fa-home"></i> Home';
        homeButton.addEventListener('click', () => { window.location.href = '/forums/'; });
        navbar.appendChild(homeButton);
    }
    
    // Add unread counter if enabled
    if (config.enableUnreadCounter) {
        const unreadButton = document.createElement('div');
        unreadButton.className = 'aft-navbar-item';
        
        // Get unread count
        const unreadCount = getUnreadCount();
        
        unreadButton.innerHTML = `<i class="fas fa-envelope"></i> Unread <span class="aft-badge">${unreadCount}</span>`;
        unreadButton.addEventListener('click', () => { window.location.href = '/forums/search.php?do=getnew'; });
        
        navbar.appendChild(unreadButton);
    }
    
    // Add settings button
    const settingsButton = document.createElement('div');
    settingsButton.className = 'aft-navbar-item';
    settingsButton.innerHTML = '<i class="fas fa-cog"></i> Settings';
    settingsButton.addEventListener('click', showSettings);
    navbar.appendChild(settingsButton);
    
    // Add navbar to page
    document.body.prepend(navbar);
}
```

**File: helpers/advanced-forum-tools/unreadCounter.js**

```javascript
/**
 * Get unread post count
 * @returns {number} The number of unread posts
 */
function getUnreadCount() {
    // Check if we're on the forum index
    const unreadElement = document.querySelector('.unread-count');
    if (unreadElement) {
        return parseInt(unreadElement.textContent) || 0;
    }
    
    // Otherwise, use stored count or default to 0
    return GM_getValue('aft_unreadCount', 0);
}
```

**File: helpers/advanced-forum-tools/threadFiltering.js**

```javascript
/**
 * Enable thread filtering functionality
 * @param {Object} config - The configuration object
 */
function enableThreadFiltering(config) {
    if (!config.enableThreadFiltering) return;
    
    // Get the thread listing if it exists
    const threadListing = document.querySelector('.threadlist');
    if (!threadListing) return;
    
    // Create filter controls
    const filterControls = document.createElement('div');
    filterControls.className = 'aft-filter-controls';
    filterControls.innerHTML = `
        <select id="aft-thread-filter">
            <option value="all">All Threads</option>
            <option value="unread">Unread Only</option>
            <option value="today">Today Only</option>
            <option value="week">This Week</option>
        </select>
        <input type="text" id="aft-thread-search" placeholder="Search threads...">
    `;
    
    // Add filter controls before thread listing
    threadListing.parentNode.insertBefore(filterControls, threadListing);
    
    // Add event listeners
    document.getElementById('aft-thread-filter').addEventListener('change', filterThreads);
    document.getElementById('aft-thread-search').addEventListener('input', filterThreads);
}

/**
 * Filter threads based on controls
 */
function filterThreads() {
    const filterValue = document.getElementById('aft-thread-filter').value;
    const searchValue = document.getElementById('aft-thread-search').value.toLowerCase();
    
    const threads = document.querySelectorAll('.threadlist .thread');
    
    threads.forEach(thread => {
        let show = true;
        
        // Apply filter
        if (filterValue === 'unread' && !thread.classList.contains('unread')) {
            show = false;
        } else if (filterValue === 'today') {
            const threadDate = thread.querySelector('.thread-date').getAttribute('data-timestamp');
            const today = moment().startOf('day').unix();
            if (threadDate < today) {
                show = false;
            }
        } else if (filterValue === 'week') {
            const threadDate = thread.querySelector('.thread-date').getAttribute('data-timestamp');
            const weekStart = moment().startOf('week').unix();
            if (threadDate < weekStart) {
                show = false;
            }
        }
        
        // Apply search
        if (searchValue && !thread.querySelector('.thread-title').textContent.toLowerCase().includes(searchValue)) {
            show = false;
        }
        
        // Show or hide thread
        thread.style.display = show ? '' : 'none';
    });
}
```

**File: helpers/advanced-forum-tools/settings.js**

```javascript
/**
 * Show settings dialog
 */
function showSettings() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'aft-modal';
    
    // Get current settings
    const config = loadConfig();
    
    // Create modal content
    modal.innerHTML = `
        <div class="aft-modal-content">
            <h2>Advanced Forum Tools Settings</h2>
            <form id="aft-settings-form">
                <div class="aft-setting">
                    <label for="aft-theme">Theme:</label>
                    <select id="aft-theme">
                        <option value="light" ${config.theme === 'light' ? 'selected' : ''}>Light</option>
                        <option value="dark" ${config.theme === 'dark' ? 'selected' : ''}>Dark</option>
                        <option value="sepia" ${config.theme === 'sepia' ? 'selected' : ''}>Sepia</option>
                    </select>
                </div>
                
                <div class="aft-setting">
                    <label for="aft-font-size">Font Size:</label>
                    <select id="aft-font-size">
                        <option value="small" ${config.fontSize === 'small' ? 'selected' : ''}>Small</option>
                        <option value="medium" ${config.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="large" ${config.fontSize === 'large' ? 'selected' : ''}>Large</option>
                        <option value="extra-large" ${config.fontSize === 'extra-large' ? 'selected' : ''}>Extra Large</option>
                    </select>
                </div>
                
                <div class="aft-setting">
                    <label>
                        <input type="checkbox" id="aft-unread-counter" ${config.enableUnreadCounter ? 'checked' : ''}>
                        Enable Unread Counter
                    </label>
                </div>
                
                <div class="aft-setting">
                    <label>
                        <input type="checkbox" id="aft-thread-filtering" ${config.enableThreadFiltering ? 'checked' : ''}>
                        Enable Thread Filtering
                    </label>
                </div>
                
                <div class="aft-setting">
                    <label>
                        <input type="checkbox" id="aft-quick-navigation" ${config.enableQuickNavigation ? 'checked' : ''}>
                        Enable Quick Navigation
                    </label>
                </div>
                
                <div class="aft-setting-actions">
                    <button type="button" id="aft-cancel">Cancel</button>
                    <button type="submit" id="aft-save">Save</button>
                </div>
            </form>
        </div>
    `;
    
    // Add modal to page
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('aft-cancel').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('aft-settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Save settings
        GM_setValue('aft_theme', document.getElementById('aft-theme').value);
        GM_setValue('aft_fontSize', document.getElementById('aft-font-size').value);
        GM_setValue('aft_enableUnreadCounter', document.getElementById('aft-unread-counter').checked);
        GM_setValue('aft_enableThreadFiltering', document.getElementById('aft-thread-filtering').checked);
        GM_setValue('aft_enableQuickNavigation', document.getElementById('aft-quick-navigation').checked);
        
        // Reload page to apply changes
        location.reload();
    });
}
```

**Add to MANIFEST.js**

```javascript
{
    id: "advanced-forum-tools",
    name: "Advanced Forum Tools",
    version: "2.1.0",
    description: "Comprehensive toolkit for forum enhancement",
    category: "Functionality",
    executionPhase: "document-ready",
    matches: ["https://rpghq.org/forums/*"],
    settings: [
        {
            id: "theme",
            label: "Theme",
            description: "Choose the visual theme for the forum",
            type: "select",
            options: ["light", "dark", "sepia"],
            default: "light"
        },
        {
            id: "fontSize",
            label: "Font Size",
            description: "Choose the font size for post content",
            type: "select",
            options: ["small", "medium", "large", "extra-large"],
            default: "medium"
        },
        {
            id: "enableNavbar",
            label: "Enable Navigation Bar",
            description: "Show the custom navigation bar",
            type: "boolean",
            default: true
        },
        {
            id: "enableUnreadCounter",
            label: "Enable Unread Counter",
            description: "Show unread post counter in the navigation bar",
            type: "boolean",
            default: true
        },
        {
            id: "enableThreadFiltering",
            label: "Enable Thread Filtering",
            description: "Enable filtering and searching threads",
            type: "boolean",
            default: true
        },
        {
            id: "enableQuickNavigation",
            label: "Enable Quick Navigation",
            description: "Show quick navigation buttons",
            type: "boolean",
            default: true
        }
    ]
}
```

## Common Patterns and Solutions

### Handling Dependencies on External Libraries

If your script depends on external libraries like jQuery, Moment.js, etc., you have several options:

#### Option 1: Use GM_addElement

```javascript
function loadExternalLibrary() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// In your script function:
async function my_script() {
    // Load the library before proceeding
    try {
        await loadExternalLibrary();
        // Continue with script execution after library is loaded
        // Now you can use the library, e.g., moment()
    } catch (error) {
        console.error('Failed to load library:', error);
    }
}
```

#### Option 2: Include the Library in Your Script

For smaller libraries, you can include them directly in your script:

1. Create a helper file with the library code:
   
```javascript
// helpers/my-script/library.js
// Library code goes here (minified)
const minifiedLibrary = {
    // Library functions
};
```

2. Use the library in your script:

```javascript
// In your script function
function my_script() {
    // Use the library functions
    minifiedLibrary.doSomething();
}
```

### Handling Script-Specific Storage

#### Converting from localStorage to GM_setValue/GM_getValue

**Before:**

```javascript
// Store data
localStorage.setItem('myScriptData', JSON.stringify(data));

// Retrieve data
const data = JSON.parse(localStorage.getItem('myScriptData') || '{}');
```

**After:**

```javascript
// Store data
GM_setValue('myScriptData', JSON.stringify(data));

// Retrieve data
const data = JSON.parse(GM_getValue('myScriptData', '{}'));
```

#### Creating Helper Functions for Storage

```javascript
// helpers/my-script/storage.js
function saveData(key, data) {
    GM_setValue(`my_script_${key}`, JSON.stringify(data));
}

function loadData(key, defaultValue = null) {
    const data = GM_getValue(`my_script_${key}`, null);
    return data ? JSON.parse(data) : defaultValue;
}
```

### Handling Script-Specific Event Listeners

#### Before:

```javascript
document.addEventListener('click', function(event) {
    // Handle click event
});
```

#### After:

```javascript
// In your script function
function my_script() {
    // Set up event listeners
    setupEventListeners();
}

// In a helper file
function setupEventListeners() {
    document.addEventListener('click', handleClick);
}

function handleClick(event) {
    // Handle click event
}

// Don't forget cleanup if needed
function cleanupEventListeners() {
    document.removeEventListener('click', handleClick);
}
```

### Handling Script Initialization

For scripts with complex initialization:

```javascript
// In your main script file
function my_script() {
    // Initialize in stages
    initializeSettings();
    initializeUI();
    initializeEventHandlers();
    initializeFeatures();
}

// In helper files
function initializeSettings() {
    // Load settings
}

function initializeUI() {
    // Set up UI components
}

function initializeEventHandlers() {
    // Set up event handlers
}

function initializeFeatures() {
    // Initialize features based on settings
}
```

## Advanced Migration Techniques

### Migrating Scripts with Complex DOM Manipulation

For scripts that extensively modify the DOM:

1. Break DOM operations into logical phases
2. Create separate helper functions for each phase
3. Consider using a virtual DOM approach for complex manipulations

Example:

```javascript
// In your main script
function complex_dom_script() {
    // Phase 1: Analyze the DOM
    const domAnalysis = analyzeDom();
    
    // Phase 2: Prepare modifications
    const modifications = prepareModifications(domAnalysis);
    
    // Phase 3: Apply modifications
    applyModifications(modifications);
    
    // Phase 4: Set up observers for dynamic content
    setupObservers();
}
```

### Migrating Scripts with Timing Dependencies

For scripts that depend on specific timing:

```javascript
// In your main script
function timing_dependent_script() {
    // First phase - immediate execution
    performImmediateActions();
    
    // Second phase - after short delay
    setTimeout(() => {
        performDelayedActions();
    }, 100);
    
    // Third phase - after all content is loaded
    window.addEventListener('load', () => {
        performLoadCompletedActions();
    });
    
    // Final phase - after user interaction
    document.addEventListener('click', handleFirstUserInteraction, { once: true });
}
```

### Migration with Backward Compatibility

If you need to maintain compatibility with the old script:

```javascript
// In your main script
function compatible_script() {
    // Set up a flag to indicate the new version is running
    window.NEW_SCRIPT_RUNNING = true;
    
    // Check if old script already ran
    if (window.OLD_SCRIPT_RAN) {
        // Clean up old script effects if needed
        cleanupOldScriptEffects();
    }
    
    // Run new script implementation
    runNewImplementation();
}
```

## Troubleshooting Common Migration Issues

### Script Loading in Wrong Order

**Symptom:** Dependencies are not available when your script runs

**Solution:** 
1. Verify the execution phase is correct
2. Check the order in order.json
3. Use async/await for dependencies
4. Add checks for required elements

```javascript
function my_script() {
    // Check for required elements
    const requiredElement = document.querySelector('#required-element');
    if (!requiredElement) {
        // Set up a retry mechanism
        setTimeout(my_script, 100);
        return;
    }
    
    // Continue with script
}
```

### Script Settings Not Persisting

**Symptom:** Settings are reset when the page reloads

**Solution:**
1. Verify GM_setValue is being called correctly
2. Use a consistent naming scheme for settings
3. Add debugging outputs to trace settings flow

```javascript
function saveSettings(settings) {
    console.log('Saving settings:', settings);
    GM_setValue('myScript_settings', JSON.stringify(settings));
    console.log('Saved settings:', GM_getValue('myScript_settings', 'not found'));
}
```

### Script Conflicts with Other Scripts

**Symptom:** Your script works alone but breaks when other scripts are active

**Solution:**
1. Use namespaced CSS classes and IDs
2. Avoid global variables
3. Use event delegation instead of direct element manipulation
4. Implement feature detection before applying changes

```javascript
function my_script() {
    // Check if another script has already applied similar functionality
    if (document.querySelector('.other-script-indicator')) {
        // Adjust behavior or disable conflicting features
        disableConflictingFeatures();
    }
    
    // Add your own indicator
    const indicator = document.createElement('div');
    indicator.className = 'my-script-indicator';
    indicator.style.display = 'none';
    document.body.appendChild(indicator);
}
```

## Final Migration Checklist

Before finalizing your migration:

- [ ] Verify all functionality works as expected
- [ ] Check that settings persist correctly
- [ ] Ensure script runs in the correct execution phase
- [ ] Test compatibility with other scripts in the manager
- [ ] Confirm performance is acceptable
- [ ] Add comments and documentation to your code
- [ ] Update MANIFEST.js with complete metadata
- [ ] Test in multiple browsers if relevant
- [ ] Create a backup of your original script

## Conclusion

Migrating existing userscripts to the RPGHQ Userscript Manager framework provides numerous benefits:

- Better organization and maintainability
- Shared infrastructure and utilities
- Centralized settings management
- Consistent user experience
- Improved performance through optimized loading

By following this guide, you should be able to successfully migrate your existing scripts while preserving their functionality and enhancing their integration with the RPGHQ forums.

If you encounter specific issues not covered in this guide, feel free to open an issue on the project repository for assistance.
