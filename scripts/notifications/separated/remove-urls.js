const removeURLs = (text) => {
  // Remove URLs with various protocols (http, https, ftp)
  return (
    text
      .replace(/(?:https?|ftp):\/\/[\n\S]+/gi, "")
      // Remove www. URLs
      .replace(/www\.[^\s]+/gi, "")
      // Clean up any double spaces created by URL removal
      .replace(/\s+/g, " ")
      .trim()
  );
};
