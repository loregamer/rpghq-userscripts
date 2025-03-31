const getStoredReactions = (postId) => {
  const storedData = GM_getValue(`reactions_${postId}`);
  if (storedData) {
    const { reactions, timestamp } = JSON.parse(storedData);
    if (Date.now() - timestamp < ONE_DAY) return reactions;
    GM_deleteValue(`reactions_${postId}`);
  }
  return null;
};
