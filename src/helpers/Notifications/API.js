/**
 * @module helpers/Notifications/API
 * @description Handles API interactions for the Notifications feature, such as fetching reactions and post content.
 */

import {
  getStoredReactions,
  storeReactions,
  getStoredPostContent,
  storePostContent,
} from "./Storage.js";
import { cleanupPostContent } from "./ContentParsing.js"; // Assuming cleanup logic is moved here
import { Logger } from "../Core/Logger.js";
import { sleep } from "../Core/Utils.js";
import { FETCH_DELAY } from "./Constants.js";

const log = new Logger("Notifications API");

/**
 * Fetches reactions for a given post ID.
 * Uses cache first, then fetches from the server.
 * @param {string} postId - The ID of the post.
 * @param {boolean} forceFetch - Whether to bypass the cache and force a fetch.
 * @returns {Promise<Array>} A promise resolving to an array of reaction objects.
 */
export async function fetchReactions(postId, forceFetch = false) {
  log.debug(`Fetching reactions for post ${postId}, forceFetch: ${forceFetch}`);
  if (!forceFetch) {
    const storedReactions = getStoredReactions(postId);
    if (storedReactions) {
      return storedReactions;
    }
  }

  // Add a small delay to avoid rate-limiting issues
  await sleep(FETCH_DELAY);

  try {
    const response = await fetch(
      `https://rpghq.org/forums/reactions?mode=view&post=${postId}`,
      {
        method: "POST", // Original used POST
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "x-requested-with": "XMLHttpRequest",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.htmlContent) {
      throw new Error("Invalid response format for reactions");
    }

    // Parse the HTML to extract reaction details
    const doc = new DOMParser().parseFromString(data.htmlContent, "text/html");
    const reactions = Array.from(
      // Assuming the original selector is correct for the response structure
      doc.querySelectorAll('.tab-content[data-id="0"] li')
    ).map((li) => {
      const userLink = li.querySelector(".cbb-helper-text a");
      const reactionImage = li.querySelector(".reaction-image");
      return {
        username: userLink ? userLink.textContent.trim() : "Unknown User",
        image: reactionImage ? reactionImage.src : "",
        name: reactionImage ? reactionImage.alt : "Unknown Reaction",
      };
    });

    log.debug(
      `Successfully fetched ${reactions.length} reactions for post ${postId}`
    );
    storeReactions(postId, reactions);
    return reactions;
  } catch (error) {
    log.error(`Error fetching reactions for post ${postId}:`, error);
    return []; // Return empty array on error
  }
}

/**
 * Fetches the raw BBCode content of a post.
 * Uses cache first, then fetches from the quote URL.
 * @param {string} postId - The ID of the post.
 * @returns {Promise<string|null>} A promise resolving to the post content string or null on error.
 */
export async function fetchPostContent(postId) {
  log.debug(`Fetching content for post ${postId}`);
  const cachedContent = getStoredPostContent(postId);
  if (cachedContent) {
    return cachedContent;
  }

  // Add a small delay
  await sleep(FETCH_DELAY);

  try {
    const response = await fetch(
      `https://rpghq.org/forums/posting.php?mode=quote&p=${postId}`,
      {
        headers: { "X-Requested-With": "XMLHttpRequest" }, // Important for getting the raw content
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();

    // Parse the response HTML to find the message textarea
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    const messageArea = tempDiv.querySelector("#message");

    if (!messageArea) {
      // Maybe the post is inaccessible (deleted, permissions?)
      log.warn(
        `Could not find message content textarea for post ${postId}. Storing null.`
      );
      storePostContent(postId, null); // Store null to prevent refetching immediately
      return null;
    }

    // Clean up the raw content from the textarea
    const content = cleanupPostContent(messageArea.value);
    log.debug(`Successfully fetched and cleaned content for post ${postId}`);
    storePostContent(postId, content);
    return content;
  } catch (error) {
    log.error(`Error fetching post content for ${postId}:`, error);
    // Store null on error to avoid constant refetch attempts for problematic posts
    storePostContent(postId, null);
    return null;
  }
}
