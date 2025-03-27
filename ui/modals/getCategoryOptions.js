/**
 * Get unique categories for the filter dropdown
 * @returns {string} - HTML options for categories
 */
function getCategoryOptions() {
  const categories = new Set();
  MANIFEST.scripts.forEach(script => {
    if (script.category) {
      categories.add(script.category);
    }
  });
  
  return Array.from(categories).sort().map(category => 
    `<option value="${category}">${category}</option>`
  ).join('');
}

// Export the function
if (typeof module !== 'undefined') {
  module.exports = getCategoryOptions;
}
