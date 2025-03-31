const extractPostId = (url) => {
  const match = (url || "").match(/p=(\d+)/);
  return match ? match[1] : null;
};
