/**
 * Add menu button to the page
 */
function addMenuButton() {
  const profileDropdown = document.querySelector('.header-profile.dropdown-container .dropdown-contents[role="menu"]');
  if (!profileDropdown) return;
  
  const logoutButton = Array.from(profileDropdown.querySelectorAll("li")).find(li => {
    return li.textContent.trim().includes("Logout") || li.querySelector('a[title="Logout"]');
  });
  
  if (!logoutButton) return;
  
  const userscriptsButton = document.createElement("li");
  userscriptsButton.innerHTML = `
    <a href="#" title="View Userscripts" role="menuitem" style="font-size:0.9em;">
      <i class="fa fa-puzzle-piece fa-fw"></i><span> View Userscripts</span>
    </a>
  `;
  
  logoutButton.parentNode.insertBefore(userscriptsButton, logoutButton);
  userscriptsButton.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    showModal();
  });
}

// Export the function if in Node.js environment
if (typeof module !== 'undefined') {
  module.exports = addMenuButton;
}
