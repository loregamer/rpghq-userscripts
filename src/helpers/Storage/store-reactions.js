const storeReactions = (postId, reactions) => {
  GM_setValue(
    `reactions_${postId}`,
    JSON.stringify({ reactions, timestamp: Date.now() })
  );
};
