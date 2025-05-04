// ==UserScript==
// @name         RPGHQ Userscript Manager
// @namespace    rpghq-userscripts
// @version      0.9.2
// @description  RPGHQ Userscript Manager
// @author       loregamer
// @match        https://rpghq.org/*
// @match        https://vault.rpghq.org/*
// @match        *://*.rpghq.org/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAyRSURBVGhDzVkJdFTVGf5nn0kykxVCEkgICYSwRUxYRBIJQYlFjQQVOCKLylKXUsClogcVrQtH1IOtWsux6KmihQMqRqtiqwRlX6IYjeyEJaxZSSbLzOv337fMezMTqq2o3zlf5t173/L/9/73X27oImAEeBqUFHaAR8FTYDl4NWgFf3Uwg9eBjaAqfDj6wB3gJNAN/irQBVwBtoPhhA5HP3gcfAxMB3kCfnZYwCngSTCckHqywMxwY61gGZgG/ixgG84CPwHZJMIJFUKr2Swlu92S2WTqTJF68EEwCvzJYQJjwFLwS9ALhhNCZVghHRaL9ODlV0hFPXv5bWZzZ4ocAW8GHeD/h1sWrnEVlN5bGJuY/o7ZbKlDV2cfDSZ7H/XaoKzLapXW3DBZqph5pzRrcJ7kRFs/rpC/sxPMAf8nWFMyc69Kycw7Y7E6wn1A0GZ3SVabcbxH1jDJbAkIdXVGn1MxTqdBcbfdLr0/cYp0dsFCadP0WVJBak8JS6yN68he7VrwB4OXrRj8gjqxVZPJLEUndJfyxy+QuqUNMIwlJPeWpi9aJ5nMFq3v/hH50uYZs/0pbo/h3iibXVpVOkkocXr+A9LK8TdJGbFxPBb83WaQTTcEetfF19eDvGzsEUaQxJMSgM0RQQNH3khTH1pLtz32MZ2u/pZqDu9RRomckdE0/s6XsVtMeJRlkNElIpJ6x8WbVk2Y5I9zuZReoqb2Npqxbg19dbKGsLHpql6ZtHHaTFo2dpwJZtam3Mbgh14HC0RLB70CA8DXwH6gwSc7IzyUWzSN5jy9gX4zYwklpefQzk9fp+92fKjcgQcsViqe+iTFJ2VQW0sT5o0nTka0Q96LWfEJ5tUTJlNiZKRoM1iJW95dTQ2t7EmJ7BYL3Twghz6dcqs9wRUh+hTwQ2+A7Eg06AUdCIZERpc7jmY+8S+68uZHKdKTAPMxUc2hr6n8necMQuaNmUFZeZwlIJq1tYhfFTGOwKznJHYjrASUcio9yDMaG2hW2btSu489sgwoS2tunEweRXkF3cH7QM0y9ArwGw0mw2hpPEdflb+ttMjU3ualD/52P/k65BljpPcvoILSBbAc+XHveXbnATisHO8C6N8lkV4ZV0KIC0oPAsrBfaZ71v+zrcMfMD2+b+YleUpLwzwwU74MMhUd/GzHKr5Y9wLVnjxEjbUn6c0lk+hUdaUyIq/QdbOXkdUWmNHGOg7MMti2Y52BFVAxumcvunvIcKUl4+97KqzLd22X/MrKHqyrpeW7OW0ygD+0DBSz0pkCUrfU/pp9dGDWN773PK1YfA2dOLBb6ZWRXzKPXFEGs6TW5gblSkByG81AgBW7/7J8uiG7v9IjYF70+ae+L6oPezccOUTFb75G9a0cQkIwCuT8qxMF4CdHlswzWe2BWa3c/B6dr+csWQEEyCmYJPUbXkL1Z4/R6aNVdPrY99QMk/P7OjTlJbgjH8yCiWvx29rRQfVeL51oaqTf5g4V+0KFT5Ks41e9SRNWr6QzLew9ZSBqK1cCPCPsdAyYC/KHhZ+f8cgHEgKZaAeTx5N6XSII14mgZRN9TA5qdmek/n5/t8gof3ZCF2lYSncJwkrJUW4p0mYTuRFWorMAppEj9+IrRgffdydowLOgGOQgNPupz6VLR9+if+AXYaonWvpw0lRp5+13SBYoqxvjNFwzId6x2pKYzVZyOKMoOqGH0vPLIC8pmTZMu52GpnSnlvZ2Uje3ArE5VAVsYLZ8KQcuuyuS0rJHiAAVDJgKWax2crg8FJeY7sseeq238KaFNOSq26hrj37skfRRlOIRkDgosTfi6x4ejx/CSVMG5tADlxcQUopAAJBnV6CprZ1cVhaNaNuJY4EB+R7hClXpOICJXc3gaGqx2Klr9768Ualiw1u8McUYK1R61yuU1HMgWe0uCGu3YA9gdWW36/f76Mi3m2reWjqFg46YoIcLCqk0qx98s4QOE/t/swWbkn3+5LX/4GisBQq8pQXSiRC8v/YsHUOQS4uOoT2nAq4ZYIW/5gt1BQpBu3xJlJwxWHiZyi3raPfnKzXhGXz9JeKCI8KNFYgSK6EKz4Bo5IlPYdvTJuxIfR25bDaKtNnFrw3pArvR177aRZ8dPqjcJYT3XZ+VrcnRDgUXl/9bKFp5RucBZfPhQwKhAH+dMz1ZCry49+ArRaT9bPVTBCcouvU4fmAXfbjiD9TRHtZHs3ImvEcLqYfr64UL1eMcXOQzmzYqLQH/IwWjfY8WFFnhdZQuoo/276Xqhnqsxjn9C7guEfkKK8DLpxUNDqdb2HHFhrepSRdR2d5ZORXfbHqH3l9+D5QIpBQqOGvFPtEGDtYhNgQp8NyWTQY/PyY9w4yYYE/xeGhGTq7SCykRM1ZV7pFqvS18YKBiPyhmVlVAs//I6C5Czu3r+ZBBBtwqld79F5GR6vHdtveR1D2LVQrkLwyr2OBubXl4BtkcVGw+Wk2vVgRSBFRk9PioMcT7gjFzcC6h9BTXjJd2bm1s0yV6wAFQzAg/weFWy1ujoMA55D11p7kslZGY2p9S+wyjookPUfYwPvoJYOtHy6lq50dKSwZ7qaT0QfFKU6TK7AYZNU1NdHvZWvJiZlVM7DeQMmPjlBYRCh8aksw+QAae5yI/oBFRLagpwMLLvgrwxCfT7s/eMNh+TsFErIJZeKBrbltKfYeMU0bwFtxXvnapwZT43pguaZq98SZs7minZijBBcwJKKGCPczD+YUiTVfBKzF36GVioytgOeXlkaG5ae5k4bU7nRHRtHfXeqUFc7A5xKZWYYFfLp76BIJcYIbO1RwQ2aoedmegGOGp4lx/7sdltPU4nzLKYNNB9SVFOwM5l4rLu6cikKUoLYGAhjrotRLgmTzfEHBZiWkDKNKdoLRkcOk4suT3SgsConz8ZvO7Sis8Xt65jdZ+F0jDEThoSdFYGtlDrFSIcA4o98yYsULJCyFEgYZzxw1+n2tgNolgpA8owGoE0uSK8rfI22wsZFSwC30Veb3eD82+dChN7j9IaYVHdkJXuqGvId0OgSqZNgNnkBKrYJtP63uZ0jIiwh2Pzc3lswyu3MrgVjkSBwMpsqCKcZl9aFH+KL2NhwWPP144hgrT+OjUAG1Dh0xtY22NcgWPFJNInrgkpWUER9yC8QsMudLe3Z/Q5rIXQ4KWHkit2e5FNP4hcNsduP8aTj/0L+UCQmivKqAN6o9DsnKLRarQGTjZGzp2ltKSsfG9ZVRdtUVpheKxUUUUE6bEvBDcDsQVizhnUpEBCtn5T9jpgi/380nDhcB7Y2TJXKGICr+vndb8ebYhiqvg2S/O6CM8Ujg2tbXRyfNNVHX2DKGspPUH99MH+74XkbjVp9uYusNfXgaOIPvAWO7QwXvdnBeasQfiuGDvaGsh/Tt4pbhWZq/F9r/ur/MM3otNS+8MGDFwl5xWQ5iQ1IJLTY4VHPB4vwSPB4E3Km9ALZ14XGnwU8H08/knTEmcd+rJJSSWSlBch3/+YpCDjmETcYONmSNcuAd+bfwWFN4j2I/lg38Eh4Ch4fFHAMmcr7WlUZ0lf4zD2WE2m+xcYaECgxczfppdZgRqBU4tMmPjqSd+y/ZV0bq9VcodGliBpSCf0BkPbxVwH4feheBsMMRl8GFWVu7VyHdSyely440S1Z06TNV7t1NLUy1lDCrk40fv0b3bxCTghd7KOb+zRdkdFj4euZD/V8fertwjUg/9SR3Ae/V5kM9IuSYIWYFgcJq9CLwVNJy0YoapeNqTIrHTl5Pshfi1KxZf246gKJJEzGzzvjvmRXB60Bk4drCwp5rP0/Jd2+mlHVsNKTiwBuT/2hiqqP+mAIPv6Q2+CHLpqQU/rhPyxkynKybcJ5I+Fex9Xrx3ZEdTXY2QODEy0lsx8y6nPnixl+HUurz6EO08cVwcIx4Aj6MGZi8VhK1gERhIYxX8EAVUsDDTQT6XNJhVNyR8xdOfokRUchwbuNT80/zhPu/5OiFxr5jYhi23zvGwebC/P4QaecmmciqDfYcRNhhcvPOx9zHR+gnAx8VsiwbPwG623/ASac6Scmn+S5USTIyDgBhLjnJXHbp7gYTsUxrUNVHCPjA82wm53nwVDI5PPwk4Eq4EQ2IHHyvmXz8fv1GaAshjdsCraO0w5DE2D/7H9wZwAchH6Jq5XgywefA/uXlpQ4Uy/n+NyzXjuEw+xn4Z5D3GM82OIrBRfibwh58G2a2FEzKYvGrfgPNBLrl+zD68aGAhUGOa+J+DFzIVXombwM796S8MFmw8yJtcb0JMPoi6cHr7o0H0HzS6ilTHXLvBAAAAAElFTkSuQmCC
// @grant        GM_addStyle
// @connect      rpghq.org
// @run-at       document-start
// @homepage     https://github.com/loregamer/rpghq-userscripts#readme
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/dist/rpghq-userscript-manager.user.js
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/dist/rpghq-userscript-manager.user.js
// ==/UserScript==

!function(e){"use strict";
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
`);const t=[{id:"bbcode",name:"BBCode Highlighting",version:"1.0.0",description:"Adds BBCode highlighting and other QOL improvements to the text editor",author:"loregamer",path:"./scripts/bbcode.js",enabledByDefault:!0,image:"https://f.rpghq.org/bEm69Td9mEGU.png?n=pasted-file.png",urlPatterns:["https://rpghq.org/forums/posting.php?mode=post*","https://rpghq.org/forums/posting.php?mode=quote*","https://rpghq.org/forums/posting.php?mode=reply*","https://rpghq.org/forums/posting.php?mode=edit*"],settings:[],categories:["UI"]},{id:"quotes",name:"Better Quotes",version:"1.0.0",description:"Improves quote functionality with styling, avatars, read more/less, and nested quote toggles.",author:"loregamer",image:"https://f.rpghq.org/mqbRTIvY56fp.png?n=pasted-file.png",path:"./scripts/quotes.js",enabledByDefault:!0,settings:[],categories:["UI"]},{id:"kalareact",name:"Kalarion Reaction Auto-Marker",version:"1.0.0",description:"Auto marks Kalarion rape notifs as read (I will move this to user preferences and make it squashed instead)",author:"loregamer",image:"https://f.rpghq.org/OA0rQkkRSSVq.png?n=pasted-file.png",path:"./scripts/kalareact.js",enabledByDefault:!1,settings:[],categories:["General"]},{id:"memberSearch",name:"Member Search Button",version:"1.0.0",description:"Adds a quick member search button next to Unread posts",author:"loregamer",image:"https://f.rpghq.org/Rjsn2V3CLLOU.png?n=pasted-file.png",path:"./scripts/memberSearch.js",enabledByDefault:!0,settings:[],categories:["Fun"]},{id:"notifications",name:"Notification Improver",version:"1.0.0",description:"Adds smileys to reacted notifs, adds colors, idk just makes em cooler I guess",author:"loregamer",image:"https://f.rpghq.org/rso7uNB6S4H9.png",path:"./scripts/notifications.js",enabledByDefault:!0,settings:[{id:"readOpacity",label:"Read Notification Opacity",type:"number",min:.1,max:1,step:.05,default:.8,description:"How transparent read notifications should be (1 = fully opaque)."},{id:"readTintColor",label:"Read Notification Tint Color",type:"color",default:"rgba(0, 0, 0, 0.05)",description:"A subtle color tint applied to read notifications."},{id:"enableNotificationColors",label:"Enable Notification Type Colors",type:"checkbox",defaultValue:!0,description:"Define custom background colors for notification types using JSON format (hex codes). Requires 'Enable Notification Type Colors' to be active."},{id:"quoteColor",label:"Quote Notification Color",type:"color",defaultValue:"#F5575D",description:"Set the text color for quote notifications.",dependsOn:{settingId:"enableNotificationColors",value:!0}},{id:"replyColor",label:"Reply Notification Color",type:"color",defaultValue:"#2E8B57",description:"Set the text color for reply notifications.",dependsOn:{settingId:"enableNotificationColors",value:!0}},{id:"reactionColor",label:"Reaction Notification Color",type:"color",defaultValue:"#3889ED",description:"Set the text color for reaction notifications.",dependsOn:{settingId:"enableNotificationColors",value:!0}},{id:"mentionColor",label:"Mention Notification Color",type:"color",defaultValue:"#FFC107",description:"Set the text color for mention notifications.",dependsOn:{settingId:"enableNotificationColors",value:!0}},{id:"editColor",label:"Edit Notification Color",type:"color",defaultValue:"#fafad2",description:"Set the background color for edit notifications.",dependsOn:{settingId:"enableNotificationColors",value:!0}},{id:"approvalColor",label:"Approval Notification Color",type:"color",defaultValue:"#00AA00",description:"Set the text color for approval notifications.",dependsOn:{settingId:"enableNotificationColors",value:!0}},{id:"reportColor",label:"Report Notification Color",type:"color",defaultValue:"#f58c05",description:"Set the text color for report notifications.",dependsOn:{settingId:"enableNotificationColors",value:!0}},{id:"warningColor",label:"Warning Notification Color",type:"color",defaultValue:"#D31141",description:"Set the text color for warning notifications.",dependsOn:{settingId:"enableNotificationColors",value:!0}},{id:"timestampColor",label:"Timestamp Color",type:"color",defaultValue:"#888888",description:"Set the text color for notification timestamps."},{id:"referenceBackgroundColor",label:"Reference Background Color",type:"color",defaultValue:"rgba(23, 27, 36, 0.5)",description:"Set the background color for the post reference preview."},{id:"referenceTextColor",label:"Reference Text Color",type:"color",defaultValue:"#ffffff",description:"Set the text color for the post reference preview."},{id:"defaultColor",label:"Default Notification Row Background",type:"color",defaultValue:"#ffffff",description:"Set the default background color for notification rows on the main page (used if type-specific colors are off or not set)."},{id:"enableImagePreviews",label:"Enable Image Previews",type:"checkbox",defaultValue:!0,description:"Shows image previews in 'Post replied to' notifications.",previewImage:"https://f.rpghq.org/X4oQJRUQ0Avb.png?n=pasted-file.png"},{id:"enableVideoPreviews",label:"Enable Video Previews",type:"checkbox",defaultValue:!1,description:"Shows video previews in 'Post replied to' notifications. Warning: This might impact performance."},{id:"enableReactionSmileys",label:"Show Reaction Smileys",type:"checkbox",defaultValue:!0,description:"Fetches and displays reaction smileys within reaction notifications.",previewImage:"https://f.rpghq.org/DVH4QZTYWIZg.png?n=pasted-file.png"},{id:"resizeFillerWords",label:"Resize Filler Words",type:"checkbox",defaultValue:!0,description:"Makes common filler words like 'and', 'by', 'in' smaller in notification text for better readability.",previewImage:"https://f.rpghq.org/xDtPAZ1xQxLL.png?n=pasted-file.png"},{id:"enableQuotePreviews",label:"Enable Quote Previews",type:"checkbox",defaultValue:!0,description:"Shows a preview of the quoted text in 'Post quoted' notifications."}],categories:["UI"]},{id:"pinThreads",name:"Pin Threads",version:"1.0.0",description:"Adds a Pin button to threads so you can see them in board index",author:"loregamer",image:"https://f.rpghq.org/HTYypNZVXaOt.png?n=pasted-file.png",path:"./scripts/pinThreads.js",enabledByDefault:!0,settings:[],categories:["UI"]},{id:"randomTopic",name:"Random Topic Button",version:"1.0.0",description:"Adds a Random Topic button, for funsies",author:"loregamer",image:"https://f.rpghq.org/LzsLP40AK6Ut.png?n=pasted-file.png",path:"./scripts/randomTopic.js",enabledByDefault:!0,settings:[],categories:["Fun"]},{id:"separateReactions",name:"Reaction List Separated",version:"1.0.0",description:"Makes smiley reactions and counts separated",author:"loregamer",image:"https://f.rpghq.org/H6zBOaMtu9i2.gif?n=Separated%20Reactions%20(2).gif",path:"./scripts/separateReactions.js",enabledByDefault:!1,settings:[],categories:["UI"]},{id:"recentTopicsFormat",name:"Slightly Formatted Thread Titles in Recent Topics",version:"1.0.0",description:"Adds some minor formatting to thread titles, like unbolding stuff in parantheses, add line wrapping, or reformatting the AG threads",author:"loregamer",image:"https://f.rpghq.org/97x4ryHzRbVf.png?n=pasted-file.png",path:"./scripts/recentTopicsFormat.js",enabledByDefault:!1,settings:[{id:"unboldParentheses",label:"Unbold Text in Parentheses",type:"checkbox",defaultValue:!0,description:"Removes bold formatting from text within parentheses in recent topics titles."},{id:"wrapTitles",label:"Wrap Long Titles",type:"checkbox",defaultValue:!0,description:"Allows long thread titles in recent topics to wrap instead of being cut off."},{id:"reformatAGThreads",label:"Reformat AG Thread Titles",type:"checkbox",defaultValue:!0,description:"Reformats 'All Games' thread titles for better readability (e.g., moves chapter number)."},{id:"addSupportSymbol",label:"Mark Support Threads",type:"checkbox",defaultValue:!0,description:"Adds ⚒ symbol to thread titles in support categories/forums."}],categories:["UI"]},{id:"commaFormatter",name:"Thousands Comma Formatter",version:"2.1.2",description:"Add commas to large numbers in forum posts and statistics.",author:"loregamer",image:"https://f.rpghq.org/olnCVAbEzbkt.png?n=pasted-file.png",path:"./scripts/commaFormatter.js",enabledByDefault:!0,urlPatterns:[],settings:[{id:"formatFourDigits",label:"Format 4-digit numbers",type:"checkbox",defaultValue:!1,description:"Enable to add commas to 4-digit numbers (1,000+). Disable to only format 5-digit numbers (10,000+)."}]}];function n(e){return!e.urlPatterns||0===e.urlPatterns.length||function(e){if(!e)return!0;const t=Array.isArray(e)?e:[e];if(0===t.length)return!0;const n=window.location.href;return t.some((e=>{const t=e.replace(/[.+?^${}()|[\]\\]/g,"\\$&").replace(/\*/g,".*");return new RegExp("^"+t+"$").test(n)}))}(e.urlPatterns)}function o(...e){console.log("%c[RPGHQ Userscript Manager]%c","color: #3889ED; font-weight: bold","",...e)}function r(...e){console.warn("%c[RPGHQ Userscript Manager]%c","color: #FFC107; font-weight: bold","",...e)}function s(...e){console.error("%c[RPGHQ Userscript Manager]%c","color: #F5575D; font-weight: bold","",...e)}const i={_cachePostData:(e,t)=>{console.log(`Caching data for post ${e}`)},_getCachedPostData:e=>(console.log(`Getting cached data for post ${e}`),null),_cachePostsOnPage:()=>{console.log("Shared Logic: Caching posts on current page (stub).")},_applyUserPreferences:()=>{console.log("Shared Logic: Applying user preferences (stub).")},_applyThreadPreferences:()=>{console.log("Shared Logic: Applying thread preferences (stub).")},_cacheTopicData:(e,t)=>{console.log(`Caching data for topic ${e}`)},_getCachedTopicData:e=>(console.log(`Getting cached data for topic ${e}`),null)};function a(e,t){o(`Showing update notification for version ${e}`),function(){const e="update-notification-style";if(document.getElementById(e))return;const t=document.createElement("style");t.id=e,t.textContent="\n    .update-notification {\n      position: fixed;\n      bottom: 20px;\n      right: 20px;\n      background-color: #C62D51; /* Green */\n      color: white;\n      padding: 10px 15px;\n      border-radius: 5px;\n      cursor: pointer;\n      font-size: 14px;\n      z-index: 10001; /* Above modal */\n      box-shadow: 0 2px 5px rgba(0,0,0,0.2);\n      transition: opacity 0.3s ease-in-out;\n    }\n    .update-notification:hover {\n      opacity: 0.9;\n    }\n    .update-notification-close {\n      margin-left: 10px;\n      font-weight: bold;\n      cursor: pointer;\n    }\n  ",document.head.appendChild(t)}();const n=document.getElementById("update-notification-bubble");n&&n.remove();const r=document.createElement("div");r.id="update-notification-bubble",r.className="update-notification",r.innerHTML=`\n    Userscript Update (v${e})\n    <span class="update-notification-close" title="Dismiss">&times;</span>\n  `,r.addEventListener("click",(e=>{e.target!==r.querySelector(".update-notification-close")&&(o(`Opening download URL: ${t}`),window.open(t,"_blank"))})),r.querySelector(".update-notification-close").addEventListener("click",(e=>{e.stopPropagation(),o("Dismissing update notification."),r.remove()})),document.body.appendChild(r)}async function c(){o("Checking for userscript updates...");const e=GM_info.script.version,t=GM_info.script.updateURL||GM_info.script.downloadURL,n=GM_info.script.downloadURL||GM_info.script.updateURL;if(t)try{GM_xmlhttpRequest({method:"GET",url:t,onload:function(s){if(s.status>=200&&s.status<300){const i=s.responseText.match(/@version\s+([\d.]+)/);if(i&&i[1]){const t=i[1];o(`Current version: ${e}, Latest version: ${t}`),function(e,t){const n=e.split(".").map(Number),o=t.split(".").map(Number),r=Math.max(n.length,o.length);for(let e=0;e<r;e++){const t=n[e]||0,r=o[e]||0;if(t>r)return 1;if(t<r)return-1}return 0}(t,e)>0?(o(`Update available: ${t}`),a(t,n)):o("Script is up to date.")}else r("Could not find @version tag in metadata file:",t)}else r(`Failed to fetch metadata. Status: ${s.status}`,t)},onerror:function(e){s("Error fetching metadata:",e)}})}catch(e){s("Error during GM_xmlhttpRequest setup:",e)}else r("No updateURL or downloadURL found in script metadata. Cannot check for updates.")}var l={"document-start":["_applyThreadPreferences","_cachePostsOnPage","_applyUserPreferences"],"document-end":["bbcode","memberSearch","randomTopic","kalareact","notifications","pinThreads","separateReactions","quotes","recentTopicsFormat","commaFormatter"],"document-idle":[],after_dom:[]};const d="hqUserRules";async function u(){try{return ge(d,{})}catch(e){return s("Error retrieving user rules:",e),{}}}async function p(e){try{return he(d,e),o("User rules saved successfully"),!0}catch(e){return s("Error saving user rules:",e),!1}}async function m(e){return(await u())[e]||null}async function f(e,t){try{return await async function(e,t){try{const n=await u();return n[e]=t,await p(n)}catch(t){return s(`Error saving rules for user ${e}:`,t),!1}}(e,t)}catch(t){return s(`Error updating rules for user ${e}:`,t),!1}}const g=".message-userDetails .message-username",h=".message-userDetails .message-username a",b=".message-userDetails .username",y=".p-title-value",v=".memberCard",x=".memberCard--username",w=".username";function S(e){if(!e)return null;try{const t=new URL(e,window.location.origin),n=t.pathname.match(/\/members\/.*\.(\d+)\/?/);if(n&&n[1])return n[1];const o=t.pathname.match(/\/members\/.*\.(\d+)\/content\/?/);if(o&&o[1])return o[1];const r=t.pathname.match(/\/members\/.*\.(\d+)\/about\/?/);if(r&&r[1])return r[1];const s=t.pathname.match(/\/posts\/(\d+)\/?/);return s&&s[1],null}catch(e){return s("Error extracting user ID from URL:",e),null}}function q(e){if(!e)return null;try{const t=e.closest(".message")||e.querySelector(".message");if(t)return function(e){if(!e)return null;try{const t=e.querySelector(h)||e.querySelector(b);if(t){const e=S(t.href),n=t.textContent.trim();if(e&&n)return{userId:e,username:n}}const n=e.querySelector(g);return n?{userId:null,username:n.textContent.trim()}:null}catch(e){return s("Error extracting user from post:",e),null}}(t);const n=e.closest(v)||e.querySelector(v);if(n)return function(e){if(!e)return null;try{const t=e.querySelector(x);if(!t)return null;const n=t.querySelector("a");if(!n)return null;const o=S(n.href),r=n.textContent.trim();return o&&r?{userId:o,username:r}:null}catch(e){return s("Error extracting user from member card:",e),null}}(n);const o=e.querySelector(w);if(o&&"A"===o.tagName){const e=S(o.href),t=o.textContent.trim();if(e&&t)return{userId:e,username:t}}if("A"===e.tagName&&(e.classList.contains("username")||e.classList.contains("username--staff")||e.classList.contains("username--moderator")||e.classList.contains("username--admin"))){const t=S(e.href),n=e.textContent.trim();if(t&&n)return{userId:t,username:n}}return null}catch(e){return s("Error getting user from element:",e),null}}const C="TOPIC_VIEW",E="PROFILE_VIEW",L="RECENT_TOPICS_LIST",k="SEARCH_RESULTS",T="MEMBER_LIST",M="OTHER";function A(){const e=window.location.href;return e.includes("/threads/")||e.includes("/posts/")?C:e.includes("/members/")&&!e.includes("/list")?E:e.includes("/whats-new/")||e.includes("/latest-activity")?L:e.includes("/search/")?k:e.includes("/members/list")?T:M}function _(e,t){if(!e||!t)return!1;try{switch(t.action){case"HIDE":return function(e,t){if(!e)return!1;try{switch(t.subject){case"POST_BODY":const t=e.querySelector(".message-body")||e.closest(".message-body");if(t)return t.style.display="none",!0;break;case"SIGNATURE":const n=e.querySelector(".message-signature")||e.closest(".message-signature");if(n)return n.style.display="none",!0;break;case"AVATAR":const o=e.querySelector(".message-avatar")||e.closest(".message-avatar")||e.querySelector(".avatar");if(o)return o.style.display="none",!0;break;case"USERNAME":const r=e.querySelector(".message-username")||e.closest(".message-username")||e.querySelector(".username");if(r)return r.style.opacity="0.5",r.style.fontSize="0.8em",!0}return!1}catch(e){return s("Error applying HIDE rule:",e),!1}}(e,t);case"HIGHLIGHT":return function(e,t){if(!e)return!1;try{const n=t.params?.color||"#FFFF99";switch(t.subject){case"POST_BODY":const t=e.querySelector(".message-body")||e.closest(".message-body");if(t)return t.style.backgroundColor=n,t.style.borderRadius="3px",t.style.padding="3px",!0;break;case"SIGNATURE":const o=e.querySelector(".message-signature")||e.closest(".message-signature");if(o)return o.style.backgroundColor=n,o.style.borderRadius="3px",o.style.padding="3px",!0;break;case"AVATAR":const r=e.querySelector(".message-avatar")||e.closest(".message-avatar")||e.querySelector(".avatar");if(r)return r.style.border=`2px solid ${n}`,r.style.borderRadius="3px",!0;break;case"USERNAME":const s=e.querySelector(".message-username")||e.closest(".message-username")||e.querySelector(".username");if(s)return s.style.backgroundColor=n,s.style.borderRadius="3px",s.style.padding="0 3px",!0}return!1}catch(e){return s("Error applying HIGHLIGHT rule:",e),!1}}(e,t);default:return r(`Unknown rule action: ${t.action}`),!1}}catch(e){return s("Error applying rule:",e),!1}}function N(e,t,n){if(!e||!t||!n)return 0;try{const t=A();let o=0;return n.usernameColor&&function(e,t){if(!e||!t)return!1;try{const n=e.querySelector(".message-username")||e.querySelector(".username");if(n){const e=n.querySelector("a")||n;return e.style.color=t,e.dataset.originalColor=e.style.color||"",e.dataset.hqUserColor=t,!0}return!1}catch(e){return s("Error applying username color:",e),!1}}(e,n.usernameColor)&&o++,n.rules&&Array.isArray(n.rules)&&n.rules.forEach((n=>{(function(e,t){if(!e||!e.scope)return!1;if("ALL"===e.scope)return!0;switch(e.scope){case"TOPIC_VIEW":return t===C;case"PROFILE_VIEW":return t===E;case"RECENT_TOPICS_LIST":return t===L;case"SEARCH_RESULTS":return t===k;default:return!1}})(n,t)&&_(e,n)&&o++})),o}catch(e){return s("Error applying user rules:",e),0}}async function R(e){if(!e)return{processed:!1};try{const t=q(e);if(!t||!t.userId)return{processed:!1,reason:"no-user-id"};const n=await m(t.userId);if(!n)return{processed:!1,reason:"no-rules"};const o=N(e,t.userId,n);return{processed:o>0,userId:t.userId,username:t.username,rulesApplied:o}}catch(e){return s("Error processing element for user rules:",e),{processed:!1,error:e.message}}}async function H(){const e=A();let t={pageType:e,elementsProcessed:0,usersWithRules:0,rulesApplied:0};try{const n=await u();if(!n||0===Object.keys(n).length)return o("No user rules defined, skipping page processing"),t;let r=[];switch(e){case C:r=Array.from(document.querySelectorAll(".message"));break;case E:const e=function(){try{const e=document.querySelector(y);if(!e)return null;const t=S(window.location.href),n=e.textContent.trim();return t&&n?{userId:t,username:n}:null}catch(e){return s("Error extracting user from profile page:",e),null}}();if(e&&e.userId){const o=n[e.userId];if(o){const n=document.querySelector(".memberHeader-main");if(n){const r=N(n,e.userId,o);r>0&&(t.usersWithRules++,t.rulesApplied+=r)}}}r=Array.from(document.querySelectorAll(".message"));break;case L:case k:r=Array.from(document.querySelectorAll(".structItem"));break;case T:r=Array.from(document.querySelectorAll(".memberCard"))}t.elementsProcessed=r.length;for(const e of r){const o=q(e);if(o&&o.userId){const r=n[o.userId];if(r){const n=N(e,o.userId,r);n>0&&(t.usersWithRules++,t.rulesApplied+=n)}}}return o(`User rules applied: ${t.rulesApplied} rules for ${t.usersWithRules} users on ${t.elementsProcessed} elements`),t}catch(e){return s("Error processing page for user rules:",e),{...t,error:e.message}}}function I(){o("Hiding userscript manager modal...");const e=document.getElementById("mod-manager-modal");e&&(e.style.display="none",document.body.style.overflow="");const t=document.getElementById("script-settings-modal");t&&(t.style.display="none")}function P(e){o("Rendering Users subtab..."),e.innerHTML='\n    <div class="wip-banner">\n      <i class="fa fa-wrench"></i> Thread Preferences - Work In Progress\n    </div>\n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">User-Specific Rules</h3>\n      </div>\n      <div class="preferences-section-body">\n        <p class="preference-description">\n          Create rules for specific users that change how their content appears to you.\n          You can hide or highlight various elements of their posts.\n        </p>\n\n        \x3c!-- User Selection Section --\x3e\n        <div class="user-selection-area">\n          <div class="user-search-form">\n            <div class="input-group">\n              <label for="user-search">Find User:</label>\n              <input type="text" id="user-search" placeholder="Enter username, user ID, or profile URL" \n                     class="form-control">\n              <button id="find-user-btn" class="button button--primary">Find User</button>\n            </div>\n            <div class="input-help">\n              Enter a username, user ID, or paste a profile URL\n            </div>\n          </div>\n          \n          <div id="user-search-status" class="user-search-status"></div>\n        </div>\n\n        \x3c!-- User Rules List Section --\x3e\n        <div class="user-rules-list-section">\n          <div class="user-rules-list-header">\n            <h4>Existing User Rules</h4>\n          </div>\n          <div id="existing-rules-container" class="existing-rules-container">\n            <div class="loading-rules">Loading existing rules...</div>\n          </div>\n        </div>\n      </div>\n    </div>\n    \n  ',function(){const e="user-rules-management-styles";if(document.getElementById(e))return;const t="\n    .user-settings-list {\n      display: flex;\n      flex-direction: column;\n      gap: 18px;\n      margin-bottom: 20px;\n    }\n    .user-setting-row {\n      display: flex;\n      align-items: center;\n      gap: 12px;\n      padding: 6px 0;\n    }\n    .user-setting-icon {\n      font-size: 1.3em;\n      color: var(--primary-color);\n      min-width: 24px;\n      text-align: center;\n    }\n    .user-setting-label {\n      min-width: 110px;\n      color: var(--text-secondary);\n      font-weight: 500;\n    }\n    .user-settings-actions {\n      display: flex;\n      gap: 10px;\n      margin-top: 10px;\n    }\n    .color-preview.username-preview {\n      margin-left: 10px;\n      font-weight: bold;\n      padding: 2px 8px;\n      border-radius: 3px;\n      background: var(--bg-dark);\n      border: 1px solid var(--border-color);\n    }\n    .user-selection-area {\n      margin-bottom: 20px;\n      padding: 15px;\n      background: var(--bg-card);\n      border-radius: 4px;\n    }\n    \n    .user-search-form .input-group {\n      display: flex;\n      align-items: center;\n      gap: 10px;\n      margin-bottom: 5px;\n    }\n    \n    .user-search-form label {\n      min-width: 80px;\n      color: var(--text-secondary);\n    }\n    \n    .user-search-form .form-control {\n      flex: 1;\n      padding: 6px 10px;\n      border: 1px solid var(--border-color);\n      border-radius: 4px;\n      background-color: var(--bg-dark);\n      color: var(--text-primary);\n    }\n    \n    .user-search-status {\n      margin-top: 10px;\n      padding: 6px 0;\n      font-style: italic;\n      color: var(--text-secondary);\n    }\n    \n    .user-search-status.success {\n      color: var(--success-color);\n    }\n    \n    .user-search-status.error {\n      color: var(--danger-color);\n    }\n    \n    .user-rules-editor {\n      border: 1px solid var(--border-color);\n      padding: 15px;\n      border-radius: 4px;\n      margin-bottom: 20px;\n      background-color: var(--bg-card);\n    }\n    \n    .user-rules-header {\n      margin-bottom: 15px;\n      padding-bottom: 10px;\n      border-bottom: 1px solid var(--border-color);\n    }\n    \n    .user-rules-header h4,\n    .rules-list-header h4,\n    .user-rules-list-header h4 {\n      color: var(--text-primary);\n    }\n    \n    .rules-list-header {\n      display: flex;\n      justify-content: space-between;\n      align-items: center;\n      margin-bottom: 10px;\n    }\n    \n    .rules-table-wrapper {\n      overflow-x: auto;\n    }\n    \n    .rules-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-bottom: 20px;\n    }\n    \n    .rules-table th, .rules-table td {\n      padding: 8px 12px;\n      text-align: left;\n      border-bottom: 1px solid var(--border-color);\n      color: var(--text-secondary);\n    }\n    \n    .rules-table th {\n      background-color: rgba(255, 255, 255, 0.05);\n      color: var(--text-primary);\n      font-weight: bold;\n    }\n    \n    .rules-table tr:hover {\n      background-color: rgba(255, 255, 255, 0.03);\n    }\n    \n    .rules-actions {\n      display: flex;\n      gap: 5px;\n    }\n    \n    .user-rules-actions {\n      display: flex;\n      gap: 10px;\n      justify-content: space-between;\n      margin-top: 10px;\n    }\n    \n    .existing-rules-container {\n      margin-top: 20px;\n    }\n    \n    .user-rules-list-section {\n      margin-top: 20px;\n    }\n\n    .user-card {\n      margin-bottom: 10px;\n      border: 1px solid var(--border-color);\n      border-radius: 4px;\n      background-color: var(--bg-card);\n      overflow: hidden; /* Contain children */\n    }\n\n    .user-card-header {\n      display: flex;\n      justify-content: space-between;\n      align-items: center;\n      padding: 10px;\n      cursor: pointer;\n      background-color: rgba(255, 255, 255, 0.02); /* Slightly different bg */\n    }\n\n    .user-card-header:hover {\n      background-color: rgba(255, 255, 255, 0.05);\n    }\n    \n    .user-info {\n      display: flex;\n      flex-direction: column;\n    }\n    \n    .user-name {\n      font-weight: bold;\n      color: var(--text-primary);\n    }\n    \n    .user-stats {\n      font-size: 0.9em;\n      color: var(--text-secondary);\n    }\n    \n    .user-card-actions {\n      display: flex;\n      gap: 5px;\n    }\n\n    .expand-btn {\n      background: none;\n      border: none;\n      color: var(--text-secondary);\n      font-size: 1.2em;\n      cursor: pointer;\n      padding: 5px;\n      transition: transform 0.2s ease;\n    }\n\n    .user-card.expanded .expand-btn {\n      transform: rotate(90deg);\n    }\n\n    .user-card-details {\n      display: none; /* Hidden by default */\n      padding: 15px;\n      border-top: 1px solid var(--border-color);\n      background-color: var(--bg-card); /* Same as card bg */\n    }\n\n    .user-card.expanded .user-card-details {\n      display: block; /* Shown when expanded */\n    }\n  ",n=document.createElement("style");n.id=e,n.textContent=t,document.head.appendChild(n)}(),function(e){const t=e.querySelector("#user-search"),n=e.querySelector("#find-user-btn"),r=e.querySelector("#user-search-status");async function i(n,s){const i=e.querySelector("#existing-rules-container");let a=i.querySelector(`.user-card[data-user-id="${n}"]`);if(a)r.innerHTML=`User found: <strong>${s}</strong> (ID: ${n}). Expanding existing card.`,r.className="user-search-status success",a.scrollIntoView({behavior:"smooth",block:"center"}),a.classList.contains("expanded")||await O(a,e);else{r.innerHTML=`User found: <strong>${s}</strong> (ID: ${n}). Creating new card.`,r.className="user-search-status success",o(`Creating new card for user ${n} (${s})`);const t=i.querySelector("p");t&&t.textContent.includes("No user rules defined yet")&&(i.innerHTML="");const c=await m(n);a=U(n,s,D(c),c?.usernameColor),B(a,e),i.appendChild(a),a.scrollIntoView({behavior:"smooth",block:"center"}),await O(a,e)}t.value=""}n.addEventListener("click",(async()=>{const e=t.value.trim();if(!e)return r.innerHTML="Please enter a username, user ID, or profile URL",void(r.className="user-search-status error");r.innerHTML="Searching...",r.className="user-search-status";try{if(e.includes("http")){const t=S(e);if(t){const n=e.split("/").filter(Boolean).pop().split(".")[0];return void await i(t,n)}}if(/^\d+$/.test(e))return void await i(e,`User #${e}`);const t=(await async function(e){return new Promise(((t,n)=>{if(!e||"string"!=typeof e)return n(new Error("Invalid query provided."));const o=`https://rpghq.org/forums/mentionloc?q=${encodeURIComponent(e)}`;GM_xmlhttpRequest({method:"GET",url:o,headers:{Accept:"application/json, text/javascript, */*; q=0.01","X-Requested-With":"XMLHttpRequest",Referer:"https://rpghq.org/forums/"},responseType:"json",onload:function(e){e.status>=200&&e.status<300?t(e.response):n(new Error(`HTTP error! status: ${e.status}, statusText: ${e.statusText}`))},onerror:function(e){n(new Error(`Network error: ${e.statusText||"Unknown error"}`))},ontimeout:function(){n(new Error("Request timed out."))}})}))}(e)).filter((e=>"user"===e.type));if(1===t.length)return void await i(t[0].user_id,t[0].value);0===t.length?(r.innerHTML=`No user found matching "${e}". Try User ID or profile URL.`,r.className="user-search-status error"):(r.innerHTML=`Multiple users found matching "${e}". Please be more specific or use User ID/URL.`,r.className="user-search-status error")}catch(e){r.innerHTML=`Error: ${e.message}`,r.className="user-search-status error",s("Error searching for user:",e)}})),t.addEventListener("keypress",(e=>{"Enter"===e.key&&n.click()}))}(e),async function(e){try{const t=e.querySelector("#existing-rules-container"),n=await u();if(!n||0===Object.keys(n).length)return void(t.innerHTML="<p>No user rules defined yet.</p>");const o=Object.entries(n).map((([e,t])=>{const n=D(t);return U(e,t.username||`User #${e}`,n,t.usernameColor).outerHTML})).join("");t.innerHTML=o,t.querySelectorAll(".user-card").forEach((t=>{B(t,e)}))}catch(t){s("Error loading existing users:",t),e.querySelector("#existing-rules-container").innerHTML=`<p>Error loading existing users: ${t.message}</p>`}}(e)}async function O(e,t){const n=e.dataset.userId,o=e.querySelector(".user-card-details"),r=o.classList.contains("loading"),i=e.classList.contains("expanded");if(!r)if(i)e.classList.remove("expanded");else if(e.classList.add("expanded"),!o.dataset.loaded){o.innerHTML='<div class="loading-placeholder">Loading details...</div>',o.classList.add("loading");try{await z(n,o,t),o.dataset.loaded="true"}catch(e){o.innerHTML=`<p class="error">Error loading details: ${e.message}</p>`,s(`Error rendering details for user ${n}:`,e)}finally{o.classList.remove("loading")}}}async function z(e,t,n){const o=await m(e),r=t.closest(".user-card").dataset.username||`User #${e}`;t.innerHTML=`\n    <div class="user-settings-list">\n      <div class="user-setting-row">\n        <i class="fa fa-user-circle user-setting-icon"></i>\n        <label for="avatar-override-${e}" class="user-setting-label">Avatar Override:</label>\n        <input type="text" id="avatar-override-${e}" class="form-control avatar-override-input" value="${o?.avatarOverride||""}" placeholder="Image URL or leave blank">\n      </div>\n      <div class="user-setting-row">\n        <i class="fa fa-paint-brush user-setting-icon"></i>\n        <label for="color-override-${e}" class="user-setting-label">Color Override:</label>\n        <input type="color" id="color-override-${e}" class="form-control color-override-input" value="${o?.usernameColor||"#000000"}">\n        <span class="color-preview username-preview" style="color: ${o?.usernameColor||"inherit"}">${r}</span>\n        <button type="button" class="button button--small clear-color-btn" title="Clear Color" style="margin-left:6px;">Clear</button>\n      </div>\n      <div class="user-setting-row">\n        <i class="fa fa-comments user-setting-icon"></i>\n        <label for="threads-setting-${e}" class="user-setting-label">Threads:</label>\n        <select id="threads-setting-${e}" class="form-control threads-setting-input">\n          <option value="" ${o?.threads?"":"selected"}></option>\n          <option value="HIGHLIGHT" ${"HIGHLIGHT"===o?.threads?"selected":""}>Highlight</option>\n          <option value="HIDE" ${"HIDE"===o?.threads?"selected":""}>Hide</option>\n        </select>\n      </div>\n      <div class="user-setting-row">\n        <i class="fa fa-file-text user-setting-icon"></i>\n        <label for="posts-setting-${e}" class="user-setting-label">Posts:</label>\n        <select id="posts-setting-${e}" class="form-control posts-setting-input">\n          <option value="" ${o?.posts?"":"selected"}></option>\n          <option value="HIGHLIGHT" ${"HIGHLIGHT"===o?.posts?"selected":""}>Highlight</option>\n          <option value="HIDE" ${"HIDE"===o?.posts?"selected":""}>Hide</option>\n        </select>\n      </div>\n      <div class="user-setting-row">\n        <i class="fa fa-at user-setting-icon"></i>\n        <label for="mentions-setting-${e}" class="user-setting-label">Mentions:</label>\n        <select id="mentions-setting-${e}" class="form-control mentions-setting-input">\n          <option value="" ${o?.mentions?"":"selected"}></option>\n          <option value="HIGHLIGHT" ${"HIGHLIGHT"===o?.mentions?"selected":""}>Highlight</option>\n          <option value="HIDE" ${"HIDE"===o?.mentions?"selected":""}>Hide</option>\n        </select>\n      </div>\n      <div class="user-settings-actions">\n        <button class="button button--normal delete-user-rules-btn">Delete User</button>\n      </div>\n    </div>\n  `;const i=t.querySelector(".color-override-input"),a=t.querySelector(".username-preview"),c=t.querySelector(".clear-color-btn");i.addEventListener("input",(()=>{a.style.color="#000000"===i.value?"inherit":i.value})),c&&c.addEventListener("click",(()=>{i.value="#000000",a.style.color="inherit",i.dispatchEvent(new Event("change"))}));const l=async()=>{try{const n=t.querySelector(".avatar-override-input").value,o="#000000"!==i.value?i.value:null,r=t.querySelector(".threads-setting-input").value,s=t.querySelector(".posts-setting-input").value,a=t.querySelector(".mentions-setting-input").value,c=t.closest(".user-card").dataset.username;await f(e,{username:c,avatarOverride:n,usernameColor:o,threads:r,posts:s,mentions:a}),j(t.closest(".user-card"))}catch(t){s(`Error auto-saving settings for user ${e}:`,t)}};t.querySelectorAll(".avatar-override-input, .color-override-input, .threads-setting-input, .posts-setting-input, .mentions-setting-input").forEach((e=>{e.addEventListener("change",l),e.addEventListener("input",l)})),t.querySelector(".delete-user-rules-btn").addEventListener("click",(async()=>{if(confirm(`Are you sure you want to delete all rules for user ${e}?`))try{await async function(e){try{const t=await u();return!t[e]||(delete t[e],await p(t))}catch(t){return s(`Error deleting rules for user ${e}:`,t),!1}}(e),await z(e,t,n),j(t.closest(".user-card"))}catch(t){s(`Error deleting rules for user ${e}:`,t),alert(`Error deleting rules: ${t.message}`)}})),setTimeout((()=>{j(t.closest(".user-card"))}),0)}function D(e){if(!e)return 0;let t=0;return e.avatarOverride&&t++,e.usernameColor&&"#000000"!==e.usernameColor&&t++,e.threads&&t++,e.posts&&t++,e.mentions&&t++,t}function U(e,t,n=0,o=null){const r=document.createElement("div");r.className="user-card",r.dataset.userId=e,r.dataset.username=t;const s=o?`style="color: ${o}"`:"";return r.innerHTML=`\n    <div class="user-card-header">\n      <div class="user-info">\n        <span class="user-name" ${s}>${t}</span>\n        <span class="user-stats user-rule-count">${n} rule${1!==n?"s":""}</span>\n      </div>\n      <div class="user-card-actions">\n        <button class="button button--icon expand-btn" title="Expand/Collapse">\n          <i class="fa fa-chevron-right"></i>\n        </button>\n      </div>\n    </div>\n    <div class="user-card-details">\n      <div class="loading-placeholder">Loading details...</div>\n    </div>\n  `,r}function B(e,t){const n=e.querySelector(".user-card-header"),o=e.querySelector(".expand-btn");n&&n.addEventListener("click",(n=>{n.target.closest("button")||O(e,t)})),o&&o.addEventListener("click",(n=>{n.stopPropagation(),O(e,t)}))}function j(e){if(!e)return;const t=e.querySelector(".user-card-details");if(!t)return;const n=t.querySelector(".avatar-override-input")?.value?.trim(),o=t.querySelector(".color-override-input")?.value,r=t.querySelector(".threads-setting-input")?.value,s=t.querySelector(".posts-setting-input")?.value,i=t.querySelector(".mentions-setting-input")?.value;let a=0;n&&a++,o&&"#000000"!==o&&a++,r&&a++,s&&a++,i&&a++;const c=e.querySelector(".user-rule-count");c&&(c.textContent=`${a} rule${1!==a?"s":""}`)}function G(e){o("Rendering Theme subtab..."),e.innerHTML="";const t=document.createElement("div");t.className="preferences-section",t.innerHTML='\n    <div class="preferences-section-header">\n      <h3 class="preferences-section-title">Theme Colors</h3>\n      <p class="preferences-section-description">\n        Customize the colors of links on the forum. Changes are applied live.\n      </p>\n    </div>\n    <div class="preferences-section-body"></div>\n  ';const n=t.querySelector(".preferences-section-body"),r=(e,t,n="#000000")=>{const r=`theme-color-${t}`,s=ge(t,""),i=document.createElement("div");i.className="preference-item theme-color-item",i.innerHTML=`\n      <div class="preference-header">\n        <label for="${r}" class="preference-name">${e}</label>\n        <div class="preference-control">\n          <input type="color" id="${r}" value="${s||n}">\n          <button class="btn btn-secondary btn-small reset-color-btn" title="Reset to default">Reset</button>\n        </div>\n      </div>\n      <p class="preference-description">Current: <code class="current-color-value">${s||"(default)"}</code></p>\n    `;const a=i.querySelector("input[type='color']"),c=i.querySelector(".reset-color-btn"),l=i.querySelector(".current-color-value");return a.value=s||n,a.addEventListener("input",(e=>{const n=e.target.value;o(`Setting ${t} to ${n}`),he(t,n),l.textContent=n,be()})),c.addEventListener("click",(()=>{o(`Resetting ${t} to default`),he(t,""),a.value=n,l.textContent="(default)",be()})),i};n.appendChild(r("Link Color (Link, Active, Visited)","theme_linkColor","#2a8ff7")),n.appendChild(r("Hover Link Color","theme_hoverColor","#399bff")),n.appendChild(r("Unread Icon Color","theme_unreadColor","#BC2A4D")),n.appendChild(r("Subtle Text Color","theme_subtleTextColor","#bfc0c5")),n.appendChild(r("Light Background Color","theme_lightBgColor","#242a36")),n.appendChild(r("Dark Background Color","theme_darkBgColor","#171b24")),n.appendChild(((e,t,n="")=>{const r=`theme-text-${t}`,s=ge(t,""),i=document.createElement("div");i.className="preference-item theme-text-item",i.innerHTML=`\n      <div class="preference-header">\n        <label for="${r}" class="preference-name">${e}</label>\n        <div class="preference-control">\n          <input type="text" id="${r}" value="${s}" placeholder="${n}" class="input-text">\n          <button class="btn btn-secondary btn-small reset-text-btn" title="Reset to default">Reset</button>\n        </div>\n      </div>\n      <p class="preference-description">Enter a valid URL for the background image.</p>\n    `;const a=i.querySelector("input[type='text']"),c=i.querySelector(".reset-text-btn");return a.addEventListener("input",(e=>{const n=e.target.value.trim();o(`Setting ${t} to ${n}`),he(t,n),be()})),c.addEventListener("click",(()=>{o(`Resetting ${t} to default`),he(t,""),a.value="",be()})),i})("Background Image URL","theme_backgroundImageUrl","e.g., https://example.com/image.png")),e.appendChild(t)}function V(e){o("Rendering Forum Preferences tab with subtabs...");const t=document.createElement("div");t.className="sub-tabs",t.innerHTML='\n    <div class="sub-tab active" data-subtab="theme">\n      <i class="fa fa-paint-brush"></i> Theme\n    </div>\n    <div class="sub-tab" data-subtab="threads">\n      <i class="fa fa-comments"></i> Threads\n    </div>\n    <div class="sub-tab" data-subtab="users">\n      <i class="fa fa-users"></i> Users\n    </div>\n  ',e.appendChild(t);const n=document.createElement("div");n.id="forum-subtab-content",e.appendChild(n),G(n),t.querySelectorAll(".sub-tab").forEach((e=>{e.addEventListener("click",(()=>{t.querySelectorAll(".sub-tab").forEach((e=>{e.classList.remove("active")})),e.classList.add("active");const r=e.dataset.subtab;o(`Switching to subtab: ${r}`),"theme"===r?G(n):"threads"===r?function(e){o("Rendering Threads subtab..."),e.innerHTML='\n    <div class="wip-banner">\n      <i class="fa fa-wrench"></i> Thread Preferences - Work In Progress\n    </div>\n  \n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">Thread Display</h3>\n      </div>\n      <div class="preferences-section-body">\n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Thread Layout</h4>\n            <div class="preference-control">\n              <select>\n                <option selected>Compact</option>\n                <option>Standard</option>\n                <option>Expanded</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Choose how thread listings are displayed</p>\n        </div>\n      \n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Threads Per Page</h4>\n            <div class="preference-control">\n              <select>\n                <option>10</option>\n                <option selected>20</option>\n                <option>30</option>\n                <option>50</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Number of threads to display per page</p>\n        </div>\n      </div>\n    </div>\n  \n    <div class="info-note">\n      <strong>Note:</strong> This is a view-only display. Additional Thread preferences will be added in future updates.\n    </div>\n  '}(n):"users"===r&&P(n)}))}))}function F(e,t){const{container:n,scripts:r,scriptStates:i,renderScriptsGridView:a}=t;switch(o(`Loading tab content for: ${e}`),n.innerHTML="",e){case"installed":!function(e,t,n,r){o("Rendering Installed Scripts tab with filtering...");const s=document.createElement("div");s.className="scripts-display-container",s.id="scripts-container",e.appendChild(s),r(s,t,n)}(n,r,i,a);break;case"forum":V(n);break;case"settings":!function(e){o("Rendering Settings tab..."),e.innerHTML='\n    <h2>Global Settings</h2>\n  \n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">Appearance</h3>\n      </div>\n      <div class="preferences-section-body">\n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Theme</h4>\n            <div class="preference-control">\n              <select class="setting-input">\n                <option value="dark" selected>Dark</option>\n                <option value="light">Light</option>\n                <option value="system">System Default</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Choose your preferred theme for the userscript manager</p>\n        </div>\n      \n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Script Card Size</h4>\n            <div class="preference-control">\n              <select class="setting-input">\n                <option value="small">Small</option>\n                <option value="medium" selected>Medium</option>\n                <option value="large">Large</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Adjust the size of script cards in the gallery view</p>\n        </div>\n      </div>\n    </div>\n  \n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">Behavior</h3>\n      </div>\n      <div class="preferences-section-body">\n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Default View</h4>\n            <div class="preference-control">\n              <select class="setting-input">\n                <option value="grid" selected>Grid</option>\n                <option value="list">List</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Choose the default view for displaying scripts</p>\n        </div>\n      \n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Auto-check for Updates</h4>\n            <div class="preference-control">\n              <label class="toggle-switch">\n                <input type="checkbox" checked>\n                <span class="toggle-slider"></span>\n              </label>\n            </div>\n          </div>\n          <p class="preference-description">Automatically check for script updates when the page loads</p>\n        </div>\n      </div>\n    </div>\n  \n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">Advanced</h3>\n      </div>\n      <div class="preferences-section-body">\n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Update Check Interval</h4>\n            <div class="preference-control">\n              <select class="setting-input">\n                <option value="daily">Daily</option>\n                <option value="weekly" selected>Weekly</option>\n                <option value="monthly">Monthly</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">How often to check for script updates</p>\n        </div>\n      \n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Debug Mode</h4>\n            <div class="preference-control">\n              <label class="toggle-switch">\n                <input type="checkbox">\n                <span class="toggle-slider"></span>\n              </label>\n            </div>\n          </div>\n          <p class="preference-description">Enable verbose console logging for troubleshooting</p>\n        </div>\n      </div>\n    </div>\n  \n    <div class="info-note">\n      <strong>Note:</strong> These are view-only representations of settings. Changes made here will not be saved.\n    </div>\n  '}(n);break;default:s(`Unknown tab: ${e}`),n.innerHTML=`<div class="error-message">Unknown tab: ${e}</div>`}}function W(e,t="No scripts found.",n="fa-search"){o("Rendering empty state..."),e.innerHTML=`\n    <div class="empty-state">\n      <div class="empty-state-icon">\n        <i class="fa ${n}"></i>\n      </div>\n      <div class="empty-state-message">${t}</div>\n    </div>\n  `}function Q(e,t,n,r){o(`Showing settings modal for script: ${e.name}`);let s=document.getElementById("script-settings-modal");s||(s=document.createElement("div"),s.id="script-settings-modal",s.className="settings-modal",document.body.appendChild(s));const i=e.settings&&e.settings.length>0&&t&&n;s.innerHTML=`\n    <div class="settings-modal-content">\n      <div class="settings-modal-header">\n        <h2 class="settings-modal-title">${e.name} Settings</h2>\n        <span class="settings-modal-close">&times;</span>\n      </div>\n\n      ${i?t(e,n):W(null,"This script doesn't have any configurable settings.")}\n\n      <div\n        class="script-info"\n        style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 15px;"\n      >\n        <h3>Script Information</h3>\n        <table class="data-table">\n          <tr>\n            <th>ID</th>\n            <td>${e.id}</td>\n          </tr>\n          <tr>\n            <th>Version</th>\n            <td>${e.version}</td>\n          </tr>\n          <tr>\n            <th>Category</th>\n            <td>${e.category||"Uncategorized"}</td>\n          </tr>\n          <tr>\n            <th>Author</th>\n            <td>${e.author||"Unknown"}</td>\n          </tr>\n          <tr>\n            <th>Description</th>\n            <td>${e.description||"-"}</td>\n          </tr>\n          ${e.urlPatterns&&e.urlPatterns.length>0?`\n          <tr><th>URL Patterns</th><td>${e.urlPatterns.join("<br>")}</td></tr>\n          `:""}\n        </table>\n      </div>\n\n      <div class="info-note" style="margin-top: 15px;">\n        <strong>Note:</strong> Changes to settings may require a page reload to\n        take full effect.\n      </div>\n    </div>\n  `,s.style.display="block";const a=s.querySelector(".settings-modal-close");a&&a.addEventListener("click",(()=>{s.style.display="none"})),s.addEventListener("click",(e=>{e.target===s&&(s.style.display="none")})),i&&r&&setTimeout((()=>{s.querySelectorAll(".setting-input").forEach((t=>{const n=t.dataset.settingId;if(!n)return void console.warn("Setting input missing data-setting-id:",t);const i="checkbox"===t.type||"radio"===t.type||"SELECT"===t.tagName?"change":"input";t.addEventListener(i,(t=>{const i=t.target,a="checkbox"===i.type?i.checked:i.value;var c,l;o(`Setting changed: ${e.id}.${n} = ${a}`),r(e.id,n,a),c=n,l=a,s.querySelectorAll(".setting-item[data-depends-on]").forEach((e=>{if(e.dataset.dependsOn===c){const t=JSON.parse(e.dataset.dependsValue),n=l===t;o(`Checking dependency: ${e.dataset.settingId} depends on ${c}. Value: ${l}, Required: ${t}. Visible: ${n}`),n?e.classList.remove("setting-item-hidden"):e.classList.add("setting-item-hidden")}}))}))}))}),150)}function J(e,t){if(o(`Rendering settings content for script: ${e.name} (${e.id})`),!e||!e.id)return o("Error: Invalid script object passed to renderScriptSettingsContent."),"<p>Error loading settings.</p>";if(!e.settings||0===e.settings.length)return o(`No settings defined for script: ${e.name}`),'<div class="empty-state"><p>This script has no configurable settings.</p></div>';if("function"!=typeof t)return o(`Error: getScriptSetting function not provided for script: ${e.name}`),"<p>Error loading setting values.</p>";return`<div class="setting-group">${e.settings.map((n=>{if(!n||!n.id)return o(`Warning: Invalid setting definition found in script ${e.id}`,n),"";const r=`setting-${e.id}-${n.id}`,s=n.name||n.id;let i="",a="",c=!1;if(n.dependsOn){const r=n.dependsOn.settingId,s=n.dependsOn.value,i=t(e.id,r);a=`\n          data-depends-on="${r}"\n          data-depends-value='${JSON.stringify(s)}'\n        `,c=i!==s,o(`Setting ${n.id} depends on ${r} (current: ${i}, required: ${s}). Initially hidden: ${c}`)}if("checkbox"===n.type){const o=t(e.id,n.id,n.defaultValue);i=`\n          <label class="toggle-switch">\n            <input\n              type="checkbox"\n              class="setting-input"\n              id="${r}"\n              data-setting-id="${n.id}"\n              name="${n.id}"\n              ${o?"checked":""}\n            >\n            <span class="toggle-slider"></span>\n          </label>\n        `}else i=function(e,t,n){const o=n(t,e.id,e.defaultValue),r=`setting-${t}-${e.id}`;switch(e.type){case"checkbox":return`\n        <input \n          type="checkbox" \n          class="setting-input" \n          id="${r}" \n          data-setting-id="${e.id}" \n          name="${e.id}" \n          ${o?"checked":""}\n        >`;case"select":return`\n        <select \n          class="setting-input" \n          id="${r}" \n          data-setting-id="${e.id}" \n          name="${e.id}"\n        >\n          ${e.options.map((e=>{const t="object"==typeof e?e.value:e,n="object"==typeof e?e.label:e;return`<option value="${t}" ${t===o?"selected":""}>${n}</option>`})).join("")}\n        </select>`;case"number":return`\n        <input \n          type="number" \n          class="setting-input" \n          id="${r}" \n          data-setting-id="${e.id}" \n          name="${e.id}" \n          value="${o??0}"\n        >`;case"color":return`\n        <input\n          type="color"\n          class="setting-input setting-color-input" // Add specific class for styling\n          id="${r}"\n          data-setting-id="${e.id}"\n          name="${e.id}"\n          value="${o??"#ffffff"}"\n        >`;default:return`\n        <input \n          type="text" \n          class="setting-input" \n          id="${r}" \n          data-setting-id="${e.id}" \n          name="${e.id}" \n          value="${o??""}"\n        >`}}(n,e.id,t);return`\n        <div\n          class="setting-item ${c?"setting-item-hidden":""}"\n          ${a}\n          data-setting-id="${n.id}"\n        >\n          <div class="setting-details">\n            <div class="setting-name">${s}</div>\n            ${n.description?`<div class="setting-description">${n.description}</div>`:""}\n            ${n.previewImage?`<img src="${n.previewImage}" alt="Setting preview" class="setting-preview-image">`:""}\n          </div>\n          <div class="setting-control">\n            ${i}\n          </div>\n        </div>\n      `})).join("\n")}</div>`}var X=Object.freeze({__proto__:null,init:function({getScriptSetting:e}){const t="recentTopicsFormat",n=[];if(e(t,"wrapTitles",!0)){const e=document.createElement("style");e.textContent="\n      /* Ensure topic titles don't get truncated with ellipses */\n      .topictitle {\n        white-space: normal !important;\n        overflow: visible !important;\n        text-overflow: unset !important;\n        max-width: none !important;\n        display: inline-block;\n      }\n    ",document.head.appendChild(e),n.push(e)}function o(n){const o=function(e){const t=e.textContent,n=/(.*?)v0\.8;?">\s*([Jj]r\.\s*)?AG\s*-\s*([A-Za-z]+)/;if(n.test(t)){const o=t.match(n);if(!o)return;let r=`${o[1].trim()} - ${o[2]||""}AG - ${o[3]}`;return e.textContent=r,!0}return!1}(n);if(o)return;const r=e(t,"unboldParentheses",!0),s=e(t,"reformatAGThreads",!0),i=n.innerHTML;let a=i,c=!1;if(s){const e=function(e,t){const n=t.textContent,o=n.includes("Adventurer's Guild"),r=null!==t.closest(".row-item")?.querySelector('.forum-links a[href*="adventurer-s-guild"]');if(!o&&!r)return e;let s;if(o){const e=/^(?:(Junior)\s+)?Adventurer's Guild\s*-\s*([A-Za-z]+):(.+?)(?:\s+[A-Z][A-Z\s]+)*$/;s=n.match(e)}else{const e=/^([A-Za-z]+):(.+?)(?:\s+[A-Z][A-Z\s]+)*$/;s=n.match(e)}if(!s)return e;if(o){const[e,t,n,o]=s,r=t?"Jr. AG - ":"AG - ";return`${o.trim()} <span style="font-size: 0.8em; opacity: 0.8;">${r}${n}</span>`}{const[e,t,n]=s;return`${n.trim()} <span style="font-size: 0.8em; opacity: 0.8;">(AG - ${t})</span>`}}(a,n);e!==a&&(a=e,c=!0)}r&&(a=a.replace(/\(([^()]*)\)/g,((e,t)=>t.includes('<span style="font-size: 0.85em; font-weight: normal;">')?e:`(<span style="font-size: 0.85em; font-weight: normal;">${t}</span>)`))),c||(a=function(e,t){const n=t.textContent,o=n.includes("Adventurer's Guild"),r=null!==t.closest(".row-item")?.querySelector('.forum-links a[href*="adventurer-s-guild"]');if(o||r)return e;const s=n.match(/\s+[-—]\s+/);if(!s)return e;const i=s.index;let a=0;for(let e=0;e<t.childNodes.length;e++){const n=t.childNodes[e];if(n.nodeType===Node.TEXT_NODE){if(a+n.length>=i){const o=n.textContent.slice(0,i-a),r=n.textContent.slice(i-a),s=document.createTextNode(o),c=document.createElement("span");c.style.fontWeight="normal",c.textContent=r,t.replaceChild(c,n),t.insertBefore(s,c);for(let n=e+1;n<t.childNodes.length;n++)t.childNodes[n]!==c&&c.appendChild(t.childNodes[n].cloneNode(!0));for(;t.childNodes.length>e+2;)t.removeChild(t.childNodes[e+2]);break}a+=n.length}else n.nodeType===Node.ELEMENT_NODE&&(a+=n.textContent.length)}return t.innerHTML}(a,n)),a!==i&&(n.innerHTML=a)}function r(e){e.querySelectorAll(".topictitle").forEach(o)}r(document);const s=new MutationObserver((e=>{e.forEach((e=>{e.addedNodes.forEach((e=>{e.nodeType===Node.ELEMENT_NODE&&(e.matches(".topictitle")?o(e):e.querySelector(".topictitle")&&r(e))}))}))}));return s.observe(document.body,{childList:!0,subtree:!0}),{cleanup:()=>{s.disconnect(),n.forEach((e=>{e&&e.parentNode&&e.parentNode.removeChild(e)})),console.log("Disconnected recentTopicsFormat observer.")}}}});var Y=Object.freeze({__proto__:null,init:function(){function e(e){return new Promise(((t,n)=>{GM_xmlhttpRequest({method:"HEAD",url:`https://rpghq.org/forums/viewtopic.php?t=${e}`,onload:function(e){t(200===e.status)},onerror:function(e){n(e)}})}))}async function t(){let t,n=!1;for(;!n;)t=Math.floor(2800*Math.random())+1,n=await e(t);return`https://rpghq.org/forums/viewtopic.php?t=${t}`}function n(e){e.preventDefault(),this.style.textDecoration="none",this.innerHTML='<i class="icon fa-spinner fa-spin fa-fw" aria-hidden="true"></i><span>Loading...</span>',t().then((e=>{window.location.href=e})).catch((e=>{console.error("Error finding random topic:",e),this.innerHTML='<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>'}))}!function(){const e=document.querySelector("#quick-links .dropdown-contents");if(e){const t=document.createElement("li");t.innerHTML='\n          <a href="#" role="menuitem">\n            <i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>\n          </a>\n        ';const o=e.querySelector('a[href*="search_id=active_topics"]');if(o){const e=o.closest("li");e.parentNode.insertBefore(t,e.nextSibling)}else e.appendChild(t);t.querySelector("a").onclick=n}const o=document.getElementById("nav-main");if(o){const e=document.createElement("li"),n=document.createElement("a");n.href="#",n.role="menuitem",n.innerHTML='<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>',n.style.cssText="\n              display: flex;\n              align-items: center;\n              height: 100%;\n              text-decoration: none;\n          ",setTimeout((()=>{const e=n.querySelector(".icon");e&&(e.style.cssText="\n                      font-size: 14px;\n                  ")}),100),n.onclick=async function(e){e.preventDefault(),this.style.textDecoration="none",this.innerHTML='<i class="icon fa-spinner fa-spin fa-fw" aria-hidden="true"></i><span>Loading...</span>';try{const e=await t();window.location.href=e}catch(e){console.error("Error finding random topic:",e),this.innerHTML='<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>'}},e.appendChild(n),o.appendChild(e)}}()}});var Z=Object.freeze({__proto__:null,init:function(){function e(){const e=document.createElement("div");e.className="member-search-modal",e.innerHTML='\n              <div class="member-search-container">\n                  <div class="member-search-close">&times;</div>\n                  <div class="member-search-title">Member Search</div>\n                  <input type="text" class="member-search-input" placeholder="Search for a member...">\n                  <div class="member-search-results"></div>\n              </div>\n          ',document.body.appendChild(e);return e.querySelector(".member-search-close").addEventListener("click",(function(){e.classList.remove("active")})),function(e){const t=e.querySelector(".member-search-input"),n=e.querySelector(".member-search-results");let o;t.addEventListener("input",(function(){clearTimeout(o);const e=this.value.trim();e.length<2?n.innerHTML="":(n.innerHTML='<div class="member-search-loading">Searching...</div>',o=setTimeout((()=>{!function(e,t){fetch(`https://rpghq.org/forums/mentionloc?q=${encodeURIComponent(e)}`,{method:"GET",headers:{accept:"application/json, text/javascript, */*; q=0.01","x-requested-with":"XMLHttpRequest"},credentials:"include"}).then((e=>e.json())).then((e=>{!function(e,t){t.innerHTML="";const n=e.filter((e=>"user"===e.type));if(!n||0===n.length)return void(t.innerHTML='<div class="member-search-no-results">No members found</div>');const o=document.createDocumentFragment();n.forEach((e=>{const t=document.createElement("div");t.className="member-search-result",t.setAttribute("data-user-id",e.user_id);const n=e.user_id,r=e.value||e.key||"Unknown User",s="https://f.rpghq.org/OhUxAgzR9avp.png?n=pasted-file.png";t.innerHTML=`\n          <img \n            src="https://rpghq.org/forums/download/file.php?avatar=${n}.jpg" \n            alt="${r}'s avatar" \n            onerror="if(this.src.endsWith('.jpg')){this.src='https://rpghq.org/forums/download/file.php?avatar=${n}.png';}else if(this.src.endsWith('.png')){this.src='https://rpghq.org/forums/download/file.php?avatar=${n}.gif';}else{this.src='${s}';}"\n          >\n          <span>${r}</span>\n        `,t.addEventListener("click",(function(){const e=this.getAttribute("data-user-id");window.location.href=`https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${e}`})),o.appendChild(t)})),t.appendChild(o)}(e,t)})).catch((e=>{console.error("Error searching for members:",e),t.innerHTML='<div class="member-search-no-results">Error searching for members</div>'}))}(e,n)}),300))})),e.addEventListener("transitionend",(function(){e.classList.contains("active")&&t.focus()}));const r=new MutationObserver((function(n){n.forEach((function(n){"class"===n.attributeName&&e.classList.contains("active")&&t.focus()}))}));r.observe(e,{attributes:!0})}(e),e}GM_addStyle("\n          .member-search-modal {\n              display: none;\n              position: fixed;\n              top: 0;\n              left: 0;\n              width: 100%;\n              height: 100%;\n              background-color: rgba(0, 0, 0, 0.7);\n              z-index: 1000;\n              justify-content: center;\n              align-items: center;\n          }\n          .member-search-modal.active {\n              display: flex;\n          }\n          .member-search-container {\n              background-color: #1e232b;\n              border: 1px solid #292e37;\n              border-radius: 4px;\n              width: 350px;\n              max-width: 80%;\n              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);\n              padding: 20px 20px;\n              position: relative;\n              z-index: 1001;\n              margin: 0 auto;\n              box-sizing: border-box;\n          }\n          .member-search-close {\n              position: absolute;\n              top: 10px;\n              right: 10px;\n              font-size: 20px;\n              color: #888;\n              cursor: pointer;\n          }\n          .member-search-close:hover {\n              color: #fff;\n          }\n          .member-search-title {\n              font-size: 18px;\n              margin-bottom: 15px;\n              color: #fff;\n              text-align: center;\n          }\n          .member-search-input {\n              width: calc(100% - 20px);\n              padding: 8px 10px;\n              border: 1px solid #292e37;\n              border-radius: 4px;\n              background-color: #171b24;\n              color: #fff;\n              margin-bottom: 10px;\n              font-size: 14px;\n              position: relative;\n              z-index: 1002;\n              margin-left: 10px;\n              margin-right: 10px;\n              box-sizing: border-box;\n          }\n          .member-search-input:focus {\n              outline: none;\n              border-color: #8698b3;\n          }\n          .member-search-results {\n              max-height: 300px;\n              overflow-y: auto;\n          }\n          .member-search-result {\n              display: flex;\n              align-items: center;\n              padding: 8px 10px;\n              cursor: pointer;\n              border-radius: 4px;\n          }\n          .member-search-result:hover {\n              background-color: #292e37;\n          }\n          .member-search-result img {\n              width: 32px;\n              height: 32px;\n              border-radius: 50%;\n              margin-right: 10px;\n          }\n          .member-search-result span {\n              white-space: nowrap;\n              overflow: hidden;\n              text-overflow: ellipsis;\n          }\n          .member-search-no-results {\n              padding: 10px;\n              color: #8a8a8a;\n              text-align: center;\n          }\n          .member-search-loading {\n              text-align: center;\n              padding: 10px;\n              color: #8a8a8a;\n          }\n          .member-search-group {\n              background-color: #272e38;\n              padding: 2px 6px;\n              border-radius: 3px;\n              margin-left: 6px;\n              font-size: 0.8em;\n              color: #aaa;\n          }\n      "),function(){const t=document.getElementById("nav-main");if(!t)return;const n=e(),o=document.createElement("li");o.setAttribute("data-skip-responsive","true");const r=document.createElement("a");r.href="#",r.role="menuitem",r.innerHTML='<i class="icon fa-user-plus fa-fw" aria-hidden="true"></i><span>Find Member</span>',r.style.cssText="\n              display: flex;\n              align-items: center;\n              height: 100%;\n              text-decoration: none;\n          ",setTimeout((()=>{const e=r.querySelector(".icon");e&&(e.style.cssText="\n                      font-size: 14px;\n                  ")}),100),r.addEventListener("click",(function(e){e.preventDefault(),n.classList.add("active");const t=n.querySelector(".member-search-input");t.value="",t.focus(),n.querySelector(".member-search-results").innerHTML=""})),o.appendChild(r);const s=Array.from(t.children).find((e=>e.textContent.trim().includes("Chat")||e.textContent.trim().includes("IRC"))),i=Array.from(t.children).find((e=>e.textContent.trim().includes("Members")));s&&s.parentNode===t?t.insertBefore(o,s.nextSibling):i&&i.parentNode===t?t.insertBefore(o,i.nextSibling):t.appendChild(o)}()}});var K=Object.freeze({__proto__:null,init:function(){function e(e,t){console.log("createReactionList: Starting to create reaction list for post",e);const n=function(){console.log("getPollVotes: Starting to collect poll votes");const e={},t=document.querySelectorAll(".polls");return console.log("getPollVotes: Found polls:",t.length),t.forEach(((t,n)=>{console.log(`getPollVotes: Processing poll #${n+1}`);const o=t.querySelectorAll("dl");console.log(`getPollVotes: Found ${o.length} dl elements in poll #${n+1}`);let r=null;o.forEach(((t,n)=>{const o=t.querySelector("dt");if(!o||t.classList.contains("poll_voters_box")||t.classList.contains("poll_total_votes")||(r=o.textContent.trim(),console.log(`getPollVotes: Found option: "${r}"`)),t.classList.contains("poll_voters_box")&&r){console.log(`getPollVotes: Processing voters for option: "${r}"`);const n=t.querySelector(".poll_voters");if(!n)return;const o=n.querySelectorAll("span[name]");console.log(`getPollVotes: Found ${o.length} voters for this option`),o.forEach(((t,n)=>{const o=t.getAttribute("name"),s=t.querySelector("a");if(console.log(`getPollVotes: Processing voter #${n+1}:`,{username:o,hasUserLink:!!s,linkText:s?.textContent,option:r,isColoured:s?.classList.contains("username-coloured"),color:s?.style.color}),o&&s){const t=o.toLowerCase();e[t]||(e[t]={options:[],isColoured:s.classList.contains("username-coloured"),color:s.style.color||null}),e[t].options.push(r)}}))}}))})),console.log("getPollVotes: Final collected votes:",e),e}();console.log("createReactionList: Got poll votes:",n);const o=0===t.length?"display: none;":"";console.log("createReactionList: Processing",t.length,"reactions");const r=`\n        <div class="reaction-score-list content-processed" data-post-id="${e}" data-title="Reactions" style="padding-top: 10px !important; ${o}">\n            <div class="list-scores" style="display: flex; flex-wrap: wrap; gap: 4px;">\n                ${t.map(((e,t)=>(console.log(`createReactionList: Processing reaction #${t+1}:`,{title:e.title,userCount:e.users.length}),`\n                    <div class="reaction-group" style="display: flex; align-items: center; background-color: #3A404A; border-radius: 8px; padding: 2px 6px; position: relative;">\n                        <img src="${e.image}" alt="${e.title}" style="width: auto; height: 16px; margin-right: 4px; object-fit: contain;">\n                        <span style="font-size: 12px; color: #dcddde;">${e.count}</span>\n                        <div class="reaction-users-popup" style="display: none; position: fixed; background-color: #191919; border: 1px solid #202225; border-radius: 4px; padding: 8px; z-index: 1000; color: #dcddde; font-size: 12px; min-width: 200px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">\n                            <div style="font-weight: bold; margin-bottom: 8px;">${e.title}</div>\n                            <div style="display: flex; flex-direction: column; gap: 8px;">\n                                ${e.users.map(((e,o)=>{console.log(`createReactionList: Reaction #${t+1}, processing user #${o+1}:`,{username:e.username,pollVotes:n[e.username.toLowerCase()]?.options});const r=n[e.username.toLowerCase()],s=r?.options?.length>0?`<div style="font-size: 8.5px; opacity: 0.8; color: #dcddde; margin-top: 2px;">\n                                            ${1===r.options.length?`<div>${r.options[0]}</div>`:r.options.map((e=>`<div style="display: flex; align-items: baseline; gap: 4px;">\n                                                  <span style="font-size: 8px;">•</span>\n                                                  <span>${e}</span>\n                                                </div>`)).join("")}\n                                          </div>`:"";return`\n                                        <div style="display: flex; align-items: flex-start;">\n                                            <div style="width: 24px; height: 24px; margin-right: 8px; flex-shrink: 0;">\n                                                ${e.avatar?`<img src="${e.avatar}" alt="${e.username}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">`:""}\n                                            </div>\n                                            <div style="display: flex; flex-direction: column;">\n                                                <a href="${e.profileUrl}" style="${e.isColoured?`color: ${e.color};`:""}" class="${e.isColoured?"username-coloured":"username"}">${e.username}</a>\n                                                ${s}\n                                            </div>\n                                        </div>\n                                    `})).join("")}\n                            </div>\n                        </div>\n                    </div>\n                `))).join("")}\n            </div>\n        </div>\n    `;return console.log("createReactionList: Finished creating HTML"),r}function t(e){return fetch(`https://rpghq.org/forums/reactions?mode=view&post=${e}`,{method:"POST",headers:{accept:"application/json, text/javascript, */*; q=0.01","x-requested-with":"XMLHttpRequest"},credentials:"include"}).then((e=>e.json())).then((e=>e.htmlContent?function(e){const t=(new DOMParser).parseFromString(e,"text/html"),n=[];return t.querySelectorAll(".tab-header a:not(.active)").forEach((e=>{const o=e.querySelector("img")?.src||"",r=e.getAttribute("title")||"",s=e.querySelector(".tab-counter")?.textContent||"0",i=e.getAttribute("data-id");if(i){const e=[];t.querySelectorAll(`.tab-content[data-id="${i}"] li`).forEach((t=>{const n=t.querySelector(".cbb-helper-text a");if(n){const o=n.textContent||"",r=n.href||"",s=t.querySelector(".user-avatar img"),i=s?s.src:"",a=n.classList.contains("username-coloured"),c=a?n.style.color:null;e.push({username:o,avatar:i,profileUrl:r,isColoured:a,color:c})}})),n.push({image:o,title:r,count:s,users:e})}})),n}(e.htmlContent):(console.error("No HTML content in response:",e),[]))).catch((e=>(console.error("Error fetching reactions:",e),[])))}function n(n){const r=n.id.substring(1),s=n.querySelector(".reaction-score-list");s&&!s.dataset.processed&&function(n,r){const s=n.querySelector(".reaction-score-list");if(s&&s.dataset.processed)return;t(r).then((t=>{const i=e(r,t);if(s)s.outerHTML=i;else{const e=n.querySelector(".reactions-launcher");e&&e.insertAdjacentHTML("beforebegin",i)}const a=n.querySelector(".reaction-score-list");a&&(a.dataset.processed="true",a.querySelectorAll(".reaction-group").forEach((e=>{const t=e.querySelector(".reaction-users-popup");let n=!1;e.addEventListener("mouseenter",(r=>{n=!0,o(e,t)})),e.addEventListener("mouseleave",(()=>{n=!1,function(e){e.style.display="none"}(t)})),window.addEventListener("scroll",(()=>{n&&o(e,t)}))})));const c=n.querySelector(".reactions-launcher");if(c){const e=c.querySelector(".reaction-button");if(e){const t=e.querySelector("img");if(t&&GM_getValue("leftMode",!0)){e.innerHTML='\n                <svg class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">\n                  <path d="M576.3,877.3c-30.5,7.2-62.1,10.9-93.7,10.9c-223.3,0-405-181.7-405-405s181.7-405,405-405c223.3,0,405,181.7,405,405c0,32.8-3.9,65.5-11.7,97.1c-4.5,18.1,6.6,36.4,24.7,40.8c18.1,4.7,36.4-6.5,40.8-24.7c9.1-36.9,13.7-75,13.7-113.3c0-260.6-212-472.5-472.5-472.5C222,10.6,10,222.6,10,483.1c0,260.6,212,472.6,472.5,472.6c36.9,0,73.7-4.3,109.3-12.7c18.1-4.3,29.4-22.4,25-40.6C612.6,884.2,594.4,872.9,576.3,877.3z"></path>\n                  <path d="M250.2,594.7c-14.7,11.5-17.3,32.7-5.8,47.4c58,74.2,145.2,116.7,239.3,116.7c95.1,0,182.9-43.3,240.9-118.7c11.4-14.8,8.6-35.9-6.2-47.3s-35.9-8.6-47.3,6.2c-45.1,58.7-113.4,92.3-187.4,92.3c-73.2,0-141-33.1-186.2-90.8C286.1,585.8,264.8,583.3,250.2,594.7z"></path>\n                  <path d="M382.4,435.9v-67.5c0-28-22.6-50.6-50.6-50.6s-50.6,22.6-50.6,50.6v67.5c0,28,22.6,50.6,50.6,50.6S382.4,463.8,382.4,435.9z"></path>\n                  <path d="M686.2,435.9v-67.5c0-28-22.7-50.6-50.6-50.6S585,340.4,585,368.3v67.5c0,28,22.7,50.6,50.6,50.6S686.2,463.8,686.2,435.9z"></path>\n                  <path d="M956.2,786.9H855V685.6c0-18.7-15.1-33.8-33.8-33.8s-33.8,15.1-33.8,33.8v101.3H686.2c-18.7,0-33.8,15.1-33.8,33.8s15.1,33.8,33.8,33.8h101.3v101.3c0,18.7,15.1,33.8,33.8,33.8s33.8-15.1,33.8-33.8V854.4h101.3c18.7,0,33.8-15.1,33.8-33.8S974.9,786.9,956.2,786.9z"></path>\n                </svg>\n              ',e.classList.add("default-icon"),e.classList.remove("remove-reaction"),e.title="Add reaction",e.style.cssText="";const n=t.src,o=a.querySelector(`.reaction-group img[src="${n}"]`);o&&o.closest(".reaction-group").classList.add("user-reacted")}}}})).catch((e=>console.error("Error fetching reactions:",e)))}(n,r)}function o(e,t){t.style.display="block";const n=e.getBoundingClientRect();let o=n.bottom,r=n.left;r+t.offsetWidth>window.innerWidth&&(r=window.innerWidth-t.offsetWidth),t.style.top=`${o}px`,t.style.left=`${r}px`}function r(){const e=GM_getValue("leftMode",!1);GM_setValue("leftMode",!e),window.location.reload()}function s(){const e=document.createElement("style");e.textContent="\n      @media screen and (min-width: 768px) {\n        .post .content {\n          min-height: 125px;\n        }\n      }\n      .reactions-launcher .reaction-button.remove-reaction .icon {\n        font-size: 16px !important;\n        line-height: 1 !important;\n        margin: 0 !important;\n        height: auto !important; /* Override the fixed height */\n      }\n      .reaction-group.user-reacted {\n        background-color: #4A5A6A !important;\n      }\n      .reaction-group.user-reacted span {\n        color: #ffffff !important;\n      }\n    ",document.head.appendChild(e),function(){const e=GM_getValue("leftMode",!1),t=document.getElementById("rpghq-reaction-list-style")||document.createElement("style");t.id="rpghq-reaction-list-style",t.textContent=e?"\n      .reactions-launcher > .reaction-button.default-icon {\n        padding-top: 7px !important;\n      }\n      .reaction-score-list, .reactions-launcher {\n        float: left !important;\n        margin-right: 4px !important;\n        padding-top: 10px !important;\n        margin: 0 0 5px 0 !important;\n        padding: 4px 4px 4px 0 !important;\n      }\n      .reactions-launcher {\n        display: flex !important;\n        align-items: center !important;\n      }\n      .reactions-launcher a.reaction-button {\n        display: flex !important;\n        align-items: center !important;\n        justify-content: center !important;\n        width: auto !important;\n        height: 16px !important;\n        padding: 0 !important;\n        background: none !important;\n      }\n      .reactions-launcher a.reaction-button svg {\n        width: 16px !important;\n        height: 16px !important;\n        fill: #dcddde !important;\n      }\n    ":"",document.head.appendChild(t),e&&document.querySelectorAll(".postbody").forEach((e=>{const t=e.querySelector(".reactions-launcher"),n=e.querySelector(".reaction-score-list");t&&n&&t.previousElementSibling!==n&&t.parentNode.insertBefore(n,t)}))}(),function(){if(window.innerWidth<=768){const e=document.querySelector("#username_logged_in .dropdown-contents");if(e&&!document.getElementById("toggle-left-reactions-mode")){const t=GM_getValue("leftMode",!1),n=document.createElement("li"),o=document.createElement("a");o.id="toggle-left-reactions-mode",o.href="#",o.title="Toggle Left Reactions Mode",o.role="menuitem",o.innerHTML=`\n          <i class="icon fa-align-left fa-fw" aria-hidden="true"></i>\n          <span>Left Reactions Mode (${t?"On":"Off"})</span>\n        `,o.addEventListener("click",(function(e){e.preventDefault(),r()})),n.appendChild(o),e.insertBefore(n,e.lastElementChild)}}}();new MutationObserver((e=>{e.forEach((e=>{"childList"===e.type&&e.addedNodes.forEach((e=>{if(e.nodeType===Node.ELEMENT_NODE)if(e.classList.contains("post"))n(e);else if(e.classList.contains("reaction-score-list")){const t=e.closest(".post");t&&n(t)}}))}))})).observe(document.body,{childList:!0,subtree:!0}),document.querySelectorAll(".post").forEach(n)}GM_registerMenuCommand("[Reaction List] Toggle Left Mode",r),"complete"===document.readyState||"interactive"===document.readyState?s():window.addEventListener("load",s)}});var ee=Object.freeze({__proto__:null,init:function(){const e="rpghq_pinned_threads",t="rpghq_pinned_forums",n="rpghq_show_pinned_on_new_posts",o="2756";let r=null;const s=()=>GM_getValue(e,{}),i=t=>GM_setValue(e,t),a=()=>GM_getValue(t,{}),c=e=>GM_setValue(t,e),l=()=>GM_getValue(n,!1),d=e=>GM_setValue(n,e),u=()=>{const e=window.location.href.match(/[?&]t=(\d+)/);if(e)return e[1];const t=document.querySelector("h2.topic-title a");if(t){const e=t.href.match(/[?&]t=(\d+)/);return e?e[1]:null}return null},p=()=>{const e=window.location.href.match(/[?&]f=(\d+)/);return e?e[1]:null},m=()=>{const e=document.querySelector("h2.forum-title");return e?e.textContent.trim():null},f=e=>GM_addStyle(e),g=e=>new Promise(((t,n)=>{GM_xmlhttpRequest({method:"GET",url:e,headers:{"User-Agent":navigator.userAgent,Accept:"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8","Accept-Language":"en-US,en;q=0.5",Referer:"https://rpghq.org/forums/",DNT:"1",Connection:"keep-alive","Upgrade-Insecure-Requests":"1"},withCredentials:!0,timeout:3e4,onload:e=>t(e.responseText),onerror:e=>n(e),ontimeout:()=>n(new Error("Request timed out"))})})),h=e=>(new DOMParser).parseFromString(e,"text/html");function b(){const e=l();d(!e),y(),location.reload()}function y(){null!==r&&GM_unregisterMenuCommand(r);const e=l();r=GM_registerMenuCommand(e?"[Pinned Threads] Disable on New Posts":"[Pinned Threads] Enable on New Posts",b)}function v(e,t){const n=s(),o={title:document.querySelector(".topic-title").textContent.trim(),author:document.querySelector(".author").textContent.trim(),postTime:document.querySelector(".author time").getAttribute("datetime")};n.hasOwnProperty(e)?delete n[e]:n[e]=o,i(n),E(t,n.hasOwnProperty(e))}function x(e,t){const n=t.isUnread||!1?"forum_unread_subforum":"forum_read";let o=t.breadcrumbs||"";return t.parentForumName&&(o=`Subforum of ${t.parentForumName}`),`\n        <li class="row content-processed" id="pinned-forum-${e}">\n          <dl class="row-item ${n}">\n            <dt title="${t.name}">\n              <div class="list-inner">\n                <a href="${t.url}" class="forumtitle">${t.name}</a>\n                <br><span class="forum-path responsive-hide">${o}</span>\n              </div>\n            </dt>\n            <dd class="posts">-</dd>\n            <dd class="views">-</dd>\n            <dd class="lastpost">              -</dd>\n          </dl>\n        </li>\n      `}function w(e,t,n,o,r=""){const s=n&&o?`» in <a href="${o}">${n}</a>`:"";return`\n        <li class="row bg1 content-processed" id="pinned-thread-${e}">\n          <dl class="row-item topic_read">\n            <dt>\n              <div class="list-inner">\n                <a href="https://rpghq.org/forums/viewtopic.php?t=${e}" class="topictitle">${r?`${t} (${r})`:t}</a>\n                ${s?`<br><span class="responsive-hide">${s}</span>`:""}\n              </div>\n            </dt>\n            <dd class="posts">-</dd>\n            <dd class="views">-</dd>\n          </dl>\n        </li>\n      `}async function $(e,t,n=1,o=5){const r=`${t}&start=${25*(n-1)}`;try{const s=await g(r),i=h(s);if(i.querySelector('form[action="./ucp.php?mode=login"]'))throw new Error("Redirected to login page. User might not be authenticated.");const a=i.querySelectorAll(".topiclist.topics .row");for(const t of a){const n=t.querySelector(".topictitle");if(n){if(n.textContent.trim()===e)return t.outerHTML}}if(i.querySelector(".pagination .next a")&&n<o)return $(e,t,n+1,o);throw new Error(`Thread not found after checking ${n} pages`)}catch(e){throw new Error(`Error fetching thread row: ${e.message}`)}}function S(e){return`\n        <li class="row bg1 content-processed" id="pinned-thread-${e}">\n          <dl class="row-item topic_read">\n            <dt>\n              <div class="list-inner">\n                <span class="topic-title">\n                  Error loading thread\n                </span>\n              </div>\n            </dt>\n            <dd class="posts">-</dd>\n            <dd class="views">-</dd>\n          </dl>\n        </li>\n      `}function q(){f("\n        #pinned-threads, #pinned-forums {\n          margin-bottom: 20px;\n        }\n        #pinned-threads .topiclist.topics, #pinned-forums .topiclist.forums {\n          margin-top: 0;\n        }\n        .pin-button {\n          margin-left: 10px;\n          cursor: pointer;\n        }\n        #pinned-threads .topic-poster .by, #pinned-forums .forum-poster .by {\n          display: none;\n        }\n        .zomboid-status {\n          margin-top: 5px;\n          font-size: 0.9em;\n          text-align: left;\n          color: #8c8c8c;\n        }\n        .zomboid-status .online-players {\n          font-weight: bold;\n          color: #BFC0C5;\n        }\n        .zomboid-status .last-updated {\n          font-size: 0.8em;\n          font-style: italic;\n        }\n        #pinned-threads .pagination, #pinned-forums .pagination {\n          display: none !important;\n        }\n        .forum-path {\n          font-size: 0.9em;\n          color: #8c8c8c;\n        }\n        @media (max-width: 700px) {\n          #pinned-threads .responsive-show, #pinned-forums .responsive-show {\n            display: none !important;\n          }\n          #pinned-threads .responsive-hide, #pinned-forums .responsive-hide {\n            display: none !important;\n          }\n        }\n      ")}function C(){const e=document.createElement("div");return e.className="dropdown-container dropdown-button-control topic-tools",e}function E(e,t){e.innerHTML=t?'<i class="icon fa-thumb-tack fa-fw" aria-hidden="true"></i><span>Unpin</span>':'<i class="icon fa-thumb-tack fa-fw" aria-hidden="true"></i><span>Pin</span>',e.title=t?"Unpin":"Pin"}y(),window.location.href.includes("/viewtopic.php")?function(){const e=document.querySelector(".action-bar.bar-top"),t=u();if(e&&t&&!document.getElementById("pin-thread-button")){const n=C(),o=function(e){const t=document.createElement("span");t.id="pin-thread-button",t.className="button button-secondary dropdown-trigger";const n=s().hasOwnProperty(e);return E(t,n),t.addEventListener("click",(n=>{n.preventDefault(),v(e,t)})),t}(t);n.appendChild(o),e.insertBefore(n,e.firstChild),q()}}():window.location.href.includes("/viewforum.php")?function(){const e=document.querySelector(".action-bar.bar-top"),t=p(),n=m();if(e&&t&&n&&!document.getElementById("pin-forum-button")){const n=C(),o=function(e){const t=document.createElement("span");t.id="pin-forum-button",t.className="button button-secondary dropdown-trigger";const n=a().hasOwnProperty(e);return E(t,n),t.addEventListener("click",(n=>{n.preventDefault(),function(e,t){const n=a(),o=function(){const e=m(),t=document.querySelectorAll(".crumb"),n=Array.from(t).filter((e=>e.querySelector("a"))).map((e=>e.querySelector("a").textContent.trim())).join(" » ");return{name:e,breadcrumbs:n,url:window.location.href.split("&start=")[0]}}();n.hasOwnProperty(e)?delete n[e]:n[e]=o;c(n),E(t,n.hasOwnProperty(e))}(e,t)})),t}(t);n.appendChild(o),e.insertBefore(n,e.firstChild),q()}}():(window.location.href.includes("/index.php")||window.location.href.endsWith("/forums/")||window.location.href.includes("/forums/home")||window.location.href.includes("/search.php?search_id=newposts")&&l())&&async function(){const e=document.querySelector("#page-body");if(!e)return;const t=s(),n=a();if(0===Object.keys(t).length&&0===Object.keys(n).length)return;let r;r=window.location.href.includes("/search.php")?function(e){const t=e.querySelector(".action-bar.bar-top");return t?t.nextElementSibling:e.querySelector(".forumbg")}(e):e.querySelector(".index-left")||e.querySelector(".forumbg");if(r){if(Object.keys(n).length>0){const e=function(){const e=document.createElement("div");return e.id="pinned-forums",e.className="forabg",e.innerHTML='\n        <div class="inner">\n          <ul class="topiclist content-processed">\n            <li class="header">\n              <dl class="row-item">\n                <dt><div class="list-inner"><i class="icon fa-thumb-tack fa-fw icon-sm" aria-hidden="true"></i> Pinned Forums</div></dt>\n                <dd class="posts">Topics</dd>\n                <dd class="views">Posts</dd>\n              </dl>\n            </li>\n          </ul>\n          <ul class="topiclist forums content-processed" id="pinned-forums-list"></ul>\n        </div>\n      ',e}();r.classList.contains("index-left")?r.insertAdjacentElement("afterbegin",e):r.parentNode.insertBefore(e,r),function(e){const t=a(),n=e.querySelector("#pinned-forums-list");Object.entries(t).sort((([,e],[,t])=>e.name.localeCompare(t.name,void 0,{numeric:!0,sensitivity:"base"}))).forEach((([e,t])=>{const o=function(e){const t=document.querySelectorAll(".topiclist.forums .row");for(const n of t){const t=n.querySelector("a.forumtitle");if(t&&t.href.includes(`f=${e}`))return n}const n=document.querySelectorAll("a.subforum");for(const t of n)if(t.href.includes(`f=${e}`)){const e=t.classList.contains("unread"),n=t.textContent.trim();let o="Unknown Forum";const r=t.closest(".row")?.querySelector("a.forumtitle");r&&(o=r.textContent.trim());const s=document.createElement("div");return s.dataset.isSubforum="true",s.dataset.isUnread=e,s.dataset.forumName=n,s.dataset.forumUrl=t.href,s.dataset.parentForumName=o,s}return null}(e);if(o)if(o.dataset&&o.dataset.isSubforum){const r="true"===o.dataset.isUnread;t.isUnread=r,o.dataset.parentForumName&&(t.parentForumName=o.dataset.parentForumName);const s=x(e,t);n.insertAdjacentHTML("beforeend",s)}else{const t=o.cloneNode(!0);t.id=`pinned-forum-${e}`;const r=t.querySelector("dl");r&&(r.classList.contains("forum_unread")||r.classList.contains("forum_unread_subforum")||r.classList.contains("forum_unread_locked"))||r&&(r.className=r.className.replace(/forum_\w+/g,"forum_read")),t.querySelectorAll("strong").forEach((e=>{if(e.textContent.includes("Subforums:")){e.remove();const n=t.querySelector(".list-inner");n&&n.querySelectorAll("a.subforum").forEach((e=>{e.remove()}))}}));const s=t.querySelector(".list-inner");if(s){const e=document.createTreeWalker(s,NodeFilter.SHOW_TEXT),t=[];for(;e.nextNode();){const n=e.currentNode;(n.textContent.includes("Subforums:")||/^\s*,\s*$/.test(n.textContent))&&t.push(n)}t.forEach((e=>{/^\s*[,\s]*\s*$/.test(e.textContent)?e.remove():e.textContent=e.textContent.replace(/\s*,\s*,\s*/g,"").trim()}))}t.querySelectorAll(".pagination").forEach((e=>e.remove())),t.classList.add("content-processed"),n.appendChild(t)}else n.insertAdjacentHTML("beforeend",x(e,t))}))}(e)}if(Object.keys(t).length>0){const e=function(){const e=document.createElement("div");return e.id="pinned-threads",e.className="forabg",e.innerHTML='\n        <div class="inner">\n          <ul class="topiclist content-processed">\n            <li class="header">\n              <dl class="row-item">\n                <dt><div class="list-inner"><i class="icon fa-thumb-tack fa-fw icon-sm" aria-hidden="true"></i> Pinned Topics</div></dt>\n                <dd class="posts">Replies</dd>\n                <dd class="views">Views</dd>\n                <dd class="lastpost">Last Post</dd>\n              </dl>\n            </li>\n          </ul>\n          <ul class="topiclist topics content-processed" id="pinned-threads-list"></ul>\n        </div>\n      ',e}();if(r.classList.contains("index-left"))r.insertAdjacentElement("afterbegin",e);else if(Object.keys(n).length>0){const t=document.getElementById("pinned-forums");t?t.insertAdjacentElement("afterend",e):r.parentNode.insertBefore(e,r)}else r.parentNode.insertBefore(e,r);await async function(e){const t=s(),n=e.querySelector("#pinned-threads-list"),r=Object.keys(t),i=function(e){const t=new Map,n=document.querySelectorAll(".topiclist.topics .row");for(const o of n){const n=o.querySelector("a.topictitle");if(n)for(const r of e)if(n.href.includes(`t=${r}`)){t.set(r,o);break}}return t}(r),a=r.filter((e=>!i.has(e)));a.forEach((e=>{n.insertAdjacentHTML("beforeend",function(e){return`\n        <li class="row bg1 content-processed" id="pinned-thread-${e}">\n          <dl class="row-item topic_read">\n            <dt>\n              <div class="list-inner">\n                <span class="topic-title">\n                  <i class="fa fa-spinner fa-spin"></i> Loading...\n                </span>\n              </div>\n            </dt>\n            <dd class="posts">-</dd>\n            <dd class="views">-</dd>\n            <dd class="lastpost"><span style="padding-left: 1.5em;">-</span></dd>\n          </dl>\n        </li>\n      `}(e))}));let c=!1;const l=new IntersectionObserver((e=>{c=e[0].isIntersecting}),{threshold:.1});l.observe(e);const d=e.offsetHeight;for(const[e,t]of i.entries()){const o=t.cloneNode(!0);o.id=`pinned-thread-${e}`,o.querySelectorAll(".pagination").forEach((e=>e.remove())),o.classList.add("content-processed");const r=n.querySelector(`#pinned-thread-${e}`);r?n.replaceChild(o,r):n.appendChild(o)}if(a.length>0){const e=await Promise.all(a.map((e=>async function(e){try{const{title:t,forumUrl:n,forumName:r,status:s}=await async function(e){const t=`https://rpghq.org/forums/viewtopic.php?t=${e}`,n=await g(t),r=h(n),s=r.querySelector("h2.topic-title a"),i=r.querySelectorAll("#nav-breadcrumbs .crumb"),a=i[i.length-1];if(!s||!a)throw new Error("Thread title or forum not found");const c=s.textContent.trim(),l=a.querySelector("a").href,d=a.querySelector("a").textContent.trim();let u=null;return e===o&&(u=function(e){const t=e.querySelector('span[style="background-color:black"] strong.text-strong');if(t){const e=t.closest("div"),n=e.querySelectorAll('span[style="font-size:85%;line-height:116%"]'),o=e.querySelector('span[style="font-size:55%;line-height:116%"] em');if(t&&o)return{playerCount:t.textContent,onlinePlayers:Array.from(n).map((e=>e.textContent)),lastUpdated:o.textContent}}return null}(r)),{title:c,forumUrl:l,forumName:d,status:u}}(e);let i=await $(t,n);if(i){i=function(e,t,n,o,r){const s=(new DOMParser).parseFromString(e,"text/html").querySelector(".row");if(!s)return e;s.classList.contains("content-processed")||s.classList.add("content-processed"),s.querySelectorAll('*[class*="sticky_"]').forEach((e=>{e.className=e.className.replace(/\bsticky_/g,"topic_")}));const i=s.querySelector(".pagination");i&&(i.style.display="none"),s.querySelectorAll(".rh_tag").forEach((e=>e.remove()));const a=s.querySelector("dl"),c=a&&(a.classList.contains("topic_unread")||a.classList.contains("topic_unread_hot")||a.classList.contains("topic_unread_mine")||a.classList.contains("topic_unread_hot_mine")),l=s.querySelector(".icon.fa-file");l&&(l.classList.remove("icon-lightgray","icon-red"),l.classList.add(c?"icon-red":"icon-lightgray"));const d=s.querySelector(".topictitle");if(d){const e=s.querySelector("dl");if(!e||!(e.classList.contains("topic_unread")||e.classList.contains("topic_unread_hot")||e.classList.contains("topic_unread_mine")||e.classList.contains("topic_unread_hot_mine"))){const e=d.getAttribute("href");d.setAttribute("href",`${e}&view=unread`)}}const u=s.querySelector(".responsive-hide.left-box");if(u){const e=u.querySelector("time");if(e){const t=document.createElement("a");t.href=r,t.textContent=o,document.createTextNode("  » in "),e.insertAdjacentElement("afterend",t),e.insertAdjacentText("afterend","  » in ")}}return s.id=`pinned-thread-${t}`,s.outerHTML}(i,e,0,r,n);const o=t.replace(/^[【】\[\]\s]+/,"");return{threadId:e,title:t,sortableTitle:o,rowHTML:i}}{i=w(e,t,r,n,"Thread not found in forum list");const o=t.replace(/^[【】\[\]\s]+/,"");return{threadId:e,title:t,sortableTitle:o,rowHTML:i}}}catch(t){return{threadId:e,title:`Error loading thread ${e}`,sortableTitle:`Error loading thread ${e}`,rowHTML:w(e,`Error loading thread ${e}`,"","",`Error: ${t.message||"Unknown error"}`)}}}(e,t[e]).catch((t=>({threadId:e,title:`Error loading thread ${e}`,sortableTitle:`error loading thread ${e}`,rowHTML:S(e)}))))));e.sort(((e,t)=>e.title.localeCompare(t.title,void 0,{numeric:!0,sensitivity:"base",ignorePunctuation:!1}))),e.forEach((e=>{const t=n.querySelector(`#pinned-thread-${e.threadId}`);t?t.outerHTML=e.rowHTML:n.insertAdjacentHTML("beforeend",e.rowHTML)}))}const u=Array.from(n.children);u.sort(((e,t)=>{const n=e.querySelector(".topictitle")?.textContent||"",o=t.querySelector(".topictitle")?.textContent||"";return n.localeCompare(o,void 0,{numeric:!0,sensitivity:"base",ignorePunctuation:!1})})),u.forEach((e=>n.appendChild(e)));const p=e.offsetHeight-d;!c&&p>0&&window.scrollBy(0,p),l.disconnect()}(e)}}}()}});let te=()=>{};var ne=Object.freeze({__proto__:null,init:function({getScriptSetting:e}){te=e,GM_addStyle("\n    .dropdown-extended a.mark_read {\n      background-color: #18202A;\n    }\n  ");const t=864e5,n=te("notifications","referenceBackgroundColor","rgba(23, 27, 36, 0.5)"),o=te("notifications","referenceTextColor","#ffffff"),r=te("notifications","timestampColor","#888888"),s={display:"inline-block",background:n,color:o,padding:"2px 4px",borderRadius:"2px",zIndex:"-1",maxWidth:"98%",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},i={position:"relative",paddingBottom:"20px"},a={position:"absolute",bottom:"2px",right:"2px",fontSize:"0.85em",color:r},c={position:"absolute",bottom:"2px",left:"2px",fontSize:"0.85em",color:"#888"},l={createElement:(e,t={},n="")=>{const o=document.createElement(e);return Object.assign(o,t),o.innerHTML=n,o},formatReactions:e=>`<span style="display: inline-flex; margin-left: 2px; vertical-align: middle;">\n          ${e.map((e=>`\n            <img src="${e.image}" alt="${e.name}" title="${e.username}: ${e.name}" \n                 reaction-username="${e.username}"\n                 style="height: 1em !important; width: auto !important; vertical-align: middle !important; margin-right: 2px !important;">\n          `)).join("")}\n        </span>`,styleReference:e=>{Object.assign(e.style,s)},extractPostId:e=>{const t=(e||"").match(/p=(\d+)/);return t?t[1]:null},sleep:e=>new Promise((t=>setTimeout(t,e))),cleanupPostContent:e=>{const t=(e=e.replace(/\[quote="([^"]+)"\]/g,"[quote=$1]")).indexOf("[quote=");if(-1!==t){const n=e.indexOf("]",t);-1!==n&&(e=e.slice(0,t)+e.slice(n+1))}const n=e.lastIndexOf("[/quote]");return-1!==n&&(e=e.slice(0,n)+e.slice(n+8)),(e=l.aggressiveRemoveInnerQuotes(e)).trim()},aggressiveRemoveInnerQuotes:e=>{let t="",n=0,o=0;for(;n<e.length;)if(e.startsWith("[quote=",n)){o++;const t=e.indexOf("]",n);if(-1===t)break;n=t+1}else e.startsWith("[/quote]",n)?(o>0&&o--,n+=8):(0===o&&(t+=e[n]),n++);return t},removeBBCode:e=>e.replace(/\[color=[^\]]*\](.*?)\[\/color\]/gi,"$1").replace(/\[size=[^\]]*\](.*?)\[\/size\]/gi,"$1").replace(/\[b\](.*?)\[\/b\]/gi,"$1").replace(/\[i\](.*?)\[\/i\]/gi,"$1").replace(/\[u\](.*?)\[\/u\]/gi,"$1").replace(/\[s\](.*?)\[\/s\]/gi,"$1").replace(/\[url=[^\]]*\](.*?)\[\/url\]/gi,"$1").replace(/\[url\](.*?)\[\/url\]/gi,"$1").replace(/\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]/gi,"").replace(/\[img\](.*?)\[\/img\]/gi,"").replace(/\[media\](.*?)\[\/media\]/gi,"").replace(/\[webm\](.*?)\[\/webm\]/gi,"").replace(/\[code\](.*?)\[\/code\]/gi,"$1").replace(/\[list\](.*?)\[\/list\]/gi,"$1").replace(/\[\*\]/gi,"").replace(/\[quote(?:=[^\]]*?)?\](.*?)\[\/quote\]/gi,"").replace(/\[[^\]]*\]/g,"").replace(/\s+/g," ").trim(),removeURLs:e=>e.replace(/(?:https?|ftp):\/\/[\n\S]+/gi,"").replace(/www\.[^\s]+/gi,"").replace(/\s+/g," ").trim(),extractSingleImageUrl:e=>{console.log("Extracting image URL from text:",e);const t=e.trim();if(console.log("Trimmed text:",t),t.startsWith("[img]")&&t.endsWith("[/img]")){console.log("Text is a single image tag");const e=t.slice(5,-6).trim();return console.log("Extracted URL:",e),e}const n=t.match(/^\[img\s+([^=\]]+)=([^\]]+)\](.*?)\[\/img\]$/i);if(n){console.log("Text is a single image tag with parameters");const e=n[3].trim();return console.log("Extracted URL:",e),e}const o=e.match(/\[img(?:\s+[^=\]]+=[^\]]+)?\](.*?)\[\/img\]/gi);if(console.log("Found image tags:",o),o&&o.length>0){console.log("Using first image tag");const e=o[0];let t;return t=e.startsWith("[img]")?e.replace(/\[img\](.*?)\[\/img\]/i,"$1").trim():e.replace(/\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]/i,"$1").trim(),console.log("Extracted URL:",t),t}return console.log("No valid image URL found"),null},extractVideoUrl:e=>{console.log("Extracting video URL from text:",e);const t=e.trim();if(t.startsWith("[webm]")&&t.endsWith("[/webm]")){console.log("Text is a single webm tag");const e=t.slice(6,-7).trim();return console.log("Extracted webm URL:",e),{url:e,type:"webm"}}if(t.startsWith("[media]")&&t.endsWith("[/media]")){console.log("Text is a single media tag");const e=t.slice(7,-8).trim();return console.log("Extracted media URL:",e),{url:e,type:"media"}}const n=e.match(/\[webm\](.*?)\[\/webm\]/i);if(n)return console.log("Found webm tag"),{url:n[1].trim(),type:"webm"};const o=e.match(/\[media\](.*?)\[\/media\]/i);return o?(console.log("Found media tag"),{url:o[1].trim(),type:"media"}):(console.log("No valid video URL found"),null)}},d=e=>{const n=GM_getValue(`reactions_${e}`);if(n){const{reactions:o,timestamp:r}=JSON.parse(n);if(Date.now()-r<t)return o;GM_deleteValue(`reactions_${e}`)}return null},u=(e,t)=>{GM_setValue(`reactions_${e}`,JSON.stringify({reactions:t,timestamp:Date.now()}))},p=e=>{const n=GM_getValue(`post_content_${e}`);if(n){const{content:o,timestamp:r}=JSON.parse(n);if(Date.now()-r<t)return o;GM_deleteValue(`post_content_${e}`)}return null},m=(e,t)=>{GM_setValue(`post_content_${e}`,JSON.stringify({content:t,timestamp:Date.now()}))},f=()=>{const e=GM_getValue("last_storage_cleanup",0),n=Date.now();n-e>=t&&GM_setValue("last_storage_cleanup",n)},g=async(e,t)=>{if(!t){const t=d(e);if(t)return t}try{const t=await fetch(`https://rpghq.org/forums/reactions?mode=view&post=${e}`,{method:"POST",headers:{accept:"application/json, text/javascript, */*; q=0.01","x-requested-with":"XMLHttpRequest"},credentials:"include"}),n=await t.json(),o=(new DOMParser).parseFromString(n.htmlContent,"text/html"),r=Array.from(o.querySelectorAll('.tab-content[data-id="0"] li')).map((e=>({username:e.querySelector(".cbb-helper-text a").textContent,image:e.querySelector(".reaction-image").src,name:e.querySelector(".reaction-image").alt})));return u(e,r),r}catch(e){return console.error("Error fetching reactions:",e),[]}},h=async e=>{const t=p(e);if(t)return t;try{const t=await fetch(`https://rpghq.org/forums/posting.php?mode=quote&p=${e}`,{headers:{"X-Requested-With":"XMLHttpRequest"},credentials:"include"});if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);const n=await t.text(),o=document.createElement("div");o.innerHTML=n;const r=o.querySelector("#message");if(!r)throw new Error("Could not find message content");let s=l.cleanupPostContent(r.value);return m(e,s),s}catch(e){return console.error("Error fetching post content:",e),null}},b={async customizeReactionNotification(e,t){if("true"===t.dataset.reactionCustomized)return;const n=te("notifications","enableNotificationColors",!0),o=te("notifications","enableReactionSmileys",!0),r=te("notifications","enableImagePreviews",!0),s=te("notifications","enableVideoPreviews",!1),i=te("notifications","reactionColor","#3889ED"),a=e.innerHTML,c=t.closest("li"),d=!c||c.classList.contains("bg2"),u=l.extractPostId(t.getAttribute("data-real-url")||t.href);if(!u)return;const p=e.querySelectorAll(".username, .username-coloured"),m=Array.from(p).map((e=>e.textContent.trim()));let f="";if(o){const e=(await g(u,d)).filter((e=>m.includes(e.username)));f=l.formatReactions(e)}let b;if(b=n?`<b style="color: ${i};">reacted</b>`:"<b>reacted</b>",a.includes("reacted to a message you posted"))if(e.innerHTML=a.replace(/(have|has)\s+reacted.*$/,`${b} ${f} to:`),r||s){const n=await h(u);if(n){const o=n.trim();let i=t.querySelector(".notification-reference");const a=l.createElement("div",{className:"notification-media-preview"});let c=!1;if(s&&(o.startsWith("[webm]")&&o.endsWith("[/webm]")||o.startsWith("[media]")&&o.endsWith("[/media]"))){const e=l.extractVideoUrl(o);e&&(a.innerHTML=`<video src="${e.url}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" loop muted autoplay title="Video Preview (click to pause)"></video>`,c=!0)}if(!c&&r&&(o.startsWith("[img]")&&o.endsWith("[/img]")||o.match(/^\[img\s+[^=\]]+=[^\]]+\].*?\[\/img\]$/i))){let e;if(o.startsWith("[img]"))e=o.slice(5,-6).trim();else{const t=o.match(/^\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]$/i);e=t?t[1].trim():null}e&&(a.innerHTML=`<img src="${e}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" title="Image Preview">`,c=!0)}c?(i&&i.remove(),e.appendChild(a)):(i||(i=l.createElement("span",{className:"notification-reference"}),e.appendChild(document.createElement("br")),e.appendChild(i)),i.textContent=l.removeURLs(l.removeBBCode(n)),l.styleReference(i),a.remove())}}else{const e=t.querySelector(".notification-reference");if(e){const t=await h(u);t?(e.textContent=l.removeURLs(l.removeBBCode(t)),l.styleReference(e)):e.remove()}}else e.innerHTML=a.replace(/(have|has)\s+reacted.*$/,`${b} ${f}`);t.dataset.reactionCustomized="true"},async customizeMentionNotification(e){const t=te("notifications","enableNotificationColors",!0),n=te("notifications","mentionColor","#FFC107");Object.assign(e.style,i);const o=e.querySelector(".notification_text"),r=o.querySelector(".notification-title"),s=r.innerHTML,c=r.querySelectorAll(".username, .username-coloured"),d=Array.from(c).map((e=>e.outerHTML)).join(", "),u=s.split("<br>in ");let p=u.length>1?u[1].trim():"Unknown Topic";r.innerHTML=t?`\n          <b style="color: ${n};">Mentioned</b> by ${d} in <b>${p}</b>\n        `:`\n          <b>Mentioned</b> by ${d} in <b>${p}</b>\n        `;let m=e.querySelector(".notification-reference");m||(m=l.createElement("span",{className:"notification-reference",textContent:"Loading..."}),l.styleReference(m),r.appendChild(document.createElement("br")),r.appendChild(m)),this.queuePostContentFetch(e.getAttribute("data-real-url")||e.href,m);const f=o.querySelector(".notification-time");f&&Object.assign(f.style,a)},customizePrivateMessageNotification(e,t){const n=te("notifications","enableNotificationColors",!0),o=te("notifications","resizeFillerWords",!0),r=te("notifications","warningColor","#D31141");Object.assign(t.style,i);const s=t.querySelector(".notification-time");s&&Object.assign(s.style,a);let c=e.innerHTML;const l=t.querySelector(".notification-reference")?.textContent.trim().replace(/^"(.*)"$/,"$1");"Board warning issued"===l&&(c=n?c.replace(/<strong>Private Message<\/strong>/,`<strong style="color: ${r};">Board warning issued</strong>`).replace(/from/,"by").replace(/:$/,""):c.replace(/<strong>Private Message<\/strong>/,"<strong>Board warning issued</strong>").replace(/from/,"by").replace(/:$/,""),t.querySelector(".notification-reference")?.remove()),!t.dataset.fillerResized&&o&&(c=c.replace(/\b(by|and|in|from)\b(?!-)/g,'<span style="font-size: 0.85em; padding: 0 0.25px;">$1</span>'),t.dataset.fillerResized=!0),e.innerHTML=c},async customizeNotificationBlock(e){const t=te("notifications","enableNotificationColors",!0),n=te("notifications","resizeFillerWords",!0),o=te("notifications","quoteColor","#1E90FF"),r=te("notifications","replyColor","#FF69B4");te("notifications","reactionColor","#3889ED"),te("notifications","mentionColor","#FFC107");const s=te("notifications","editColor","#8A2BE2"),c=te("notifications","approvalColor","#00AA00"),d=te("notifications","reportColor","#f58c05");te("notifications","warningColor","#D31141");const u=te("notifications","readOpacity",.8),p=te("notifications","readTintColor","rgba(0, 0, 0, 0.05)");Object.assign(e.style,i);const m=e.querySelector(".notification_text");if(!m)return;const f=e.closest("li");!!f&&!f.classList.contains("bg2")?(e.style.opacity=u,e.style.backgroundColor=p):(e.style.opacity="",e.style.backgroundColor="");const g=e.querySelector(".notification-time");g&&Object.assign(g.style,a);let h=m.querySelector(".notification-title");if(!h)return;let b=h.innerHTML,y=b,v="default";b.includes("You were mentioned by")?(v="mention",await this.customizeMentionNotification(e),y=h.innerHTML):b.includes("reacted to")?(v="reaction",await this.customizeReactionNotification(h,e),y=h.innerHTML):b.includes("Private Message")?(v="pm",this.customizePrivateMessageNotification(h,e),y=h.innerHTML,h.innerHTML.includes("Board warning issued")&&(v="warning")):b.includes("Report closed")?(v="report",t&&(y=b.replace(/Report closed/,`<strong style="color: ${d};">Report closed</strong>`))):b.includes("Post approval")?(v="approval",t&&(y=b.replace(/<strong>Post approval<\/strong>/,`<strong style="color: ${c};">Post approval</strong>`))):b.includes("<strong>Quoted</strong>")?v="quote":b.includes("<strong>Reply</strong>")?v="reply":b.includes("edited a message")&&(v="edit",t&&(y=b.replace(/edited a message you posted/,`<strong style="color: ${s};">edited</strong> a message you posted`)));let x=m.querySelector(".notification-reference");if(!x||"reply"!==v&&"quote"!==v)h.innerHTML=y;else{const t=x.textContent.trim().replace(/^"|"$/g,"");let n=y.replace(/in(?:\stopic)?:/,`<span style="font-size: 0.85em; padding: 0 0.25px;">in</span> <strong>${t}</strong>:`);h.innerHTML=n,x.textContent="Loading...",l.styleReference(x),this.queuePostContentFetch(e.getAttribute("data-real-url")||e.href,x),y=h.innerHTML}if(!e.dataset.fillerResized&&n&&(y=y.replace(/\b(by|and|in|from)\b(?!-)/g,'<span style="font-size: 0.85em; padding: 0 0.25px;">$1</span>'),e.dataset.fillerResized=!0),t){const e=o,t=r,n=s,i=c,a=d;switch(v){case"quote":y=y.replace(/<strong>Quoted<\/strong>/,`<strong style="color: ${e};">Quoted</strong>`);break;case"reply":y=y.replace(/<strong>Reply<\/strong>/,`<strong style="color: ${t};">Reply</strong>`);break;case"edit":y=y.replace(/(<strong(?: style="color: [^;]+;")?>edited<\/strong>|edited) a message/,`<strong style="color: ${n};">edited</strong> a message`);break;case"approval":y=y.replace(/(<strong(?: style="color: [^;]+;")?>Post approval<\/strong>|<strong>Post approval<\/strong>)/,`<strong style="color: ${i};">Post approval</strong>`);break;case"report":y=y.replace(/(<strong(?: style="color: [^;]+;")?>Report closed<\/strong>|Report closed)/,`<strong style="color: ${a};">Report closed</strong>`)}}else y=y.replace(/<b style="color: [^;]+;">/g,"<b>").replace(/<strong style="color: [^;]+;">/g,"<strong>");h.innerHTML=y,x=e.querySelector(".notification-reference"),x&&l.styleReference(x),e.querySelectorAll(".username-coloured").forEach((e=>{e.classList.replace("username-coloured","username"),e.style.color=""})),e.dataset.customized="true"},customizeNotificationPanel(){document.querySelectorAll(".notification-block, a.notification-block").forEach(b.customizeNotificationBlock.bind(b))},customizeNotificationPage(){const e=te("notifications","enableNotificationColors",!0),t=te("notifications","notificationColors","{}");let n={};try{n=JSON.parse(t)}catch(e){console.error("Invalid JSON in notificationColors setting:",e),n={default:"#ffffff"}}const o=te("notifications","enableReactionSmileys"),r=te("notifications","resizeFillerWords",!0),s=te("notifications","quoteColor","#F5575D"),i=te("notifications","replyColor","#2E8B57"),a=te("notifications","reactionColor","#3889ED"),d=te("notifications","mentionColor","#FFC107"),u=te("notifications","editColor","#8A2BE2"),p=te("notifications","approvalColor","#00AA00"),m=te("notifications","reportColor","#f58c05"),f=te("notifications","warningColor","#D31141"),h=te("notifications","defaultColor","#ffffff"),y=te("notifications","referenceBackgroundColor","rgba(23, 27, 36, 0.5)"),v=te("notifications","referenceTextColor","#ffffff"),x=te("notifications","readOpacity",.8),w=te("notifications","readTintColor","rgba(0, 0, 0, 0.05)"),$=s,S=i,q=a,C=d,E=u,L=p,k=m,T=f,M=h,A=y,_=v;document.querySelectorAll(".cplist .row").forEach((async t=>{if("true"===t.dataset.customized)return;t.style.position="relative",t.style.paddingBottom="20px";const s=t.querySelector(".notifications_time");s&&Object.assign(s.style,c);const i=t.querySelector(".notifications"),a=i?.querySelector("a");if(!a)return void(t.dataset.customized="true");const d=a.querySelector(".notifications_title");if(!d)return void(t.dataset.customized="true");const u=!(a.href&&a.href.includes("mark_notification"));u&&(t.style.opacity=x,t.style.backgroundColor=w);let p,m=d.innerHTML,f="default",h="";const y=(t,n)=>e?`<strong style="color: ${n};">${t}</strong>`:`<strong>${t}</strong>`,v=e=>`<span style="font-size: 0.85em; padding: 0 0.25px;">${e}</span>`;if(m.includes("You were mentioned by")){f="mention";const e=m.split("<br>");if(2===e.length){let t=e[0]+" "+e[1];r&&(t=t.replace(/\b(by|in)\b(?!-)/g,v("$1")));const n=`background: ${A}; color: ${_}; padding: 2px 4px; border-radius: 2px; margin-top: 5px;`;h=`\n              <div class="notification-block">\n                <div class="notification-title">${y("Mentioned",C)} ${t.substring(t.indexOf(r?v("by"):"by"))}</div>\n                <div class="notification-reference" style="${n}">\n                  Loading...\n                </div>\n              </div>\n            `,a.innerHTML=h,p=a.querySelector(".notification-reference")}else h=m}else if(m.includes("reacted to")){f="reaction";const e=Array.from(d.querySelectorAll(".username, .username-coloured")),t=e.map((e=>e.textContent.trim())),n=l.extractPostId(a.href);if(n){let s="";if(o){const e=(await g(n,!1)).filter((e=>t.includes(e.username)));s=l.formatReactions(e)}const i=e.length>0?e[0].outerHTML:"",c=m.substring(0,m.indexOf(i));let d;const u=r?v("and"):"and";d=1===e.length?e[0].outerHTML:2===e.length?`${e[0].outerHTML} ${u} ${e[1].outerHTML}`:e.length>2?e.slice(0,-1).map((e=>e.outerHTML)).join(", ")+`, ${u} ${e[e.length-1].outerHTML}`:"Someone";h=`\n              <div class="notification-block">\n                <div class="notification-title">${`${c}${d} ${y("reacted",q)} ${s} to:`}</div>\n                <div class="notification-reference" style="${`background: ${A}; color: ${_}; padding: 2px 4px; border-radius: 2px; margin-top: 5px;`}">\n                  Loading...\n                </div>\n              </div>\n            `,a.innerHTML=h,p=a.querySelector(".notification-reference")}else h=m}else{const e=m.match(/"([^"]*)"$/);let t=m,n="Loading...";if(m.includes("<strong>Quoted</strong>"))f="quote",n=e?`"${e[1]}"`:"Loading...";else if(e&&(t=m.replace(/"[^"]*"$/,"").trim(),n=`"${e[1]}"`),m.includes("<strong>Reply</strong>"))f="reply";else if(m.includes("edited a message"))f="edit";else if(m.includes("Post approval"))f="approval";else if(m.includes("Report closed"))f="report";else if(m.includes("Private Message")){f="pm";const e=m.match(/<strong>Private Message<\/strong>(?: from [^:]+):? "?([^"]*)"?/);e&&"Board warning issued"===e[1]?(f="warning",t=m.replace(/<strong>Private Message<\/strong>/,y("Board warning issued",T)).replace(/from/,"by").replace(/:$/,"").replace(/"[^"]*"$/,"").trim(),n=null):t=m.replace(/<strong>Private Message<\/strong>/,y("Private Message",M)).replace(/"[^"]*"$/,"").trim()}let o=t;switch(f){case"quote":o=o.replace(/<strong>Quoted<\/strong>/,y("Quoted",$));break;case"reply":o=o.replace(/<strong>Reply<\/strong>/,y("Reply",S));break;case"edit":o=o.replace(/edited a message/,`${y("edited",E)} a message`);break;case"approval":o=o.replace(/<strong>Post approval<\/strong>/,y("Post approval",L));break;case"report":o=o.replace(/Report closed/,y("Report closed",k))}r&&(o=o.replace(/\b(by|and|in|from)\b(?!-)/g,v("$1")));h=`\n            <div class="notification-block">\n              <div class="notification-title">${o}</div>\n              ${null!==n?`<div class="notification-reference" style="${`background: ${A}; color: ${_}; padding: 2px 4px; border-radius: 2px; margin-top: 5px;`}">\n                ${n}\n              </div>`:""}\n            </div>\n          `,a.innerHTML=h,null!==n&&(p=a.querySelector(".notification-reference"))}if(p&&p.textContent.includes("Loading...")){!p.textContent.includes("Loading...")?l.styleReference(p):b.queuePostContentFetch(a.href,p)}if(e&&!u){const e=n[f]||M;t.style.backgroundColor=e}a.querySelectorAll(".username-coloured").forEach((e=>{e.classList.replace("username-coloured","username"),e.style.color=""})),t.dataset.customized="true"}))},async queuePostContentFetch(e,t){const n=te("notifications","enableImagePreviews",!0),o=te("notifications","enableVideoPreviews",!1),r=n||o,s=te("notifications","enableQuotePreviews",!0),i=l.extractPostId(e);if(i){if(this.lastFetchTime){const e=Date.now()-this.lastFetchTime;e<500&&await l.sleep(500-e)}try{const e=await h(i);if(e&&t.parentNode){const i=e.trim(),a=l.createElement("div",{className:"notification-media-preview"});let c=!1;if(o&&(i.startsWith("[webm]")&&i.endsWith("[/webm]")||i.startsWith("[media]")&&i.endsWith("[/media]"))){const e=l.extractVideoUrl(i);e&&(a.innerHTML=`<video src="${e.url}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" loop muted autoplay title="Video Preview"></video>`,c=!0)}if(!c&&n&&(i.startsWith("[img]")&&i.endsWith("[/img]")||i.match(/^\[img\s+[^=\]]+=[^\]]+\].*?\[\/img\]$/i))){let e;if(i.startsWith("[img]"))e=i.slice(5,-6).trim();else{const t=i.match(/^\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]$/i);e=t?t[1].trim():null}e&&(a.innerHTML=`<img src="${e}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" title="Image Preview">`,c=!0)}c&&r?(t.parentNode.insertBefore(a,t),t.remove()):s?(t.textContent=l.removeBBCode(e),l.styleReference(t),a.remove()):(t.remove(),a.remove())}else t.remove()}catch(e){console.error("Error fetching post content:",e),t.remove()}this.lastFetchTime=Date.now()}else t.remove()}},y={getDisplayedPostIds:()=>Array.from(document.querySelectorAll('div[id^="p"]')).map((e=>e.id.substring(1))),getNotificationData:()=>Array.from(document.querySelectorAll(".notification-block")).map((e=>{const t=e.getAttribute("href");return{href:t,postId:l.extractPostId(e.getAttribute("data-real-url")||t)}})).filter((e=>e.href&&e.postId)),markNotificationAsRead(e){GM_xmlhttpRequest({method:"GET",url:"https://rpghq.org/forums/"+e,onload:e=>console.log("Notification marked as read:",e.status)})},checkAndMarkNotifications(){const e=this.getDisplayedPostIds();this.getNotificationData().forEach((t=>{e.includes(t.postId)&&this.markNotificationAsRead(t.href)}))}},v=()=>{const e=document.createElement("style");let t;e.textContent="\n        .row .list-inner img {\n          max-width: 50px !important;\n        }\n      ",document.head.appendChild(e),b.customizeNotificationPanel(),y.checkAndMarkNotifications(),window.location.href.includes("ucp.php?i=ucp_notifications")&&b.customizeNotificationPage();new MutationObserver((e=>{let n=!1;for(const t of e){if("attributes"===t.type&&"class"===t.attributeName&&t.target.nodeType===Node.ELEMENT_NODE&&t.target.matches("li")&&t.target.querySelector(".notification-block, a.notification-block")){console.log("Observer triggered: Parent LI class changed."),n=!0;break}if("childList"===t.type){if(Array.from(t.addedNodes).some((e=>e.nodeType===Node.ELEMENT_NODE&&(e.matches?.(".notification-block, a.notification-block")||e.querySelector?.(".notification-block, a.notification-block"))))){console.log("Observer triggered: New notifications added."),n=!0;break}}}n&&(clearTimeout(t),t=setTimeout((()=>{b.customizeNotificationPanel()}),100))})).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class"]}),f()};"complete"===document.readyState||"interactive"===document.readyState?v():window.addEventListener("load",v)}});var oe=Object.freeze({__proto__:null,init:function(){console.log("User Reaction Auto-Marker initialized!"),document.querySelector("#notification_list").querySelectorAll("li").forEach((e=>{if(!e.querySelector("a.notification-block"))return;const t=e.querySelector("span.username");if(!t)return;const n=t.textContent.trim();if(!n.startsWith("Kalarion")&&!n.startsWith("dolor"))return;console.log(`Found notification from ${n}, marking as read`);const o=e.querySelector("a.mark_read");o&&(o.click(),console.log(`Removing ${n} notification from view`)),e.remove()}))}});var re=Object.freeze({__proto__:null,init:function(){const e={img:1,url:4,color:3,"*":"list-item"},t=/(https?:\/\/[^\s<]+)/g,n=/\[(\/?)([a-zA-Z0-9*]+)([^\]]*)\]/g;let o=[],r="";const s=t=>(t in e||(e[t]=Object.keys(e).length%5),e[t]),i=e=>e.replace(/[&<>"']/g,(e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[e]))),a=e=>(299*parseInt(e.slice(1,3),16)+587*parseInt(e.slice(3,5),16)+114*parseInt(e.slice(5,7),16))/1e3>=128?"black":"white",c=(e,t)=>{let n;return function(...o){const r=this;clearTimeout(n),n=setTimeout((()=>e.apply(r,o)),t)}};let l=null;const d=(e,t)=>{if(!e||!t)return;if(0===e.offsetHeight)return;e.style.height="auto",e.style.height=e.scrollHeight+"px";const n=window.getComputedStyle(e);Object.assign(t.style,{width:e.offsetWidth+"px",height:e.offsetHeight+"px",padding:n.padding,borderWidth:n.borderWidth,borderStyle:n.borderStyle,borderColor:"transparent",fontFamily:n.fontFamily,fontSize:n.fontSize,lineHeight:n.lineHeight}),u(),p()},u=()=>{const e=document.getElementById("smiley-box"),t=document.getElementById("message");if(e&&t)if(window.innerWidth<=768)Object.assign(e.style,{position:"static",width:"100%",maxHeight:"none",overflowY:"visible",marginBottom:"10px"});else{const{top:n,right:o}=t.getBoundingClientRect(),r=window.innerWidth,s=n+(window.pageYOffset||document.documentElement.scrollTop),i=220,a=Math.min(o+10,r-i);Object.assign(e.style,{position:"absolute",top:s+"px",left:a+"px",maxHeight:"80vh",overflowY:"auto"})}},p=()=>{const e=document.getElementById("abbc3_buttons"),t=document.getElementById("message");if(!e||!t)return;const n=t.getBoundingClientRect(),o=e.getBoundingClientRect(),r=window.pageYOffset||document.documentElement.scrollTop,s=o.top-n.top;if(r>=n.top+r-s){if(!e.classList.contains("fixed")){e.classList.add("fixed");const t=document.createElement("div");t.style.height=e.offsetHeight+"px",t.id="abbc3_buttons_placeholder",e.parentNode.insertBefore(t,e)}Object.assign(e.style,{width:t.offsetWidth+"px",left:n.left+"px",top:"0px"});let o=0;e.querySelectorAll(".abbc3_buttons_row").forEach((e=>{Object.assign(e.style,{width:t.offsetWidth+"px",position:"fixed",top:o+"px"}),e.classList.add("fixed"),o+=e.offsetHeight}))}else if(e.classList.contains("fixed")){e.classList.remove("fixed"),e.style="";const t=document.getElementById("abbc3_buttons_placeholder");t&&t.remove(),e.querySelectorAll(".abbc3_buttons_row").forEach((e=>{e.style="",e.classList.remove("fixed")}))}},m=()=>{(()=>{const e=new URLSearchParams(window.location.search).get("mode"),t=document.querySelector(".posting-title a");if(t){const n=t.textContent.trim();"reply"===e||"quote"===e?document.title=`RPGHQ - Replying to "${n}"`:"edit"===e&&(document.title=`RPGHQ - Editing post in "${n}"`)}})();const e=document.getElementById("message");if(!e)return setTimeout(m,500);(()=>{const e=document.getElementById("message");e&&($(e).off("focus change keyup"),e.classList.remove("auto-resized"),e.style.height="",e.style.resize="none")})();const f=document.createElement("div");f.className="editor-container";const g=document.createElement("div");g.id="bbcode-highlight",e.parentNode.replaceChild(f,e),f.append(g,e),Object.assign(e.style,{overflow:"hidden",resize:"none",minHeight:"500px",position:"relative",zIndex:"2",background:"transparent",color:"rgb(204, 204, 204)",caretColor:"white",width:"100%",height:"100%",padding:"3px",boxSizing:"border-box",fontFamily:"Verdana, Helvetica, Arial, sans-serif",fontSize:"11px",lineHeight:"15.4px"}),((e,t)=>{l&&l.disconnect(),l=new ResizeObserver((()=>{d(e,t)})),l.observe(e)})(e,g);const h=c((()=>{const c=e.value;if(c===r)return;const l=(e=>{if(e===r&&o.length)return o;const i=[];let a=0;const c=[...e.matchAll(n)];for(const t of c){const[n,o,r,c]=t,l=t.index;l>a&&i.push({type:"text",content:e.substring(a,l)}),i.push({type:o?"tag-close":"tag-open",tagName:r,attributes:c,fullMatch:n,colorIndex:s(r)}),a=l+n.length}a<e.length&&i.push({type:"text",content:e.substring(a)});const l=[];for(const e of i)if("text"===e.type){let n=e.content,o=0;const r=[...n.matchAll(t)];if(0===r.length){l.push(e);continue}for(const e of r){const t=e[0],r=e.index;r>o&&l.push({type:"text",content:n.substring(o,r)}),l.push({type:"url",content:t}),o=r+t.length}o<n.length&&l.push({type:"text",content:n.substring(o)})}else l.push(e);return o=l,r=e,l})(c);g.innerHTML=(e=>e.map((e=>{switch(e.type){case"text":return i(e.content);case"url":return`<span class="bbcode-link">${i(e.content)}</span>`;case"tag-open":case"tag-close":{const{tagName:t,attributes:n,colorIndex:o}=e;if("*"===t)return'<span class="bbcode-bracket" style="color:#A0A0A0;">[</span><span class="bbcode-list-item">*</span><span class="bbcode-bracket" style="color:#A0A0A0;">]</span>';let r='<span class="bbcode-bracket" style="color:#A0A0A0;">[</span>';if("tag-close"===e.type?r+=`<span class="bbcode-tag-${o}">/`:r+=`<span class="bbcode-tag-${o}">`,r+=`${i(t)}</span>`,n){const e=n.match(/^\s*/)[0],o=n.slice(e.length);if(o)if(o.startsWith("=")){const n=o.slice(1).trim();if("color"===t.toLowerCase()){const t=n.match(/^(#[0-9A-Fa-f]{6})/);if(t){const o=t[1];r+=e+'<span class="bbcode-attribute">=</span>'+`<span class="bbcode-color-preview" style="background-color:${o}; color:${a(o)};">${i(o)}</span>`;const s=n.slice(o.length);s&&(r+=`<span class="bbcode-attribute">${i(s)}</span>`)}else r+=e+'<span class="bbcode-attribute">=</span>'+`<span class="bbcode-attribute">${i(n)}</span>`}else r+=e+'<span class="bbcode-attribute">=</span>'+`<span class="bbcode-attribute">${i(n)}</span>`}else r+=e+`<span class="bbcode-attribute">${i(o)}</span>`;else r+=e}return r+='<span class="bbcode-bracket" style="color:#A0A0A0;">]</span>',r}default:return""}})).join(""))(l),g.scrollTop=e.scrollTop}),150);e.addEventListener("input",h),e.addEventListener("scroll",(()=>{g.scrollTop=e.scrollTop}));const b=c((()=>{d(e,g)}),100),y=c((()=>{u(),p()}),100);window.addEventListener("resize",b),window.addEventListener("scroll",y),h(),d(e,g)};window.addEventListener("load",(()=>{(()=>{const e=document.createElement("style");e.textContent="\n        .bbcode-bracket { color: #D4D4D4; }\n        .bbcode-tag-0 { color: #569CD6; }\n        .bbcode-tag-1 { color: #CE9178; }\n        .bbcode-tag-2 { color: #DCDCAA; }\n        .bbcode-tag-3 { color: #C586C0; }\n        .bbcode-tag-4 { color: #4EC9B0; }\n        .bbcode-attribute { color: #9CDCFE; }\n        .bbcode-list-item { color: #FFD700; }\n        .bbcode-link { color: #5D8FBD; }\n\n        #bbcode-highlight {\n            white-space: pre-wrap;\n            word-wrap: break-word;\n            position: absolute;\n            top: 0; left: 0;\n            z-index: 3;\n            width: 100%; height: 100%;\n            overflow: hidden;\n            pointer-events: none;\n            box-sizing: border-box;\n            padding: 3px;\n            font-family: Verdana, Helvetica, Arial, sans-serif;\n            font-size: 11px;\n            line-height: 15.4px;\n            background-color: transparent;\n            color: transparent;\n        }\n\n        #message {\n            position: relative;\n            z-index: 2;\n            background: transparent;\n            color: rgb(204, 204, 204);\n            caret-color: white;\n            width: 100%;\n            height: 100%;\n            padding: 3px;\n            box-sizing: border-box;\n            resize: none;\n            overflow: auto;\n            font-family: Verdana, Helvetica, Arial, sans-serif;\n            font-size: 11px;\n            line-height: 15.4px;\n        }\n\n        .editor-container {\n            position: relative;\n            width: 100%;\n            height: auto;\n        }\n\n        #abbc3_buttons.fixed {\n            position: fixed;\n            top: 0;\n            z-index: 1000;\n            background-color: #3A404A !important;\n        }\n\n        .abbc3_buttons_row.fixed {\n            background-color: #3A404A !important;\n            position: fixed;\n            top: 0;\n            z-index: 1000;\n        }\n      ",document.head.appendChild(e)})(),m()}))}});var se=Object.freeze({__proto__:null,init:function(){const e=GM_getValue("formatFourDigits",!1)?/\b\d{4,}\b/g:/\b\d{5,}\b/g;function t(e){return e.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")}document.querySelectorAll("dd.posts, dd.profile-posts, dd.views, span.responsive-show.left-box, .column2 .details dd").forEach((n=>{if(n.classList.contains("posts")||n.classList.contains("views")||n.parentElement&&n.parentElement.classList.contains("details")){if(n.previousElementSibling&&"Joined:"===n.previousElementSibling.textContent.trim())return;n.childNodes.forEach((n=>{n.nodeType===Node.TEXT_NODE&&e.test(n.nodeValue)&&(n.nodeValue=n.nodeValue.replace(e,(e=>t(e))))}))}else if(n.classList.contains("profile-posts")){const o=n.querySelector("a");o&&e.test(o.textContent)&&(o.textContent=o.textContent.replace(e,(e=>t(e))))}else if(n.classList.contains("responsive-show")){const o=n.querySelector("strong");o&&e.test(o.textContent)&&(o.textContent=o.textContent.replace(e,(e=>t(e))))}n.querySelectorAll("strong").forEach((n=>{e.test(n.textContent)&&(n.textContent=n.textContent.replace(e,(e=>t(e))))}))})),function(){if(!window.location.pathname.endsWith("index.php"))return;let e=0,t=0;const n=document.querySelectorAll("dd.posts"),o=document.querySelectorAll("dd.topics");function r(e){return e.toString().length>=5?e.toString().replace(/\B(?=(\d{3})+(?!\d))/g,","):e.toString()}n.forEach(((e,n)=>{const o=e.childNodes[0].textContent.trim().replace(/,/g,""),r=parseInt(o);isNaN(r)||(t+=r)})),o.forEach(((t,n)=>{const o=t.childNodes[0].textContent.trim().replace(/,/g,""),r=parseInt(o);isNaN(r)||(e+=r)}));const s=document.querySelector(".stat-block.statistics");if(s){const n=s.querySelector("p");if(n){const o=n.innerHTML,s=o.match(/Total members <strong>(\d+)<\/strong>/),i=o.match(/(Our newest member <strong>.*?<\/strong>)/);s&&i&&(n.innerHTML=`Total posts <strong>${r(t)}</strong> • Total topics <strong>${r(e)}</strong> • Total members <strong>${s[1]}</strong> • ${i[1]}`)}}}()}});var ie=Object.freeze({__proto__:null,init:function(){const e=document.createElement("style");function t(e,t){const n=`userColor_${e.toLowerCase()}`,o=JSON.stringify({color:t,timestamp:Date.now()});localStorage.setItem(n,o)}function n(e,t){const n=`userAvatar_${e.toLowerCase()}`,o=JSON.stringify({avatar:t,timestamp:Date.now()});localStorage.setItem(n,o)}function o(e){null!==e.closest("blockquote blockquote")?function(e){const t=e.querySelector("cite"),n=document.createElement("div");n.className="nested-quote-content";for(;e.firstChild;)e.firstChild!==t?n.appendChild(e.firstChild):e.removeChild(e.firstChild);t&&e.appendChild(t);e.appendChild(n),function(e,t){const n=document.createElement("span");n.className="quote-toggle",n.textContent="Expand Quote",t.style.display="none",n.onclick=function(){if("none"===t.style.display){t.style.display="block",this.textContent="Collapse Quote";let n=e.closest(".quote-content");for(;n;){if(n.classList.contains("collapsed")){const e=n.nextElementSibling;e&&e.classList.contains("quote-read-more")?e.click():r(n.closest("blockquote"),n)}n=n.closest("blockquote")?.closest(".quote-content")}setTimeout((()=>{let t=e.closest(".quote-content");for(;t;){if(t.classList.contains("collapsed")){const e=t.nextElementSibling;e&&e.classList.contains("quote-read-more")&&e.click()}t=t.closest("blockquote")?.closest(".quote-content")}}),0)}else t.style.display="none",this.textContent="Expand Quote";setTimeout((()=>{e.scrollIntoView({behavior:"smooth",block:"nearest"})}),0)},e.appendChild(n)}(e,n)}(e):function(e){const t=document.createElement("div");t.className="quote-content";for(;e.firstChild;)t.appendChild(e.firstChild);e.appendChild(t),r(e,t);const n=new MutationObserver((()=>{r(e,t)}));n.observe(t,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["style"]})}(e)}function r(e,t){let n=e.querySelector(".quote-read-more");const o=t.querySelectorAll("img").length>0?350:400;t.scrollHeight>o?(n||(n=function(e){const t=document.createElement("div");return t.className="quote-read-more",t.textContent="Read more...",t.addEventListener("click",(()=>{const n=e.closest("blockquote");if(e.classList.contains("expanded")){e.classList.remove("expanded"),e.classList.add("collapsed"),t.textContent="Read more...";if(e.querySelectorAll("blockquote").forEach((e=>{const t=e.querySelector(".nested-quote-content");if(t){t.style.display="none";const n=e.querySelector(".quote-toggle");n&&(n.textContent="Expand Quote")}})),n){n.getBoundingClientRect().top<0&&n.scrollIntoView({behavior:"smooth",block:"start"})}}else e.classList.remove("collapsed"),e.classList.add("expanded"),t.textContent="Show less..."})),t}(t),e.appendChild(n)),t.classList.contains("expanded")||t.classList.add("collapsed")):(n&&n.remove(),t.classList.remove("collapsed","expanded"))}e.textContent="\n    blockquote {\n      background-color: #2a2e36;\n      border-left: 3px solid #4a90e2;\n      padding: 10px;\n      margin: 10px 0;\n      font-size: 0.9em;\n      line-height: 1.4;\n    }\n    blockquote cite {\n      display: flex;\n      align-items: center;\n    }\n    .quote-divider {\n      border: none;\n      border-top: 1px solid #3a3f4c;\n      margin: 10px 0;\n    }\n    .quote-toggle {\n      cursor: pointer;\n      color: #4a90e2;\n      font-size: 0.8em;\n      margin-top: 5px;\n      display: block;\n    }\n\n    .quote-read-more {\n      cursor: pointer;\n      color: #4a90e2;\n      font-size: 0.9em;\n      text-align: center;\n      padding: 5px;\n      background-color: rgba(74, 144, 226, 0.1);\n      border-top: 1px solid rgba(74, 144, 226, 0.3);\n      margin-top: 10px;\n    }\n\n    .quote-read-more:hover {\n      background-color: rgba(74, 144, 226, 0.2);\n    }\n\n    .quote-content {\n      transition: max-height 0.3s ease-out;\n    }\n\n    .quote-content.collapsed {\n      max-height: 300px;\n      overflow: hidden;\n    }\n\n    .quote-content.expanded {\n      max-height: none;\n    }\n\n    /* Limit image height in collapsed quotes */\n    .quote-content.collapsed img {\n      max-height: 200px;\n      width: auto;\n      object-fit: contain;\n    }\n\n    /* Allow full image size in expanded quotes */\n    .quote-content.expanded img {\n      max-height: none;\n    }\n\n    blockquote cite a {\n      display: inline-flex;\n      align-items: center;\n      font-weight: bold;\n    }\n    .quote-avatar {\n      width: 16px;\n      height: 16px;\n      margin-left: 4px;\n      margin-right: 3px;\n      border-radius: 50%;\n      object-fit: cover;\n    }\n    blockquote cite {\n      display: flex;\n      align-items: center;\n      margin-bottom: 8px; // Add some space below the citation\n    }\n  ",document.head.appendChild(e),document.querySelectorAll("blockquote").forEach(o),function(){const e=document.querySelectorAll("blockquote cite a"),t=window.matchMedia("(max-width: 700px)").matches;e.forEach((e=>{const n=e.textContent.trim();n.startsWith("↑")&&!n.startsWith("↑ ")&&(e.textContent=t?" ↑ ":"↑  "+n.slice(1))}))}(),document.querySelectorAll(".imcger-quote-button").forEach((e=>e.remove())),document.querySelectorAll(".imcger-quote-shadow").forEach((e=>e.remove())),document.querySelectorAll(".imcger-quote-text").forEach((e=>{e.style.maxHeight="none",e.style.overflow="visible"})),async function(){const e=new Map;document.querySelectorAll("a.username-coloured").forEach((n=>{const o=n.textContent.trim(),r=n.style.color;r&&(e.set(o.toLowerCase(),r),t(o,r))})),document.querySelectorAll("blockquote cite a").forEach((async n=>{const o=n.textContent.trim();let r=e.get(o.toLowerCase())||function(e){const t=`userColor_${e.toLowerCase()}`,n=localStorage.getItem(t);if(n){const{color:e,timestamp:t}=JSON.parse(n);if(Date.now()-t<6048e5)return e}return null}(o);r||(r=await async function(e){try{const t=await fetch(e),n=await t.text(),o=new DOMParser,r=o.parseFromString(n,"text/html").querySelector('.left-box.details.profile-details dd span[style^="color:"]');if(r)return r.style.color}catch(e){console.error("Error fetching user color:",e)}return null}(n.href),r&&t(o,r)),r&&(n.style.color=r,n.classList.add("username-coloured"))}))}(),async function(){const e=new Map;document.querySelectorAll(".avatar-container img.avatar").forEach((t=>{const o=t.closest(".postprofile");if(o){const r=o.querySelector("a.username-coloured, a.username");if(r){const o=r.textContent.trim();e.set(o.toLowerCase(),t.src),n(o,t.src)}}})),document.querySelectorAll("blockquote cite").forEach((async t=>{!function(e){const t=document.createElement("div");t.className="quote-citation-container";for(;e.firstChild;)t.appendChild(e.firstChild);e.appendChild(t)}(t);const o=t.querySelector("a");if(o){const r=o.textContent.trim();let s=e.get(r.toLowerCase())||function(e){const t=`userAvatar_${e.toLowerCase()}`,n=localStorage.getItem(t);if(n){const{avatar:e,timestamp:t}=JSON.parse(n);if(Date.now()-t<6048e5)return e}return null}(r);if(s||(s=await async function(e){try{const t=await fetch(e),n=await t.text(),o=new DOMParser,r=o.parseFromString(n,"text/html").querySelector(".profile-avatar img.avatar");if(r)return r.src}catch(e){console.error("Error fetching user avatar:",e)}return null}(o.href),s&&n(r,s)),s){const e=document.createElement("img");e.src=s,e.className="quote-avatar",e.alt=`${r}'s avatar`,t.querySelector(".quote-citation-container").insertBefore(e,t.querySelector(".quote-citation-container").firstChild)}}}))}(),function(){const e=new URLSearchParams(window.location.search).get("p")||window.location.hash.slice(1);if(e){const t=document.getElementById(e);t&&setTimeout((()=>{t.scrollIntoView({behavior:"smooth",block:"center"})}),100)}}()}});const ae="RPGHQ_Manager_",ce="theme_linkColor",le="theme_hoverColor",de="theme_backgroundImageUrl",ue="theme_unreadColor",pe="theme_subtleTextColor",me="theme_lightBgColor",fe="theme_darkBgColor";function ge(e,t){return GM_getValue(ae+e,t)}function he(e,t){GM_setValue(ae+e,t)}function be(){const e=ge(ce,""),t=ge(le,""),n=ge(de,""),r=ge(ue,""),s=ge(pe,""),i=ge(me,""),a=ge(fe,"");let c="";if(n){c+=`\n      html, body {\n        ${`background: #171b24 url("${n}") repeat center center; background-attachment: fixed; color-scheme: dark;`}\n      }\n    `}else a&&(c+=`\n      html, body {\n        background-color: ${a};\n        color-scheme: dark; /* Assume dark scheme with custom bg */\n      }\n    `);e&&(c+=`\n      a:link,\n      a:active,\n      a:visited {\n        color: ${e};\n      }\n    `),t&&(c+=`\n      a:hover,\n      a:focus,\n      a:active {\n        color: ${t};\n        text-decoration: underline;\n      }\n    `),r&&(c+=`\n      .icon.icon-red,\n      a:hover .icon.icon-red {\n        color: ${r};\n      }\n    `),s&&(c+=`\n      html, body, .headerbar p, .copyright, ul.topiclist li, .panel, label, dd label, .signature, .postprofile, .postprofile strong, dl.details dd, dl.details dt, .content, .postbody, fieldset.polls dl, dl.file dd, table.table1 td, .dropdown-extended ul li:hover, .button {\n        color: ${s};\n      }\n    `),i&&(c+=`\n      .headerbar, .navbar, .forabg, .forumbg, li.row, .bg1, .bg2, .bg3, .tabs .activetab > a, .tabs a:hover, ul.cplist, .panel, blockquote blockquote, .panel blockquote, .panel blockquote blockquote blockquote, .panel .codebox, .dropdown .dropdown-contents, .jumpbox-cat-link, .jumpbox-sub-link, .jumpbox-forum-link, .cp-main .message-box textarea, fieldset.quick-login input.inputbox {\n        background: ${i} !important;\n      }\n    `),a&&(c+=`\n      html, body, .wrap, .panel-container .panel, .navigation .active-subsection a, .navigation a:hover, .cp-mini, .codebox, blockquote, blockquote blockquote blockquote, .panel blockquote blockquote, .attachbox, .message-box textarea, .phpbb_alert, select, .minitabs a:hover, .minitabs .activetab > a, .minitabs .activetab > a:hover, .cp-main .pm, .bg3 .topicreview .bg2, .bg3 .topicreview .bg1 {\n        background-color: ${a} !important;\n      }\n    `),e||t||n||r||s||i||a?(o("Applying custom theme styles:",c),GM_addStyle(c.trim())):o("No custom theme styles defined.")}const ye={},ve={};function xe(e){o(`Executing load order for phase: ${e}`);const n=l[e]||[];0!==n.length?(n.forEach((n=>{if("function"==typeof i[n]){o(`-> Executing shared function: ${n}`);try{i[n]()}catch(e){s(`Error executing shared function ${n}:`,e)}}else{const s=(a=n,t.find((e=>e.id===a)));s?ye[s.id]?(o(`-> Loading script from load order: ${s.name} (${s.id}) for phase: ${e}`),$e(s)):o(`-> Script ${n} skipped (disabled).`):r(`-> Item "${n}" in load_order.json is not a known shared function or script ID.`)}var a})),o(`Finished executing load order for phase: ${e}`)):o(`No items defined in load order for phase: ${e}`)}const we={commaFormatter:se,bbcode:re,quotes:ie,kalareact:oe,notifications:ne,pinThreads:ee,separateReactions:K,memberSearch:Z,randomTopic:Y,recentTopicsFormat:X};function $e(e){if(ve[e.id])o(`Script ${e.name} already loaded, skipping.`);else if(n(e)){o(`Loading script: ${e.name} (${e.id})`);try{const t=we[e.id];if(!t)return void s(`Script module ${e.id} not found`);if("function"==typeof t.init){let n;n="recentTopicsFormat"===e.id||"notifications"===e.id?t.init({getScriptSetting:Le}):t.init(),ve[e.id]={module:t,cleanup:n&&"function"==typeof n.cleanup?n.cleanup:null},o(`Successfully loaded script: ${e.name}`)}else r(`Script ${e.name} has no init function, skipping.`)}catch(t){s(`Failed to load script ${e.name}:`,t)}}else o(`Script ${e.name} not loaded: URL pattern did not match.`)}function Se(e){const t=ve[e];if(t){if(o(`Unloading script: ${e}`),t.cleanup&&"function"==typeof t.cleanup)try{t.cleanup(),o(`Cleanup completed for script: ${e}`)}catch(t){s(`Error during cleanup for script ${e}:`,t)}delete ve[e],o(`Script ${e} unloaded.`)}else o(`Script ${e} not loaded, nothing to unload.`)}function qe(e,t,n){!function(e,t,n={},r){if(o("Rendering scripts in Grid View..."),!t||0===t.length)return void W(e,"No scripts found. Try adjusting your filters to see more results.");const s=document.createElement("div");s.className="script-grid",t.forEach((e=>{const t=void 0!==n[e.id]?n[e.id]:e.enabledByDefault,o=e.settings&&e.settings.length>0,r=document.createElement("div");r.className=t?"script-card":"script-card disabled",r.dataset.scriptId=e.id,r.innerHTML=`\n      <div class="script-card-image">\n        <img src="${e.image||"https://via.placeholder.com/240x130?text=No+Image"}" \n             alt="${e.name}" \n             class="script-image-toggle" \n             data-script-id="${e.id}">\n      </div>\n      <div class="script-card-content">\n        <div class="script-card-header">\n          <h3 class="script-card-title">${e.name}</h3>\n          <div class="script-card-actions-top">\n            ${o?`\n            <button \n              class="btn btn-icon view-settings" \n              title="Settings" \n              data-script-id="${e.id}"\n            >\n              <i class="fa fa-cog"></i>\n            </button>\n            `:""}\n          </div>\n        </div>\n        <p class="script-card-description">${e.description||"No description available."}</p>\n        <div class="script-card-footer">\n          <span class="script-card-version">v${e.version}</span>\n        </div>\n      </div>\n    `,s.appendChild(r)})),e.innerHTML="",e.appendChild(s),document.querySelectorAll(".view-settings:not([disabled])").forEach((e=>{e.addEventListener("click",(()=>{const n=e.dataset.scriptId,o=t.find((e=>e.id===n));o&&r&&r(o)}))})),document.querySelectorAll(".script-image-toggle").forEach((e=>{e.addEventListener("click",(t=>{const n=e.dataset.scriptId,o=e.closest(".script-card");if(o){const e=!!o.classList.contains("disabled");e?o.classList.remove("disabled"):o.classList.add("disabled");const t=new CustomEvent("script-toggle",{detail:{scriptId:n,enabled:e}});document.dispatchEvent(t)}}))}))}(e,t,n,Ce)}function Ce(e){Q(e,J,Le,Ee)}function Ee(e,t,n){he(`script_setting_${e}_${t}`,n),o(`Saved setting: ${e}.${t} = ${n}`)}function Le(e,t,n){const r=`script_setting_${e}_${t}`;let s=ge(r,n);return void 0===ge(r)&&(he(r,n),o(`Setting default value for ${e}.${t}: ${n}`),s=n),s}function ke(e){const n=document.getElementById("mod-manager-content");n&&(F(e,{container:n,scripts:t,scriptStates:ye,renderScriptsGridView:qe}),he("last_selected_tab",e))}function Te(){const e=document.getElementById("mod-manager-modal"),t=e&&"block"===e.style.display;if(o(`Toggling modal visibility. Currently ${t?"visible":"hidden"}.`),t)I();else{const e=ge("last_selected_tab","installed");o(`Retrieved last selected tab: ${e}`),function({loadTabContent:e,hideModal:t,initialTabName:n="installed"}){o("Showing userscript manager modal...");let r=document.getElementById("mod-manager-modal");r||(r=document.createElement("div"),r.id="mod-manager-modal",r.className="mod-manager-modal",r.innerHTML=`\n      <div class="mod-manager-modal-content">\n        <div class="mod-manager-header">\n          <h2 class="mod-manager-title">RPGHQ Userscript Manager <span style="font-size: x-small;">v${GM_info.script.version}</span></h2>\n          <span class="mod-manager-close">&times;</span>\n        </div>\n        <div class="mod-manager-tabs">\n          <div class="mod-manager-tab active" data-tab="installed">\n            <i class="fa fa-puzzle-piece"></i> Installed Scripts\n          </div>\n          <div class="mod-manager-tab" data-tab="forum">\n            <i class="fa fa-sliders"></i> Forum Preferences\n          </div>\n          \x3c!-- Settings tab completely hidden --\x3e\n        </div>\n        <div class="mod-manager-content" id="mod-manager-content">\n          \x3c!-- Content loaded dynamically --\x3e\n        </div>\n      </div>\n    `,document.body.appendChild(r),r.querySelector(".mod-manager-close").addEventListener("click",(()=>{t()})),r.addEventListener("click",(e=>{e.target===r&&t()})),r.querySelectorAll(".mod-manager-tab").forEach((t=>{t.addEventListener("click",(()=>{document.querySelectorAll(".mod-manager-tab").forEach((e=>{e.classList.remove("active")})),t.classList.add("active"),e(t.dataset.tab)}))}))),r.querySelectorAll(".mod-manager-tab").forEach((e=>{e.dataset.tab===n?e.classList.add("active"):e.classList.remove("active")})),r.style.display="block",document.body.style.overflow="hidden",e(n)}({loadTabContent:ke,hideModal:I,initialTabName:e})}}function Me(e){!function(){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css",document.head.appendChild(e),o("RPGHQ Manager: Added Font Awesome CSS link.")}}();const t=document.querySelector('.header-profile.dropdown-container .dropdown-contents[role="menu"]');if(!t)return void r("RPGHQ Manager: Could not find profile dropdown menu.");const n=Array.from(t.querySelectorAll("li")).find((e=>{const t=e.querySelector("a");return t&&(t.textContent.trim().includes("Logout")||"Logout"===t.getAttribute("title"))}));if(!n)return void r("RPGHQ Manager: Could not find logout button for reference.");const s=t.querySelector('a[title="RPGHQ Userscript Manager"]');if(s)return o("RPGHQ Manager: Button already exists, updating listener."),void(s.onclick=function(t){t.preventDefault(),e()});const i=document.createElement("li");i.innerHTML='\n    <a href="#" title="RPGHQ Userscript Manager" role="menuitem">\n      <i class="icon fa-puzzle-piece fa-fw" aria-hidden="true"></i><span>Userscripts</span>\n    </a>\n  ',i.querySelector("a").onclick=function(t){t.preventDefault(),e()},t.insertBefore(i,n),o("RPGHQ Manager: 'View Userscripts' button added to profile menu.")}document.addEventListener("script-toggle",(e=>{const{scriptId:n,enabled:r}=e.detail;!function(e,t,n,r,i,a,c){const l=`script_enabled_${e}`;o(`Toggling script '${e}' to ${t?"Enabled":"Disabled"}`),n[e]=t,r(l,t),o(`State for ${e} saved as ${t}. Triggering script ${t?"loading":"unloading"}...`);const d=i.find((t=>t.id===e));d?t?a(d):c(e):s(`Could not find script with ID ${e} in manifest.`)}(n,r,ye,he,t,$e,Se)})),o("Initializing RPGHQ Userscript Manager..."),be(),o("Initializing script states..."),t.forEach((e=>{const t=`script_enabled_${e.id}`;ye[e.id]=ge(t,e.enabledByDefault),o(`Script '${e.name}' (${e.id}): ${ye[e.id]?"Enabled":"Disabled"} (Default: ${e.enabledByDefault})`)})),o("Script states initialized:",ye),be(),xe("document-start"),be(),document.addEventListener("DOMContentLoaded",(()=>{be(),xe("document-end"),be(),Me(Te),async function(){try{o("Initial user rules application complete:",await H());const e=new MutationObserver((e=>{e.forEach((async e=>{if("childList"===e.type&&e.addedNodes.length>0)for(const t of e.addedNodes)t.nodeType===Node.ELEMENT_NODE&&(t.classList.contains("message")||t.classList.contains("structItem")||t.classList.contains("memberCard")||t.querySelector(".message")||t.querySelector(".structItem")||t.querySelector(".memberCard"))&&await R(t)}))}));return e.observe(document.body,{childList:!0,subtree:!0}),{success:!0,observer:e}}catch(e){return s("Error initializing rule application:",e),{success:!1,error:e.message}}}().then((e=>{e.success?o("User rules system initialized successfully"):r("Failed to initialize user rules system:",e.error)}))})),window.addEventListener("load",(()=>{be(),xe("document-idle")})),setTimeout((()=>{xe("after_dom"),c()}),500),document.addEventListener("keydown",(e=>{if(45===e.keyCode){if("INPUT"===document.activeElement.tagName||"TEXTAREA"===document.activeElement.tagName||document.activeElement.isContentEditable)return void o("Insert key pressed in input field, ignoring modal toggle.");e.preventDefault(),Te()}})),be(),e.applyCustomThemeStyles=be,e.gmGetValue=ge,e.gmSetValue=he}({});
