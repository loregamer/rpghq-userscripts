/**
 * Calculate and update forum statistics
 */
export function calculateForumStatistics() {
  // Only run on index.php
  if (!window.location.pathname.endsWith("index.php")) {
    return;
  }

  let totalTopics = 0;
  let totalPosts = 0;

  // Get all posts and topics elements
  const postsElements = document.querySelectorAll("dd.posts");
  const topicsElements = document.querySelectorAll("dd.topics");

  // Sum up posts
  postsElements.forEach((element) => {
    const postsText = element.childNodes[0].textContent
      .trim()
      .replace(/,/g, "");
    const posts = parseInt(postsText);
    if (!isNaN(posts)) {
      totalPosts += posts;
    }
  });

  // Sum up topics
  topicsElements.forEach((element) => {
    const topicsText = element.childNodes[0].textContent
      .trim()
      .replace(/,/g, "");
    const topics = parseInt(topicsText);
    if (!isNaN(topics)) {
      totalTopics += topics;
    }
  });

  // Function to format numbers, only adding commas for 5+ digits
  function formatStatNumber(num) {
    return num.toString().length >= 5
      ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : num.toString();
  }

  // Find and update the statistics block
  const statsBlock = document.querySelector(".stat-block.statistics");
  if (statsBlock) {
    const statsText = statsBlock.querySelector("p");
    if (statsText) {
      const existingText = statsText.innerHTML;
      // Keep the members count and newest member info, but update topics and posts
      const membersMatch = existingText.match(
        /Total members <strong>(\d+)<\/strong>/
      );
      const newestMemberMatch = existingText.match(
        /(Our newest member <strong>.*?<\/strong>)/
      );

      if (membersMatch && newestMemberMatch) {
        statsText.innerHTML = `Total posts <strong>${formatStatNumber(
          totalPosts
        )}</strong> • Total topics <strong>${formatStatNumber(
          totalTopics
        )}</strong> • Total members <strong>${membersMatch[1]}</strong> • ${
          newestMemberMatch[1]
        }`;
      }
    }
  }
}
