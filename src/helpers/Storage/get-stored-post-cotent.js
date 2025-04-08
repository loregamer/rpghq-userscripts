
getStoredPostContent: (postId) => {
    const storedData = GM_getValue(`post_content_${postId}`);
    if (storedData) {
      const { content, timestamp } = JSON.parse(storedData);
      if (Date.now() - timestamp < ONE_DAY) return content;
      GM_deleteValue(`post_content_${postId}`);
    }
    return null;
  },