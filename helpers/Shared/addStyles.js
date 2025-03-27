/**
 * Add CSS styles for the modal
 */
export function addStyles() {
  GM_addStyle(`
    /* Import Font Awesome */
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

    :root {
        --primary-color: #2196F3;
        --primary-dark: #1976D2;
        --accent-color: #FF9800;
        --success-color: #4CAF50;
        --warning-color: #FFC107;
        --danger-color: #F44336;
        --text-primary: #FFFFFF;
        --text-secondary: #B0BEC5;
        --bg-dark: #1E1E1E;
        --bg-card: #2D2D2D;
        --border-color: #444444;
    }
    
    /* Modal container */
    .mod-manager-modal {
        display: none;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        overflow: hidden;
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
    }
    
    .script-card-image {
        position: relative;
        height: 130px;
        overflow: hidden;
    }
    
    .script-card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .script-card-category {
        position: absolute;
        top: 5px;
        right: 5px;
        background-color: rgba(0, 0, 0, 0.7);
        color: var(--text-primary);
        padding: 3px 8px;
        border-radius: 3px;
        font-size: 0.8em;
    }
    
    .script-card-content {
        padding: 10px;
    }
    
    .script-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
    }
    
    .script-card-title {
        font-size: 1.1em;
        font-weight: bold;
        margin: 0;
    }
    
    .script-card-version {
        background-color: var(--primary-color);
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 0.8em;
    }
    
    .script-card-description {
        margin: 0 0 10px 0;
        color: var(--text-secondary);
        font-size: 0.9em;
        line-height: 1.3;
        height: 3.6em;
        overflow: hidden;
    }
    
    .script-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid var(--border-color);
        padding-top: 8px;
    }
    
    .script-card-phase {
        font-size: 0.85em;
        color: var(--text-secondary);
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
        z-index: 10001;
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
    
    .btn-success {
        background-color: var(--success-color);
        color: white;
    }
    
    .btn-success:hover {
        background-color: #3d8b40;
    }
    
    .btn-danger {
        background-color: var(--danger-color);
        color: white;
    }
    
    .btn-danger:hover {
        background-color: #d32f2f;
    }
    
    .btn-small {
        padding: 3px 8px;
        font-size: 0.8em;
    }
    
    /* Toggle switch */
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 46px;
        height: 22px;
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
        background-color: #444;
        border-radius: 3px;
    }
    
    .toggle-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        border-radius: 2px;
    }
    
    input:checked + .toggle-slider {
        background-color: var(--primary-color);
    }
    
    input:checked + .toggle-slider:before {
        transform: translateX(24px);
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
    
    /* Badges */
    .badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 0.8em;
        font-weight: bold;
    }
    
    .badge-primary {
        background-color: var(--primary-color);
        color: white;
    }
    
    /* Info note */
    .info-note {
        background-color: rgba(33, 150, 243, 0.1);
        border-left: 4px solid var(--primary-color);
        padding: 10px;
        margin-bottom: 15px;
        border-radius: 0 4px 4px 0;
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
    
    /* Styles for toggle buttons */
    .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
        text-align: center;
        transition: all 0.2s ease;
    }
    
    .btn-icon:hover {
        opacity: 0.8;
    }
    
    .btn-icon:focus {
        outline: none;
    }
    
    .text-success {
        color: #28a745;
    }
    
    .text-muted {
        color: #6c757d;
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
    
    /* Hide modal on ESC key */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const modal = document.getElementById('mod-manager-modal');
        if (modal && modal.style.display === 'block') {
          hideModal();
        }
      }
    });
  `);
}
