// ==UserScript==
// @name         RPGHQ Userscript Manager
// @namespace    rpghq-userscripts
// @version      0.7.0
// @description  RPGHQ Userscript Manager
// @author       loregamer
// @match        https://rpghq.org/*
// @match        https://vault.rpghq.org/*
// @match        *://*.rpghq.org/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAyRSURBVGhDzVkJdFTVGf5nn0kykxVCEkgICYSwRUxYRBIJQYlFjQQVOCKLylKXUsClogcVrQtH1IOtWsux6KmihQMqRqtiqwRlX6IYjeyEJaxZSSbLzOv337fMezMTqq2o3zlf5t173/L/9/73X27oImAEeBqUFHaAR8FTYDl4NWgFf3Uwg9eBjaAqfDj6wB3gJNAN/irQBVwBtoPhhA5HP3gcfAxMB3kCfnZYwCngSTCckHqywMxwY61gGZgG/ixgG84CPwHZJMIJFUKr2Swlu92S2WTqTJF68EEwCvzJYQJjwFLwS9ALhhNCZVghHRaL9ODlV0hFPXv5bWZzZ4ocAW8GHeD/h1sWrnEVlN5bGJuY/o7ZbKlDV2cfDSZ7H/XaoKzLapXW3DBZqph5pzRrcJ7kRFs/rpC/sxPMAf8nWFMyc69Kycw7Y7E6wn1A0GZ3SVabcbxH1jDJbAkIdXVGn1MxTqdBcbfdLr0/cYp0dsFCadP0WVJBak8JS6yN68he7VrwB4OXrRj8gjqxVZPJLEUndJfyxy+QuqUNMIwlJPeWpi9aJ5nMFq3v/hH50uYZs/0pbo/h3iibXVpVOkkocXr+A9LK8TdJGbFxPBb83WaQTTcEetfF19eDvGzsEUaQxJMSgM0RQQNH3khTH1pLtz32MZ2u/pZqDu9RRomckdE0/s6XsVtMeJRlkNElIpJ6x8WbVk2Y5I9zuZReoqb2Npqxbg19dbKGsLHpql6ZtHHaTFo2dpwJZtam3Mbgh14HC0RLB70CA8DXwH6gwSc7IzyUWzSN5jy9gX4zYwklpefQzk9fp+92fKjcgQcsViqe+iTFJ2VQW0sT5o0nTka0Q96LWfEJ5tUTJlNiZKRoM1iJW95dTQ2t7EmJ7BYL3Twghz6dcqs9wRUh+hTwQ2+A7Eg06AUdCIZERpc7jmY+8S+68uZHKdKTAPMxUc2hr6n8necMQuaNmUFZeZwlIJq1tYhfFTGOwKznJHYjrASUcio9yDMaG2hW2btSu489sgwoS2tunEweRXkF3cH7QM0y9ArwGw0mw2hpPEdflb+ttMjU3ualD/52P/k65BljpPcvoILSBbAc+XHveXbnATisHO8C6N8lkV4ZV0KIC0oPAsrBfaZ71v+zrcMfMD2+b+YleUpLwzwwU74MMhUd/GzHKr5Y9wLVnjxEjbUn6c0lk+hUdaUyIq/QdbOXkdUWmNHGOg7MMti2Y52BFVAxumcvunvIcKUl4+97KqzLd22X/MrKHqyrpeW7OW0ygD+0DBSz0pkCUrfU/pp9dGDWN773PK1YfA2dOLBb6ZWRXzKPXFEGs6TW5gblSkByG81AgBW7/7J8uiG7v9IjYF70+ae+L6oPezccOUTFb75G9a0cQkIwCuT8qxMF4CdHlswzWe2BWa3c/B6dr+csWQEEyCmYJPUbXkL1Z4/R6aNVdPrY99QMk/P7OjTlJbgjH8yCiWvx29rRQfVeL51oaqTf5g4V+0KFT5Ks41e9SRNWr6QzLew9ZSBqK1cCPCPsdAyYC/KHhZ+f8cgHEgKZaAeTx5N6XSII14mgZRN9TA5qdmek/n5/t8gof3ZCF2lYSncJwkrJUW4p0mYTuRFWorMAppEj9+IrRgffdydowLOgGOQgNPupz6VLR9+if+AXYaonWvpw0lRp5+13SBYoqxvjNFwzId6x2pKYzVZyOKMoOqGH0vPLIC8pmTZMu52GpnSnlvZ2Uje3ArE5VAVsYLZ8KQcuuyuS0rJHiAAVDJgKWax2crg8FJeY7sseeq238KaFNOSq26hrj37skfRRlOIRkDgosTfi6x4ejx/CSVMG5tADlxcQUopAAJBnV6CprZ1cVhaNaNuJY4EB+R7hClXpOICJXc3gaGqx2Klr9768Ualiw1u8McUYK1R61yuU1HMgWe0uCGu3YA9gdWW36/f76Mi3m2reWjqFg46YoIcLCqk0qx98s4QOE/t/swWbkn3+5LX/4GisBQq8pQXSiRC8v/YsHUOQS4uOoT2nAq4ZYIW/5gt1BQpBu3xJlJwxWHiZyi3raPfnKzXhGXz9JeKCI8KNFYgSK6EKz4Bo5IlPYdvTJuxIfR25bDaKtNnFrw3pArvR177aRZ8dPqjcJYT3XZ+VrcnRDgUXl/9bKFp5RucBZfPhQwKhAH+dMz1ZCry49+ArRaT9bPVTBCcouvU4fmAXfbjiD9TRHtZHs3ImvEcLqYfr64UL1eMcXOQzmzYqLQH/IwWjfY8WFFnhdZQuoo/276Xqhnqsxjn9C7guEfkKK8DLpxUNDqdb2HHFhrepSRdR2d5ZORXfbHqH3l9+D5QIpBQqOGvFPtEGDtYhNgQp8NyWTQY/PyY9w4yYYE/xeGhGTq7SCykRM1ZV7pFqvS18YKBiPyhmVlVAs//I6C5Czu3r+ZBBBtwqld79F5GR6vHdtveR1D2LVQrkLwyr2OBubXl4BtkcVGw+Wk2vVgRSBFRk9PioMcT7gjFzcC6h9BTXjJd2bm1s0yV6wAFQzAg/weFWy1ujoMA55D11p7kslZGY2p9S+wyjookPUfYwPvoJYOtHy6lq50dKSwZ7qaT0QfFKU6TK7AYZNU1NdHvZWvJiZlVM7DeQMmPjlBYRCh8aksw+QAae5yI/oBFRLagpwMLLvgrwxCfT7s/eMNh+TsFErIJZeKBrbltKfYeMU0bwFtxXvnapwZT43pguaZq98SZs7minZijBBcwJKKGCPczD+YUiTVfBKzF36GVioytgOeXlkaG5ae5k4bU7nRHRtHfXeqUFc7A5xKZWYYFfLp76BIJcYIbO1RwQ2aoedmegGOGp4lx/7sdltPU4nzLKYNNB9SVFOwM5l4rLu6cikKUoLYGAhjrotRLgmTzfEHBZiWkDKNKdoLRkcOk4suT3SgsConz8ZvO7Sis8Xt65jdZ+F0jDEThoSdFYGtlDrFSIcA4o98yYsULJCyFEgYZzxw1+n2tgNolgpA8owGoE0uSK8rfI22wsZFSwC30Veb3eD82+dChN7j9IaYVHdkJXuqGvId0OgSqZNgNnkBKrYJtP63uZ0jIiwh2Pzc3lswyu3MrgVjkSBwMpsqCKcZl9aFH+KL2NhwWPP144hgrT+OjUAG1Dh0xtY22NcgWPFJNInrgkpWUER9yC8QsMudLe3Z/Q5rIXQ4KWHkit2e5FNP4hcNsduP8aTj/0L+UCQmivKqAN6o9DsnKLRarQGTjZGzp2ltKSsfG9ZVRdtUVpheKxUUUUE6bEvBDcDsQVizhnUpEBCtn5T9jpgi/380nDhcB7Y2TJXKGICr+vndb8ebYhiqvg2S/O6CM8Ujg2tbXRyfNNVHX2DKGspPUH99MH+74XkbjVp9uYusNfXgaOIPvAWO7QwXvdnBeasQfiuGDvaGsh/Tt4pbhWZq/F9r/ur/MM3otNS+8MGDFwl5xWQ5iQ1IJLTY4VHPB4vwSPB4E3Km9ALZ14XGnwU8H08/knTEmcd+rJJSSWSlBch3/+YpCDjmETcYONmSNcuAd+bfwWFN4j2I/lg38Eh4Ch4fFHAMmcr7WlUZ0lf4zD2WE2m+xcYaECgxczfppdZgRqBU4tMmPjqSd+y/ZV0bq9VcodGliBpSCf0BkPbxVwH4feheBsMMRl8GFWVu7VyHdSyely440S1Z06TNV7t1NLUy1lDCrk40fv0b3bxCTghd7KOb+zRdkdFj4euZD/V8fertwjUg/9SR3Ae/V5kM9IuSYIWYFgcJq9CLwVNJy0YoapeNqTIrHTl5Pshfi1KxZf246gKJJEzGzzvjvmRXB60Bk4drCwp5rP0/Jd2+mlHVsNKTiwBuT/2hiqqP+mAIPv6Q2+CHLpqQU/rhPyxkynKybcJ5I+Fex9Xrx3ZEdTXY2QODEy0lsx8y6nPnixl+HUurz6EO08cVwcIx4Aj6MGZi8VhK1gERhIYxX8EAVUsDDTQT6XNJhVNyR8xdOfokRUchwbuNT80/zhPu/5OiFxr5jYhi23zvGwebC/P4QaecmmciqDfYcRNhhcvPOx9zHR+gnAx8VsiwbPwG623/ASac6Scmn+S5USTIyDgBhLjnJXHbp7gYTsUxrUNVHCPjA82wm53nwVDI5PPwk4Eq4EQ2IHHyvmXz8fv1GaAshjdsCraO0w5DE2D/7H9wZwAchH6Jq5XgywefA/uXlpQ4Uy/n+NyzXjuEw+xn4Z5D3GM82OIrBRfibwh58G2a2FEzKYvGrfgPNBLrl+zD68aGAhUGOa+J+DFzIVXombwM796S8MFmw8yJtcb0JMPoi6cHr7o0H0HzS6ilTHXLvBAAAAAElFTkSuQmCC
// @grant        GM_addStyle
// @run-at       document-start
// @homepage     https://github.com/loregamer/rpghq-userscripts#readme
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/dist/rpghq-userscript-manager.user.js
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/dist/rpghq-userscript-manager.user.js
// ==/UserScript==

!(function () {
  "use strict";
  // Inject styles
  GM_addStyle(`
  :root {
    --primary-color: #2196f3;
    --primary-dark: #1976d2;
    --accent-color: #ff9800;
    --success-color: #4caf50;
    --warning-color: #ffc107;
    --danger-color: #f44336;
    --text-primary: #ffffff;
    --text-secondary: #b0bec5;
    --bg-dark: #1e1e1e;
    --bg-card: #2d2d2d;
    --border-color: #444444;
  }
  
  /* Modal overlay */
  #rpghq-modal-overlay {
    display: none;
    position: fixed;
    z-index: 1000000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    overflow: hidden;
  }

  /* Modal container */
  .mod-manager-modal {
    display: none;
    position: fixed;
    z-index: 1000000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    overflow: hidden; /* Prevent body scroll when modal is open */
  }

  /* Modal content box */
  .mod-manager-modal-content {
    background-color: var(--bg-dark);
    margin: 2% auto;
    padding: 10px;
    border: 1px solid var(--border-color);
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    border-radius: 4px;
    color: var(--text-primary);
    display: flex;
    flex-direction: column;
  }

  /* Header and close button */
  .mod-manager-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 10px;
  }

  .mod-manager-title {
    margin: 0;
    font-size: 1.8em;
    color: var(--text-primary);
  }

  .mod-manager-close {
    font-size: 1.8em;
    cursor: pointer;
  }

  .mod-manager-close:hover {
    color: var(--danger-color);
  }

  /* Tab system */
  .mod-manager-tabs {
    display: flex;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
  }

  .mod-manager-tab {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 1em;
    color: var(--text-secondary);
    position: relative;
  }

  .mod-manager-tab:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .mod-manager-tab.active {
    color: var(--primary-color);
    font-weight: bold;
    border-bottom: 2px solid var(--primary-color);
  }

  /* Sub-tabs system */
  .sub-tabs {
    display: flex;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-card);
    border-radius: 4px 4px 0 0;
  }

  .sub-tab {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 1em;
    color: var(--text-secondary);
    position: relative;
  }

  .sub-tab:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .sub-tab.active {
    color: var(--primary-color);
    font-weight: bold;
    border-bottom: 2px solid var(--primary-color);
    background-color: var(--bg-card);
    border-radius: 4px 4px 0 0;
  }

  .sub-tab {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 1em;
    color: var(--text-secondary);
    position: relative;
  }

  .sub-tab:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .sub-tab.active {
    color: var(--primary-color);
    font-weight: bold;
    border-bottom: 2px solid var(--primary-color);
  }

  /* Content area */
  .mod-manager-content {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }

  /* Filter panel */
  .filter-panel {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 15px;
  }

  .filter-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .filter-panel-title {
    font-size: 1.1em;
    font-weight: bold;
    margin: 0;
  }

  .filter-panel-toggle {
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    font-size: 1.1em;
  }

  .filter-panel-body {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }

  .filter-panel-body.collapsed {
    display: none;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
  }

  .filter-group label {
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 0.9em;
  }

  .filter-group select,
  .filter-group input {
    padding: 5px;
    border: 1px solid var(--border-color);
    border-radius: 3px;
    background-color: var(--bg-dark);
    color: var(--text-primary);
  }

  .filter-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    grid-column: 1 / -1;
  }
  
  .filter-panel {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 15px;
  }

  .filter-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .filter-panel-title {
    font-size: 1.1em;
    font-weight: bold;
    margin: 0;
  }

  .filter-panel-toggle {
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    font-size: 1.1em;
  }

  .filter-panel-body {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }

  .filter-panel-body.collapsed {
    display: none;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
  }

  .filter-group label {
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 0.9em;
  }

  .filter-group select,
  .filter-group input {
    padding: 5px;
    border: 1px solid var(--border-color);
    border-radius: 3px;
    background-color: var(--bg-dark);
    color: var(--text-primary);
  }

  .filter-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    grid-column: 1 / -1;
  }

  /* Script grid */
  .script-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 10px;
  }

  .script-card {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .script-card.disabled {
    opacity: 0.7;
    filter: grayscale(0.8);
  }

  /* Style for enabled script card in Grid View */
  .script-card:not(.disabled) {
    border: 1px solid #C62D51; /* Added border */
    /* Adjust margin slightly to compensate for border */
    margin: -1px; /* Prevent layout shift due to border */
  }

  .script-card-image {
    position: relative;
    height: 130px;
    overflow: hidden;
    cursor: pointer;
  }

  .script-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .image-toggle {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    border-radius: 3px;
    padding: 3px;
  }

  /* Category display removed */

  .script-card-content {
    padding: 10px;
  }

  .script-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .script-card-actions-top {
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }

  .script-toggle-wrapper {
    cursor: pointer;
    font-size: 1.2em;
    display: flex;
    align-items: center;
  }

  /* Default checkboxes - no custom styling */
  input[type="checkbox"] {
    cursor: pointer;
  }

  /* Specific styling for the script toggle checkbox */
  .script-toggle-checkbox {
    margin: 2px;
  }

  .btn-icon {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 3px;
  }

  .btn-icon:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  .script-card-title {
    font-size: 1.1em;
    font-weight: bold;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    padding-right: 8px;
  }

  .script-card-version {
    background-color: var(--primary-color);
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.8em;
  }
  
  .script-card-version-inline {
    font-size: 0.8em;
    color: var(--text-secondary);
    font-weight: normal;
    display: none; /* Hide version for now */
  }
  
  .script-version-inline {
    font-size: 0.8em;
    color: var(--text-secondary);
    font-weight: normal;
    display: none; /* Hide version for now */
  }

  .script-card-description {
    margin: 0 0 10px 0;
    color: var(--text-secondary);
    font-size: 0.9em;
    line-height: 1.3;
    height: 3.6em; /* Approx 3 lines */
    overflow: hidden;
  }

  .script-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    margin-top: 8px;
    border-top: 1px solid var(--border-color);
  }

  .script-card-version {
    font-size: 0.8em;
    color: var(--text-secondary);
    display: none; /* Hide version for now */
  }

  .script-card-phase {
    font-size: 0.85em;
    color: var(--text-secondary);
  }

  /* Script list view */
  .script-list {
    /* Uses .data-table styling */
  }

  /* Forum preferences */
  .preferences-section {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin-bottom: 15px;
    overflow: hidden;
  }

  .preferences-section-header {
    background-color: rgba(33, 150, 243, 0.1);
    padding: 10px;
    border-bottom: 1px solid var(--border-color);
  }

  .preferences-section-title {
    margin: 0;
    font-size: 1.1em;
    color: var(--text-primary);
  }

  .preferences-section-body {
    padding: 10px;
  }

  .preference-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .preference-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .preference-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }

  .preference-name {
    font-weight: bold;
    margin: 0;
  }

  .preference-control {
    min-width: 150px;
  }

  .preference-description {
    color: var(--text-secondary);
    font-size: 0.9em;
    margin: 0;
  }

  /* Settings modal */
  .settings-modal {
    display: none;
    position: fixed;
    z-index: 1100000; /* Above main modal */
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
  }

  .settings-modal-content {
    background-color: var(--bg-dark);
    margin: 5% auto;
    padding: 15px;
    border: 1px solid var(--border-color);
    width: 60%;
    max-width: 800px;
    max-height: 85vh;
    border-radius: 4px;
    overflow-y: auto;
  }

  .settings-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
  }

  .settings-modal-title {
    font-size: 1.4em;
    margin: 0;
  }

  .settings-modal-close {
    font-size: 1.4em;
    cursor: pointer;
    color: var(--text-secondary);
  }

  .settings-modal-close:hover {
    color: var(--danger-color);
  }

  .setting-group {
    margin-bottom: 15px;
  }

  .setting-group-title {
    font-size: 1.1em;
    margin: 0 0 10px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .setting-item {
    margin-bottom: 12px;
  }

  .setting-label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .setting-description {
    display: block;
    color: var(--text-secondary);
    font-size: 0.9em;
    margin-bottom: 5px;
  }

  .setting-control {
    margin-top: 5px;
  }

  /* Buttons */
  .btn {
    padding: 5px 10px;
    border-radius: 3px;
    border: none;
    cursor: pointer;
    font-size: 0.9em;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .btn-icon {
    font-size: 1em;
  }

  .btn-primary {
    background-color: var(--primary-color);
    color: white;
  }

  .btn-primary:hover {
    background-color: var(--primary-dark);
  }

  .btn-secondary {
    background-color: #555;
    color: var(--text-primary);
  }

  .btn-secondary:hover {
    background-color: #666;
  }

  .btn-small {
    padding: 3px 8px;
    font-size: 0.8em;
  }


  /* New Settings Item Layout */
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--border-color);
    transition: opacity 0.3s ease, max-height 0.3s ease; /* Add transitions */
    overflow: hidden; /* Hide content when collapsed */
  }
  .setting-item.setting-item-hidden {
    opacity: 0;
    max-height: 0;
    padding-bottom: 0;
    margin-bottom: 0;
    border-bottom: none;
    pointer-events: none; /* Prevent interaction when hidden */
  }
  .setting-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  .setting-details {
    flex-grow: 1;
    padding-right: 20px; /* Space between details and control */
  }
  .setting-name {
    font-weight: bold;
    margin-bottom: 4px;
    color: var(--text-primary);
  }
  .setting-description {
    color: var(--text-secondary);
    font-size: 0.9em;
  }
  .setting-control {
    flex-shrink: 0; /* Prevent control from shrinking */
  }
  .setting-control .setting-input {
    /* General styling for non-toggle inputs in the new layout */
    padding: 6px 10px;
    border: 1px solid var(--border-color);
    border-radius: 3px;
    background-color: var(--bg-dark);
    color: var(--text-primary);
    min-width: 150px; /* Ensure inputs have some minimum width */
  }
  .setting-control select.setting-input {
    /* Specific styles for select if needed */
    padding: 8px 10px; /* Adjust padding for select dropdown arrow */
  }


  /* Toggle Switch Styles */
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 48px; /* Width of the toggle */
    height: 24px; /* Height of the toggle */
  }

  .toggle-switch input { 
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #555; /* Off state background */
    transition: .4s;
    border-radius: 24px; /* Rounded slider */
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px; /* Height of the knob */
    width: 18px; /* Width of the knob */
    left: 3px; /* Padding from left */
    bottom: 3px; /* Padding from bottom */
    background-color: white;
    transition: .4s;
    border-radius: 50%; /* Circular knob */
  }

  input:checked + .toggle-slider {
    background-color: var(--primary-color); /* On state background */
  }

  input:focus + .toggle-slider {
    box-shadow: 0 0 1px var(--primary-color);
  }

  input:checked + .toggle-slider:before {
    transform: translateX(24px); /* Move knob to the right */
  }
  

  /* Tables */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
  }

  .data-table th,
  .data-table td {
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  .data-table th {
    background-color: rgba(255, 255, 255, 0.05);
    font-weight: bold;
  }

  .data-table tr:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }

  /* Style for enabled script row in List View */
  .data-table tr.enabled {
    border-left: 1px solid #cce5ff; /* Make border thinner and lighter */
    /* Optionally adjust padding if needed */
    /* padding-left: 7px; /* Adjust padding */
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 30px 20px;
    color: var(--text-secondary);
  }

  .empty-state-icon {
    font-size: 2.5em;
    margin-bottom: 15px;
    opacity: 0.5;
  }

  .empty-state-message {
    font-size: 1.1em;
    margin-bottom: 10px;
  }

  /* Info note */
  .info-note {
    background-color: rgba(33, 150, 243, 0.1);
    border-left: 4px solid var(--primary-color);
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 0 4px 4px 0;
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 30px 20px;
    color: var(--text-secondary);
  }

  .empty-state-icon {
    font-size: 2.5em;
    margin-bottom: 15px;
    opacity: 0.5;
  }

  .empty-state-message {
    font-size: 1.1em;
    margin-bottom: 10px;
  }
  
  /* WIP Banner */
  .wip-banner {
    background-color: var(--warning-color);
    color: #000;
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 4px;
    text-align: center;
    font-weight: bold;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .script-grid {
      grid-template-columns: 1fr;
    }

    .filter-panel-body {
      grid-template-columns: 1fr;
    }

    .settings-modal-content {
      width: 90%;
    }
  }

  /* Preview image for settings */
  .setting-preview-image {
    display: block; /* Ensure it takes its own line */
    max-width: 100px; /* Adjust size as needed */
    height: auto; /* Maintain aspect ratio */
    margin-top: 8px; /* Space above the image */
    border: 1px solid var(--border-color); /* Optional border */
    border-radius: 3px;
  }
`);
  const SCRIPT_MANIFEST = [
    {
      id: "bbcode",
      name: "BBCode Highlighting",
      version: "1.0.0",
      description:
        "Adds BBCode highlighting and other QOL improvements to the text editor",
      author: "loregamer",
      path: "./scripts/bbcode.js",
      enabledByDefault: !0,
      image: "https://f.rpghq.org/bEm69Td9mEGU.png?n=pasted-file.png",
      urlPatterns: [
        "https://rpghq.org/forums/posting.php?mode=post*",
        "https://rpghq.org/forums/posting.php?mode=quote*",
        "https://rpghq.org/forums/posting.php?mode=reply*",
        "https://rpghq.org/forums/posting.php?mode=edit*",
      ],
      settings: [],
      categories: ["UI"],
    },
    {
      id: "kalareact",
      name: "Kalarion Reaction Auto-Marker",
      version: "1.0.0",
      description:
        "Auto marks Kalarion rape notifs as read (I will move this to user preferences and make it squashed instead)",
      author: "loregamer",
      image: "https://f.rpghq.org/OA0rQkkRSSVq.png?n=pasted-file.png",
      // Add an image URL if available
      path: "./scripts/kalareact.js",
      enabledByDefault: !1,
      settings: [],
      categories: ["General"],
    },
    {
      id: "memberSearch",
      name: "Member Search Button",
      version: "1.0.0",
      description: "Adds a quick member search button next to Unread posts",
      author: "loregamer",
      image: "https://f.rpghq.org/Rjsn2V3CLLOU.png?n=pasted-file.png",
      // Add an image URL if available
      path: "./scripts/memberSearch.js",
      enabledByDefault: !0,
      settings: [],
      categories: ["Fun"],
    },
    {
      id: "notifications",
      name: "Notification Improver",
      version: "1.0.0",
      description:
        "Adds smileys to reacted notifs, adds colors, idk just makes em cooler I guess",
      author: "loregamer",
      image: "https://f.rpghq.org/rso7uNB6S4H9.png",
      // Add an image URL if available
      path: "./scripts/notifications.js",
      enabledByDefault: !0,
      settings: [
        {
          id: "enableNotificationColors",
          label: "Enable Notification Type Colors",
          type: "checkbox",
          defaultValue: !0,
          description:
            "Define custom background colors for notification types using JSON format (hex codes). Requires 'Enable Notification Type Colors' to be active.",
        },
        {
          id: "quoteColor",
          label: "Quote Notification Color",
          type: "color",
          defaultValue: "#F5575D",
          description: "Set the text color for quote notifications.",
          dependsOn: {
            settingId: "enableNotificationColors",
            value: !0,
          },
        },
        {
          id: "replyColor",
          label: "Reply Notification Color",
          type: "color",
          defaultValue: "#2E8B57",
          // SeaGreen - Default Reply Color
          description: "Set the text color for reply notifications.",
          dependsOn: {
            settingId: "enableNotificationColors",
            value: !0,
          },
        },
        {
          id: "reactionColor",
          label: "Reaction Notification Color",
          type: "color",
          defaultValue: "#3889ED",
          // Default Reaction Color
          description: "Set the text color for reaction notifications.",
          dependsOn: {
            settingId: "enableNotificationColors",
            value: !0,
          },
        },
        {
          id: "mentionColor",
          label: "Mention Notification Color",
          type: "color",
          defaultValue: "#FFC107",
          description: "Set the text color for mention notifications.",
          dependsOn: {
            settingId: "enableNotificationColors",
            value: !0,
          },
        },
        {
          id: "editColor",
          label: "Edit Notification Color",
          type: "color",
          defaultValue: "#fafad2",
          // LightGoldenrodYellow
          description: "Set the background color for edit notifications.",
          dependsOn: {
            settingId: "enableNotificationColors",
            value: !0,
          },
        },
        {
          id: "approvalColor",
          label: "Approval Notification Color",
          type: "color",
          defaultValue: "#00AA00",
          description: "Set the text color for approval notifications.",
          dependsOn: {
            settingId: "enableNotificationColors",
            value: !0,
          },
        },
        {
          id: "reportColor",
          label: "Report Notification Color",
          type: "color",
          defaultValue: "#f58c05",
          description: "Set the text color for report notifications.",
          dependsOn: {
            settingId: "enableNotificationColors",
            value: !0,
          },
        },
        {
          id: "warningColor",
          label: "Warning Notification Color",
          type: "color",
          defaultValue: "#D31141",
          description: "Set the text color for warning notifications.",
          dependsOn: {
            settingId: "enableNotificationColors",
            value: !0,
          },
        },
        {
          id: "timestampColor",
          label: "Timestamp Color",
          type: "color",
          defaultValue: "#888888",
          description: "Set the text color for notification timestamps.",
        },
        {
          id: "referenceBackgroundColor",
          label: "Reference Background Color",
          type: "color",
          defaultValue: "rgba(23, 27, 36, 0.5)",
          description:
            "Set the background color for the post reference preview.",
        },
        {
          id: "referenceTextColor",
          label: "Reference Text Color",
          type: "color",
          defaultValue: "#ffffff",
          description: "Set the text color for the post reference preview.",
        },
        {
          id: "defaultColor",
          label: "Default Notification Row Background",
          type: "color",
          defaultValue: "#ffffff",
          description:
            "Set the default background color for notification rows on the main page (used if type-specific colors are off or not set).",
        },
        {
          id: "enableImagePreviews",
          label: "Enable Image Previews",
          type: "checkbox",
          defaultValue: !0,
          description:
            "Shows image previews in 'Post replied to' notifications.",
          previewImage:
            "https://f.rpghq.org/X4oQJRUQ0Avb.png?n=pasted-file.png",
        },
        {
          id: "enableVideoPreviews",
          label: "Enable Video Previews",
          type: "checkbox",
          defaultValue: !1,
          // Off by default
          description:
            "Shows video previews in 'Post replied to' notifications. Warning: This might impact performance.",
        },
        {
          id: "enableReactionSmileys",
          label: "Show Reaction Smileys",
          type: "checkbox",
          defaultValue: !0,
          description:
            "Fetches and displays reaction smileys within reaction notifications.",
          previewImage:
            "https://f.rpghq.org/DVH4QZTYWIZg.png?n=pasted-file.png",
        },
        {
          id: "resizeFillerWords",
          label: "Resize Filler Words",
          type: "checkbox",
          defaultValue: !0,
          description:
            "Makes common filler words like 'and', 'by', 'in' smaller in notification text for better readability.",
          previewImage:
            "https://f.rpghq.org/xDtPAZ1xQxLL.png?n=pasted-file.png",
        },
        // Keep existing unrelated settings if any, e.g., quote previews
        {
          id: "enableQuotePreviews",
          label: "Enable Quote Previews",
          type: "checkbox",
          defaultValue: !0,
          description:
            "Shows a preview of the quoted text in 'Post quoted' notifications.",
        },
      ],
      categories: ["UI"],
    },
    {
      id: "pinThreads",
      name: "Pin Threads",
      version: "1.0.0",
      description:
        "Adds a Pin button to threads so you can see them in board index",
      author: "loregamer",
      image: "https://f.rpghq.org/HTYypNZVXaOt.png?n=pasted-file.png",
      // Add an image URL if available
      path: "./scripts/pinThreads.js",
      enabledByDefault: !0,
      settings: [],
      categories: ["UI"],
    },
    {
      id: "randomTopic",
      name: "Random Topic Button",
      version: "1.0.0",
      description: "Adds a Random Topic button, for funsies",
      author: "loregamer",
      image: "https://f.rpghq.org/LzsLP40AK6Ut.png?n=pasted-file.png",
      // Add an image URL if available
      path: "./scripts/randomTopic.js",
      enabledByDefault: !0,
      settings: [],
      categories: ["Fun"],
    },
    {
      id: "separateReactions",
      name: "Reaction List Separated",
      version: "1.0.0",
      description: "Makes smiley reactions and counts separated",
      author: "loregamer",
      image:
        "https://f.rpghq.org/H6zBOaMtu9i2.gif?n=Separated%20Reactions%20(2).gif",
      // Add an image URL if available
      path: "./scripts/separateReactions.js",
      enabledByDefault: !1,
      settings: [],
      categories: ["UI"],
    },
    {
      id: "recentTopicsFormat",
      name: "Slightly Formatted Thread Titles in Recent Topics",
      version: "1.0.0",
      description:
        "Adds some minor formatting to thread titles, like unbolding stuff in parantheses, add line wrapping, or reformatting the AG threads",
      author: "loregamer",
      image: "https://f.rpghq.org/97x4ryHzRbVf.png?n=pasted-file.png",
      // Add an image URL if available
      path: "./scripts/recentTopicsFormat.js",
      enabledByDefault: !1,
      settings: [
        {
          id: "unboldParentheses",
          label: "Unbold Text in Parentheses",
          type: "checkbox",
          defaultValue: !0,
          description:
            "Removes bold formatting from text within parentheses in recent topics titles.",
        },
        {
          id: "wrapTitles",
          label: "Wrap Long Titles",
          type: "checkbox",
          defaultValue: !0,
          description:
            "Allows long thread titles in recent topics to wrap instead of being cut off.",
        },
        {
          id: "reformatAGThreads",
          label: "Reformat AG Thread Titles",
          type: "checkbox",
          defaultValue: !0,
          description:
            "Reformats 'All Games' thread titles for better readability (e.g., moves chapter number).",
        },
      ],
      categories: ["UI"],
    },
    {
      id: "commaFormatter",
      name: "Thousands Comma Formatter",
      version: "2.1.2",
      description: "Add commas to large numbers in forum posts and statistics.",
      author: "loregamer",
      image: "https://f.rpghq.org/olnCVAbEzbkt.png?n=pasted-file.png",
      path: "./scripts/commaFormatter.js",
      enabledByDefault: !0,
      urlPatterns: [],
      settings: [
        {
          id: "formatFourDigits",
          label: "Format 4-digit numbers",
          type: "checkbox",
          defaultValue: !1,
          description:
            "Enable to add commas to 4-digit numbers (1,000+). Disable to only format 5-digit numbers (10,000+).",
        },
      ],
    },
  ];
  /**
   * URL Matcher Utility
   *
   * This utility provides functions to check if the current URL matches
   * a pattern or set of patterns. It supports wildcard (*) characters.
   */
  /**
   * Check if the current URL matches any of the provided patterns
   *
   * @param {string|string[]} patterns - A pattern or array of patterns to match against
   * @returns {boolean} - True if the current URL matches any pattern, false otherwise
   */
  /**
   * Check if a script should be loaded based on the current URL
   *
   * @param {Object} script - The script manifest object
   * @returns {boolean} - True if the script should be loaded, false otherwise
   */
  function shouldLoadScript(script) {
    // If no urlPatterns specified or empty array, load everywhere
    return (
      !script.urlPatterns ||
      0 === script.urlPatterns.length ||
      (function (patterns) {
        if (!patterns) return !0;
        // If no patterns, match all URLs
        // Convert single pattern to array
        const patternArray = Array.isArray(patterns) ? patterns : [patterns];
        // If empty array, match all URLs
        if (0 === patternArray.length) return !0;
        const currentUrl = window.location.href;
        return patternArray.some((pattern) => {
          // Convert the pattern to a regex pattern
          // Escape regex special chars except for wildcards
          const escapedPattern = pattern
            .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
            .replace(/\*/g, ".*");
          // Convert * to .*
          return new RegExp("^" + escapedPattern + "$").test(currentUrl);
        });
      })(script.urlPatterns)
    );
  }
  /**
   * Utility for consistent logging throughout the application
   * Prefixes all console outputs with a stylized RPGHQ Userscript Manager label
   */
  /**
   * Log a message to the console with RPGHQ Userscript Manager prefix
   * @param {...any} args - Arguments to pass to console.log
   */ function log(...args) {
    console.log(
      "%c[RPGHQ Userscript Manager]%c",
      "color: #3889ED; font-weight: bold",
      "",
      ...args
    );
  }
  /**
   * Log a warning to the console with RPGHQ Userscript Manager prefix
   * @param {...any} args - Arguments to pass to console.warn
   */ function warn(...args) {
    console.warn(
      "%c[RPGHQ Userscript Manager]%c",
      "color: #FFC107; font-weight: bold",
      "",
      ...args
    );
  }
  /**
   * Log an error to the console with RPGHQ Userscript Manager prefix
   * @param {...any} args - Arguments to pass to console.error
   */ function error(...args) {
    console.error(
      "%c[RPGHQ Userscript Manager]%c",
      "color: #F5575D; font-weight: bold",
      "",
      ...args
    );
  }
  // Shared utility functions for RPGHQ Userscripts
  const sharedUtils = {
    // Caching functions will go here
    _cachePostData: (postId, data) => {
      console.log(`Caching data for post ${postId}`);
      // GM_setValue(`post_${postId}`, JSON.stringify(data)); // Example structure
    },
    _getCachedPostData: (postId) => (
      console.log(`Getting cached data for post ${postId}`), null
    ), // Placeholder
    // Page-level Caching Logic (Placeholders)
    _cachePostsOnPage: () => {
      console.log("Shared Logic: Caching posts on current page (stub).");
      // Logic to find all posts on the page and call cachePostData for each
    },
    // Preference Application Logic (Placeholders)
    _applyUserPreferences: () => {
      console.log("Shared Logic: Applying user preferences (stub).");
      // Logic to read stored user preferences (hiding/highlighting users) and apply them
    },
    _applyThreadPreferences: () => {
      console.log("Shared Logic: Applying thread preferences (stub).");
      // Logic to read stored thread preferences (pinning/hiding/highlighting topics) and apply them
    },
    _cacheTopicData: (topicId, data) => {
      console.log(`Caching data for topic ${topicId}`);
      // GM_setValue(`topic_${topicId}`, JSON.stringify(data)); // Example structure
    },
    _getCachedTopicData: (topicId) => (
      console.log(`Getting cached data for topic ${topicId}`), null
    ),
    // Placeholder
  };
  // G:/Modding/_Github/HQ-Userscripts/src/components/updateNotification.js
  // Function to inject CSS for the notification
  function showUpdateNotification(newVersion, downloadUrl) {
    log(`Showing update notification for version ${newVersion}`),
      (function () {
        const styleId = "update-notification-style";
        if (document.getElementById(styleId)) return;
        // Style already added
        const style = document.createElement("style");
        (style.id = styleId),
          (style.textContent =
            "\n    .update-notification {\n      position: fixed;\n      bottom: 20px;\n      right: 20px;\n      background-color: #C62D51; /* Green */\n      color: white;\n      padding: 10px 15px;\n      border-radius: 5px;\n      cursor: pointer;\n      font-size: 14px;\n      z-index: 10001; /* Above modal */\n      box-shadow: 0 2px 5px rgba(0,0,0,0.2);\n      transition: opacity 0.3s ease-in-out;\n    }\n    .update-notification:hover {\n      opacity: 0.9;\n    }\n    .update-notification-close {\n      margin-left: 10px;\n      font-weight: bold;\n      cursor: pointer;\n    }\n  "),
          document.head.appendChild(style);
      })();
    // Ensure styles are present
    // Remove existing notification if any
    const existingNotification = document.getElementById(
      "update-notification-bubble"
    );
    existingNotification && existingNotification.remove();
    const notification = document.createElement("div");
    (notification.id = "update-notification-bubble"),
      (notification.className = "update-notification"),
      (notification.innerHTML = `\n    Userscript Update (v${newVersion})\n    <span class="update-notification-close" title="Dismiss">&times;</span>\n  `),
      // Click on main body opens download link
      notification.addEventListener("click", (event) => {
        event.target !==
          notification.querySelector(".update-notification-close") &&
          (log(`Opening download URL: ${downloadUrl}`),
          window.open(downloadUrl, "_blank"));
      }),
      // Click on close button dismisses
      notification
        .querySelector(".update-notification-close")
        .addEventListener("click", (event) => {
          event.stopPropagation(), // Prevent triggering the main click
            log("Dismissing update notification."),
            notification.remove();
        }),
      document.body.appendChild(notification);
  }
  // G:/Modding/_Github/HQ-Userscripts/src/utils/updateChecker.js
  // Simple version comparison (e.g., "1.10.1" > "1.2.3")
  async function checkForUpdates() {
    log("Checking for userscript updates...");
    const currentVersion = GM_info.script.version,
      metaUrl = GM_info.script.updateURL || GM_info.script.downloadURL,
      downloadUrl = GM_info.script.downloadURL || GM_info.script.updateURL;
    // Prefer updateURL, fallback to downloadURL for fetching metadata
    // URL to open on click
    if (metaUrl)
      try {
        // eslint-disable-next-line no-undef
        GM_xmlhttpRequest({
          method: "GET",
          url: metaUrl,
          onload: function (response) {
            if (response.status >= 200 && response.status < 300) {
              const versionMatch =
                response.responseText.match(/@version\s+([\d.]+)/);
              // Extract version using regex
              if (versionMatch && versionMatch[1]) {
                const latestVersion = versionMatch[1];
                log(
                  `Current version: ${currentVersion}, Latest version: ${latestVersion}`
                ),
                  (function (v1, v2) {
                    const parts1 = v1.split(".").map(Number),
                      parts2 = v2.split(".").map(Number),
                      len = Math.max(parts1.length, parts2.length);
                    for (let i = 0; i < len; i++) {
                      const n1 = parts1[i] || 0,
                        n2 = parts2[i] || 0;
                      if (n1 > n2) return 1;
                      if (n1 < n2) return -1;
                    }
                    return 0;
                  })(latestVersion, currentVersion) > 0
                    ? (log(`Update available: ${latestVersion}`),
                      // Call the notification function (currently commented out)
                      showUpdateNotification(latestVersion, downloadUrl))
                    : log("Script is up to date.");
              } else
                warn("Could not find @version tag in metadata file:", metaUrl);
            } else
              warn(
                `Failed to fetch metadata. Status: ${response.status}`,
                metaUrl
              );
          },
          onerror: function (response) {
            error("Error fetching metadata:", response);
          },
        });
      } catch (err) {
        error("Error during GM_xmlhttpRequest setup:", err);
      }
    else
      warn(
        "No updateURL or downloadURL found in script metadata. Cannot check for updates."
      );
  }
  var loadOrder = {
    "document-start": [
      "_applyThreadPreferences",
      "_cachePostsOnPage",
      "recentTopicsFormat",
      "_applyUserPreferences",
      "bbcode",
      "commaFormatter",
    ],
    "document-end": [
      "memberSearch",
      "randomTopic",
      "kalareact",
      "notifications",
      "pinThreads",
      "separateReactions",
    ],
    "document-idle": [],
    after_dom: [],
  };
  /**
   * Hides the userscript manager modal.
   */
  function hideModal() {
    log("Hiding userscript manager modal...");
    const modal = document.getElementById("mod-manager-modal");
    modal &&
      ((modal.style.display = "none"), (document.body.style.overflow = ""));
    // Hide any open settings modal
    const settingsModal = document.getElementById("script-settings-modal");
    settingsModal && (settingsModal.style.display = "none");
  }
  /**
   * Renders the "Installed Scripts" tab content with filtering and view options.
   *
   * @param {HTMLElement} container - The container element to render into
   * @param {Array} scripts - The array of script objects from SCRIPT_MANIFEST
   * @param {Object} scriptStates - Object containing enabled/disabled states for scripts
   * @param {Function} renderScriptsGridView - Function to render scripts in grid view
   * @param {Function} renderScriptsListView - Function to render scripts in list view
   */
  /**
   * Renders the "Threads" subtab content within the Forum Preferences tab.
   *
   * @param {HTMLElement} container - The container element to render into
   */
  function renderThreadsSubtab(container) {
    log("Rendering Threads subtab..."),
      (container.innerHTML =
        '\n    <div class="wip-banner">\n      <i class="fa fa-wrench"></i> Thread Preferences - Work In Progress\n    </div>\n  \n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">Thread Display</h3>\n      </div>\n      <div class="preferences-section-body">\n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Thread Layout</h4>\n            <div class="preference-control">\n              <select>\n                <option selected>Compact</option>\n                <option>Standard</option>\n                <option>Expanded</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Choose how thread listings are displayed</p>\n        </div>\n      \n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Threads Per Page</h4>\n            <div class="preference-control">\n              <select>\n                <option>10</option>\n                <option selected>20</option>\n                <option>30</option>\n                <option>50</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Number of threads to display per page</p>\n        </div>\n      </div>\n    </div>\n  \n    <div class="info-note">\n      <strong>Note:</strong> This is a view-only display. Additional Thread preferences will be added in future updates.\n    </div>\n  ');
  }
  /**
   * Renders the "Users" subtab content within the Forum Preferences tab.
   *
   * @param {HTMLElement} container - The container element to render into
   */
  /**
   * Renders the "Forum Preferences" tab content with subtabs.
   *
   * @param {HTMLElement} container - The container element to render into
   */
  function renderForumPreferencesTab(container) {
    log("Rendering Forum Preferences tab with subtabs..."),
      (container.innerHTML = "<h2>Forum Preferences</h2>");
    // Add sub-tabs for Threads and Users
    const subTabsContainer = document.createElement("div");
    (subTabsContainer.className = "sub-tabs"),
      (subTabsContainer.innerHTML =
        '\n    <div class="sub-tab active" data-subtab="threads">\n      <i class="fa fa-comments"></i> Threads\n    </div>\n    <div class="sub-tab" data-subtab="users">\n      <i class="fa fa-users"></i> Users\n    </div>\n  '),
      container.appendChild(subTabsContainer);
    // Add container for sub-tab content
    const subTabContent = document.createElement("div");
    (subTabContent.id = "forum-subtab-content"),
      container.appendChild(subTabContent),
      // Load initial sub-tab (Threads)
      renderThreadsSubtab(subTabContent),
      // Add event listeners for sub-tabs
      subTabsContainer.querySelectorAll(".sub-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          // Update active state
          subTabsContainer.querySelectorAll(".sub-tab").forEach((t) => {
            t.classList.remove("active");
          }),
            tab.classList.add("active"),
            // Load content
            "threads" === tab.dataset.subtab
              ? renderThreadsSubtab(subTabContent)
              : "users" === tab.dataset.subtab &&
                (function (container) {
                  log("Rendering Users subtab..."),
                    (container.innerHTML =
                      '\n    <div class="wip-banner">\n      <i class="fa fa-wrench"></i> User Preferences - Work In Progress\n    </div>\n  \n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">User Display</h3>\n      </div>\n      <div class="preferences-section-body">\n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Show User Signatures</h4>\n            <div class="preference-control">\n              <input type="checkbox" name="user.display.signatures" checked>\n            </div>\n          </div>\n          <p class="preference-description">Display user signatures in posts</p>\n        </div>\n      \n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Show User Avatars</h4>\n            <div class="preference-control">\n              <input type="checkbox" name="user.display.avatars" checked>\n            </div>\n          </div>\n          <p class="preference-description">Display user avatars in posts and listings</p>\n        </div>\n      </div>\n    </div>\n  \n    <div class="info-note">\n      <strong>Note:</strong> This is a view-only display. Additional User preferences will be added in future updates.\n    </div>\n  ');
                })(subTabContent);
        });
      });
  }
  /**
   * Renders the "Settings" tab content with global manager settings.
   *
   * @param {HTMLElement} container - The container element to render into
   */
  /**
   * Loads the appropriate tab content based on the selected tab.
   *
   * @param {string} tabName - The name of the tab to load ('installed', 'forum', or 'settings')
   * @param {Object} context - Object containing necessary data and functions for rendering tabs
   * @param {HTMLElement} context.container - The container element to render into
   * @param {Array} context.scripts - The scripts array from SCRIPT_MANIFEST
   * @param {Object} context.scriptStates - Object containing enabled/disabled states for scripts
   * @param {Function} context.renderScriptsGridView - Function to render scripts in grid view
   * @param {Function} context.renderScriptsListView - Function to render scripts in list view
   * @param {Array} context.executionPhases - Array of execution phase objects from manifest schema
   */
  function loadTabContent(tabName, context) {
    const {
      container: container,
      scripts: scripts,
      scriptStates: scriptStates,
      renderScriptsGridView: renderScriptsGridView,
    } = context;
    switch (
      (log(`Loading tab content for: ${tabName}`),
      // Clear previous content
      (container.innerHTML = ""),
      tabName)
    ) {
      case "installed":
        !(function (container, scripts, scriptStates, renderScriptsGridView) {
          log("Rendering Installed Scripts tab with filtering...");
          // Filter panel removed
          // View switcher removed
          // Create the scripts container
          const scriptsContainer = document.createElement("div");
          (scriptsContainer.className = "scripts-display-container"),
            (scriptsContainer.id = "scripts-container"),
            container.appendChild(scriptsContainer),
            // Render scripts in grid view initially
            renderScriptsGridView(scriptsContainer, scripts, scriptStates);
        })(container, scripts, scriptStates, renderScriptsGridView);
        break;

      case "forum":
        renderForumPreferencesTab(container);
        break;

      case "settings":
        !(function (container) {
          log("Rendering Settings tab..."),
            (container.innerHTML =
              '\n    <h2>Global Settings</h2>\n  \n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">Appearance</h3>\n      </div>\n      <div class="preferences-section-body">\n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Theme</h4>\n            <div class="preference-control">\n              <select class="setting-input">\n                <option value="dark" selected>Dark</option>\n                <option value="light">Light</option>\n                <option value="system">System Default</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Choose your preferred theme for the userscript manager</p>\n        </div>\n      \n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Script Card Size</h4>\n            <div class="preference-control">\n              <select class="setting-input">\n                <option value="small">Small</option>\n                <option value="medium" selected>Medium</option>\n                <option value="large">Large</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Adjust the size of script cards in the gallery view</p>\n        </div>\n      </div>\n    </div>\n  \n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">Behavior</h3>\n      </div>\n      <div class="preferences-section-body">\n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Default View</h4>\n            <div class="preference-control">\n              <select class="setting-input">\n                <option value="grid" selected>Grid</option>\n                <option value="list">List</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Choose the default view for displaying scripts</p>\n        </div>\n      \n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Auto-check for Updates</h4>\n            <div class="preference-control">\n              <label class="toggle-switch">\n                <input type="checkbox" checked>\n                <span class="toggle-slider"></span>\n              </label>\n            </div>\n          </div>\n          <p class="preference-description">Automatically check for script updates when the page loads</p>\n        </div>\n      </div>\n    </div>\n  \n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">Advanced</h3>\n      </div>\n      <div class="preferences-section-body">\n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Update Check Interval</h4>\n            <div class="preference-control">\n              <select class="setting-input">\n                <option value="daily">Daily</option>\n                <option value="weekly" selected>Weekly</option>\n                <option value="monthly">Monthly</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">How often to check for script updates</p>\n        </div>\n      \n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Debug Mode</h4>\n            <div class="preference-control">\n              <label class="toggle-switch">\n                <input type="checkbox">\n                <span class="toggle-slider"></span>\n              </label>\n            </div>\n          </div>\n          <p class="preference-description">Enable verbose console logging for troubleshooting</p>\n        </div>\n      </div>\n    </div>\n  \n    <div class="info-note">\n      <strong>Note:</strong> These are view-only representations of settings. Changes made here will not be saved.\n    </div>\n  ');
        })(container);
        break;

      default:
        error(`Unknown tab: ${tabName}`),
          (container.innerHTML = `<div class="error-message">Unknown tab: ${tabName}</div>`);
    }
  }
  /**
   * Renders an empty state message when no scripts are found.
   *
   * @param {HTMLElement} container - The container element to render into
   * @param {string} message - The message to display (optional)
   * @param {string} iconClass - The Font Awesome icon class to use (optional)
   */ function renderEmptyState(
    container,
    message = "No scripts found.",
    iconClass = "fa-search"
  ) {
    log("Rendering empty state..."),
      (container.innerHTML = `\n    <div class="empty-state">\n      <div class="empty-state-icon">\n        <i class="fa ${iconClass}"></i>\n      </div>\n      <div class="empty-state-message">${message}</div>\n    </div>\n  `);
  }
  /**
   * Renders scripts in a grid view with cards.
   *
   * @param {HTMLElement} container - The container element to render into
   * @param {Array} scripts - Array of script objects from the manifest
   * @param {Object} scriptStates - Object containing enabled/disabled states for scripts
   * @param {Function} showScriptSettings - Function to show the settings modal for a script
   */
  /**
   * Shows the settings modal for a script.
   *
   * @param {Object} script - The script object from the manifest.
   * @param {Function} renderScriptSettingsContent - Function to render the settings content.
   * @param {Function} getScriptSetting - Function to retrieve a script setting value.
   * @param {Function} saveScriptSetting - Function to save a script setting value.
   */
  function showScriptSettings(
    script,
    renderScriptSettingsContent,
    getScriptSetting,
    saveScriptSetting
  ) {
    log(`Showing settings modal for script: ${script.name}`);
    let modal = document.getElementById("script-settings-modal");
    modal ||
      ((modal = document.createElement("div")),
      (modal.id = "script-settings-modal"),
      (modal.className = "settings-modal"),
      document.body.appendChild(modal));
    const canRenderSettings =
      script.settings &&
      script.settings.length > 0 &&
      renderScriptSettingsContent &&
      getScriptSetting;
    (modal.innerHTML = `\n    <div class="settings-modal-content">\n      <div class="settings-modal-header">\n        <h2 class="settings-modal-title">${script.name} Settings</h2>\n        <span class="settings-modal-close">&times;</span>\n      </div>\n\n      ${canRenderSettings ? renderScriptSettingsContent(script, getScriptSetting) : renderEmptyState(null, "This script doesn't have any configurable settings.")}\n\n      <div\n        class="script-info"\n        style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 15px;"\n      >\n        <h3>Script Information</h3>\n        <table class="data-table">\n          <tr>\n            <th>ID</th>\n            <td>${script.id}</td>\n          </tr>\n          <tr>\n            <th>Version</th>\n            <td>${script.version}</td>\n          </tr>\n          <tr>\n            <th>Category</th>\n            <td>${script.category || "Uncategorized"}</td>\n          </tr>\n          <tr>\n            <th>Author</th>\n            <td>${script.author || "Unknown"}</td>\n          </tr>\n          <tr>\n            <th>Description</th>\n            <td>${script.description || "-"}</td>\n          </tr>\n          ${script.urlPatterns && script.urlPatterns.length > 0 ? `\n          <tr><th>URL Patterns</th><td>${script.urlPatterns.join("<br>")}</td></tr>\n          ` : ""}\n        </table>\n      </div>\n\n      <div class="info-note" style="margin-top: 15px;">\n        <strong>Note:</strong> Changes to settings may require a page reload to\n        take full effect.\n      </div>\n    </div>\n  `),
      (modal.style.display = "block");
    const closeButton = modal.querySelector(".settings-modal-close");
    closeButton &&
      closeButton.addEventListener("click", () => {
        modal.style.display = "none";
      }),
      modal.addEventListener("click", (e) => {
        e.target === modal && (modal.style.display = "none");
      }),
      canRenderSettings &&
        saveScriptSetting &&
        setTimeout(() => {
          modal.querySelectorAll(".setting-input").forEach((input) => {
            const settingId = input.dataset.settingId;
            if (!settingId)
              return void console.warn(
                "Setting input missing data-setting-id:",
                input
              );
            const eventType =
              "checkbox" === input.type ||
              "radio" === input.type ||
              "SELECT" === input.tagName
                ? "change"
                : "input";
            // Use existing input, no need to clone
            input.addEventListener(eventType, (e) => {
              const target = e.target,
                value =
                  "checkbox" === target.type ? target.checked : target.value;
              // Function to update visibility of dependent settings
              var changedSettingId, newValue;
              log(`Setting changed: ${script.id}.${settingId} = ${value}`),
                saveScriptSetting(script.id, settingId, value),
                // Update visibility of dependent settings
                (changedSettingId = settingId),
                (newValue = value),
                modal
                  .querySelectorAll(".setting-item[data-depends-on]")
                  .forEach((item) => {
                    if (item.dataset.dependsOn === changedSettingId) {
                      const requiredValue = JSON.parse(
                          item.dataset.dependsValue
                        ),
                        shouldBeVisible = newValue === requiredValue;
                      log(
                        `Checking dependency: ${item.dataset.settingId} depends on ${changedSettingId}. Value: ${newValue}, Required: ${requiredValue}. Visible: ${shouldBeVisible}`
                      ),
                        shouldBeVisible
                          ? item.classList.remove("setting-item-hidden")
                          : item.classList.add("setting-item-hidden");
                    }
                  });
            });
          });
        }, 150);
  }
  /**
   * Renders an appropriate HTML control element based on the setting type,
   * using the currently saved value.
   *
   * @param {Object} setting - The setting object from the manifest.
   * @param {string} scriptId - The ID of the script these settings belong to.
   * @param {Function} getScriptSetting - Function to retrieve the saved setting value.
   * @returns {string} - HTML string for the rendered control.
   */
  /**
   * Renders the settings content HTML for a script.
   *
   * @param {Object} script - The script object from the manifest.
   * @param {Function} getScriptSetting - Function to retrieve a script setting value.
   * @returns {string} - HTML string for the settings content, or empty string if no settings.
   */
  function renderScriptSettingsContent(script, getScriptSetting) {
    if (
      (log(
        `Rendering settings content for script: ${script.name} (${script.id})`
      ),
      !script || !script.id)
    )
      return (
        log(
          "Error: Invalid script object passed to renderScriptSettingsContent."
        ),
        "<p>Error loading settings.</p>"
      );
    if (!script.settings || 0 === script.settings.length)
      return (
        log(`No settings defined for script: ${script.name}`),
        '<div class="empty-state"><p>This script has no configurable settings.</p></div>'
      );
    if ("function" != typeof getScriptSetting)
      return (
        log(
          `Error: getScriptSetting function not provided for script: ${script.name}`
        ),
        "<p>Error loading setting values.</p>"
      );
    // Map each setting definition to its HTML representation
    return `<div class="setting-group">${script.settings
      .map((setting) => {
        if (!setting || !setting.id)
          return (
            log(
              `Warning: Invalid setting definition found in script ${script.id}`,
              setting
            ),
            ""
          );
        // Skip invalid setting definitions
        const controlId = `setting-${script.id}-${setting.id}`,
          settingName = setting.name || setting.id;
        // Unique ID for label
        // Use name if available, else ID
        let controlHTML = "",
          dependencyAttributes = "",
          initiallyHidden = !1;
        // Determine dependency attributes and initial visibility
        if (setting.dependsOn) {
          const depSettingId = setting.dependsOn.settingId,
            depValue = setting.dependsOn.value,
            depCurrentValue = getScriptSetting(script.id, depSettingId);
          (dependencyAttributes = `\n          data-depends-on="${depSettingId}"\n          data-depends-value='${JSON.stringify(depValue)}'\n        `),
            // Use single quotes for JSON validity
            // Hide if the dependency's current value doesn't match the required value
            (initiallyHidden = depCurrentValue !== depValue),
            log(
              `Setting ${setting.id} depends on ${depSettingId} (current: ${depCurrentValue}, required: ${depValue}). Initially hidden: ${initiallyHidden}`
            );
        }
        // Render the specific control (checkbox or other)
        if ("checkbox" === setting.type) {
          const isChecked = getScriptSetting(
            script.id,
            setting.id,
            setting.defaultValue
          );
          controlHTML = `\n          <label class="toggle-switch">\n            <input\n              type="checkbox"\n              class="setting-input"\n              id="${controlId}"\n              data-setting-id="${setting.id}"\n              name="${setting.id}"\n              ${isChecked ? "checked" : ""}\n            >\n            <span class="toggle-slider"></span>\n          </label>\n        `;
        } else
          controlHTML = (function (setting, scriptId, getScriptSetting) {
            // Get the currently saved value, falling back to the manifest default
            const currentValue = getScriptSetting(
                scriptId,
                setting.id,
                setting.defaultValue
              ),
              controlId = `setting-${scriptId}-${setting.id}`;
            // Unique ID for label association
            switch (setting.type) {
              case "checkbox":
                return `\n        <input \n          type="checkbox" \n          class="setting-input" \n          id="${controlId}" \n          data-setting-id="${setting.id}" \n          name="${setting.id}" \n          ${currentValue ? "checked" : ""}\n        >`;

              case "select":
                return `\n        <select \n          class="setting-input" \n          id="${controlId}" \n          data-setting-id="${setting.id}" \n          name="${setting.id}"\n        >\n          ${setting.options
                  .map((option) => {
                    const value =
                        "object" == typeof option ? option.value : option,
                      label = "object" == typeof option ? option.label : option;
                    return `<option value="${value}" ${value === currentValue ? "selected" : ""}>${label}</option>`;
                  })
                  .join("")}\n        </select>`;

              case "number":
                return `\n        <input \n          type="number" \n          class="setting-input" \n          id="${controlId}" \n          data-setting-id="${setting.id}" \n          name="${setting.id}" \n          value="${currentValue ?? 0}"\n        >`;

              case "color":
                return `\n        <input\n          type="color"\n          class="setting-input setting-color-input" // Add specific class for styling\n          id="${controlId}"\n          data-setting-id="${setting.id}"\n          name="${setting.id}"\n          value="${currentValue ?? "#ffffff"}"\n        >`;

              default:
                // Default to text
                return `\n        <input \n          type="text" \n          class="setting-input" \n          id="${controlId}" \n          data-setting-id="${setting.id}" \n          name="${setting.id}" \n          value="${currentValue ?? ""}"\n        >`;
            }
          })(setting, script.id, getScriptSetting);
        // Create the setting item container with dependency attributes and initial style
        return `\n        <div\n          class="setting-item ${initiallyHidden ? "setting-item-hidden" : ""}"\n          ${dependencyAttributes}\n          data-setting-id="${setting.id}"\n        >\n          <div class="setting-details">\n            <div class="setting-name">${settingName}</div>\n            ${setting.description ? `<div class="setting-description">${setting.description}</div>` : ""}\n            ${setting.previewImage ? `<img src="${setting.previewImage}" alt="Setting preview" class="setting-preview-image">` : ""}\n          </div>\n          <div class="setting-control">\n            ${controlHTML}\n          </div>\n        </div>\n      `;
      })
      .join("\n")}</div>`;
  }
  /**
   * Toggles a script's enabled state, saves the state, and loads/unloads the script.
   *
   * @param {string} scriptId - The ID of the script to toggle
   * @param {boolean} newState - The new enabled state
   * @param {Object} scriptStates - Object containing enabled/disabled states for scripts
   * @param {Function} gmSetValue - Function to save the state
   * @param {Array} scriptManifest - Array of script objects from the manifest
   * @param {Function} loadScript - Function to load a script
   * @param {Function} unloadScript - Function to unload a script
   */ var recentTopicsFormat = Object.freeze({
    __proto__: null,
    init:
      // RPGHQ - Slightly Formatted Thread Titles
      /**
       * Adds some minor formatting to thread titles, like unbolding stuff in parantheses or reformatting the AG threads
       * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
       * License: MIT
       *
       * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/recentTopicsFormat.md for documentation
       */
      // Note: Assumes getScriptSetting is provided to init by main.js
      function ({ getScriptSetting: getScriptSetting }) {
        const SCRIPT_ID = "recentTopicsFormat";
        // Define script ID for settings
        /***************************************
         * 1) Remove ellipses/truncation in titles (Conditional)
         ***************************************/ if (
          getScriptSetting(SCRIPT_ID, "wrapTitles", !0)
        ) {
          const style = document.createElement("style");
          (style.textContent =
            "\n           /* Ensure topic titles don't get truncated with ellipses */\n           .topictitle {\n               white-space: normal !important;\n               overflow: visible !important;\n               text-overflow: unset !important;\n               max-width: none !important;\n               display: inline-block;\n           }\n       "),
            document.head.appendChild(style);
        }
        /*******************************************
         * 2) Functions to style different elements
         *******************************************/
        /**
         * Make any text in (parentheses) smaller, non-bold
         * e.g. "Title (Extra Info)" -> "Title (<span>Extra Info</span>)"
         */
        /**
         * Process a single title element based on settings
         */
        function processTitle(titleElem) {
          const shouldUnboldParens = getScriptSetting(
              SCRIPT_ID,
              "unboldParentheses",
              !0
            ),
            shouldReformatAG = getScriptSetting(
              SCRIPT_ID,
              "reformatAGThreads",
              !0
            ),
            originalHTML = titleElem.innerHTML;
          // Work with HTML
          let currentHTML = originalHTML,
            agFormatted = !1;
          // Apply AG formatting first if enabled
          if (shouldReformatAG) {
            const agResult =
              /**
               * Special formatting for Adventurer's Guild titles
               * Format: "[x] Adventurer's Guild - Month: Games" or "Month: Games"
               */
              (function (str, elem) {
                // Check if it's an Adventurer's Guild title or post
                const plainText = elem.textContent,
                  isGuildTitle = plainText.includes("Adventurer's Guild"),
                  isGuildForum =
                    null !==
                    elem
                      .closest(".row-item")
                      ?.querySelector(
                        '.forum-links a[href*="adventurer-s-guild"]'
                      );
                // Use textContent for matching patterns
                if (!isGuildTitle && !isGuildForum) return str;
                // Return original HTML if not relevant
                let match;
                if (isGuildTitle) {
                  // Match the pattern: optional Junior, Month, Games
                  const titleRegex =
                    /^(?:(Junior)\s+)?Adventurer's Guild\s*-\s*([A-Za-z]+):(.+?)(?:\s+[A-Z][A-Z\s]+)*$/;
                  match = plainText.match(titleRegex);
                } else {
                  // Match the pattern: Month, Games (when in AG forum)
                  const forumRegex = /^([A-Za-z]+):(.+?)(?:\s+[A-Z][A-Z\s]+)*$/;
                  match = plainText.match(forumRegex);
                }
                if (!match) return str;
                // Return original HTML if no pattern match
                if (isGuildTitle) {
                  const [_, juniorPrefix, month, gamesList] = match,
                    shortPrefix = juniorPrefix ? "Jr. AG - " : "AG - ";
                  return `${gamesList.trim()} <span style="font-size: 0.8em; opacity: 0.8;">${shortPrefix}${month}</span>`;
                }
                {
                  const [_, month, gamesList] = match;
                  return `${gamesList.trim()} <span style="font-size: 0.8em; opacity: 0.8;">(AG - ${month})</span>`;
                }
              })(
                /**
                 * Make text after dash unbolded (but keep same size)
                 * e.g. "Title - Game" -> "Title<span style="font-weight: normal"> - Game</span>"
                 * Handles both regular dash and em dash
                 */ currentHTML,
                titleElem
              );
            agResult !== currentHTML &&
              ((currentHTML = agResult), (agFormatted = !0));
          }
          // Apply parentheses styling if enabled
          shouldUnboldParens &&
            (currentHTML = currentHTML.replace(
              /\(([^()]*)\)/g,
              (match, innerText) =>
                // Avoid double-wrapping
                innerText.includes(
                  '<span style="font-size: 0.85em; font-weight: normal;">'
                )
                  ? match
                  : `(<span style="font-size: 0.85em; font-weight: normal;">${innerText}</span>)`
            )),
            // Apply version styling (always, for now)
            (currentHTML =
              /**
               * Style version numbers by adding 'v' prefix and making them smaller
               * Matches patterns like: 1.0, 1.0.0, 1.0.0.1, etc.
               */
              (function (str) {
                // Use HTML replace
                return str.replace(
                  /\b(\d+(?:\.\d+)+)\b/g,
                  (match, versionNumber) =>
                    // Avoid double-wrapping
                    str.includes(
                      `<span style="font-size: 0.75em;">v${versionNumber}</span>`
                    )
                      ? match
                      : `<span style="font-size: 0.75em;">v${versionNumber}</span>`
                );
              })(currentHTML)),
            // Apply dash styling ONLY if AG formatting didn't run
            agFormatted ||
              (currentHTML = (function (str, elem) {
                // Context check needed here because AG formatting might not run if setting is off
                const plainText = elem.textContent,
                  isGuildTitle = plainText.includes("Adventurer's Guild"),
                  isGuildForum =
                    null !==
                    elem
                      .closest(".row-item")
                      ?.querySelector(
                        '.forum-links a[href*="adventurer-s-guild"]'
                      );
                if (isGuildTitle || isGuildForum) return str;
                // Don't process AG titles/posts here
                // Match both regular dash and em dash with optional spaces, ensuring it's not inside HTML tags
                // This is tricky with regex on HTML, might need a simpler approach or DOM parsing
                // Simple approach: find the first dash in text content, then reconstruct HTML
                const dashMatch = plainText.match(/\s+[-—]\s+/);
                if (!dashMatch) return str;
                // Find the index of the first dash in the text content
                const dashIndexInText = dashMatch.index;
                // Reconstruct carefully - this might break existing spans across the dash
                // A more robust solution would parse the DOM nodes within the title element
                let charCount = 0;
                for (let i = 0; i < elem.childNodes.length; i++) {
                  const node = elem.childNodes[i];
                  if (node.nodeType === Node.TEXT_NODE) {
                    if (charCount + node.length >= dashIndexInText) {
                      // Dash is in this text node
                      const textBeforeDash = node.textContent.slice(
                          0,
                          dashIndexInText - charCount
                        ),
                        textAfterDash = node.textContent.slice(
                          dashIndexInText - charCount
                        ),
                        beforeNode = document.createTextNode(textBeforeDash),
                        spanNode = document.createElement("span");
                      (spanNode.style.fontWeight = "normal"),
                        (spanNode.textContent = textAfterDash), // Includes the dash itself
                        // Replace the original text node
                        elem.replaceChild(spanNode, node),
                        elem.insertBefore(beforeNode, spanNode);
                      // Wrap subsequent nodes
                      for (let j = i + 1; j < elem.childNodes.length; j++)
                        elem.childNodes[j] !== spanNode &&
                          // Avoid re-wrapping the span we just added
                          spanNode.appendChild(
                            elem.childNodes[j].cloneNode(!0)
                          );
                      // Remove original subsequent nodes that were cloned
                      for (; elem.childNodes.length > i + 2; )
                        elem.removeChild(elem.childNodes[i + 2]);
                      break;
                      // Found and processed dash
                    }
                    charCount += node.length;
                  } else
                    node.nodeType === Node.ELEMENT_NODE &&
                      // Could try to estimate length, but skip complex tags for now
                      (charCount += node.textContent.length);
                }
                return elem.innerHTML;
                // Return potentially modified HTML
              })(currentHTML, titleElem)),
            // Update DOM only if HTML actually changed
            currentHTML !== originalHTML && (titleElem.innerHTML = currentHTML);
        }
        /**
         * Process all titles in a container element
         */ function processTitlesInContainer(container) {
          container.querySelectorAll(".topictitle").forEach(processTitle);
        }
        // Initial processing
        processTitlesInContainer(document);
        // Set up mutation observer for dynamic updates
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              // Check if the added node is an element and contains titles or is a title itself
              node.nodeType === Node.ELEMENT_NODE &&
                (node.matches(".topictitle")
                  ? processTitle(node)
                  : node.querySelector(".topictitle") &&
                    // If the added node contains titles, process them
                    processTitlesInContainer(node));
            });
          });
        });
        // Start observing the document body for added nodes
        // Return a cleanup function to disconnect the observer when the script is disabled
        return (
          observer.observe(document.body, {
            childList: !0,
            subtree: !0,
          }),
          {
            cleanup: () => {
              observer.disconnect(),
                // Potentially add code here to revert styles if needed, though complex
                console.log("Disconnected recentTopicsFormat observer.");
            },
          }
        );
      },
  });
  // RPGHQ - Random Topic Button
  /**
   * Adds a Random Topic button, for funsies
   * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
   * License: MIT
   *
   * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/randomTopic.md for documentation
   */ var randomTopic = Object.freeze({
    __proto__: null,
    init: function () {
      // Function to check if a topic exists
      function checkTopicExists(topicId) {
        return new Promise((resolve, reject) => {
          GM_xmlhttpRequest({
            method: "HEAD",
            url: `https://rpghq.org/forums/viewtopic.php?t=${topicId}`,
            onload: function (response) {
              resolve(200 === response.status);
            },
            onerror: function (error) {
              reject(error);
            },
          });
        });
      }
      // Function to get a valid random topic
      async function getValidRandomTopic() {
        let topicId,
          topicExists = !1;
        for (; !topicExists; )
          (topicId = Math.floor(2800 * Math.random()) + 1),
            (topicExists = await checkTopicExists(topicId));
        return `https://rpghq.org/forums/viewtopic.php?t=${topicId}`;
      }
      // Function to create and add the button
      function handleRandomTopicClick(e) {
        e.preventDefault(),
          (this.style.textDecoration = "none"),
          (this.innerHTML =
            '<i class="icon fa-spinner fa-spin fa-fw" aria-hidden="true"></i><span>Loading...</span>'),
          getValidRandomTopic()
            .then((validTopic) => {
              window.location.href = validTopic;
            })
            .catch((error) => {
              console.error("Error finding random topic:", error),
                (this.innerHTML =
                  '<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>');
            });
      }
      // Run the function when the page is loaded
      !(function () {
        // Add to quick links dropdown
        const quickLinks = document.querySelector(
          "#quick-links .dropdown-contents"
        );
        if (quickLinks) {
          const listItem = document.createElement("li");
          listItem.innerHTML =
            '\n          <a href="#" role="menuitem">\n            <i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>\n          </a>\n        ';
          // Insert after "Active topics" in the dropdown
          const activeTopicsItem = quickLinks.querySelector(
            'a[href*="search_id=active_topics"]'
          );
          if (activeTopicsItem) {
            const insertAfter = activeTopicsItem.closest("li");
            insertAfter.parentNode.insertBefore(
              listItem,
              insertAfter.nextSibling
            );
          } else
            // If "Active topics" is not found, append to the end of the list
            quickLinks.appendChild(listItem);
          // Add click event to the dropdown item
          listItem.querySelector("a").onclick = handleRandomTopicClick;
        }
        // Add as a separate button in the main navigation (existing code)
        const navMain = document.getElementById("nav-main");
        if (navMain) {
          const li = document.createElement("li"),
            a = document.createElement("a");
          (a.href = "#"),
            (a.role = "menuitem"),
            (a.innerHTML =
              '<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>'),
            // Add custom styles to the anchor and icon
            (a.style.cssText =
              "\n              display: flex;\n              align-items: center;\n              height: 100%;\n              text-decoration: none;\n          "),
            // Apply styles after a short delay to ensure the icon is loaded
            setTimeout(() => {
              const icon = a.querySelector(".icon");
              icon &&
                (icon.style.cssText =
                  "\n                      font-size: 14px;\n                  ");
            }, 100),
            (a.onclick = async function (e) {
              e.preventDefault(),
                (this.style.textDecoration = "none"),
                (this.innerHTML =
                  '<i class="icon fa-spinner fa-spin fa-fw" aria-hidden="true"></i><span>Loading...</span>');
              try {
                const validTopic = await getValidRandomTopic();
                window.location.href = validTopic;
              } catch (error) {
                console.error("Error finding random topic:", error),
                  (this.innerHTML =
                    '<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>');
              }
            }),
            li.appendChild(a),
            navMain.appendChild(li);
        }
      })();
    },
  });
  // RPGHQ - Member Search Button
  /**
   * Adds a quick member search button next to Unread posts
   * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
   * License: MIT
   *
   * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/memberSearch.md for documentation
   */ var memberSearch = Object.freeze({
    __proto__: null,
    init: function () {
      // Create member search modal
      function createMemberSearchModal() {
        const modal = document.createElement("div");
        (modal.className = "member-search-modal"),
          (modal.innerHTML =
            '\n              <div class="member-search-container">\n                  <div class="member-search-close">&times;</div>\n                  <div class="member-search-title">Member Search</div>\n                  <input type="text" class="member-search-input" placeholder="Search for a member...">\n                  <div class="member-search-results"></div>\n              </div>\n          '),
          document.body.appendChild(modal);
        return (
          modal
            .querySelector(".member-search-close")
            .addEventListener("click", function () {
              modal.classList.remove("active");
            }),
          // Remove the event listener that closes the modal when clicking outside
          // This ensures users must click the X to close the overlay
          // Setup search functionality
          // Function to setup search functionality
          (function (modal) {
            const searchInput = modal.querySelector(".member-search-input"),
              searchResults = modal.querySelector(".member-search-results");
            // Handle input changes for search
            let debounceTimer;
            searchInput.addEventListener("input", function () {
              clearTimeout(debounceTimer);
              const query = this.value.trim();
              query.length < 2
                ? (searchResults.innerHTML = "")
                : ((searchResults.innerHTML =
                    '<div class="member-search-loading">Searching...</div>'),
                  (debounceTimer = setTimeout(() => {
                    !(
                      // Function to search for members using the API
                      (function (query, resultsContainer) {
                        fetch(
                          `https://rpghq.org/forums/mentionloc?q=${encodeURIComponent(query)}`,
                          {
                            method: "GET",
                            headers: {
                              accept:
                                "application/json, text/javascript, */*; q=0.01",
                              "x-requested-with": "XMLHttpRequest",
                            },
                            credentials: "include",
                          }
                        )
                          .then((response) => response.json())
                          .then((data) => {
                            !(
                              // Function to display search results
                              (function (data, resultsContainer) {
                                resultsContainer.innerHTML = "";
                                // Filter to only include users, exclude groups
                                const filteredData = data.filter(
                                  (item) => "user" === item.type
                                );
                                if (!filteredData || 0 === filteredData.length)
                                  return void (resultsContainer.innerHTML =
                                    '<div class="member-search-no-results">No members found</div>');
                                const fragment =
                                  document.createDocumentFragment();
                                // No need to sort since we're only showing users now
                                filteredData.forEach((item) => {
                                  const resultItem =
                                    document.createElement("div");
                                  (resultItem.className =
                                    "member-search-result"),
                                    // User entry
                                    resultItem.setAttribute(
                                      "data-user-id",
                                      item.user_id
                                    );
                                  // Create avatar URL with proper format
                                  const userId = item.user_id,
                                    username =
                                      item.value || item.key || "Unknown User",
                                    defaultAvatar =
                                      "https://f.rpghq.org/OhUxAgzR9avp.png?n=pasted-file.png";
                                  // Create the result item with image that tries multiple extensions
                                  (resultItem.innerHTML = `\n          <img \n            src="https://rpghq.org/forums/download/file.php?avatar=${userId}.jpg" \n            alt="${username}'s avatar" \n            onerror="if(this.src.endsWith('.jpg')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.png';}else if(this.src.endsWith('.png')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.gif';}else{this.src='${defaultAvatar}';}"\n          >\n          <span>${username}</span>\n        `),
                                    resultItem.addEventListener(
                                      "click",
                                      function () {
                                        const userId =
                                          this.getAttribute("data-user-id");
                                        window.location.href = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}`;
                                      }
                                    ),
                                    fragment.appendChild(resultItem);
                                }),
                                  resultsContainer.appendChild(fragment);
                              })(
                                // Add the member search button to the navigation bar
                                data,
                                resultsContainer
                              )
                            );
                          })
                          .catch((error) => {
                            console.error(
                              "Error searching for members:",
                              error
                            ),
                              (resultsContainer.innerHTML =
                                '<div class="member-search-no-results">Error searching for members</div>');
                          });
                      })(query, searchResults)
                    );
                  }, 300)));
            }),
              // Focus input when modal is opened
              modal.addEventListener("transitionend", function () {
                modal.classList.contains("active") && searchInput.focus();
              });
            // Also try to focus right away when modal is shown
            // This helps in browsers that don't fire transitionend properly
            const activeObserver = new MutationObserver(function (mutations) {
              mutations.forEach(function (mutation) {
                "class" === mutation.attributeName &&
                  modal.classList.contains("active") &&
                  searchInput.focus();
              });
            });
            activeObserver.observe(modal, {
              attributes: !0,
            });
          })(modal),
          modal
        );
      }
      // Add CSS styles
      GM_addStyle(
        "\n          .member-search-modal {\n              display: none;\n              position: fixed;\n              top: 0;\n              left: 0;\n              width: 100%;\n              height: 100%;\n              background-color: rgba(0, 0, 0, 0.7);\n              z-index: 1000;\n              justify-content: center;\n              align-items: center;\n          }\n          .member-search-modal.active {\n              display: flex;\n          }\n          .member-search-container {\n              background-color: #1e232b;\n              border: 1px solid #292e37;\n              border-radius: 4px;\n              width: 350px;\n              max-width: 80%;\n              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);\n              padding: 20px 20px;\n              position: relative;\n              z-index: 1001;\n              margin: 0 auto;\n              box-sizing: border-box;\n          }\n          .member-search-close {\n              position: absolute;\n              top: 10px;\n              right: 10px;\n              font-size: 20px;\n              color: #888;\n              cursor: pointer;\n          }\n          .member-search-close:hover {\n              color: #fff;\n          }\n          .member-search-title {\n              font-size: 18px;\n              margin-bottom: 15px;\n              color: #fff;\n              text-align: center;\n          }\n          .member-search-input {\n              width: calc(100% - 20px);\n              padding: 8px 10px;\n              border: 1px solid #292e37;\n              border-radius: 4px;\n              background-color: #171b24;\n              color: #fff;\n              margin-bottom: 10px;\n              font-size: 14px;\n              position: relative;\n              z-index: 1002;\n              margin-left: 10px;\n              margin-right: 10px;\n              box-sizing: border-box;\n          }\n          .member-search-input:focus {\n              outline: none;\n              border-color: #8698b3;\n          }\n          .member-search-results {\n              max-height: 300px;\n              overflow-y: auto;\n          }\n          .member-search-result {\n              display: flex;\n              align-items: center;\n              padding: 8px 10px;\n              cursor: pointer;\n              border-radius: 4px;\n          }\n          .member-search-result:hover {\n              background-color: #292e37;\n          }\n          .member-search-result img {\n              width: 32px;\n              height: 32px;\n              border-radius: 50%;\n              margin-right: 10px;\n          }\n          .member-search-result span {\n              white-space: nowrap;\n              overflow: hidden;\n              text-overflow: ellipsis;\n          }\n          .member-search-no-results {\n              padding: 10px;\n              color: #8a8a8a;\n              text-align: center;\n          }\n          .member-search-loading {\n              text-align: center;\n              padding: 10px;\n              color: #8a8a8a;\n          }\n          .member-search-group {\n              background-color: #272e38;\n              padding: 2px 6px;\n              border-radius: 3px;\n              margin-left: 6px;\n              font-size: 0.8em;\n              color: #aaa;\n          }\n      "
      ),
        // Initialize the member search functionality
        (function () {
          const navMain = document.getElementById("nav-main");
          if (!navMain) return;
          // Create the modal first
          const searchModal = createMemberSearchModal(),
            li = document.createElement("li");
          // Create the navigation button
          li.setAttribute("data-skip-responsive", "true");
          const a = document.createElement("a");
          (a.href = "#"),
            (a.role = "menuitem"),
            (a.innerHTML =
              '<i class="icon fa-user-plus fa-fw" aria-hidden="true"></i><span>Find Member</span>'),
            // Add custom styles to the anchor and icon
            (a.style.cssText =
              "\n              display: flex;\n              align-items: center;\n              height: 100%;\n              text-decoration: none;\n          "),
            // Apply styles after a short delay to ensure the icon is loaded
            setTimeout(() => {
              const icon = a.querySelector(".icon");
              icon &&
                (icon.style.cssText =
                  "\n                      font-size: 14px;\n                  ");
            }, 100),
            // Add click event to open the search modal
            a.addEventListener("click", function (e) {
              e.preventDefault(), searchModal.classList.add("active");
              const searchInput = searchModal.querySelector(
                ".member-search-input"
              );
              (searchInput.value = ""),
                searchInput.focus(),
                (searchModal.querySelector(".member-search-results").innerHTML =
                  "");
            }),
            li.appendChild(a);
          // Try a different approach for inserting the button in the navigation
          // Find a good position for the button, like after Chat or near Members
          const chatItem = Array.from(navMain.children).find(
              (el) =>
                el.textContent.trim().includes("Chat") ||
                el.textContent.trim().includes("IRC")
            ),
            membersItem = Array.from(navMain.children).find((el) =>
              el.textContent.trim().includes("Members")
            );
          // Try to find the Members item again, but look for direct children of navMain
          // Try to insert it after Chat, or Members, or just append to navMain
          chatItem && chatItem.parentNode === navMain
            ? navMain.insertBefore(li, chatItem.nextSibling)
            : membersItem && membersItem.parentNode === navMain
              ? navMain.insertBefore(li, membersItem.nextSibling)
              : // Just append it to the navMain as a safe fallback
                navMain.appendChild(li);
        })();
    },
  });
  // RPGHQ - Reaction List Separated
  /**
   * Makes smiley reactions and counts separated
   * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
   * License: MIT
   *
   * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/separateReactions.md for documentation
   */ var separateReactions = Object.freeze({
    __proto__: null,
    init: function () {
      function createReactionList(postId, reactions) {
        console.log(
          "createReactionList: Starting to create reaction list for post",
          postId
        );
        const pollVotes = (function () {
          console.log("getPollVotes: Starting to collect poll votes");
          const pollVotes = {},
            polls = document.querySelectorAll(".polls");
          return (
            console.log("getPollVotes: Found polls:", polls.length),
            polls.forEach((poll, pollIndex) => {
              console.log(`getPollVotes: Processing poll #${pollIndex + 1}`);
              const dls = poll.querySelectorAll("dl");
              console.log(
                `getPollVotes: Found ${dls.length} dl elements in poll #${pollIndex + 1}`
              );
              let currentOption = null;
              dls.forEach((dl, dlIndex) => {
                // First check if this is an option DL
                const optionDt = dl.querySelector("dt");
                // Then check if this is a voters box for the current option
                if (
                  (!optionDt ||
                    dl.classList.contains("poll_voters_box") ||
                    dl.classList.contains("poll_total_votes") ||
                    ((currentOption = optionDt.textContent.trim()),
                    console.log(
                      `getPollVotes: Found option: "${currentOption}"`
                    )),
                  dl.classList.contains("poll_voters_box") && currentOption)
                ) {
                  console.log(
                    `getPollVotes: Processing voters for option: "${currentOption}"`
                  );
                  const votersSpan = dl.querySelector(".poll_voters");
                  if (!votersSpan) return;
                  const voters = votersSpan.querySelectorAll("span[name]");
                  console.log(
                    `getPollVotes: Found ${voters.length} voters for this option`
                  ),
                    voters.forEach((voter, voterIndex) => {
                      const username = voter.getAttribute("name"),
                        userLink = voter.querySelector("a");
                      if (
                        (console.log(
                          `getPollVotes: Processing voter #${voterIndex + 1}:`,
                          {
                            username: username,
                            hasUserLink: !!userLink,
                            linkText: userLink?.textContent,
                            option: currentOption,
                            isColoured:
                              userLink?.classList.contains("username-coloured"),
                            color: userLink?.style.color,
                          }
                        ),
                        username && userLink)
                      ) {
                        const lowerUsername = username.toLowerCase();
                        pollVotes[lowerUsername] ||
                          (pollVotes[lowerUsername] = {
                            options: [],
                            isColoured:
                              userLink.classList.contains("username-coloured"),
                            color: userLink.style.color || null,
                          }),
                          pollVotes[lowerUsername].options.push(currentOption);
                      }
                    });
                }
              });
            }),
            console.log("getPollVotes: Final collected votes:", pollVotes),
            pollVotes
          );
        })();
        console.log("createReactionList: Got poll votes:", pollVotes);
        const displayStyle = 0 === reactions.length ? "display: none;" : "";
        console.log(
          "createReactionList: Processing",
          reactions.length,
          "reactions"
        );
        const html = `\n        <div class="reaction-score-list content-processed" data-post-id="${postId}" data-title="Reactions" style="padding-top: 10px !important; ${displayStyle}">\n            <div class="list-scores" style="display: flex; flex-wrap: wrap; gap: 4px;">\n                ${reactions
          .map(
            (reaction, reactionIndex) => (
              console.log(
                `createReactionList: Processing reaction #${reactionIndex + 1}:`,
                {
                  title: reaction.title,
                  userCount: reaction.users.length,
                }
              ),
              `\n                    <div class="reaction-group" style="display: flex; align-items: center; background-color: #3A404A; border-radius: 8px; padding: 2px 6px; position: relative;">\n                        <img src="${reaction.image}" alt="${reaction.title}" style="width: auto; height: 16px; margin-right: 4px; object-fit: contain;">\n                        <span style="font-size: 12px; color: #dcddde;">${reaction.count}</span>\n                        <div class="reaction-users-popup" style="display: none; position: fixed; background-color: #191919; border: 1px solid #202225; border-radius: 4px; padding: 8px; z-index: 1000; color: #dcddde; font-size: 12px; min-width: 200px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">\n                            <div style="font-weight: bold; margin-bottom: 8px;">${reaction.title}</div>\n                            <div style="display: flex; flex-direction: column; gap: 8px;">\n                                ${reaction.users
                .map((user, userIndex) => {
                  console.log(
                    `createReactionList: Reaction #${reactionIndex + 1}, processing user #${userIndex + 1}:`,
                    {
                      username: user.username,
                      pollVotes:
                        pollVotes[user.username.toLowerCase()]?.options,
                    }
                  );
                  const userPollVotes = pollVotes[user.username.toLowerCase()],
                    pollInfo =
                      userPollVotes?.options?.length > 0
                        ? `<div style="font-size: 8.5px; opacity: 0.8; color: #dcddde; margin-top: 2px;">\n                                            ${1 === userPollVotes.options.length ? `<div>${userPollVotes.options[0]}</div>` : userPollVotes.options.map((option) => `<div style="display: flex; align-items: baseline; gap: 4px;">\n                                                  <span style="font-size: 8px;">•</span>\n                                                  <span>${option}</span>\n                                                </div>`).join("")}\n                                          </div>`
                        : "";
                  return `\n                                        <div style="display: flex; align-items: flex-start;">\n                                            <div style="width: 24px; height: 24px; margin-right: 8px; flex-shrink: 0;">\n                                                ${user.avatar ? `<img src="${user.avatar}" alt="${user.username}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">` : ""}\n                                            </div>\n                                            <div style="display: flex; flex-direction: column;">\n                                                <a href="${user.profileUrl}" style="${user.isColoured ? `color: ${user.color};` : ""}" class="${user.isColoured ? "username-coloured" : "username"}">${user.username}</a>\n                                                ${pollInfo}\n                                            </div>\n                                        </div>\n                                    `;
                })
                .join(
                  ""
                )}\n                            </div>\n                        </div>\n                    </div>\n                `
            )
          )
          .join("")}\n            </div>\n        </div>\n    `;
        return console.log("createReactionList: Finished creating HTML"), html;
      }
      function fetchReactions(postId) {
        return fetch(
          `https://rpghq.org/forums/reactions?mode=view&post=${postId}`,
          {
            method: "POST",
            headers: {
              accept: "application/json, text/javascript, */*; q=0.01",
              "x-requested-with": "XMLHttpRequest",
            },
            credentials: "include",
          }
        )
          .then((response) => response.json())
          .then((data) =>
            data.htmlContent
              ? (function (htmlContent) {
                  const doc = new DOMParser().parseFromString(
                      htmlContent,
                      "text/html"
                    ),
                    reactions = [];
                  return (
                    doc
                      .querySelectorAll(".tab-header a:not(.active)")
                      .forEach((a) => {
                        const image = a.querySelector("img")?.src || "",
                          title = a.getAttribute("title") || "",
                          count =
                            a.querySelector(".tab-counter")?.textContent || "0",
                          dataId = a.getAttribute("data-id");
                        if (dataId) {
                          const users = [];
                          doc
                            .querySelectorAll(
                              `.tab-content[data-id="${dataId}"] li`
                            )
                            .forEach((li) => {
                              const userLink =
                                li.querySelector(".cbb-helper-text a");
                              if (userLink) {
                                const username = userLink.textContent || "",
                                  profileUrl = userLink.href || "",
                                  avatarImg =
                                    li.querySelector(".user-avatar img"),
                                  avatar = avatarImg ? avatarImg.src : "",
                                  isColoured =
                                    userLink.classList.contains(
                                      "username-coloured"
                                    ),
                                  color = isColoured
                                    ? userLink.style.color
                                    : null;
                                users.push({
                                  username: username,
                                  avatar: avatar,
                                  profileUrl: profileUrl,
                                  isColoured: isColoured,
                                  color: color,
                                });
                              }
                            }),
                            reactions.push({
                              image: image,
                              title: title,
                              count: count,
                              users: users,
                            });
                        }
                      }),
                    reactions
                  );
                })(data.htmlContent)
              : (console.error("No HTML content in response:", data), [])
          )
          .catch(
            (error) => (console.error("Error fetching reactions:", error), [])
          );
      }
      function processPost(post) {
        const postId = post.id.substring(1),
          existingReactionList = post.querySelector(".reaction-score-list");
        existingReactionList &&
          !existingReactionList.dataset.processed &&
          (function (post, postId) {
            const existingReactionList = post.querySelector(
              ".reaction-score-list"
            );
            if (existingReactionList && existingReactionList.dataset.processed)
              return;
            fetchReactions(postId)
              .then((reactions) => {
                const reactionListHtml = createReactionList(postId, reactions);
                if (existingReactionList)
                  existingReactionList.outerHTML = reactionListHtml;
                else {
                  const reactionLauncher = post.querySelector(
                    ".reactions-launcher"
                  );
                  reactionLauncher &&
                    reactionLauncher.insertAdjacentHTML(
                      "beforebegin",
                      reactionListHtml
                    );
                }
                const newReactionList = post.querySelector(
                  ".reaction-score-list"
                );
                newReactionList &&
                  ((newReactionList.dataset.processed = "true"),
                  // Add hover effect to reaction groups
                  newReactionList
                    .querySelectorAll(".reaction-group")
                    .forEach((group) => {
                      const popup = group.querySelector(
                        ".reaction-users-popup"
                      );
                      let isHovering = !1;
                      group.addEventListener("mouseenter", (e) => {
                        (isHovering = !0), showPopup(group, popup);
                      }),
                        group.addEventListener("mouseleave", () => {
                          (isHovering = !1),
                            (function (popup) {
                              popup.style.display = "none";
                            })(popup);
                        }),
                        // Add scroll event listener
                        window.addEventListener("scroll", () => {
                          isHovering && showPopup(group, popup);
                        });
                    }));
                // Update the reaction launcher
                const reactionLauncher = post.querySelector(
                  ".reactions-launcher"
                );
                if (reactionLauncher) {
                  const reactionButton =
                    reactionLauncher.querySelector(".reaction-button");
                  if (reactionButton) {
                    // Check if a reaction is selected
                    const selectedReaction =
                      reactionButton.querySelector("img");
                    if (selectedReaction && GM_getValue("leftMode", !0)) {
                      // Replace the button content with an "X" icon and center-align it
                      (reactionButton.innerHTML =
                        '\n                <svg class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">\n                  <path d="M576.3,877.3c-30.5,7.2-62.1,10.9-93.7,10.9c-223.3,0-405-181.7-405-405s181.7-405,405-405c223.3,0,405,181.7,405,405c0,32.8-3.9,65.5-11.7,97.1c-4.5,18.1,6.6,36.4,24.7,40.8c18.1,4.7,36.4-6.5,40.8-24.7c9.1-36.9,13.7-75,13.7-113.3c0-260.6-212-472.5-472.5-472.5C222,10.6,10,222.6,10,483.1c0,260.6,212,472.6,472.5,472.6c36.9,0,73.7-4.3,109.3-12.7c18.1-4.3,29.4-22.4,25-40.6C612.6,884.2,594.4,872.9,576.3,877.3z"></path>\n                  <path d="M250.2,594.7c-14.7,11.5-17.3,32.7-5.8,47.4c58,74.2,145.2,116.7,239.3,116.7c95.1,0,182.9-43.3,240.9-118.7c11.4-14.8,8.6-35.9-6.2-47.3s-35.9-8.6-47.3,6.2c-45.1,58.7-113.4,92.3-187.4,92.3c-73.2,0-141-33.1-186.2-90.8C286.1,585.8,264.8,583.3,250.2,594.7z"></path>\n                  <path d="M382.4,435.9v-67.5c0-28-22.6-50.6-50.6-50.6s-50.6,22.6-50.6,50.6v67.5c0,28,22.6,50.6,50.6,50.6S382.4,463.8,382.4,435.9z"></path>\n                  <path d="M686.2,435.9v-67.5c0-28-22.7-50.6-50.6-50.6S585,340.4,585,368.3v67.5c0,28,22.7,50.6,50.6,50.6S686.2,463.8,686.2,435.9z"></path>\n                  <path d="M956.2,786.9H855V685.6c0-18.7-15.1-33.8-33.8-33.8s-33.8,15.1-33.8,33.8v101.3H686.2c-18.7,0-33.8,15.1-33.8,33.8s15.1,33.8,33.8,33.8h101.3v101.3c0,18.7,15.1,33.8,33.8,33.8s33.8-15.1,33.8-33.8V854.4h101.3c18.7,0,33.8-15.1,33.8-33.8S974.9,786.9,956.2,786.9z"></path>\n                </svg>\n              '),
                        reactionButton.classList.add("default-icon"),
                        reactionButton.classList.remove("remove-reaction"),
                        (reactionButton.title = "Add reaction"),
                        // Remove any existing inline styles that might interfere
                        (reactionButton.style.cssText = "");
                      // Highlight the user's reaction in the reaction list
                      const userReactionImage = selectedReaction.src,
                        userReactionGroup = newReactionList.querySelector(
                          `.reaction-group img[src="${userReactionImage}"]`
                        );
                      userReactionGroup &&
                        userReactionGroup
                          .closest(".reaction-group")
                          .classList.add("user-reacted");
                    }
                  }
                }
              })
              .catch((error) =>
                console.error("Error fetching reactions:", error)
              );
          })(post, postId);
      }
      function showPopup(group, popup) {
        // Show the popup
        popup.style.display = "block";
        // Position the popup
        const rect = group.getBoundingClientRect();
        let top = rect.bottom,
          left = rect.left;
        // Adjust if popup goes off-screen
        left + popup.offsetWidth > window.innerWidth &&
          (left = window.innerWidth - popup.offsetWidth),
          (popup.style.top = `${top}px`),
          (popup.style.left = `${left}px`);
      }
      function toggleLeftMode() {
        const currentMode = GM_getValue("leftMode", !1);
        GM_setValue("leftMode", !currentMode), window.location.reload();
      }
      function observePosts() {
        const style = document.createElement("style");
        (style.textContent =
          "\n      @media screen and (min-width: 768px) {\n        .post .content {\n          min-height: 125px;\n        }\n      }\n      .reactions-launcher .reaction-button.remove-reaction .icon {\n        font-size: 16px !important;\n        line-height: 1 !important;\n        margin: 0 !important;\n        height: auto !important; /* Override the fixed height */\n      }\n      .reaction-group.user-reacted {\n        background-color: #4A5A6A !important;\n      }\n      .reaction-group.user-reacted span {\n        color: #ffffff !important;\n      }\n    "),
          document.head.appendChild(style),
          (function () {
            const leftMode = GM_getValue("leftMode", !1),
              style =
                document.getElementById("rpghq-reaction-list-style") ||
                document.createElement("style");
            (style.id = "rpghq-reaction-list-style"),
              (style.textContent = leftMode
                ? "\n      .reactions-launcher > .reaction-button.default-icon {\n        padding-top: 7px !important;\n      }\n      .reaction-score-list, .reactions-launcher {\n        float: left !important;\n        margin-right: 4px !important;\n        padding-top: 10px !important;\n        margin: 0 0 5px 0 !important;\n        padding: 4px 4px 4px 0 !important;\n      }\n      .reactions-launcher {\n        display: flex !important;\n        align-items: center !important;\n      }\n      .reactions-launcher a.reaction-button {\n        display: flex !important;\n        align-items: center !important;\n        justify-content: center !important;\n        width: auto !important;\n        height: 16px !important;\n        padding: 0 !important;\n        background: none !important;\n      }\n      .reactions-launcher a.reaction-button svg {\n        width: 16px !important;\n        height: 16px !important;\n        fill: #dcddde !important;\n      }\n    "
                : ""),
              document.head.appendChild(style),
              leftMode &&
                document.querySelectorAll(".postbody").forEach((postbody) => {
                  const reactionLauncher = postbody.querySelector(
                      ".reactions-launcher"
                    ),
                    reactionScoreList = postbody.querySelector(
                      ".reaction-score-list"
                    );
                  reactionLauncher &&
                    reactionScoreList &&
                    reactionLauncher.previousElementSibling !==
                      reactionScoreList &&
                    reactionLauncher.parentNode.insertBefore(
                      reactionScoreList,
                      reactionLauncher
                    );
                });
          })(),
          (function () {
            if (window.innerWidth <= 768) {
              // Mobile view check
              const dropdown = document.querySelector(
                "#username_logged_in .dropdown-contents"
              );
              if (
                dropdown &&
                !document.getElementById("toggle-left-reactions-mode")
              ) {
                const leftModeEnabled = GM_getValue("leftMode", !1),
                  listItem = document.createElement("li"),
                  toggleButton = document.createElement("a");
                (toggleButton.id = "toggle-left-reactions-mode"),
                  (toggleButton.href = "#"),
                  (toggleButton.title = "Toggle Left Reactions Mode"),
                  (toggleButton.role = "menuitem"),
                  (toggleButton.innerHTML = `\n          <i class="icon fa-align-left fa-fw" aria-hidden="true"></i>\n          <span>Left Reactions Mode (${leftModeEnabled ? "On" : "Off"})</span>\n        `),
                  toggleButton.addEventListener("click", function (e) {
                    e.preventDefault(), toggleLeftMode();
                  }),
                  listItem.appendChild(toggleButton),
                  dropdown.insertBefore(listItem, dropdown.lastElementChild);
              }
            }
          })();
        new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            "childList" === mutation.type &&
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE)
                  if (node.classList.contains("post")) processPost(node);
                  else if (node.classList.contains("reaction-score-list")) {
                    const post = node.closest(".post");
                    post && processPost(post);
                  }
              });
          });
        }).observe(document.body, {
          childList: !0,
          subtree: !0,
        }),
          // Process existing posts
          document.querySelectorAll(".post").forEach(processPost);
      }
      GM_registerMenuCommand(
        "[Reaction List] Toggle Left Mode",
        toggleLeftMode
      ),
        "complete" === document.readyState ||
        "interactive" === document.readyState
          ? observePosts()
          : window.addEventListener("load", observePosts);
    },
  });
  // RPGHQ - Pin Threads
  /**
   * Adds a Pin button to threads so you can see them in board index
   * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
   * License: MIT
   *
   * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/pinThreads.md for documentation
   */ var pinThreads = Object.freeze({
    __proto__: null,
    init: function () {
      let menuCommandId = null;
      // Utility functions
      const util_getPinnedThreads = () =>
          GM_getValue("rpghq_pinned_threads", {}),
        util_setPinnedThreads = (threads) =>
          GM_setValue("rpghq_pinned_threads", threads),
        util_getPinnedForums = () => GM_getValue("rpghq_pinned_forums", {}),
        util_setPinnedForums = (forums) =>
          GM_setValue("rpghq_pinned_forums", forums),
        util_getShowOnNewPosts = () =>
          GM_getValue("rpghq_show_pinned_on_new_posts", !1),
        util_setShowOnNewPosts = (value) =>
          GM_setValue("rpghq_show_pinned_on_new_posts", value),
        util_getThreadId = () => {
          const match = window.location.href.match(/[?&]t=(\d+)/);
          if (match) return match[1];
          const topicTitleLink = document.querySelector("h2.topic-title a");
          if (topicTitleLink) {
            const topicUrlMatch = topicTitleLink.href.match(/[?&]t=(\d+)/);
            return topicUrlMatch ? topicUrlMatch[1] : null;
          }
          return null;
        },
        util_getForumId = () => {
          const match = window.location.href.match(/[?&]f=(\d+)/);
          return match ? match[1] : null;
        },
        util_getForumName = () => {
          const forumTitleElement = document.querySelector("h2.forum-title");
          return forumTitleElement
            ? forumTitleElement.textContent.trim()
            : null;
        },
        util_addStyle = (css) => GM_addStyle(css),
        util_fetchHtml = (url) =>
          new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
              method: "GET",
              url: url,
              headers: {
                "User-Agent": navigator.userAgent,
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                Referer: "https://rpghq.org/forums/",
                DNT: "1",
                Connection: "keep-alive",
                "Upgrade-Insecure-Requests": "1",
              },
              withCredentials: !0,
              timeout: 3e4,
              onload: (response) => resolve(response.responseText),
              onerror: (error) => reject(error),
              ontimeout: () => reject(new Error("Request timed out")),
            });
          }),
        util_parseHtml = (html) =>
          new DOMParser().parseFromString(html, "text/html");
      function toggleNewPostsDisplay() {
        const currentState = util_getShowOnNewPosts();
        util_setShowOnNewPosts(!currentState),
          updateMenuCommand(),
          location.reload();
      }
      function updateMenuCommand() {
        null !== menuCommandId && GM_unregisterMenuCommand(menuCommandId);
        const currentState = util_getShowOnNewPosts();
        menuCommandId = GM_registerMenuCommand(
          currentState
            ? "[Pinned Threads] Disable on New Posts"
            : "[Pinned Threads] Enable on New Posts",
          toggleNewPostsDisplay
        );
      }
      function togglePinThread(threadId, button) {
        const pinnedThreads = util_getPinnedThreads(),
          threadInfo = {
            title: document.querySelector(".topic-title").textContent.trim(),
            author: document.querySelector(".author").textContent.trim(),
            postTime: document
              .querySelector(".author time")
              .getAttribute("datetime"),
          };
        pinnedThreads.hasOwnProperty(threadId)
          ? delete pinnedThreads[threadId]
          : (pinnedThreads[threadId] = threadInfo),
          util_setPinnedThreads(pinnedThreads),
          updatePinButtonState(button, pinnedThreads.hasOwnProperty(threadId));
      }
      function createForumListItemHTML(forumId, forumInfo) {
        const forumClass =
          forumInfo.isUnread || !1 ? "forum_unread_subforum" : "forum_read";
        // Create breadcrumbs text based on whether it's a subforum
        let breadcrumbsText = forumInfo.breadcrumbs || "";
        return (
          forumInfo.parentForumName &&
            (breadcrumbsText = `Subforum of ${forumInfo.parentForumName}`),
          `\n        <li class="row content-processed" id="pinned-forum-${forumId}">\n          <dl class="row-item ${forumClass}">\n            <dt title="${forumInfo.name}">\n              <div class="list-inner">\n                <a href="${forumInfo.url}" class="forumtitle">${forumInfo.name}</a>\n                <br><span class="forum-path responsive-hide">${breadcrumbsText}</span>\n              </div>\n            </dt>\n            <dd class="posts">-</dd>\n            <dd class="views">-</dd>\n            <dd class="lastpost">              -</dd>\n          </dl>\n        </li>\n      `
        );
      }
      function createCustomThreadRowHTML(
        threadId,
        title,
        forumName,
        forumUrl,
        errorMessage = ""
      ) {
        const forumInfo =
          forumName && forumUrl
            ? `» in <a href="${forumUrl}">${forumName}</a>`
            : "";
        return `\n        <li class="row bg1 content-processed" id="pinned-thread-${threadId}">\n          <dl class="row-item topic_read">\n            <dt>\n              <div class="list-inner">\n                <a href="https://rpghq.org/forums/viewtopic.php?t=${threadId}" class="topictitle">${errorMessage ? `${title} (${errorMessage})` : title}</a>\n                ${forumInfo ? `<br><span class="responsive-hide">${forumInfo}</span>` : ""}\n              </div>\n            </dt>\n            <dd class="posts">-</dd>\n            <dd class="views">-</dd>\n          </dl>\n        </li>\n      `;
      }
      async function fetchThreadRowFromForum(
        threadTitle,
        forumUrl,
        page = 1,
        maxPages = 5
      ) {
        const url = `${forumUrl}&start=${25 * (page - 1)}`;
        try {
          const html = await util_fetchHtml(url),
            doc = util_parseHtml(html);
          if (doc.querySelector('form[action="./ucp.php?mode=login"]'))
            throw new Error(
              "Redirected to login page. User might not be authenticated."
            );
          const threadRows = doc.querySelectorAll(".topiclist.topics .row");
          for (const row of threadRows) {
            const rowTitleElement = row.querySelector(".topictitle");
            if (rowTitleElement) {
              if (rowTitleElement.textContent.trim() === threadTitle)
                return row.outerHTML;
            }
          }
          // If thread not found on this page, check the next page
          if (doc.querySelector(".pagination .next a") && page < maxPages)
            return fetchThreadRowFromForum(
              threadTitle,
              forumUrl,
              page + 1,
              maxPages
            );
          // If no next page or max pages reached, thread not found
          throw new Error(`Thread not found after checking ${page} pages`);
        } catch (error) {
          throw new Error(`Error fetching thread row: ${error.message}`);
        }
      }
      function createErrorListItemHTML(threadId) {
        return `\n        <li class="row bg1 content-processed" id="pinned-thread-${threadId}">\n          <dl class="row-item topic_read">\n            <dt>\n              <div class="list-inner">\n                <span class="topic-title">\n                  Error loading thread\n                </span>\n              </div>\n            </dt>\n            <dd class="posts">-</dd>\n            <dd class="views">-</dd>\n          </dl>\n        </li>\n      `;
      }
      function addResponsiveStyle() {
        util_addStyle(
          "\n        #pinned-threads, #pinned-forums {\n          margin-bottom: 20px;\n        }\n        #pinned-threads .topiclist.topics, #pinned-forums .topiclist.forums {\n          margin-top: 0;\n        }\n        .pin-button {\n          margin-left: 10px;\n          cursor: pointer;\n        }\n        #pinned-threads .topic-poster .by, #pinned-forums .forum-poster .by {\n          display: none;\n        }\n        .zomboid-status {\n          margin-top: 5px;\n          font-size: 0.9em;\n          text-align: left;\n          color: #8c8c8c;\n        }\n        .zomboid-status .online-players {\n          font-weight: bold;\n          color: #BFC0C5;\n        }\n        .zomboid-status .last-updated {\n          font-size: 0.8em;\n          font-style: italic;\n        }\n        #pinned-threads .pagination, #pinned-forums .pagination {\n          display: none !important;\n        }\n        .forum-path {\n          font-size: 0.9em;\n          color: #8c8c8c;\n        }\n        @media (max-width: 700px) {\n          #pinned-threads .responsive-show, #pinned-forums .responsive-show {\n            display: none !important;\n          }\n          #pinned-threads .responsive-hide, #pinned-forums .responsive-hide {\n            display: none !important;\n          }\n        }\n      "
        );
      }
      function createDropdownContainer() {
        const container = document.createElement("div");
        return (
          (container.className =
            "dropdown-container dropdown-button-control topic-tools"),
          container
        );
      }
      function updatePinButtonState(button, isPinned) {
        (button.innerHTML = isPinned
          ? '<i class="icon fa-thumb-tack fa-fw" aria-hidden="true"></i><span>Unpin</span>'
          : '<i class="icon fa-thumb-tack fa-fw" aria-hidden="true"></i><span>Pin</span>'),
          (button.title = isPinned ? "Unpin" : "Pin");
      }
      updateMenuCommand(),
        // Main execution
        window.location.href.includes("/viewtopic.php")
          ? // Thread pinning functions
            (function () {
              const actionBar = document.querySelector(".action-bar.bar-top"),
                threadId = util_getThreadId();
              if (
                actionBar &&
                threadId &&
                !document.getElementById("pin-thread-button")
              ) {
                const dropdownContainer = createDropdownContainer(),
                  pinButton = (function (threadId) {
                    const button = document.createElement("span");
                    (button.id = "pin-thread-button"),
                      (button.className =
                        "button button-secondary dropdown-trigger");
                    const isPinned =
                      util_getPinnedThreads().hasOwnProperty(threadId);
                    return (
                      updatePinButtonState(button, isPinned),
                      button.addEventListener("click", (e) => {
                        e.preventDefault(), togglePinThread(threadId, button);
                      }),
                      button
                    );
                  })(
                    // Forum pinning functions
                    threadId
                  );
                dropdownContainer.appendChild(pinButton),
                  actionBar.insertBefore(
                    dropdownContainer,
                    actionBar.firstChild
                  ),
                  addResponsiveStyle();
              }
            })()
          : window.location.href.includes("/viewforum.php")
            ? (function () {
                const actionBar = document.querySelector(".action-bar.bar-top"),
                  forumId = util_getForumId(),
                  forumName = util_getForumName();
                if (
                  actionBar &&
                  forumId &&
                  forumName &&
                  !document.getElementById("pin-forum-button")
                ) {
                  const dropdownContainer = createDropdownContainer(),
                    pinButton = (function (forumId) {
                      const button = document.createElement("span");
                      (button.id = "pin-forum-button"),
                        (button.className =
                          "button button-secondary dropdown-trigger");
                      const isPinned =
                        util_getPinnedForums().hasOwnProperty(forumId);
                      return (
                        updatePinButtonState(button, isPinned),
                        button.addEventListener("click", (e) => {
                          e.preventDefault(),
                            (function (forumId, button) {
                              const pinnedForums = util_getPinnedForums(),
                                forumInfo = (function () {
                                  const forumName = util_getForumName(),
                                    breadcrumbs =
                                      document.querySelectorAll(".crumb"),
                                    breadcrumbsPath = Array.from(breadcrumbs)
                                      .filter((crumb) =>
                                        crumb.querySelector("a")
                                      )
                                      .map((crumb) =>
                                        crumb
                                          .querySelector("a")
                                          .textContent.trim()
                                      )
                                      .join(" » ");
                                  return {
                                    name: forumName,
                                    breadcrumbs: breadcrumbsPath,
                                    url: window.location.href.split(
                                      "&start="
                                    )[0],
                                  };
                                })();
                              pinnedForums.hasOwnProperty(forumId)
                                ? delete pinnedForums[forumId]
                                : (pinnedForums[forumId] = forumInfo);
                              util_setPinnedForums(pinnedForums),
                                updatePinButtonState(
                                  button,
                                  pinnedForums.hasOwnProperty(forumId)
                                );
                            })(forumId, button);
                        }),
                        button
                      );
                    })(forumId);
                  dropdownContainer.appendChild(pinButton),
                    // Add the pin button at the start of the action bar
                    actionBar.insertBefore(
                      dropdownContainer,
                      actionBar.firstChild
                    ),
                    addResponsiveStyle();
                }
              })()
            : (window.location.href.includes("/index.php") ||
                window.location.href.endsWith("/forums/") ||
                window.location.href.includes("/forums/home") ||
                (window.location.href.includes(
                  "/search.php?search_id=newposts"
                ) &&
                  util_getShowOnNewPosts())) &&
              (async function () {
                const pageBody = document.querySelector("#page-body");
                if (!pageBody) return;
                const pinnedThreads = util_getPinnedThreads(),
                  pinnedForums = util_getPinnedForums();
                // If there's nothing to display, exit early
                if (
                  0 === Object.keys(pinnedThreads).length &&
                  0 === Object.keys(pinnedForums).length
                )
                  return;
                // Determine the correct insertion point based on the current page
                let insertionPoint;
                insertionPoint = window.location.href.includes("/search.php")
                  ? (function (pageBody) {
                      const actionBar = pageBody.querySelector(
                        ".action-bar.bar-top"
                      );
                      return actionBar
                        ? actionBar.nextElementSibling
                        : pageBody.querySelector(".forumbg");
                    })(pageBody)
                  : pageBody.querySelector(".index-left") ||
                    pageBody.querySelector(".forumbg");
                if (insertionPoint) {
                  // Create and insert pinned sections if needed
                  if (Object.keys(pinnedForums).length > 0) {
                    const pinnedForumsSection = (function () {
                      const section = document.createElement("div");
                      return (
                        (section.id = "pinned-forums"),
                        (section.className = "forabg"),
                        (section.innerHTML =
                          '\n        <div class="inner">\n          <ul class="topiclist content-processed">\n            <li class="header">\n              <dl class="row-item">\n                <dt><div class="list-inner"><i class="icon fa-thumb-tack fa-fw icon-sm" aria-hidden="true"></i> Pinned Forums</div></dt>\n                <dd class="posts">Topics</dd>\n                <dd class="views">Posts</dd>\n              </dl>\n            </li>\n          </ul>\n          <ul class="topiclist forums content-processed" id="pinned-forums-list"></ul>\n        </div>\n      '),
                        section
                      );
                    })();
                    // Insert the pinned forums section
                    insertionPoint.classList.contains("index-left")
                      ? insertionPoint.insertAdjacentElement(
                          "afterbegin",
                          pinnedForumsSection
                        )
                      : insertionPoint.parentNode.insertBefore(
                          pinnedForumsSection,
                          insertionPoint
                        ),
                      (function (pinnedSection) {
                        const pinnedForums = util_getPinnedForums(),
                          pinnedList = pinnedSection.querySelector(
                            "#pinned-forums-list"
                          );
                        // Add each forum to the list
                        Object.entries(pinnedForums)
                          .sort(([, a], [, b]) =>
                            a.name.localeCompare(b.name, void 0, {
                              numeric: !0,
                              sensitivity: "base",
                            })
                          )
                          .forEach(([forumId, forumInfo]) => {
                            // First try to find the forum row on the page
                            const existingRow = (function (forumId) {
                              // Look for forum rows on the current page
                              const forumRows = document.querySelectorAll(
                                ".topiclist.forums .row"
                              );
                              for (const row of forumRows) {
                                const forumLink =
                                  row.querySelector("a.forumtitle");
                                if (
                                  forumLink &&
                                  forumLink.href.includes(`f=${forumId}`)
                                )
                                  return row;
                              }
                              // If not found in main forums, look for it in subforums
                              const subforums =
                                document.querySelectorAll("a.subforum");
                              for (const subforum of subforums)
                                if (subforum.href.includes(`f=${forumId}`)) {
                                  // Create a synthetic row based on the subforum link
                                  const isUnread =
                                      subforum.classList.contains("unread"),
                                    forumName = subforum.textContent.trim();
                                  // Find the parent forum name
                                  let parentForumName = "Unknown Forum";
                                  const forumtitle = subforum
                                    .closest(".row")
                                    ?.querySelector("a.forumtitle");
                                  forumtitle &&
                                    (parentForumName =
                                      forumtitle.textContent.trim());
                                  const row = document.createElement("div");
                                  return (
                                    (row.dataset.isSubforum = "true"),
                                    (row.dataset.isUnread = isUnread),
                                    (row.dataset.forumName = forumName),
                                    (row.dataset.forumUrl = subforum.href),
                                    (row.dataset.parentForumName =
                                      parentForumName),
                                    row
                                  );
                                }
                              return null;
                            })(forumId);
                            if (existingRow)
                              if (
                                existingRow.dataset &&
                                existingRow.dataset.isSubforum
                              ) {
                                // This is a synthetic row from a subforum link
                                const isUnread =
                                  "true" === existingRow.dataset.isUnread;
                                (forumInfo.isUnread = isUnread),
                                  // Add parent forum name to the forum info
                                  existingRow.dataset.parentForumName &&
                                    (forumInfo.parentForumName =
                                      existingRow.dataset.parentForumName);
                                const html = createForumListItemHTML(
                                  forumId,
                                  forumInfo
                                );
                                pinnedList.insertAdjacentHTML(
                                  "beforeend",
                                  html
                                );
                              } else {
                                // This is a regular forum row
                                const clonedRow = existingRow.cloneNode(!0);
                                clonedRow.id = `pinned-forum-${forumId}`;
                                // Check if this forum is unread
                                const dlElement = clonedRow.querySelector("dl");
                                (dlElement &&
                                  (dlElement.classList.contains(
                                    "forum_unread"
                                  ) ||
                                    dlElement.classList.contains(
                                      "forum_unread_subforum"
                                    ) ||
                                    dlElement.classList.contains(
                                      "forum_unread_locked"
                                    ))) ||
                                  // Make sure we use the read class
                                  (dlElement &&
                                    (dlElement.className =
                                      dlElement.className.replace(
                                        /forum_\w+/g,
                                        "forum_read"
                                      ))),
                                  clonedRow
                                    .querySelectorAll("strong")
                                    .forEach((section) => {
                                      if (
                                        section.textContent.includes(
                                          "Subforums:"
                                        )
                                      ) {
                                        // Remove the "Subforums:" text
                                        section.remove();
                                        // Find and remove all subforum links that follow
                                        const listInner =
                                          clonedRow.querySelector(
                                            ".list-inner"
                                          );
                                        listInner &&
                                          listInner
                                            .querySelectorAll("a.subforum")
                                            .forEach((link) => {
                                              link.remove();
                                            });
                                      }
                                    });
                                // Remove subforum sections and clean up commas
                                // Remove any text nodes that might contain "Subforums:" text or stray commas
                                const listInner =
                                  clonedRow.querySelector(".list-inner");
                                if (listInner) {
                                  const walker = document.createTreeWalker(
                                      listInner,
                                      NodeFilter.SHOW_TEXT
                                    ),
                                    textNodesToProcess = [];
                                  for (; walker.nextNode(); ) {
                                    const textNode = walker.currentNode;
                                    (textNode.textContent.includes(
                                      "Subforums:"
                                    ) ||
                                      /^\s*,\s*$/.test(textNode.textContent)) &&
                                      textNodesToProcess.push(textNode);
                                  }
                                  textNodesToProcess.forEach((node) => {
                                    // If it's just commas and whitespace, remove it entirely
                                    /^\s*[,\s]*\s*$/.test(node.textContent)
                                      ? node.remove()
                                      : // Otherwise, clean up any trailing commas
                                        (node.textContent = node.textContent
                                          .replace(/\s*,\s*,\s*/g, "")
                                          .trim());
                                  });
                                }
                                // Remove any unwanted elements or classes
                                clonedRow
                                  .querySelectorAll(".pagination")
                                  .forEach((el) => el.remove()),
                                  clonedRow.classList.add("content-processed"),
                                  pinnedList.appendChild(clonedRow);
                              }
                            else
                              // If not found, create a new row
                              pinnedList.insertAdjacentHTML(
                                "beforeend",
                                createForumListItemHTML(forumId, forumInfo)
                              );
                          });
                      })(pinnedForumsSection);
                  }
                  if (Object.keys(pinnedThreads).length > 0) {
                    const pinnedThreadsSection = (function () {
                      const section = document.createElement("div");
                      return (
                        (section.id = "pinned-threads"),
                        (section.className = "forabg"),
                        (section.innerHTML =
                          '\n        <div class="inner">\n          <ul class="topiclist content-processed">\n            <li class="header">\n              <dl class="row-item">\n                <dt><div class="list-inner"><i class="icon fa-thumb-tack fa-fw icon-sm" aria-hidden="true"></i> Pinned Topics</div></dt>\n                <dd class="posts">Replies</dd>\n                <dd class="views">Views</dd>\n                <dd class="lastpost">Last Post</dd>\n              </dl>\n            </li>\n          </ul>\n          <ul class="topiclist topics content-processed" id="pinned-threads-list"></ul>\n        </div>\n      '),
                        section
                      );
                    })();
                    // Insert the pinned threads section
                    if (insertionPoint.classList.contains("index-left"))
                      insertionPoint.insertAdjacentElement(
                        "afterbegin",
                        pinnedThreadsSection
                      );
                    else if (Object.keys(pinnedForums).length > 0) {
                      // If we already have pinned forums, insert after that section
                      const pinnedForumsSection =
                        document.getElementById("pinned-forums");
                      pinnedForumsSection
                        ? pinnedForumsSection.insertAdjacentElement(
                            "afterend",
                            pinnedThreadsSection
                          )
                        : insertionPoint.parentNode.insertBefore(
                            pinnedThreadsSection,
                            insertionPoint
                          );
                    } else
                      insertionPoint.parentNode.insertBefore(
                        pinnedThreadsSection,
                        insertionPoint
                      );
                    await (async function (pinnedSection) {
                      const pinnedThreads = util_getPinnedThreads(),
                        pinnedList = pinnedSection.querySelector(
                          "#pinned-threads-list"
                        ),
                        threadIds = Object.keys(pinnedThreads),
                        existingThreadRows = (function (threadIds) {
                          const result = new Map(),
                            threadRowsOnPage = document.querySelectorAll(
                              ".topiclist.topics .row"
                            );
                          for (const row of threadRowsOnPage) {
                            const threadLink =
                              row.querySelector("a.topictitle");
                            if (threadLink)
                              for (const threadId of threadIds)
                                if (threadLink.href.includes(`t=${threadId}`)) {
                                  result.set(threadId, row);
                                  break;
                                }
                          }
                          return result;
                        })(threadIds),
                        threadsToFetch = threadIds.filter(
                          (id) => !existingThreadRows.has(id)
                        );
                      // Create loading placeholders for threads we need to fetch
                      threadsToFetch.forEach((threadId) => {
                        pinnedList.insertAdjacentHTML(
                          "beforeend",
                          (function (threadId) {
                            return `\n        <li class="row bg1 content-processed" id="pinned-thread-${threadId}">\n          <dl class="row-item topic_read">\n            <dt>\n              <div class="list-inner">\n                <span class="topic-title">\n                  <i class="fa fa-spinner fa-spin"></i> Loading...\n                </span>\n              </div>\n            </dt>\n            <dd class="posts">-</dd>\n            <dd class="views">-</dd>\n            <dd class="lastpost"><span style="padding-left: 1.5em;">-</span></dd>\n          </dl>\n        </li>\n      `;
                          })(threadId)
                        );
                      });
                      // Set up Intersection Observer
                      let isVisible = !1;
                      const observer = new IntersectionObserver(
                        (entries) => {
                          isVisible = entries[0].isIntersecting;
                        },
                        {
                          threshold: 0.1,
                        }
                      );
                      observer.observe(pinnedSection);
                      // Store the initial height
                      const initialHeight = pinnedSection.offsetHeight;
                      // Add existing thread rows first
                      for (const [
                        threadId,
                        row,
                      ] of existingThreadRows.entries()) {
                        const clonedRow = row.cloneNode(!0);
                        (clonedRow.id = `pinned-thread-${threadId}`),
                          // Remove any unwanted elements or classes
                          clonedRow
                            .querySelectorAll(".pagination")
                            .forEach((el) => el.remove()),
                          clonedRow.classList.add("content-processed");
                        // Find the placeholder if it exists and replace it, or just append
                        const placeholder = pinnedList.querySelector(
                          `#pinned-thread-${threadId}`
                        );
                        placeholder
                          ? pinnedList.replaceChild(clonedRow, placeholder)
                          : pinnedList.appendChild(clonedRow);
                      }
                      // Fetch and process threads that don't exist on the page
                      if (threadsToFetch.length > 0) {
                        const threadsData = await Promise.all(
                          threadsToFetch.map((threadId) =>
                            (async function (threadId) {
                              try {
                                const {
                                  title: title,
                                  forumUrl: forumUrl,
                                  forumName: forumName,
                                  status: status,
                                } = await (async function (threadId) {
                                  const url = `https://rpghq.org/forums/viewtopic.php?t=${threadId}`,
                                    html = await util_fetchHtml(url),
                                    doc = util_parseHtml(html),
                                    titleElement =
                                      doc.querySelector("h2.topic-title a"),
                                    breadcrumbs = doc.querySelectorAll(
                                      "#nav-breadcrumbs .crumb"
                                    ),
                                    lastBreadcrumb =
                                      breadcrumbs[breadcrumbs.length - 1];
                                  if (!titleElement || !lastBreadcrumb)
                                    throw new Error(
                                      "Thread title or forum not found"
                                    );
                                  const title = titleElement.textContent.trim(),
                                    forumUrl =
                                      lastBreadcrumb.querySelector("a").href,
                                    forumName = lastBreadcrumb
                                      .querySelector("a")
                                      .textContent.trim();
                                  let status = null;
                                  return (
                                    "2756" === threadId &&
                                      (status = (function (doc) {
                                        const playerCountElement =
                                          doc.querySelector(
                                            'span[style="background-color:black"] strong.text-strong'
                                          );
                                        if (playerCountElement) {
                                          const statusDiv =
                                              playerCountElement.closest("div"),
                                            onlinePlayersElements =
                                              statusDiv.querySelectorAll(
                                                'span[style="font-size:85%;line-height:116%"]'
                                              ),
                                            lastUpdatedElement =
                                              statusDiv.querySelector(
                                                'span[style="font-size:55%;line-height:116%"] em'
                                              );
                                          if (
                                            playerCountElement &&
                                            lastUpdatedElement
                                          )
                                            return {
                                              playerCount:
                                                playerCountElement.textContent,
                                              onlinePlayers: Array.from(
                                                onlinePlayersElements
                                              ).map((el) => el.textContent),
                                              lastUpdated:
                                                lastUpdatedElement.textContent,
                                            };
                                        }
                                        return null;
                                      })(doc)),
                                    {
                                      title: title,
                                      forumUrl: forumUrl,
                                      forumName: forumName,
                                      status: status,
                                    }
                                  );
                                })(threadId);
                                let rowHTML = await fetchThreadRowFromForum(
                                  title,
                                  forumUrl
                                );
                                if (rowHTML) {
                                  rowHTML = (function (
                                    rowHTML,
                                    threadId,
                                    status,
                                    forumName,
                                    forumUrl
                                  ) {
                                    const row = new DOMParser()
                                      .parseFromString(rowHTML, "text/html")
                                      .querySelector(".row");
                                    if (!row) return rowHTML;
                                    // Add content-processed class if it's not already there
                                    row.classList.contains(
                                      "content-processed"
                                    ) || row.classList.add("content-processed"),
                                      // Change "sticky_" classes to "topic_"
                                      row
                                        .querySelectorAll('*[class*="sticky_"]')
                                        .forEach((element) => {
                                          element.className =
                                            element.className.replace(
                                              /\bsticky_/g,
                                              "topic_"
                                            );
                                        });
                                    // Remove pagination
                                    const pagination =
                                      row.querySelector(".pagination");
                                    pagination &&
                                      (pagination.style.display = "none"),
                                      row
                                        .querySelectorAll(".rh_tag")
                                        .forEach((tag) => tag.remove());
                                    // Remove rh_tag elements
                                    // Check if the thread is unread
                                    const dlElement = row.querySelector("dl"),
                                      isUnread =
                                        dlElement &&
                                        (dlElement.classList.contains(
                                          "topic_unread"
                                        ) ||
                                          dlElement.classList.contains(
                                            "topic_unread_hot"
                                          ) ||
                                          dlElement.classList.contains(
                                            "topic_unread_mine"
                                          ) ||
                                          dlElement.classList.contains(
                                            "topic_unread_hot_mine"
                                          )),
                                      iconElement =
                                        row.querySelector(".icon.fa-file");
                                    iconElement &&
                                      (iconElement.classList.remove(
                                        "icon-lightgray",
                                        "icon-red"
                                      ),
                                      iconElement.classList.add(
                                        isUnread ? "icon-red" : "icon-lightgray"
                                      ));
                                    // Modify the topic hyperlink
                                    const topicLink =
                                      row.querySelector(".topictitle");
                                    if (topicLink) {
                                      const dlElement = row.querySelector("dl");
                                      if (
                                        !dlElement ||
                                        !(
                                          dlElement.classList.contains(
                                            "topic_unread"
                                          ) ||
                                          dlElement.classList.contains(
                                            "topic_unread_hot"
                                          ) ||
                                          dlElement.classList.contains(
                                            "topic_unread_mine"
                                          ) ||
                                          dlElement.classList.contains(
                                            "topic_unread_hot_mine"
                                          )
                                        )
                                      ) {
                                        const currentHref =
                                          topicLink.getAttribute("href");
                                        topicLink.setAttribute(
                                          "href",
                                          `${currentHref}&view=unread`
                                        );
                                      }
                                    }
                                    // Add forum section information
                                    const leftBox = row.querySelector(
                                      ".responsive-hide.left-box"
                                    );
                                    if (leftBox) {
                                      const lastTimeElement =
                                        leftBox.querySelector("time");
                                      if (lastTimeElement) {
                                        const forumLink =
                                          document.createElement("a");
                                        (forumLink.href = forumUrl),
                                          (forumLink.textContent = forumName),
                                          document.createTextNode("  » in "),
                                          lastTimeElement.insertAdjacentElement(
                                            "afterend",
                                            forumLink
                                          ),
                                          lastTimeElement.insertAdjacentText(
                                            "afterend",
                                            "  » in "
                                          );
                                      }
                                    }
                                    // Add id to the row for easier manipulation later if needed
                                    return (
                                      (row.id = `pinned-thread-${threadId}`),
                                      row.outerHTML
                                    );
                                  })(rowHTML, threadId, 0, forumName, forumUrl);
                                  const sortableTitle = title.replace(
                                    /^[【】\[\]\s]+/,
                                    ""
                                  );
                                  return {
                                    threadId: threadId,
                                    title: title,
                                    sortableTitle: sortableTitle,
                                    rowHTML: rowHTML,
                                  };
                                }
                                {
                                  // Create a custom row HTML for threads that can't be found in the forum list
                                  rowHTML = createCustomThreadRowHTML(
                                    threadId,
                                    title,
                                    forumName,
                                    forumUrl,
                                    "Thread not found in forum list"
                                  );
                                  const sortableTitle = title.replace(
                                    /^[【】\[\]\s]+/,
                                    ""
                                  );
                                  return {
                                    threadId: threadId,
                                    title: title,
                                    sortableTitle: sortableTitle,
                                    rowHTML: rowHTML,
                                  };
                                }
                              } catch (error) {
                                return {
                                  threadId: threadId,
                                  title: `Error loading thread ${threadId}`,
                                  sortableTitle: `Error loading thread ${threadId}`,
                                  rowHTML: createCustomThreadRowHTML(
                                    threadId,
                                    `Error loading thread ${threadId}`,
                                    "",
                                    "",
                                    `Error: ${error.message || "Unknown error"}`
                                  ),
                                };
                              }
                            })(threadId, pinnedThreads[threadId]).catch(
                              (error) => ({
                                threadId: threadId,
                                title: `Error loading thread ${threadId}`,
                                sortableTitle: `error loading thread ${threadId}`,
                                rowHTML: createErrorListItemHTML(threadId),
                              })
                            )
                          )
                        );
                        // Sort threads
                        threadsData.sort((a, b) =>
                          a.title.localeCompare(b.title, void 0, {
                            numeric: !0,
                            sensitivity: "base",
                            ignorePunctuation: !1,
                          })
                        ),
                          // Update the list with sorted threads
                          threadsData.forEach((threadData) => {
                            const placeholder = pinnedList.querySelector(
                              `#pinned-thread-${threadData.threadId}`
                            );
                            placeholder
                              ? (placeholder.outerHTML = threadData.rowHTML)
                              : pinnedList.insertAdjacentHTML(
                                  "beforeend",
                                  threadData.rowHTML
                                );
                          });
                      }
                      // Sort all thread rows now that we have all of them
                      const allRows = Array.from(pinnedList.children);
                      allRows.sort((a, b) => {
                        const aTitle =
                            a.querySelector(".topictitle")?.textContent || "",
                          bTitle =
                            b.querySelector(".topictitle")?.textContent || "";
                        return aTitle.localeCompare(bTitle, void 0, {
                          numeric: !0,
                          sensitivity: "base",
                          ignorePunctuation: !1,
                        });
                      }),
                        // Re-append in sorted order
                        allRows.forEach((row) => pinnedList.appendChild(row));
                      // Adjust scroll position if necessary
                      const heightDifference =
                        pinnedSection.offsetHeight - initialHeight;
                      !isVisible &&
                        heightDifference > 0 &&
                        window.scrollBy(0, heightDifference),
                        // Clean up the observer
                        observer.disconnect();
                    })(pinnedThreadsSection);
                  }
                }
              })();
    },
  });
  // RPGHQ - Notification Improver
  /**
   * Adds smileys to reacted notifs, adds colors, idk just makes em cooler I guess
   * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
   * License: MIT
   *
   * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/notifications.md for documentation
   */ let _getScriptSetting = () => {}; // Placeholder
  var notifications = Object.freeze({
    __proto__: null,
    init: function ({ getScriptSetting: getScriptSetting }) {
      _getScriptSetting = getScriptSetting;
      // Store the passed function
      const referenceBackgroundColor = _getScriptSetting(
          "notifications",
          "referenceBackgroundColor",
          "rgba(23, 27, 36, 0.5)"
        ),
        referenceTextColor = _getScriptSetting(
          "notifications",
          "referenceTextColor",
          "#ffffff"
        ),
        timestampColor = _getScriptSetting(
          "notifications",
          "timestampColor",
          "#888888"
        ),
        REFERENCE_STYLE = {
          display: "inline-block",
          background: referenceBackgroundColor,
          color: referenceTextColor,
          padding: "2px 4px",
          borderRadius: "2px",
          zIndex: "-1",
          maxWidth: "98%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
        NOTIFICATION_BLOCK_STYLE = {
          position: "relative",
          paddingBottom: "20px",
        },
        NOTIFICATION_TIME_STYLE = {
          position: "absolute",
          bottom: "2px",
          right: "2px",
          fontSize: "0.85em",
          color: timestampColor,
        },
        NOTIFICATIONS_TIME_STYLE = {
          position: "absolute",
          bottom: "2px",
          left: "2px",
          fontSize: "0.85em",
          color: "#888",
        },
        Utils = {
          createElement: (tag, attributes = {}, innerHTML = "") => {
            const element = document.createElement(tag);
            return (
              Object.assign(element, attributes),
              (element.innerHTML = innerHTML),
              element
            );
          },
          formatReactions: (reactions) =>
            `<span style="display: inline-flex; margin-left: 2px; vertical-align: middle;">\n          ${reactions.map((reaction) => `\n            <img src="${reaction.image}" alt="${reaction.name}" title="${reaction.username}: ${reaction.name}" \n                 reaction-username="${reaction.username}"\n                 style="height: 1em !important; width: auto !important; vertical-align: middle !important; margin-right: 2px !important;">\n          `).join("")}\n        </span>`,
          styleReference: (element) => {
            Object.assign(element.style, REFERENCE_STYLE);
          },
          extractPostId: (url) => {
            const match = (url || "").match(/p=(\d+)/);
            return match ? match[1] : null;
          },
          sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
          cleanupPostContent: (content) => {
            // 2. Remove ONLY the first occurrence of an opening quote tag.
            const firstOpenIdx =
              // 1. Normalize any [quote="..."] tags to [quote=...]
              (content = content.replace(
                /\[quote="([^"]+)"\]/g,
                "[quote=$1]"
              )).indexOf("[quote=");
            if (-1 !== firstOpenIdx) {
              const firstCloseBracket = content.indexOf("]", firstOpenIdx);
              -1 !== firstCloseBracket &&
                // Remove the tag from [quote= ... ]
                (content =
                  content.slice(0, firstOpenIdx) +
                  content.slice(firstCloseBracket + 1));
            }
            // 3. Remove ONLY the last occurrence of a closing quote tag.
            const lastCloseIdx = content.lastIndexOf("[/quote]");
            return (
              -1 !== lastCloseIdx &&
                // Remove that closing tag (8 characters long).
                (content =
                  content.slice(0, lastCloseIdx) +
                  content.slice(lastCloseIdx + 8)),
              // 4. Aggressively remove any inner quote blocks.
              (content = Utils.aggressiveRemoveInnerQuotes(content)).trim()
            );
          },
          aggressiveRemoveInnerQuotes: (text) => {
            let result = "",
              i = 0,
              depth = 0;
            for (; i < text.length; )
              // Check for an opening quote tag.
              if (text.startsWith("[quote=", i)) {
                depth++;
                const endBracket = text.indexOf("]", i);
                if (-1 === endBracket)
                  // Malformed tag; break out.
                  break;
                i = endBracket + 1;
              }
              // Check for a closing quote tag.
              else
                text.startsWith("[/quote]", i)
                  ? (depth > 0 && depth--, (i += 8))
                  : // Only append characters that are NOT inside a quote block.
                    (0 === depth && (result += text[i]), i++);
            return result;
          },
          removeBBCode: (text) =>
            text
              .replace(/\[color=[^\]]*\](.*?)\[\/color\]/gi, "$1")
              .replace(/\[size=[^\]]*\](.*?)\[\/size\]/gi, "$1")
              .replace(/\[b\](.*?)\[\/b\]/gi, "$1")
              .replace(/\[i\](.*?)\[\/i\]/gi, "$1")
              .replace(/\[u\](.*?)\[\/u\]/gi, "$1")
              .replace(/\[s\](.*?)\[\/s\]/gi, "$1")
              .replace(/\[url=[^\]]*\](.*?)\[\/url\]/gi, "$1")
              .replace(/\[url\](.*?)\[\/url\]/gi, "$1")
              .replace(/\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]/gi, "")
              .replace(/\[img\](.*?)\[\/img\]/gi, "")
              .replace(/\[media\](.*?)\[\/media\]/gi, "")
              .replace(/\[webm\](.*?)\[\/webm\]/gi, "")
              .replace(/\[code\](.*?)\[\/code\]/gi, "$1")
              .replace(/\[list\](.*?)\[\/list\]/gi, "$1")
              .replace(/\[\*\]/gi, "")
              .replace(/\[quote(?:=[^\]]*?)?\](.*?)\[\/quote\]/gi, "")
              .replace(/\[[^\]]*\]/g, "")
              .replace(/\s+/g, " ")
              .trim(),
          removeURLs: (text) =>
            text
              .replace(/(?:https?|ftp):\/\/[\n\S]+/gi, "")
              .replace(/www\.[^\s]+/gi, "")
              .replace(/\s+/g, " ")
              .trim(),
          extractSingleImageUrl: (text) => {
            console.log("Extracting image URL from text:", text);
            // If the entire text is just an image tag, extract it
            const trimmedText = text.trim();
            // Handle standard [img]url[/img] format
            if (
              (console.log("Trimmed text:", trimmedText),
              trimmedText.startsWith("[img]") && trimmedText.endsWith("[/img]"))
            ) {
              console.log("Text is a single image tag");
              const url = trimmedText.slice(5, -6).trim();
              return console.log("Extracted URL:", url), url;
            }
            // Handle [img size=X]url[/img] format with parameters
            const paramImgMatch = trimmedText.match(
              /^\[img\s+([^=\]]+)=([^\]]+)\](.*?)\[\/img\]$/i
            );
            if (paramImgMatch) {
              console.log("Text is a single image tag with parameters");
              const url = paramImgMatch[3].trim();
              return console.log("Extracted URL:", url), url;
            }
            // Find all image tags (both with and without parameters)
            const imageUrls = text.match(
              /\[img(?:\s+[^=\]]+=[^\]]+)?\](.*?)\[\/img\]/gi
            );
            if (
              (console.log("Found image tags:", imageUrls),
              imageUrls && imageUrls.length > 0)
            ) {
              console.log("Using first image tag");
              // Extract URL from the first image tag, handling both formats
              const firstTag = imageUrls[0];
              let url;
              // Standard format
              return (
                (url = firstTag.startsWith("[img]")
                  ? firstTag.replace(/\[img\](.*?)\[\/img\]/i, "$1").trim()
                  : firstTag
                      .replace(/\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]/i, "$1")
                      .trim()),
                console.log("Extracted URL:", url),
                url
              );
            }
            return console.log("No valid image URL found"), null;
          },
          extractVideoUrl: (text) => {
            console.log("Extracting video URL from text:", text);
            const trimmedText = text.trim();
            // Handle [webm] tags
            if (
              trimmedText.startsWith("[webm]") &&
              trimmedText.endsWith("[/webm]")
            ) {
              console.log("Text is a single webm tag");
              const url = trimmedText.slice(6, -7).trim();
              return (
                console.log("Extracted webm URL:", url),
                {
                  url: url,
                  type: "webm",
                }
              );
            }
            // Handle [media] tags
            if (
              trimmedText.startsWith("[media]") &&
              trimmedText.endsWith("[/media]")
            ) {
              console.log("Text is a single media tag");
              const url = trimmedText.slice(7, -8).trim();
              return (
                console.log("Extracted media URL:", url),
                {
                  url: url,
                  type: "media",
                }
              );
            }
            // Find all video tags
            const webmMatch = text.match(/\[webm\](.*?)\[\/webm\]/i);
            if (webmMatch)
              return (
                console.log("Found webm tag"),
                {
                  url: webmMatch[1].trim(),
                  type: "webm",
                }
              );
            const mediaMatch = text.match(/\[media\](.*?)\[\/media\]/i);
            return mediaMatch
              ? (console.log("Found media tag"),
                {
                  url: mediaMatch[1].trim(),
                  type: "media",
                })
              : (console.log("No valid video URL found"), null);
          },
        },
        Storage_getStoredReactions = (postId) => {
          const storedData = GM_getValue(`reactions_${postId}`);
          if (storedData) {
            const { reactions: reactions, timestamp: timestamp } =
              JSON.parse(storedData);
            if (Date.now() - timestamp < 864e5) return reactions;
            GM_deleteValue(`reactions_${postId}`);
          }
          return null;
        },
        Storage_storeReactions = (postId, reactions) => {
          GM_setValue(
            `reactions_${postId}`,
            JSON.stringify({
              reactions: reactions,
              timestamp: Date.now(),
            })
          );
        },
        Storage_getStoredPostContent = (postId) => {
          const storedData = GM_getValue(`post_content_${postId}`);
          if (storedData) {
            const { content: content, timestamp: timestamp } =
              JSON.parse(storedData);
            if (Date.now() - timestamp < 864e5) return content;
            GM_deleteValue(`post_content_${postId}`);
          }
          return null;
        },
        Storage_storePostContent = (postId, content) => {
          GM_setValue(
            `post_content_${postId}`,
            JSON.stringify({
              content: content,
              timestamp: Date.now(),
            })
          );
        },
        Storage_cleanupStorage = () => {
          const lastCleanup = GM_getValue("last_storage_cleanup", 0),
            now = Date.now();
          // Only cleanup if it's been more than 24 hours since last cleanup
          if (now - lastCleanup >= 864e5) {
            (GM_listValues ? GM_listValues() : []).forEach((key) => {
              if ("last_storage_cleanup" === key) return;
              const data = GM_getValue(key);
              if (data)
                try {
                  const parsed = JSON.parse(data);
                  parsed.timestamp &&
                    now - parsed.timestamp >= 864e5 &&
                    GM_deleteValue(key);
                } catch (e) {
                  // If we can't parse the data, it's probably corrupted, so delete it
                  GM_deleteValue(key);
                }
            }),
              // Update last cleanup timestamp
              GM_setValue("last_storage_cleanup", now);
          }
        },
        ReactionHandler_fetchReactions = async (postId, isUnread) => {
          if (!isUnread) {
            const storedReactions = Storage_getStoredReactions(postId);
            if (storedReactions) return storedReactions;
          }
          try {
            const response = await fetch(
                `https://rpghq.org/forums/reactions?mode=view&post=${postId}`,
                {
                  method: "POST",
                  headers: {
                    accept: "application/json, text/javascript, */*; q=0.01",
                    "x-requested-with": "XMLHttpRequest",
                  },
                  credentials: "include",
                }
              ),
              data = await response.json(),
              doc = new DOMParser().parseFromString(
                data.htmlContent,
                "text/html"
              ),
              reactions = Array.from(
                doc.querySelectorAll('.tab-content[data-id="0"] li')
              ).map((li) => ({
                username: li.querySelector(".cbb-helper-text a").textContent,
                image: li.querySelector(".reaction-image").src,
                name: li.querySelector(".reaction-image").alt,
              }));
            return Storage_storeReactions(postId, reactions), reactions;
          } catch (error) {
            return console.error("Error fetching reactions:", error), [];
          }
        },
        ReactionHandler_fetchPostContent = async (postId) => {
          const cachedContent = Storage_getStoredPostContent(postId);
          if (cachedContent) return cachedContent;
          try {
            const response = await fetch(
              `https://rpghq.org/forums/posting.php?mode=quote&p=${postId}`,
              {
                headers: {
                  "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "include",
              }
            );
            if (!response.ok)
              throw new Error(`HTTP error! status: ${response.status}`);
            const text = await response.text(),
              tempDiv = document.createElement("div");
            tempDiv.innerHTML = text;
            const messageArea = tempDiv.querySelector("#message");
            if (!messageArea) throw new Error("Could not find message content");
            let content = Utils.cleanupPostContent(messageArea.value);
            return Storage_storePostContent(postId, content), content;
          } catch (error) {
            return console.error("Error fetching post content:", error), null;
          }
        },
        NotificationCustomizer = {
          async customizeReactionNotification(titleElement, block) {
            if ("true" === block.dataset.reactionCustomized) return;
            // Get settings
            const enableColors = _getScriptSetting(
                "notifications",
                "enableNotificationColors",
                !0
              ),
              enableSmileys = _getScriptSetting(
                "notifications",
                "enableReactionSmileys",
                !0
              ),
              enableImagePreview = _getScriptSetting(
                "notifications",
                "enableImagePreviews",
                !0
              ),
              enableVideoPreview = _getScriptSetting(
                "notifications",
                "enableVideoPreviews",
                !1
              ),
              reactionColorSetting = _getScriptSetting(
                "notifications",
                "reactionColor",
                "#3889ED"
              ),
              titleText = titleElement.innerHTML,
              isUnread = block.href && block.href.includes("mark_notification"),
              postId = Utils.extractPostId(
                block.getAttribute("data-real-url") || block.href
              );
            if (!postId) return;
            const usernameElements = titleElement.querySelectorAll(
                ".username, .username-coloured"
              ),
              usernames = Array.from(usernameElements).map((el) =>
                el.textContent.trim()
              );
            let reactionHTML = "";
            if (enableSmileys) {
              const filteredReactions = (
                await ReactionHandler_fetchReactions(postId, isUnread)
              ).filter((reaction) => usernames.includes(reaction.username));
              reactionHTML = Utils.formatReactions(filteredReactions);
            }
            let reactionVerb;
            // Apply color only if enabled
            if (
              ((reactionVerb = enableColors
                ? `<b style="color: ${reactionColorSetting};">reacted</b>`
                : "<b>reacted</b>"),
              titleText.includes("reacted to a message you posted"))
            )
              if (
                // Update title with reaction info
                ((titleElement.innerHTML = titleText.replace(
                  /(have|has)\s+reacted.*$/,
                  `${reactionVerb} ${reactionHTML} to:`
                )),
                enableImagePreview || enableVideoPreview)
              ) {
                // Fetch content for preview (only if a preview type is enabled)
                const postContent =
                  await ReactionHandler_fetchPostContent(postId);
                if (postContent) {
                  const trimmedContent = postContent.trim();
                  let referenceElement = block.querySelector(
                    ".notification-reference"
                  );
                  const mediaPreviewContainer = Utils.createElement("div", {
                    className: "notification-media-preview",
                  });
                  let mediaFound = !1;
                  // Check for video first
                  if (
                    enableVideoPreview &&
                    ((trimmedContent.startsWith("[webm]") &&
                      trimmedContent.endsWith("[/webm]")) ||
                      (trimmedContent.startsWith("[media]") &&
                        trimmedContent.endsWith("[/media]")))
                  ) {
                    const videoData = Utils.extractVideoUrl(trimmedContent);
                    videoData &&
                      ((mediaPreviewContainer.innerHTML = `<video src="${videoData.url}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" loop muted autoplay title="Video Preview (click to pause)"></video>`),
                      (mediaFound = !0));
                  }
                  // If no video or video preview disabled, check for image
                  if (
                    !mediaFound &&
                    enableImagePreview &&
                    ((trimmedContent.startsWith("[img]") &&
                      trimmedContent.endsWith("[/img]")) ||
                      trimmedContent.match(
                        /^\[img\s+[^=\]]+=[^\]]+\].*?\[\/img\]$/i
                      ))
                  ) {
                    let imageUrl;
                    if (trimmedContent.startsWith("[img]"))
                      imageUrl = trimmedContent.slice(5, -6).trim();
                    else {
                      const paramMatch = trimmedContent.match(
                        /^\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]$/i
                      );
                      imageUrl = paramMatch ? paramMatch[1].trim() : null;
                    }
                    imageUrl &&
                      ((mediaPreviewContainer.innerHTML = `<img src="${imageUrl}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" title="Image Preview">`),
                      (mediaFound = !0));
                  }
                  // Handle placement of preview/reference
                  mediaFound
                    ? // If media found, remove placeholder and add preview
                      (referenceElement && referenceElement.remove(),
                      titleElement.appendChild(mediaPreviewContainer))
                    : // No media preview shown, ensure reference element exists and show text
                      (referenceElement ||
                        ((referenceElement = Utils.createElement("span", {
                          className: "notification-reference",
                        })),
                        titleElement.appendChild(document.createElement("br")),
                        titleElement.appendChild(referenceElement)),
                      (referenceElement.textContent = Utils.removeURLs(
                        Utils.removeBBCode(postContent)
                      )),
                      Utils.styleReference(referenceElement),
                      // Ensure media container isn't added if empty
                      mediaPreviewContainer.remove());
                }
              }
              // If no previews enabled, ensure reference element is handled if it exists
              else {
                const referenceElement = block.querySelector(
                  ".notification-reference"
                );
                if (referenceElement) {
                  // If previews disabled, just remove the loading placeholder?
                  // Or fetch content anyway to show text? Let's fetch for text.
                  const postContent =
                    await ReactionHandler_fetchPostContent(postId);
                  postContent
                    ? ((referenceElement.textContent = Utils.removeURLs(
                        Utils.removeBBCode(postContent)
                      )),
                      Utils.styleReference(referenceElement))
                    : referenceElement.remove();
                }
              }
            else
              // Handle cases like "X, Y, and Z reacted to your post in Topic T"
              titleElement.innerHTML = titleText.replace(
                /(have|has)\s+reacted.*$/,
                `${reactionVerb} ${reactionHTML}`
              );
            block.dataset.reactionCustomized = "true";
          },
          async customizeMentionNotification(notificationBlock) {
            // Get settings
            const enableColors = _getScriptSetting(
                "notifications",
                "enableNotificationColors",
                !0
              ),
              mentionColorSetting = _getScriptSetting(
                "notifications",
                "mentionColor",
                "#FFC107"
              );
            // Apply container styling to the block
            Object.assign(notificationBlock.style, NOTIFICATION_BLOCK_STYLE);
            const notificationText =
                notificationBlock.querySelector(".notification_text"),
              titleElement = notificationText.querySelector(
                ".notification-title"
              ),
              originalHTML = titleElement.innerHTML,
              usernameElements = titleElement.querySelectorAll(
                ".username, .username-coloured"
              ),
              usernames = Array.from(usernameElements)
                .map((el) => el.outerHTML)
                .join(", "),
              parts = originalHTML.split("<br>in ");
            let topicName =
              parts.length > 1 ? parts[1].trim() : "Unknown Topic";
            // Apply color only if enabled
            titleElement.innerHTML = enableColors
              ? `\n          <b style="color: ${mentionColorSetting};">Mentioned</b> by ${usernames} in <b>${topicName}</b>\n        `
              : `\n          <b>Mentioned</b> by ${usernames} in <b>${topicName}</b>\n        `;
            // Create or update reference element for post content
            let referenceElement = notificationBlock.querySelector(
              ".notification-reference"
            );
            referenceElement ||
              ((referenceElement = Utils.createElement("span", {
                className: "notification-reference",
                textContent: "Loading...",
              })),
              Utils.styleReference(referenceElement),
              titleElement.appendChild(document.createElement("br")),
              titleElement.appendChild(referenceElement)),
              // Queue the content fetch
              this.queuePostContentFetch(
                notificationBlock.getAttribute("data-real-url") ||
                  notificationBlock.href,
                referenceElement
              );
            // Move time element to bottom right
            const timeElement =
              notificationText.querySelector(".notification-time");
            timeElement &&
              Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
          },
          customizePrivateMessageNotification(titleElement, block) {
            // Get settings
            const enableColors = _getScriptSetting(
                "notifications",
                "enableNotificationColors",
                !0
              ),
              resizeFillers = _getScriptSetting(
                "notifications",
                "resizeFillerWords",
                !0
              ),
              warningColorSetting = _getScriptSetting(
                "notifications",
                "warningColor",
                "#D31141"
              );
            // Apply container styling to the block
            Object.assign(block.style, NOTIFICATION_BLOCK_STYLE);
            // Move time element to bottom right
            const timeElement = block.querySelector(".notification-time");
            timeElement &&
              Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
            let currentHtml = titleElement.innerHTML;
            const subject = block
              .querySelector(".notification-reference")
              ?.textContent.trim()
              .replace(/^"(.*)"$/, "$1");
            "Board warning issued" === subject &&
              ((currentHtml = enableColors
                ? currentHtml
                    .replace(
                      /<strong>Private Message<\/strong>/,
                      `<strong style="color: ${warningColorSetting};">Board warning issued</strong>`
                    )
                    .replace(/from/, "by")
                    .replace(/:$/, "")
                : currentHtml
                    .replace(
                      /<strong>Private Message<\/strong>/,
                      "<strong>Board warning issued</strong>"
                    )
                    .replace(/from/, "by")
                    .replace(/:$/, "")),
              block.querySelector(".notification-reference")?.remove()),
              // Apply filler word resizing if enabled
              resizeFillers &&
                (currentHtml = currentHtml.replace(
                  /\b(by|and|in|from)\b(?!-)/g,
                  '<span style="font-size: 0.85em; padding: 0 0.25px;">$1</span>'
                )),
              // Update the title element's HTML
              (titleElement.innerHTML = currentHtml);
          },
          async customizeNotificationBlock(block) {
            if ("true" === block.dataset.customized) return;
            // Get settings
            const enableColors = _getScriptSetting(
                "notifications",
                "enableNotificationColors",
                !0
              ),
              resizeFillers = _getScriptSetting(
                "notifications",
                "resizeFillerWords",
                !0
              ),
              quoteColorSetting = _getScriptSetting(
                "notifications",
                "quoteColor",
                "#1E90FF"
              ),
              replyColorSetting = _getScriptSetting(
                "notifications",
                "replyColor",
                "#FF69B4"
              );
            _getScriptSetting("notifications", "reactionColor", "#3889ED"),
              _getScriptSetting("notifications", "mentionColor", "#FFC107");
            const editColorSetting = _getScriptSetting(
                "notifications",
                "editColor",
                "#8A2BE2"
              ),
              approvalColorSetting = _getScriptSetting(
                "notifications",
                "approvalColor",
                "#00AA00"
              ),
              reportColorSetting = _getScriptSetting(
                "notifications",
                "reportColor",
                "#f58c05"
              );
            _getScriptSetting("notifications", "warningColor", "#D31141"),
              // Apply base container styling
              Object.assign(block.style, NOTIFICATION_BLOCK_STYLE);
            const notificationText = block.querySelector(".notification_text");
            if (!notificationText) return;
            // Move time element to bottom right
            const timeElement = block.querySelector(".notification-time");
            timeElement &&
              Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
            let titleElement = notificationText.querySelector(
              ".notification-title"
            );
            if (!titleElement) return;
            // Need a title element to proceed
            let titleText = titleElement.innerHTML,
              currentHtml = titleText,
              notificationType = "default";
            // Initialize titleText
            // Determine type
            // Determine notification type and potentially call specialized handlers
            titleText.includes("You were mentioned by")
              ? ((notificationType = "mention"),
                await this.customizeMentionNotification(block),
                (currentHtml = titleElement.innerHTML))
              : titleText.includes("reacted to")
                ? ((notificationType = "reaction"),
                  await this.customizeReactionNotification(titleElement, block),
                  (currentHtml = titleElement.innerHTML))
                : titleText.includes("Private Message")
                  ? ((notificationType = "pm"),
                    this.customizePrivateMessageNotification(
                      titleElement,
                      block
                    ),
                    (currentHtml = titleElement.innerHTML),
                    // Re-check currentHtml
                    titleElement.innerHTML.includes("Board warning issued") &&
                      // Use titleElement.innerHTML for check
                      (notificationType = "warning"))
                  : titleText.includes("Report closed")
                    ? ((notificationType = "report"),
                      enableColors &&
                        (currentHtml = titleText.replace(
                          /Report closed/,
                          `<strong style="color: ${reportColorSetting};">Report closed</strong>`
                        )))
                    : titleText.includes("Post approval")
                      ? ((notificationType = "approval"),
                        enableColors &&
                          (currentHtml = titleText.replace(
                            /<strong>Post approval<\/strong>/,
                            `<strong style="color: ${approvalColorSetting};">Post approval</strong>`
                          )))
                      : titleText.includes("<strong>Quoted</strong>")
                        ? (notificationType = "quote")
                        : titleText.includes("<strong>Reply</strong>")
                          ? (notificationType = "reply")
                          : titleText.includes("edited a message") &&
                            ((notificationType = "edit"),
                            enableColors &&
                              (currentHtml = titleText.replace(
                                /edited a message you posted/,
                                `<strong style="color: ${editColorSetting};">edited</strong> a message you posted`
                              )));
            // IMPORTANT: After this block, `currentHtml` holds the base HTML before reply/quote modifications
            // Handle previews for Reply/Quote (this part modifies titleElement.innerHTML directly)
            let referenceElement = notificationText.querySelector(
              ".notification-reference"
            );
            if (
              !referenceElement ||
              ("reply" !== notificationType && "quote" !== notificationType)
            )
              // If not reply/quote, ensure titleElement reflects currentHtml before styling
              titleElement.innerHTML = currentHtml;
            else {
              const threadTitle = referenceElement.textContent
                .trim()
                .replace(/^"|"$/g, "");
              // Update title structure IN PLACE
              // Start with the potentially colored/modified currentHtml
              let updatedTitle = currentHtml.replace(
                /in(?:\stopic)?:/,
                `<span style="font-size: 0.85em; padding: 0 0.25px;">in</span> <strong>${threadTitle}</strong>:`
              );
              (titleElement.innerHTML = updatedTitle), // Apply this structural change
                // Update the reference element
                (referenceElement.textContent = "Loading..."),
                Utils.styleReference(referenceElement),
                // Apply reference style
                // Queue fetch
                this.queuePostContentFetch(
                  block.getAttribute("data-real-url") || block.href,
                  referenceElement
                ),
                // Re-fetch HTML after potential in-place modification for reply/quote
                (currentHtml = titleElement.innerHTML);
            }
            // Apply text resizing *after* all structural changes
            // Apply keyword coloring ONLY if enableColors is true
            if (
              (resizeFillers &&
                (currentHtml = currentHtml.replace(
                  /\b(by|and|in|from)\b(?!-)/g,
                  '<span style="font-size: 0.85em; padding: 0 0.25px;">$1</span>'
                )),
              enableColors)
            ) {
              const quoteColor = quoteColorSetting,
                replyColor = replyColorSetting,
                editColor = editColorSetting,
                approvalColor = approvalColorSetting,
                reportColor = reportColorSetting;
              // Reaction, Mention, Warning handled earlier or within their functions
              // Re-apply coloring systematically based on notificationType
              // This ensures colors are applied correctly even after resizing/structural changes
              switch (notificationType) {
                case "quote":
                  currentHtml = currentHtml.replace(
                    /<strong>Quoted<\/strong>/,
                    `<strong style="color: ${quoteColor};">Quoted</strong>`
                  );
                  break;

                case "reply":
                  currentHtml = currentHtml.replace(
                    /<strong>Reply<\/strong>/,
                    `<strong style="color: ${replyColor};">Reply</strong>`
                  );
                  break;

                case "edit":
                  // Make sure we're replacing the correct pattern, potentially already styled
                  currentHtml = currentHtml.replace(
                    /(<strong(?: style="color: [^;]+;")?>edited<\/strong>|edited) a message/,
                    `<strong style="color: ${editColor};">edited</strong> a message`
                  );
                  break;

                case "approval":
                  currentHtml = currentHtml.replace(
                    /(<strong(?: style="color: [^;]+;")?>Post approval<\/strong>|<strong>Post approval<\/strong>)/,
                    `<strong style="color: ${approvalColor};">Post approval</strong>`
                  );
                  break;

                case "report":
                  currentHtml = currentHtml.replace(
                    /(<strong(?: style="color: [^;]+;")?>Report closed<\/strong>|Report closed)/,
                    `<strong style="color: ${reportColor};">Report closed</strong>`
                  );
                // Reaction, Mention, Warning colors should be handled by their respective functions
                // or the initial assignment if `enableColors` was false initially.
              }
            } else
              // If colors are disabled, remove any potentially pre-existing color styles
              currentHtml = currentHtml
                .replace(/<b style="color: [^;]+;">/g, "<b>")
                .replace(/<strong style="color: [^;]+;">/g, "<strong>");
            // Apply the final HTML
            (titleElement.innerHTML = currentHtml),
              // Ensure reference styling is applied (if element exists)
              (referenceElement = block.querySelector(
                ".notification-reference"
              )), // Re-query in case it was added/removed
              referenceElement && Utils.styleReference(referenceElement),
              // Standardize username class and remove inline color
              block.querySelectorAll(".username-coloured").forEach((el) => {
                el.classList.replace("username-coloured", "username"),
                  (el.style.color = "");
              }),
              (block.dataset.customized = "true");
          },
          customizeNotificationPanel() {
            document
              .querySelectorAll(".notification-block, a.notification-block")
              .forEach(
                NotificationCustomizer.customizeNotificationBlock.bind(
                  NotificationCustomizer
                )
              );
          },
          customizeNotificationPage() {
            // Get settings needed for this page
            const enableColors = _getScriptSetting(
                "notifications",
                "enableNotificationColors",
                !0
              ),
              rawColorsJson = _getScriptSetting(
                "notifications",
                "notificationColors",
                "{}"
              );
            let notificationColors = {};
            try {
              notificationColors = JSON.parse(rawColorsJson);
            } catch (e) {
              console.error("Invalid JSON in notificationColors setting:", e),
                (notificationColors = {
                  default: "#ffffff",
                });
            }
            const enableSmileys = _getScriptSetting(
                "notifications",
                "enableReactionSmileys"
              ),
              resizeFillers = _getScriptSetting(
                "notifications",
                "resizeFillerWords",
                !0
              ),
              quoteColorSetting = _getScriptSetting(
                "notifications",
                "quoteColor"
              ),
              replyColorSetting = _getScriptSetting(
                "notifications",
                "replyColor"
              ),
              reactionColorSetting = _getScriptSetting(
                "notifications",
                "reactionColor"
              ),
              mentionColorSetting = _getScriptSetting(
                "notifications",
                "mentionColor"
              ),
              editColorSetting = _getScriptSetting(
                "notifications",
                "editColor",
                "#8A2BE2"
              ),
              approvalColorSetting = _getScriptSetting(
                "notifications",
                "approvalColor",
                "#00AA00"
              ),
              reportColorSetting = _getScriptSetting(
                "notifications",
                "reportColor",
                "#f58c05"
              ),
              warningColorSetting = _getScriptSetting(
                "notifications",
                "warningColor",
                "#D31141"
              ),
              defaultColorSetting = _getScriptSetting(
                "notifications",
                "defaultColor",
                "#ffffff"
              ),
              referenceBackgroundColorSetting = _getScriptSetting(
                "notifications",
                "referenceBackgroundColor",
                "rgba(23, 27, 36, 0.5)"
              ),
              referenceTextColorSetting = _getScriptSetting(
                "notifications",
                "referenceTextColor",
                "#ffffff"
              ),
              quoteColor = quoteColorSetting,
              replyColor = replyColorSetting,
              reactionColor = reactionColorSetting,
              mentionColor = mentionColorSetting,
              editColor = editColorSetting,
              approvalColor = approvalColorSetting,
              reportColor = reportColorSetting,
              warningColor = warningColorSetting,
              defaultColor = defaultColorSetting,
              referenceBackgroundColor = referenceBackgroundColorSetting,
              referenceTextColor = referenceTextColorSetting;
            document.querySelectorAll(".cplist .row").forEach(async (row) => {
              if ("true" === row.dataset.customized) return;
              (row.style.position = "relative"),
                (row.style.paddingBottom = "20px");
              // Make room for timestamp
              const timeElement = row.querySelector(".notifications_time");
              timeElement &&
                Object.assign(timeElement.style, NOTIFICATIONS_TIME_STYLE);
              const notificationBlock = row.querySelector(".notifications"),
                anchorElement = notificationBlock?.querySelector("a");
              if (!anchorElement)
                // Mark as processed even if no anchor
                return void (row.dataset.customized = "true");
              const titleElement = anchorElement.querySelector(
                ".notifications_title"
              );
              if (!titleElement)
                // Mark as processed even if no title
                return void (row.dataset.customized = "true");
              let placeholderElement,
                originalTitleHTML = titleElement.innerHTML,
                notificationType = "default",
                newHtmlContent = "";
              // Store ref to placeholder for fetch later
              // Helper for styling keywords
              const styleKeyword = (keyword, color) =>
                  enableColors
                    ? `<strong style="color: ${color};">${keyword}</strong>`
                    : `<strong>${keyword}</strong>`,
                styleFiller = (word) =>
                  `<span style="font-size: 0.85em; padding: 0 0.25px;">${word}</span>`;
              // --- Mention Handling ---
              if (originalTitleHTML.includes("You were mentioned by")) {
                notificationType = "mention";
                const parts = originalTitleHTML.split("<br>");
                if (2 === parts.length) {
                  let mentionText = parts[0] + " " + parts[1];
                  // Apply filler styling first if enabled
                  resizeFillers &&
                    (mentionText = mentionText.replace(
                      /\b(by|in)\b(?!-)/g,
                      styleFiller("$1")
                    ));
                  const referenceStyle = `background: ${referenceBackgroundColor}; color: ${referenceTextColor}; padding: 2px 4px; border-radius: 2px; margin-top: 5px;`;
                  (newHtmlContent = `\n              <div class="notification-block">\n                <div class="notification-title">${styleKeyword("Mentioned", mentionColor)} ${mentionText.substring(mentionText.indexOf(resizeFillers ? styleFiller("by") : "by"))}</div>\n                <div class="notification-reference" style="${referenceStyle}">\n                  Loading...\n                </div>\n              </div>\n            `),
                    (anchorElement.innerHTML = newHtmlContent), // Update DOM to find placeholder
                    (placeholderElement = anchorElement.querySelector(
                      ".notification-reference"
                    ));
                } else
                  // Fallback if format unexpected
                  newHtmlContent = originalTitleHTML;
                // Keep original if parsing fails
              }
              // --- Reaction Handling ---
              else if (originalTitleHTML.includes("reacted to")) {
                notificationType = "reaction";
                const usernameElements = Array.from(
                    titleElement.querySelectorAll(
                      ".username, .username-coloured"
                    )
                  ),
                  usernames = usernameElements.map((el) =>
                    el.textContent.trim()
                  ),
                  postId = Utils.extractPostId(anchorElement.href);
                if (postId) {
                  let reactionHTML = "";
                  if (enableSmileys) {
                    const filteredReactions = (
                      await ReactionHandler_fetchReactions(postId, !1)
                    ).filter((r) => usernames.includes(r.username));
                    reactionHTML = Utils.formatReactions(filteredReactions);
                  }
                  const firstUsernameHTML =
                      usernameElements.length > 0
                        ? usernameElements[0].outerHTML
                        : "",
                    firstPart = originalTitleHTML.substring(
                      0,
                      originalTitleHTML.indexOf(firstUsernameHTML)
                    );
                  // Format usernames with styled fillers
                  let formattedUsernames;
                  const smallAnd = resizeFillers ? styleFiller("and") : "and";
                  formattedUsernames =
                    1 === usernameElements.length
                      ? usernameElements[0].outerHTML
                      : 2 === usernameElements.length
                        ? `${usernameElements[0].outerHTML} ${smallAnd} ${usernameElements[1].outerHTML}`
                        : usernameElements.length > 2
                          ? usernameElements
                              .slice(0, -1)
                              .map((el) => el.outerHTML)
                              .join(", ") +
                            `, ${smallAnd} ${usernameElements[usernameElements.length - 1].outerHTML}`
                          : "Someone";
                  (newHtmlContent = `\n              <div class="notification-block">\n                <div class="notification-title">${`${firstPart}${formattedUsernames} ${styleKeyword("reacted", reactionColor)} ${reactionHTML} to:`}</div>\n                <div class="notification-reference" style="${`background: ${referenceBackgroundColor}; color: ${referenceTextColor}; padding: 2px 4px; border-radius: 2px; margin-top: 5px;`}">\n                  Loading...\n                </div>\n              </div>\n            `),
                    (anchorElement.innerHTML = newHtmlContent), // Update DOM
                    (placeholderElement = anchorElement.querySelector(
                      ".notification-reference"
                    ));
                } else newHtmlContent = originalTitleHTML;
                // Keep original if no postId
              }
              // --- Other Notification Types (Quote, Reply, Edit, Approval, Report) ---
              else {
                const lastQuoteMatch = originalTitleHTML.match(/"([^"]*)"$/);
                let baseTitleText = originalTitleHTML,
                  referenceText = "Loading...";
                // Default for placeholder
                // Determine type and adjust base title
                if (originalTitleHTML.includes("<strong>Quoted</strong>"))
                  (notificationType = "quote"),
                    // Keep the quote in the title for 'Quoted' notifications
                    (referenceText = lastQuoteMatch
                      ? `"${lastQuoteMatch[1]}"`
                      : "Loading...");
                else if (
                  // For other types, remove the trailing quote from the title if present
                  (lastQuoteMatch &&
                    ((baseTitleText = originalTitleHTML
                      .replace(/"[^"]*"$/, "")
                      .trim()),
                    (referenceText = `"${lastQuoteMatch[1]}"`)),
                  originalTitleHTML.includes("<strong>Reply</strong>"))
                )
                  notificationType = "reply";
                else if (originalTitleHTML.includes("edited a message"))
                  notificationType = "edit";
                else if (originalTitleHTML.includes("Post approval"))
                  notificationType = "approval";
                else if (originalTitleHTML.includes("Report closed"))
                  notificationType = "report";
                else if (originalTitleHTML.includes("Private Message")) {
                  // Basic PM handling, could be expanded like in customizeNotificationBlock
                  notificationType = "pm";
                  const subjectMatch = originalTitleHTML.match(
                    /<strong>Private Message<\/strong>(?: from [^:]+):? "?([^"]*)"?/
                  );
                  subjectMatch && "Board warning issued" === subjectMatch[1]
                    ? ((notificationType = "warning"),
                      (baseTitleText = originalTitleHTML
                        .replace(
                          /<strong>Private Message<\/strong>/,
                          styleKeyword("Board warning issued", warningColor)
                        )
                        .replace(/from/, "by")
                        .replace(/:$/, "")
                        .replace(/"[^"]*"$/, "")
                        .trim()),
                      (referenceText = null))
                    : (baseTitleText = originalTitleHTML
                        .replace(
                          /<strong>Private Message<\/strong>/,
                          styleKeyword("Private Message", defaultColor)
                        )
                        .replace(/"[^"]*"$/, "")
                        .trim());
                }
                // Apply keyword styling based on determined type
                let styledTitle = baseTitleText;
                switch (notificationType) {
                  case "quote":
                    styledTitle = styledTitle.replace(
                      /<strong>Quoted<\/strong>/,
                      styleKeyword("Quoted", quoteColor)
                    );
                    break;

                  case "reply":
                    styledTitle = styledTitle.replace(
                      /<strong>Reply<\/strong>/,
                      styleKeyword("Reply", replyColor)
                    );
                    break;

                  case "edit":
                    styledTitle = styledTitle.replace(
                      /edited a message/,
                      `${styleKeyword("edited", editColor)} a message`
                    );
                    break;

                  case "approval":
                    styledTitle = styledTitle.replace(
                      /<strong>Post approval<\/strong>/,
                      styleKeyword("Post approval", approvalColor)
                    );
                    break;

                  case "report":
                    styledTitle = styledTitle.replace(
                      /Report closed/,
                      styleKeyword("Report closed", reportColor)
                    );
                  // Warning already styled if detected
                  // PM default styling handled above
                }
                // Apply filler styling if enabled
                resizeFillers &&
                  (styledTitle = styledTitle.replace(
                    /\b(by|and|in|from)\b(?!-)/g,
                    styleFiller("$1")
                  ));
                // Construct HTML
                (newHtmlContent = `\n            <div class="notification-block">\n              <div class="notification-title">${styledTitle}</div>\n              ${null !== referenceText ? `<div class="notification-reference" style="${`background: ${referenceBackgroundColor}; color: ${referenceTextColor}; padding: 2px 4px; border-radius: 2px; margin-top: 5px;`}">\n                ${referenceText}\n              </div>` : ""}\n            </div>\n          `),
                  (anchorElement.innerHTML = newHtmlContent), // Update DOM
                  null !== referenceText &&
                    (placeholderElement = anchorElement.querySelector(
                      ".notification-reference"
                    ));
              }
              // --- Post-Processing ---
              // Queue content fetch if a placeholder exists
              if (
                placeholderElement &&
                placeholderElement.textContent.includes("Loading...")
              ) {
                !placeholderElement.textContent.includes("Loading...")
                  ? // If it already has text content (like a quote), style it
                    Utils.styleReference(placeholderElement)
                  : NotificationCustomizer.queuePostContentFetch(
                      anchorElement.href,
                      placeholderElement
                    );
              }
              // Apply background color to the row if enabled
              if (enableColors) {
                const color =
                  notificationColors[notificationType] || defaultColor;
                row.style.backgroundColor = color;
              }
              // Convert username-coloured to username and remove inline style
              anchorElement.querySelectorAll(".username-coloured").forEach(
                (el) => {
                  el.classList.replace("username-coloured", "username"),
                    (el.style.color = "");
                } // Remove inline color style if any
              ),
                (row.dataset.customized = "true");
            });
          },
          // End of customizeNotificationPage
          async queuePostContentFetch(url, placeholder) {
            // Get relevant settings
            const enableImagePreview = _getScriptSetting(
                "notifications",
                "enableImagePreviews",
                !0
              ),
              enableVideoPreview = _getScriptSetting(
                "notifications",
                "enableVideoPreviews",
                !1
              ),
              wantsPreview = enableImagePreview || enableVideoPreview,
              wantsTextQuote = _getScriptSetting(
                // Need this for quote notifications
                "notifications",
                "enableQuotePreviews",
                !0
              ),
              postId = Utils.extractPostId(url);
            if (postId) {
              // Check if we need to wait before next fetch
              if (this.lastFetchTime) {
                const timeSinceLastFetch = Date.now() - this.lastFetchTime;
                timeSinceLastFetch < 500 &&
                  (await Utils.sleep(500 - timeSinceLastFetch));
              }
              try {
                const postContent =
                  await ReactionHandler_fetchPostContent(postId);
                if (postContent && placeholder.parentNode) {
                  const trimmedContent = postContent.trim(),
                    mediaPreviewContainer = Utils.createElement("div", {
                      className: "notification-media-preview",
                    });
                  // Always create the media preview container, but only add if needed
                  let mediaFound = !1;
                  // Check for video first
                  if (
                    enableVideoPreview &&
                    ((trimmedContent.startsWith("[webm]") &&
                      trimmedContent.endsWith("[/webm]")) ||
                      (trimmedContent.startsWith("[media]") &&
                        trimmedContent.endsWith("[/media]")))
                  ) {
                    const videoData = Utils.extractVideoUrl(trimmedContent);
                    videoData &&
                      ((mediaPreviewContainer.innerHTML = `<video src="${videoData.url}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" loop muted autoplay title="Video Preview"></video>`),
                      (mediaFound = !0));
                  }
                  // If no video or video disabled, check for image
                  if (
                    !mediaFound &&
                    enableImagePreview &&
                    ((trimmedContent.startsWith("[img]") &&
                      trimmedContent.endsWith("[/img]")) ||
                      trimmedContent.match(
                        /^\[img\s+[^=\]]+=[^\]]+\].*?\[\/img\]$/i
                      ))
                  ) {
                    let imageUrl;
                    if (trimmedContent.startsWith("[img]"))
                      imageUrl = trimmedContent.slice(5, -6).trim();
                    else {
                      const paramMatch = trimmedContent.match(
                        /^\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]$/i
                      );
                      imageUrl = paramMatch ? paramMatch[1].trim() : null;
                    }
                    imageUrl &&
                      ((mediaPreviewContainer.innerHTML = `<img src="${imageUrl}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" title="Image Preview">`),
                      (mediaFound = !0));
                  }
                  // Decision time: Show media, text, or nothing?
                  mediaFound && wantsPreview
                    ? // Media found and previews enabled: Insert media, remove placeholder
                      (placeholder.parentNode.insertBefore(
                        mediaPreviewContainer,
                        placeholder
                      ),
                      placeholder.remove())
                    : wantsTextQuote
                      ? // Show text content (for quotes or if media previews off/no media found)
                        ((placeholder.textContent =
                          Utils.removeBBCode(postContent)),
                        Utils.styleReference(placeholder),
                        mediaPreviewContainer.remove())
                      : // No text quote wanted, no media preview shown -> remove placeholder
                        (placeholder.remove(), mediaPreviewContainer.remove());
                } else placeholder.remove();
              } catch (error) {
                console.error("Error fetching post content:", error),
                  placeholder.remove();
              }
              this.lastFetchTime = Date.now();
            } else placeholder.remove();
          },
        },
        NotificationMarker = {
          getDisplayedPostIds: () =>
            Array.from(document.querySelectorAll('div[id^="p"]')).map((el) =>
              el.id.substring(1)
            ),
          getNotificationData: () =>
            Array.from(document.querySelectorAll(".notification-block"))
              .map((link) => {
                const href = link.getAttribute("href");
                return {
                  href: href,
                  postId: Utils.extractPostId(
                    link.getAttribute("data-real-url") || href
                  ),
                };
              })
              .filter((data) => data.href && data.postId),
          markNotificationAsRead(href) {
            GM_xmlhttpRequest({
              method: "GET",
              url: "https://rpghq.org/forums/" + href,
              onload: (response) =>
                console.log("Notification marked as read:", response.status),
            });
          },
          checkAndMarkNotifications() {
            const displayedPostIds = this.getDisplayedPostIds();
            this.getNotificationData().forEach((notification) => {
              displayedPostIds.includes(notification.postId) &&
                this.markNotificationAsRead(notification.href);
            });
          },
        },
        init = () => {
          // Add CSS override to set max-width to 50px for .row .list-inner img
          const styleElement = document.createElement("style");
          // Add debouncing to prevent rapid re-processing
          let debounceTimer;
          (styleElement.textContent =
            "\n        .row .list-inner img {\n          max-width: 50px !important;\n        }\n      "),
            document.head.appendChild(styleElement),
            NotificationCustomizer.customizeNotificationPanel(),
            NotificationMarker.checkAndMarkNotifications(), // Now unconditional
            window.location.href.includes("ucp.php?i=ucp_notifications") &&
              NotificationCustomizer.customizeNotificationPage();
          new MutationObserver((mutations) => {
            let shouldProcess = !1;
            // Only process if new notification blocks are added
            for (const mutation of mutations)
              if ("childList" === mutation.type) {
                if (
                  Array.from(mutation.addedNodes).some(
                    (node) =>
                      node.nodeType === Node.ELEMENT_NODE &&
                      (node.classList?.contains("notification-block") ||
                        node.querySelector?.(".notification-block"))
                  )
                ) {
                  shouldProcess = !0;
                  break;
                }
              }
            shouldProcess &&
              (clearTimeout(debounceTimer),
              (debounceTimer = setTimeout(() => {
                NotificationCustomizer.customizeNotificationPanel();
              }, 100)));
          }).observe(document.body, {
            childList: !0,
            subtree: !0,
          }),
            // Run storage cleanup last
            Storage_cleanupStorage();
        };
      "complete" === document.readyState ||
      "interactive" === document.readyState
        ? init()
        : window.addEventListener("load", init);
    },
  });
  // RPGHQ - Kalarion Reaction Auto-Marker
  /**
   * Marks smiley reaction notifs from Kalarion automagically so he can't rape you
   * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
   * License: MIT
   *
   * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/kalareact.md for documentation
   */ var kalareact = Object.freeze({
    __proto__: null,
    init: function () {
      console.log("User Reaction Auto-Marker initialized!"),
        document
          .querySelector("#notification_list")
          .querySelectorAll("li")
          .forEach((item) => {
            // Return early if there's no notification-block link
            if (!item.querySelector("a.notification-block")) return;
            // Find the username span within this notification
            const usernameSpan = item.querySelector("span.username");
            if (!usernameSpan) return;
            const username = usernameSpan.textContent.trim();
            // Return if username doesn't start with "Kalarion" or "dolor"
            if (
              !username.startsWith("Kalarion") &&
              !username.startsWith("dolor")
            )
              return;
            console.log(`Found notification from ${username}, marking as read`);
            // Find and click the mark read button
            const markReadButton = item.querySelector("a.mark_read");
            markReadButton &&
              (markReadButton.click(),
              // Remove the notification row from the DOM
              console.log(`Removing ${username} notification from view`)),
              item.remove();
          });
    },
  });
  var bbcode = Object.freeze({
    __proto__: null,
    init: function () {
      // =============================
      // Constants & Configuration
      // =============================
      const TAG_COLORS = {
          img: 1,
          url: 4,
          color: 3,
          "*": "list-item",
        },
        URL_REGEX = /(https?:\/\/[^\s<]+)/g,
        BBCODE_REGEX = /\[(\/?)([a-zA-Z0-9*]+)([^\]]*)\]/g;
      // =============================
      // Tokenization & Highlighting
      // =============================
      // Cached token arrays to avoid re-tokenizing unchanged text sections
      let cachedTokens = [],
        lastText = "";
      /**
       * Token types:
       * - 'text': Regular text
       * - 'tag-open': Opening BBCode tag
       * - 'tag-close': Closing BBCode tag
       * - 'url': URL
       */
      // Create tokens from text for more efficient highlighting
      const getColorIndex = (tagName) => (
          tagName in TAG_COLORS ||
            // Add new tag to our color map
            (TAG_COLORS[tagName] = Object.keys(TAG_COLORS).length % 5),
          TAG_COLORS[tagName]
        ),
        escapeHTML = (str) =>
          str.replace(
            /[&<>"']/g,
            (m) =>
              ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
              })[m]
          ),
        // Get contrast color (black or white) for a background color
        getContrastColor = (hexColor) =>
          (299 * parseInt(hexColor.slice(1, 3), 16) +
            587 * parseInt(hexColor.slice(3, 5), 16) +
            114 * parseInt(hexColor.slice(5, 7), 16)) /
            1e3 >=
          128
            ? "black"
            : "white",
        debounce = (func, wait) => {
          let timeout;
          return function (...args) {
            const context = this;
            clearTimeout(timeout),
              (timeout = setTimeout(() => func.apply(context, args), wait));
          };
        };
      // Convert tokens to HTML for display
      // =============================
      // Layout Adjustment Functions
      // =============================
      // Observer for textarea size changes
      let resizeObserver = null;
      const adjustTextareaAndHighlight = (textArea, highlightDiv) => {
          if (!textArea || !highlightDiv) return;
          // Use IntersectionObserver to optimize for when the textarea is actually visible
          if (0 === textArea.offsetHeight) return;
          (textArea.style.height = "auto"),
            (textArea.style.height = textArea.scrollHeight + "px");
          const computed = window.getComputedStyle(textArea);
          Object.assign(highlightDiv.style, {
            width: textArea.offsetWidth + "px",
            height: textArea.offsetHeight + "px",
            padding: computed.padding,
            borderWidth: computed.borderWidth,
            borderStyle: computed.borderStyle,
            borderColor: "transparent",
            fontFamily: computed.fontFamily,
            fontSize: computed.fontSize,
            lineHeight: computed.lineHeight,
          }),
            positionSmileyBox(),
            positionEditorHeader();
        },
        positionSmileyBox = () => {
          const smileyBox = document.getElementById("smiley-box"),
            textarea = document.getElementById("message");
          if (smileyBox && textarea)
            if (window.innerWidth <= 768)
              Object.assign(smileyBox.style, {
                position: "static",
                width: "100%",
                maxHeight: "none",
                overflowY: "visible",
                marginBottom: "10px",
              });
            else {
              const { top: top, right: right } =
                  textarea.getBoundingClientRect(),
                windowWidth = window.innerWidth,
                scrollStart =
                  top +
                  (window.pageYOffset || document.documentElement.scrollTop),
                smileyBoxWidth = 220,
                leftPosition = Math.min(
                  right + 10,
                  windowWidth - smileyBoxWidth
                );
              Object.assign(smileyBox.style, {
                position: "absolute",
                top: scrollStart + "px",
                left: leftPosition + "px",
                maxHeight: "80vh",
                overflowY: "auto",
              });
            }
        },
        positionEditorHeader = () => {
          const editorHeader = document.getElementById("abbc3_buttons"),
            textarea = document.getElementById("message");
          if (!editorHeader || !textarea) return;
          const textareaRect = textarea.getBoundingClientRect(),
            headerRect = editorHeader.getBoundingClientRect(),
            scrollTop =
              window.pageYOffset || document.documentElement.scrollTop,
            offset = headerRect.top - textareaRect.top;
          if (scrollTop >= textareaRect.top + scrollTop - offset) {
            if (!editorHeader.classList.contains("fixed")) {
              editorHeader.classList.add("fixed");
              const placeholder = document.createElement("div");
              (placeholder.style.height = editorHeader.offsetHeight + "px"),
                (placeholder.id = "abbc3_buttons_placeholder"),
                editorHeader.parentNode.insertBefore(placeholder, editorHeader);
            }
            Object.assign(editorHeader.style, {
              width: textarea.offsetWidth + "px",
              left: textareaRect.left + "px",
              top: "0px",
            });
            let cumulative = 0;
            editorHeader
              .querySelectorAll(".abbc3_buttons_row")
              .forEach((row) => {
                Object.assign(row.style, {
                  width: textarea.offsetWidth + "px",
                  position: "fixed",
                  top: cumulative + "px",
                }),
                  row.classList.add("fixed"),
                  (cumulative += row.offsetHeight);
              });
          } else if (editorHeader.classList.contains("fixed")) {
            editorHeader.classList.remove("fixed"), (editorHeader.style = "");
            const placeholder = document.getElementById(
              "abbc3_buttons_placeholder"
            );
            placeholder && placeholder.remove(),
              editorHeader
                .querySelectorAll(".abbc3_buttons_row")
                .forEach((row) => {
                  (row.style = ""), row.classList.remove("fixed");
                });
          }
        },
        initialize = () => {
          (() => {
            const mode = new URLSearchParams(window.location.search).get(
                "mode"
              ),
              postingTitleElement = document.querySelector(".posting-title a");
            if (postingTitleElement) {
              const threadTitle = postingTitleElement.textContent.trim();
              "reply" === mode || "quote" === mode
                ? (document.title = `RPGHQ - Replying to "${threadTitle}"`)
                : "edit" === mode &&
                  (document.title = `RPGHQ - Editing post in "${threadTitle}"`);
            }
          })();
          const textArea = document.getElementById("message");
          if (!textArea) return setTimeout(initialize, 500);
          (() => {
            const textarea = document.getElementById("message");
            textarea &&
              ($(textarea).off("focus change keyup"),
              textarea.classList.remove("auto-resized"),
              (textarea.style.height = ""),
              (textarea.style.resize = "none"));
          })();
          const container = document.createElement("div");
          container.className = "editor-container";
          const highlightDiv = document.createElement("div");
          (highlightDiv.id = "bbcode-highlight"),
            textArea.parentNode.replaceChild(container, textArea),
            container.append(highlightDiv, textArea),
            Object.assign(textArea.style, {
              overflow: "hidden",
              resize: "none",
              minHeight: "500px",
              position: "relative",
              zIndex: "2",
              background: "transparent",
              color: "rgb(204, 204, 204)",
              caretColor: "white",
              width: "100%",
              height: "100%",
              padding: "3px",
              boxSizing: "border-box",
              fontFamily: "Verdana, Helvetica, Arial, sans-serif",
              fontSize: "11px",
              lineHeight: "15.4px",
            }),
            // Setup resize observer for the textarea
            ((textArea, highlightDiv) => {
              resizeObserver && resizeObserver.disconnect(),
                (resizeObserver = new ResizeObserver(() => {
                  adjustTextareaAndHighlight(textArea, highlightDiv);
                })),
                resizeObserver.observe(textArea);
            })(textArea, highlightDiv);
          // Efficient update function using debounce
          const updateHighlight = debounce(() => {
            const currentText = textArea.value;
            if (currentText === lastText) return;
            const tokens = ((text) => {
              // Fast path: if text hasn't changed, return cached tokens
              if (text === lastText && cachedTokens.length) return cachedTokens;
              const tokens = [];
              let lastIndex = 0;
              // First pass: Find all BBCode tags
              const bbcodeMatches = [...text.matchAll(BBCODE_REGEX)];
              for (const match of bbcodeMatches) {
                const [fullMatch, slash, tagName, attributes] = match,
                  startIndex = match.index;
                // Add text before the tag
                startIndex > lastIndex &&
                  tokens.push({
                    type: "text",
                    content: text.substring(lastIndex, startIndex),
                  }),
                  // Add the tag
                  tokens.push({
                    type: slash ? "tag-close" : "tag-open",
                    tagName: tagName,
                    attributes: attributes,
                    fullMatch: fullMatch,
                    colorIndex: getColorIndex(tagName),
                  }),
                  (lastIndex = startIndex + fullMatch.length);
              }
              // Add remaining text
              lastIndex < text.length &&
                tokens.push({
                  type: "text",
                  content: text.substring(lastIndex),
                });
              // Second pass: Find URLs in text tokens
              const processedTokens = [];
              for (const token of tokens)
                if ("text" === token.type) {
                  let textContent = token.content,
                    lastUrlIndex = 0;
                  const urlMatches = [...textContent.matchAll(URL_REGEX)];
                  if (0 === urlMatches.length) {
                    processedTokens.push(token);
                    continue;
                  }
                  for (const urlMatch of urlMatches) {
                    const urlText = urlMatch[0],
                      urlStartIndex = urlMatch.index;
                    // Text before URL
                    urlStartIndex > lastUrlIndex &&
                      processedTokens.push({
                        type: "text",
                        content: textContent.substring(
                          lastUrlIndex,
                          urlStartIndex
                        ),
                      }),
                      // URL token
                      processedTokens.push({
                        type: "url",
                        content: urlText,
                      }),
                      (lastUrlIndex = urlStartIndex + urlText.length);
                  }
                  // Remaining text after last URL
                  lastUrlIndex < textContent.length &&
                    processedTokens.push({
                      type: "text",
                      content: textContent.substring(lastUrlIndex),
                    });
                } else processedTokens.push(token);
              // Cache the results
              return (
                (cachedTokens = processedTokens),
                (lastText = text),
                processedTokens
              );
            })(currentText);
            (highlightDiv.innerHTML = ((tokens) =>
              tokens
                .map((token) => {
                  switch (token.type) {
                    case "text":
                      return escapeHTML(token.content);

                    case "url":
                      return `<span class="bbcode-link">${escapeHTML(token.content)}</span>`;

                    case "tag-open":
                    case "tag-close": {
                      const {
                        tagName: tagName,
                        attributes: attributes,
                        colorIndex: colorIndex,
                      } = token;
                      // Special handling for list items
                      if ("*" === tagName)
                        return '<span class="bbcode-bracket" style="color:#A0A0A0;">[</span><span class="bbcode-list-item">*</span><span class="bbcode-bracket" style="color:#A0A0A0;">]</span>';
                      let html =
                        '<span class="bbcode-bracket" style="color:#A0A0A0;">[</span>';
                      // Add slash for closing tags
                      // Process attributes if any
                      if (
                        ("tag-close" === token.type
                          ? (html += `<span class="bbcode-tag-${colorIndex}">/`)
                          : (html += `<span class="bbcode-tag-${colorIndex}">`),
                        (html += `${escapeHTML(tagName)}</span>`),
                        attributes)
                      ) {
                        const leadingWs = attributes.match(/^\s*/)[0],
                          params = attributes.slice(leadingWs.length);
                        if (params)
                          if (params.startsWith("=")) {
                            const paramValue = params.slice(1).trim();
                            if ("color" === tagName.toLowerCase()) {
                              const hexMatch =
                                paramValue.match(/^(#[0-9A-Fa-f]{6})/);
                              if (hexMatch) {
                                const hex = hexMatch[1];
                                html +=
                                  leadingWs +
                                  '<span class="bbcode-attribute">=</span>' +
                                  `<span class="bbcode-color-preview" style="background-color:${hex}; color:${getContrastColor(hex)};">${escapeHTML(hex)}</span>`;
                                const extra = paramValue.slice(hex.length);
                                extra &&
                                  (html += `<span class="bbcode-attribute">${escapeHTML(extra)}</span>`);
                              } else
                                html +=
                                  leadingWs +
                                  '<span class="bbcode-attribute">=</span>' +
                                  `<span class="bbcode-attribute">${escapeHTML(paramValue)}</span>`;
                            } else
                              html +=
                                leadingWs +
                                '<span class="bbcode-attribute">=</span>' +
                                `<span class="bbcode-attribute">${escapeHTML(paramValue)}</span>`;
                          } else
                            html +=
                              leadingWs +
                              `<span class="bbcode-attribute">${escapeHTML(params)}</span>`;
                        else html += leadingWs;
                      }
                      return (
                        (html +=
                          '<span class="bbcode-bracket" style="color:#A0A0A0;">]</span>'),
                        html
                      );
                    }

                    default:
                      return "";
                  }
                })
                .join(""))(tokens)),
              // Sync scrolling between textarea and highlight div
              (highlightDiv.scrollTop = textArea.scrollTop);
          }, 150);
          // Event listeners
          textArea.addEventListener("input", updateHighlight),
            textArea.addEventListener("scroll", () => {
              highlightDiv.scrollTop = textArea.scrollTop;
            });
          // Optimized event listeners for window events
          const throttledResize = debounce(() => {
              adjustTextareaAndHighlight(textArea, highlightDiv);
            }, 100),
            throttledScroll = debounce(() => {
              positionSmileyBox(), positionEditorHeader();
            }, 100);
          window.addEventListener("resize", throttledResize),
            window.addEventListener("scroll", throttledScroll),
            // Initial rendering
            updateHighlight(),
            adjustTextareaAndHighlight(textArea, highlightDiv);
        };
      // Update page title based on URL parameters
      // =============================
      // Run on Page Load
      // =============================
      window.addEventListener("load", () => {
        (() => {
          const style = document.createElement("style");
          (style.textContent =
            "\n        .bbcode-bracket { color: #D4D4D4; }\n        .bbcode-tag-0 { color: #569CD6; }\n        .bbcode-tag-1 { color: #CE9178; }\n        .bbcode-tag-2 { color: #DCDCAA; }\n        .bbcode-tag-3 { color: #C586C0; }\n        .bbcode-tag-4 { color: #4EC9B0; }\n        .bbcode-attribute { color: #9CDCFE; }\n        .bbcode-list-item { color: #FFD700; }\n        .bbcode-link { color: #5D8FBD; }\n\n        #bbcode-highlight {\n            white-space: pre-wrap;\n            word-wrap: break-word;\n            position: absolute;\n            top: 0; left: 0;\n            z-index: 3;\n            width: 100%; height: 100%;\n            overflow: hidden;\n            pointer-events: none;\n            box-sizing: border-box;\n            padding: 3px;\n            font-family: Verdana, Helvetica, Arial, sans-serif;\n            font-size: 11px;\n            line-height: 15.4px;\n            background-color: transparent;\n            color: transparent;\n        }\n\n        #message {\n            position: relative;\n            z-index: 2;\n            background: transparent;\n            color: rgb(204, 204, 204);\n            caret-color: white;\n            width: 100%;\n            height: 100%;\n            padding: 3px;\n            box-sizing: border-box;\n            resize: none;\n            overflow: auto;\n            font-family: Verdana, Helvetica, Arial, sans-serif;\n            font-size: 11px;\n            line-height: 15.4px;\n        }\n\n        .editor-container {\n            position: relative;\n            width: 100%;\n            height: auto;\n        }\n\n        #abbc3_buttons.fixed {\n            position: fixed;\n            top: 0;\n            z-index: 1000;\n            background-color: #3A404A !important;\n        }\n\n        .abbc3_buttons_row.fixed {\n            background-color: #3A404A !important;\n            position: fixed;\n            top: 0;\n            z-index: 1000;\n        }\n      "),
            document.head.appendChild(style);
        })(),
          initialize();
      });
    },
  });
  // RPGHQ - Thousands Comma Formatter
  /**
   * Adds commas to large numbers in forum posts and statistics.
   * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
   * License: MIT
   *
   * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/commaFormatter.md for documentation
   */ // Prefix for GM_setValue/GM_getValue keys
  // --- GM Wrappers ---
  function gmGetValue(key, defaultValue) {
    // eslint-disable-next-line no-undef
    return GM_getValue("RPGHQ_Manager_" + key, defaultValue);
  }
  function gmSetValue(key, value) {
    // eslint-disable-next-line no-undef
    GM_setValue("RPGHQ_Manager_" + key, value);
  }
  // --- Core Logic ---
  // Object to hold the runtime state of scripts (enabled/disabled)
  const scriptStates = {},
    loadedScripts = {};
  // Object to hold loaded script modules and their cleanup functions
  // Execute functions and scripts based on the load order for a specific phase
  function executeLoadOrderForPhase(phase) {
    log(`Executing load order for phase: ${phase}`);
    const itemsToLoad = loadOrder[phase] || [];
    0 !== itemsToLoad.length
      ? (itemsToLoad.forEach((item) => {
          // Check if it's a known shared function
          if ("function" == typeof sharedUtils[item]) {
            log(`-> Executing shared function: ${item}`);
            try {
              sharedUtils[item]();
            } catch (err) {
              error(`Error executing shared function ${item}:`, err);
            }
          }
          // Check if it's a script ID
          else {
            const script =
              ((scriptId = item),
              SCRIPT_MANIFEST.find((script) => script.id === scriptId));
            script
              ? // Check if script is enabled
                scriptStates[script.id]
                ? (log(
                    `-> Loading script from load order: ${script.name} (${script.id}) for phase: ${phase}`
                  ),
                  loadScript(script))
                : log(`-> Script ${item} skipped (disabled).`)
              : warn(
                  `-> Item "${item}" in load_order.json is not a known shared function or script ID.`
                );
          }
          // Find a script definition in the manifest by its ID
          var scriptId;
        }),
        log(`Finished executing load order for phase: ${phase}`))
      : log(`No items defined in load order for phase: ${phase}`);
  }
  // Map of script ids to their modules
  const scriptModules = {
    commaFormatter: Object.freeze({
      __proto__: null,
      init: function () {
        log("Thousands Comma Formatter initialized!");
        // Get user settings
        const formatFourDigits = GM_getValue(
            "RPGHQ_Manager_commaFormatter_formatFourDigits",
            !1
          ),
          numberRegex = formatFourDigits ? /\b\d{4,}\b/g : /\b\d{5,}\b/g;
        // Create regex based on settings
        // Core formatting function
        function formatNumberWithCommas(number) {
          return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        // Process forum statistics (only on index page)
        // Process all elements with numbers that need commas
        function processElements() {
          document
            .querySelectorAll(
              "dd.posts, dd.profile-posts, dd.views, span.responsive-show.left-box, .column2 .details dd"
            )
            .forEach((element) => {
              if (
                element.classList.contains("posts") ||
                element.classList.contains("views") ||
                (element.parentElement &&
                  element.parentElement.classList.contains("details"))
              ) {
                if (
                  element.previousElementSibling &&
                  "Joined:" ===
                    element.previousElementSibling.textContent.trim()
                )
                  return;
                element.childNodes.forEach((node) => {
                  node.nodeType === Node.TEXT_NODE &&
                    numberRegex.test(node.nodeValue) &&
                    (node.nodeValue = node.nodeValue.replace(
                      numberRegex,
                      (match) => formatNumberWithCommas(match)
                    ));
                });
              } else if (element.classList.contains("profile-posts")) {
                const anchor = element.querySelector("a");
                anchor &&
                  numberRegex.test(anchor.textContent) &&
                  (anchor.textContent = anchor.textContent.replace(
                    numberRegex,
                    (match) => formatNumberWithCommas(match)
                  ));
              } else if (element.classList.contains("responsive-show")) {
                const strong = element.querySelector("strong");
                strong &&
                  numberRegex.test(strong.textContent) &&
                  (strong.textContent = strong.textContent.replace(
                    numberRegex,
                    (match) => formatNumberWithCommas(match)
                  ));
              }
              element.querySelectorAll("strong").forEach((strong) => {
                numberRegex.test(strong.textContent) &&
                  (strong.textContent = strong.textContent.replace(
                    numberRegex,
                    (match) => formatNumberWithCommas(match)
                  ));
              });
            });
        }
        // Initial processing
        processElements(),
          (function () {
            // Only run on index.php
            if (!window.location.pathname.endsWith("index.php")) return;
            let totalTopics = 0,
              totalPosts = 0;
            // Get all posts and topics elements
            const postsElements = document.querySelectorAll("dd.posts"),
              topicsElements = document.querySelectorAll("dd.topics");
            // Function to format numbers, only adding commas for 5+ digits (or 4+ if enabled)
            function formatStatNumber(num) {
              return formatFourDigits
                ? num.toString().length >= 4
                  ? formatNumberWithCommas(num)
                  : num.toString()
                : num.toString().length >= 5
                  ? formatNumberWithCommas(num)
                  : num.toString();
            }
            // Find and update the statistics block
            // Sum up posts
            postsElements.forEach((element) => {
              const postsText = element.childNodes[0].textContent
                  .trim()
                  .replace(/,/g, ""),
                posts = parseInt(postsText);
              isNaN(posts) || (totalPosts += posts);
            }),
              // Sum up topics
              topicsElements.forEach((element) => {
                const topicsText = element.childNodes[0].textContent
                    .trim()
                    .replace(/,/g, ""),
                  topics = parseInt(topicsText);
                isNaN(topics) || (totalTopics += topics);
              });
            const statsBlock = document.querySelector(".stat-block.statistics");
            if (statsBlock) {
              const statsText = statsBlock.querySelector("p");
              if (statsText) {
                const existingText = statsText.innerHTML,
                  membersMatch = existingText.match(
                    /Total members <strong>(\d+)<\/strong>/
                  ),
                  newestMemberMatch = existingText.match(
                    /(Our newest member <strong>.*?<\/strong>)/
                  );
                // Keep the members count and newest member info, but update topics and posts
                membersMatch &&
                  newestMemberMatch &&
                  (statsText.innerHTML = `Total posts <strong>${formatStatNumber(totalPosts)}</strong> • Total topics <strong>${formatStatNumber(totalTopics)}</strong> • Total members <strong>${membersMatch[1]}</strong> • ${newestMemberMatch[1]}`);
              }
            }
          })();
        // Set up observer to handle dynamic content
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            "childList" === mutation.type && processElements();
          });
        });
        // Start observing
        // Return cleanup function
        return (
          observer.observe(document.body, {
            childList: !0,
            subtree: !0,
          }),
          {
            cleanup: () => {
              log("Thousands Comma Formatter cleanup"),
                // Disconnect observer
                observer.disconnect();
            },
            // We can't easily "undo" the formatting without a page reload
            // since we directly modified text nodes
          }
        );
      },
    }),
    bbcode: bbcode,
    kalareact: kalareact,
    notifications: notifications,
    pinThreads: pinThreads,
    separateReactions: separateReactions,
    memberSearch: memberSearch,
    randomTopic: randomTopic,
    recentTopicsFormat: recentTopicsFormat,
  };
  // Load a single script by its manifest entry
  function loadScript(script) {
    if (loadedScripts[script.id])
      log(`Script ${script.name} already loaded, skipping.`);
    else if (shouldLoadScript(script)) {
      // Check if the script should run on the current URL
      // log(`Loading script: ${script.name} (${script.id})`); // Phase is determined by load_order.json
      log(`Loading script: ${script.name} (${script.id})`);
      try {
        // Get the module from our imports
        const module = scriptModules[script.id];
        if (!module) return void error(`Script module ${script.id} not found`);
        // Check if the module has an init function
        if ("function" == typeof module.init) {
          let result;
          // Pass dependencies if needed
          (result =
            "recentTopicsFormat" === script.id || "notifications" === script.id
              ? module.init({
                  getScriptSetting: getScriptSetting,
                })
              : module.init()),
            // Store the loaded module and any cleanup function
            (loadedScripts[script.id] = {
              module: module,
              cleanup:
                result && "function" == typeof result.cleanup
                  ? result.cleanup
                  : null,
            }),
            log(`Successfully loaded script: ${script.name}`);
        } else warn(`Script ${script.name} has no init function, skipping.`);
      } catch (err) {
        error(`Failed to load script ${script.name}:`, err);
      }
    } else log(`Script ${script.name} not loaded: URL pattern did not match.`);
  }
  // Unload a single script by its ID
  function unloadScript(scriptId) {
    const scriptInfo = loadedScripts[scriptId];
    if (scriptInfo) {
      // Call cleanup function if it exists
      if (
        (log(`Unloading script: ${scriptId}`),
        scriptInfo.cleanup && "function" == typeof scriptInfo.cleanup)
      )
        try {
          scriptInfo.cleanup(),
            log(`Cleanup completed for script: ${scriptId}`);
        } catch (err) {
          error(`Error during cleanup for script ${scriptId}:`, err);
        }
      // Remove the script from loadedScripts
      delete loadedScripts[scriptId], log(`Script ${scriptId} unloaded.`);
    } else log(`Script ${scriptId} not loaded, nothing to unload.`);
  }
  // --- Script Toggle Event Handler ---
  // --- UI Handlers ---
  function handleRenderScriptsGridView(container, scripts, states) {
    !(function (container, scripts, scriptStates = {}, showScriptSettings) {
      if (
        (log("Rendering scripts in Grid View..."),
        !scripts || 0 === scripts.length)
      )
        return void renderEmptyState(
          container,
          "No scripts found. Try adjusting your filters to see more results."
        );
      const grid = document.createElement("div");
      (grid.className = "script-grid"),
        scripts.forEach((script) => {
          const isEnabled =
              void 0 !== scriptStates[script.id]
                ? scriptStates[script.id]
                : script.enabledByDefault,
            hasSettings = script.settings && script.settings.length > 0,
            card = document.createElement("div");
          (card.className = isEnabled ? "script-card" : "script-card disabled"),
            (card.dataset.scriptId = script.id),
            // Corrected innerHTML with single settings button + disabled logic
            (card.innerHTML = `\n      <div class="script-card-image">\n        <img src="${script.image || "https://via.placeholder.com/240x130?text=No+Image"}" \n             alt="${script.name}" \n             class="script-image-toggle" \n             data-script-id="${script.id}">\n      </div>\n      <div class="script-card-content">\n        <div class="script-card-header">\n          <h3 class="script-card-title">${script.name}</h3>\n          <div class="script-card-actions-top">\n            ${hasSettings ? `\n            <button \n              class="btn btn-icon view-settings" \n              title="Settings" \n              data-script-id="${script.id}"\n            >\n              <i class="fa fa-cog"></i>\n            </button>\n            ` : ""}\n          </div>\n        </div>\n        <p class="script-card-description">${script.description || "No description available."}</p>\n        <div class="script-card-footer">\n          <span class="script-card-version">v${script.version}</span>\n        </div>\n      </div>\n    `),
            grid.appendChild(card);
        }),
        (container.innerHTML = ""),
        container.appendChild(grid),
        // Add event listeners for settings buttons (only non-disabled ones)
        document
          .querySelectorAll(".view-settings:not([disabled])")
          .forEach((btn) => {
            btn.addEventListener("click", () => {
              const scriptId = btn.dataset.scriptId,
                script = scripts.find((s) => s.id === scriptId);
              script && showScriptSettings && showScriptSettings(script);
            });
          }),
        // Make the image clickable for toggling state
        document.querySelectorAll(".script-image-toggle").forEach((img) => {
          img.addEventListener("click", (e) => {
            const scriptId = img.dataset.scriptId,
              card = img.closest(".script-card");
            if (card) {
              const newState = !!card.classList.contains("disabled");
              newState
                ? card.classList.remove("disabled")
                : card.classList.add("disabled");
              const event = new CustomEvent("script-toggle", {
                detail: {
                  scriptId: scriptId,
                  enabled: newState,
                },
              });
              document.dispatchEvent(event);
            }
          });
        });
    })(container, scripts, states, handleShowScriptSettings);
  }
  function handleShowScriptSettings(script) {
    // Pass getScriptSetting as the third argument now
    showScriptSettings(
      script,
      renderScriptSettingsContent, // Renders the content area
      getScriptSetting, // Function to get current setting value
      saveScriptSetting
    );
  }
  function saveScriptSetting(scriptId, settingId, value) {
    gmSetValue(`script_setting_${scriptId}_${settingId}`, value),
      log(`Saved setting: ${scriptId}.${settingId} = ${value}`);
  }
  function getScriptSetting(scriptId, settingId, defaultValue) {
    const storageKey = `script_setting_${scriptId}_${settingId}`;
    let value = gmGetValue(storageKey, defaultValue);
    // If the value retrieved is the default (meaning it wasn't set),
    // or explicitly undefined, set it in storage now.
    // Tampermonkey might return the default value directly if the key doesn't exist.
    // We check if the retrieved value *is* the default to cover this.
    // Check actual stored value
    return (
      void 0 === gmGetValue(storageKey) &&
        (gmSetValue(storageKey, defaultValue),
        log(
          `Setting default value for ${scriptId}.${settingId}: ${defaultValue}`
        ),
        (value = defaultValue)),
      value
    );
  }
  // --- Tab Content Handling ---
  function handleLoadTabContent(tabName) {
    const contentContainer = document.getElementById("mod-manager-content");
    contentContainer &&
      loadTabContent(tabName, {
        container: contentContainer,
        scripts: SCRIPT_MANIFEST,
        scriptStates: scriptStates,
        renderScriptsGridView: handleRenderScriptsGridView,
      });
  }
  // --- Modal Visibility Logic ---
  function toggleModalVisibility() {
    const modal = document.getElementById("mod-manager-modal"),
      isVisible = modal && "block" === modal.style.display;
    log(
      `Toggling modal visibility. Currently ${isVisible ? "visible" : "hidden"}.`
    ),
      isVisible
        ? hideModal()
        : /**
           * Shows the userscript manager modal and sets up tab functionality.
           *
           * @param {Object} options - Configuration options
           * @param {Function} options.loadTabContent - Function to load tab content
           * @param {Function} options.hideModal - Function to hide the modal
           */
          (function ({ loadTabContent: loadTabContent, hideModal: hideModal }) {
            log("Showing userscript manager modal...");
            let modal = document.getElementById("mod-manager-modal");
            modal ||
              ((modal = document.createElement("div")),
              (modal.id = "mod-manager-modal"),
              (modal.className = "mod-manager-modal"),
              (modal.innerHTML = `\n      <div class="mod-manager-modal-content">\n        <div class="mod-manager-header">\n          <h2 class="mod-manager-title">RPGHQ Userscript Manager <span style="font-size: x-small;">v${GM_info.script.version}</span></h2>\n          <span class="mod-manager-close">&times;</span>\n        </div>\n        <div class="mod-manager-tabs">\n          <div class="mod-manager-tab active" data-tab="installed">\n            <i class="fa fa-puzzle-piece"></i> Installed Scripts\n          </div>\n          <div class="mod-manager-tab" data-tab="forum">\n            <i class="fa fa-sliders"></i> Forum Preferences\n          </div>\n          \x3c!-- Settings tab completely hidden --\x3e\n        </div>\n        <div class="mod-manager-content" id="mod-manager-content">\n          \x3c!-- Content loaded dynamically --\x3e\n        </div>\n      </div>\n    `),
              document.body.appendChild(modal),
              // Add event listeners
              modal
                .querySelector(".mod-manager-close")
                .addEventListener("click", () => {
                  hideModal();
                }),
              modal.addEventListener("click", (e) => {
                e.target === modal && hideModal();
              }),
              // Tab switching
              modal.querySelectorAll(".mod-manager-tab").forEach((tab) => {
                tab.addEventListener("click", () => {
                  document.querySelectorAll(".mod-manager-tab").forEach((t) => {
                    t.classList.remove("active");
                  }),
                    tab.classList.add("active"),
                    loadTabContent(tab.dataset.tab);
                });
              })),
              (modal.style.display = "block"),
              (document.body.style.overflow = "hidden"),
              // Initial view - load the first tab (Installed Scripts)
              loadTabContent("installed");
          })({
            loadTabContent: handleLoadTabContent,
            hideModal: hideModal,
          });
  }
  // --- Add Button to Profile Dropdown ---
  // Add Font Awesome CSS if not already present
  function addMenuButton(toggleVisibilityCallback) {
    // Ensure FA is loaded for the icon
    !(function () {
      if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement("link");
        (link.rel = "stylesheet"),
          (link.href =
            "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"),
          document.head.appendChild(link),
          log("RPGHQ Manager: Added Font Awesome CSS link.");
      }
    })();
    const profileDropdown = document.querySelector(
      '.header-profile.dropdown-container .dropdown-contents[role="menu"]'
    );
    if (!profileDropdown)
      return void warn("RPGHQ Manager: Could not find profile dropdown menu.");
    // Find the logout button more robustly
    const logoutButton = Array.from(
      profileDropdown.querySelectorAll("li")
    ).find((li) => {
      const link = li.querySelector("a");
      return (
        link &&
        (link.textContent.trim().includes("Logout") ||
          "Logout" === link.getAttribute("title"))
      );
    });
    if (!logoutButton)
      return void warn(
        "RPGHQ Manager: Could not find logout button for reference."
      );
    // Check if button already exists
    const existingButton = profileDropdown.querySelector(
      'a[title="RPGHQ Userscript Manager"]'
    );
    if (existingButton)
      return (
        log("RPGHQ Manager: Button already exists, updating listener."),
        void (existingButton.onclick = function (e) {
          e.preventDefault(), toggleVisibilityCallback();
        })
      );
    // Create the new button
    const userscriptsButton = document.createElement("li");
    (userscriptsButton.innerHTML =
      '\n    <a href="#" title="RPGHQ Userscript Manager" role="menuitem">\n      <i class="icon fa-puzzle-piece fa-fw" aria-hidden="true"></i><span>Userscripts</span>\n    </a>\n  '),
      // Add click handler
      (userscriptsButton.querySelector("a").onclick = function (e) {
        e.preventDefault(), toggleVisibilityCallback();
      }),
      // Insert before logout button
      profileDropdown.insertBefore(userscriptsButton, logoutButton),
      log("RPGHQ Manager: 'View Userscripts' button added to profile menu.");
  }
  // --- Initialization ---
  document.addEventListener("script-toggle", (event) => {
    const { scriptId: scriptId, enabled: enabled } = event.detail;
    !(function (
      scriptId,
      newState,
      scriptStates,
      gmSetValue,
      scriptManifest,
      loadScript,
      unloadScript
    ) {
      const storageKey = `script_enabled_${scriptId}`;
      log(
        `Toggling script '${scriptId}' to ${newState ? "Enabled" : "Disabled"}`
      ),
        // Update the runtime state
        (scriptStates[scriptId] = newState),
        // Save the new state to GM storage
        gmSetValue(storageKey, newState),
        // Trigger immediate loading/unloading based on new state
        log(
          `State for ${scriptId} saved as ${newState}. Triggering script ${newState ? "loading" : "unloading"}...`
        );
      // Find the script in the manifest
      const script = scriptManifest.find((s) => s.id === scriptId);
      script
        ? // Load or unload the script based on new state
          newState
          ? loadScript(script)
          : unloadScript(scriptId)
        : error(`Could not find script with ID ${scriptId} in manifest.`);
    })(
      scriptId,
      enabled,
      scriptStates,
      gmSetValue,
      SCRIPT_MANIFEST,
      loadScript,
      unloadScript
    );
  }),
    log("Initializing RPGHQ Userscript Manager..."),
    log("Initializing script states..."),
    SCRIPT_MANIFEST.forEach((script) => {
      const storageKey = `script_enabled_${script.id}`;
      // Load state from GM storage, falling back to manifest default
      (scriptStates[script.id] = gmGetValue(
        storageKey,
        script.enabledByDefault
      )),
        log(
          `Script '${script.name}' (${script.id}): ${scriptStates[script.id] ? "Enabled" : "Disabled"} (Default: ${script.enabledByDefault})`
        );
    }),
    log("Script states initialized:", scriptStates),
    // Execute load order for document-start phase immediately
    executeLoadOrderForPhase("document-start"),
    // Set up listeners for other execution phases
    document.addEventListener("DOMContentLoaded", () => {
      executeLoadOrderForPhase("document-end"),
        // Add menu button (needs DOM ready)
        addMenuButton(toggleModalVisibility);
    }),
    window.addEventListener("load", () => {
      executeLoadOrderForPhase("document-idle");
    }),
    // Set up a phase for after DOM is fully ready and rendered
    setTimeout(
      () => {
        executeLoadOrderForPhase("after_dom"), checkForUpdates();
      }, // Check for updates after everything else
      500
    ), // Small delay to ensure everything is loaded
    // Add keyboard shortcut listener for Insert key
    document.addEventListener("keydown", (event) => {
      // Insert key = keyCode 45
      if (45 === event.keyCode) {
        // Don't toggle if focus is on an input element
        if (
          "INPUT" === document.activeElement.tagName ||
          "TEXTAREA" === document.activeElement.tagName ||
          document.activeElement.isContentEditable
        )
          return void log(
            "Insert key pressed in input field, ignoring modal toggle."
          );
        event.preventDefault(), toggleModalVisibility();
      }
    });
})();
