/**
 * Format reactions as HTML
 * @param {Array} reactions - Array of reaction objects
 * @returns {string} HTML string of formatted reactions
 */
export function formatReactions(reactions) {
  return `<span style="display: inline-flex; margin-left: 2px; vertical-align: middle;">
    ${reactions
      .map(
        (reaction) => `
      <img src="${reaction.image}" alt="${reaction.name}" title="${reaction.username}: ${reaction.name}" 
           reaction-username="${reaction.username}"
           style="height: 1em !important; width: auto !important; vertical-align: middle !important; margin-right: 2px !important;">
    `
      )
      .join("")}
  </span>`;
}