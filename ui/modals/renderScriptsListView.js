/**
 * Render the scripts in a list view
 * @param {HTMLElement} container - The container to render into
 * @param {Array} scripts - The scripts to render
 */
function renderScriptsListView(container, scripts) {
  if (scripts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="fa fa-search"></i>
        </div>
        <h3 class="empty-state-message">No scripts found</h3>
        <p>Try adjusting your filters to see more results.</p>
      </div>
    `;
    return;
  }
  
  const table = document.createElement("table");
  table.className = "data-table";
  
  table.innerHTML = `
    <thead>
      <tr>
        <th>Status</th>
        <th>Name</th>
        <th>Version</th>
        <th>Category</th>
        <th>Description</th>
        <th>Execution Phase</th>
        <th>Settings</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${scripts.map(script => `
        <tr>
          <td>
            <button class="btn btn-icon toggle-script" data-script-id="${script.id}" title="${isScriptEnabled(script.id) ? 'Enabled (click to disable)' : 'Disabled (click to enable)'}">
              <i class="fa ${isScriptEnabled(script.id) ? 'fa-toggle-on text-success' : 'fa-toggle-off text-muted'}" style="font-size: 1.5em;"></i>
            </button>
          </td>
          <td><strong>${script.name}</strong></td>
          <td>v${script.version}</td>
          <td>${script.category || "Uncategorized"}</td>
          <td>${script.description || "No description available."}</td>
          <td>${getPhaseDisplayName(script.executionPhase)}</td>
          <td>${script.settings && script.settings.length > 0 ? `<span class="badge badge-primary">${script.settings.length}</span>` : "-"}</td>
          <td>
            <button class="btn btn-primary btn-small view-settings" data-script-id="${script.id}">
              <i class="fa fa-cog"></i> Settings
            </button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  container.innerHTML = "";
  container.appendChild(table);
  
  // Add event listeners for settings buttons
  document.querySelectorAll(".view-settings").forEach(btn => {
    btn.addEventListener("click", () => {
      const scriptId = btn.dataset.scriptId;
      const script = scripts.find(s => s.id === scriptId);
      if (script) {
        showScriptSettings(script);
      }
    });
  });
  
  // Add event listeners for toggle script buttons
  document.querySelectorAll(".toggle-script").forEach(btn => {
    btn.addEventListener("click", () => {
      const scriptId = btn.dataset.scriptId;
      const newState = toggleScriptEnabled(scriptId);
      
      // Update icon state
      const icon = btn.querySelector("i");
      if (newState) {
        // Script is now enabled
        icon.classList.remove("fa-toggle-off");
        icon.classList.remove("text-muted");
        icon.classList.add("fa-toggle-on");
        icon.classList.add("text-success");
        btn.setAttribute("title", "Enabled (click to disable)");
      } else {
        // Script is now disabled
        icon.classList.remove("fa-toggle-on");
        icon.classList.remove("text-success");
        icon.classList.add("fa-toggle-off");
        icon.classList.add("text-muted");
        btn.setAttribute("title", "Disabled (click to enable)");
      }
    });
  });
}