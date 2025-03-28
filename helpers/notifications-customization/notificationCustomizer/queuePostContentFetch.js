/**
 * Queue post content fetch with throttling
 * @param {string} url - URL to fetch content from
 * @param {Element} placeholder - Placeholder element to update
 */
export async function queuePostContentFetch(url, placeholder) {
  // Track last fetch time with a static variable
  if (typeof queuePostContentFetch.lastFetchTime === 'undefined') {
    queuePostContentFetch.lastFetchTime = 0;
  }
  
  const postId = extractPostId(url);
  if (!postId) {
    placeholder.remove();
    return;
  }

  // Check if we need to wait before next fetch
  if (queuePostContentFetch.lastFetchTime) {
    const timeSinceLastFetch = Date.now() - queuePostContentFetch.lastFetchTime;
    if (timeSinceLastFetch < FETCH_DELAY) {
      await sleep(FETCH_DELAY - timeSinceLastFetch);
    }
  }

  try {
    const postContent = await fetchPostContent(postId);
    if (postContent && placeholder.parentNode) {
      const trimmedContent = postContent.trim();

      // Always create the image/video preview div
      const mediaPreview = createElement("div", {
        className: "notification-image-preview",
      });

      // Check for video content first - only if the entire content is just a video tag
      if (
        (trimmedContent.startsWith("[webm]") &&
          trimmedContent.endsWith("[/webm]")) ||
        (trimmedContent.startsWith("[media]") &&
          trimmedContent.endsWith("[/media]"))
      ) {
        const videoData = extractVideoUrl(trimmedContent);
        if (videoData) {
          // Create video element for preview
          mediaPreview.innerHTML = `<video src="${videoData.url}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" loop muted autoplay></video>`;

          // Remove the placeholder and add the video preview
          placeholder.parentNode.insertBefore(mediaPreview, placeholder);
          placeholder.remove();
        }
      }
      // Only add image if content is just an image tag
      else if (
        (trimmedContent.startsWith("[img]") &&
          trimmedContent.endsWith("[/img]")) ||
        trimmedContent.match(/^\[img\s+[^=\]]+=[^\]]+\].*?\[\/img\]$/i)
      ) {
        let imageUrl;

        if (trimmedContent.startsWith("[img]")) {
          // Standard format
          imageUrl = trimmedContent.slice(5, -6).trim();
        } else {
          // Format with parameters
          const paramMatch = trimmedContent.match(
            /^\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]$/i
          );
          imageUrl = paramMatch[1].trim();
        }

        mediaPreview.innerHTML = `<img src="${imageUrl}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;">`;
        // Remove the placeholder and add the image preview
        placeholder.parentNode.insertBefore(mediaPreview, placeholder);
        placeholder.remove();
      } else {
        // If not an image or video, update the placeholder with the text content
        placeholder.insertAdjacentElement("afterend", mediaPreview);
        placeholder.textContent = removeBBCode(postContent);
        styleReference(placeholder);
      }
    } else {
      placeholder.remove();
    }
  } catch (error) {
    console.error("Error fetching post content:", error);
    placeholder.remove();
  }

  queuePostContentFetch.lastFetchTime = Date.now();
}