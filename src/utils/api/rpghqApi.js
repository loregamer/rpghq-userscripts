/**
 * Searches for users or groups on RPGHQ forums via the mention system.
 * @param {string} query - The search term.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of user/group objects or rejects on error.
 */
export async function searchUsers(query) {
  return new Promise((resolve, reject) => {
    if (!query || typeof query !== "string") {
      return reject(new Error("Invalid query provided."));
    }

    const url = `https://rpghq.org/forums/mentionloc?q=${encodeURIComponent(query)}`;

    GM_xmlhttpRequest({
      method: "GET",
      url: url,
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        // Referer might be important, adjust if needed based on where this is called
        Referer: "https://rpghq.org/forums/",
      },
      responseType: "json", // Automatically parse JSON response
      onload: function (response) {
        if (response.status >= 200 && response.status < 300) {
          resolve(response.response);
        } else {
          reject(
            new Error(
              `HTTP error! status: ${response.status}, statusText: ${response.statusText}`,
            ),
          );
        }
      },
      onerror: function (response) {
        reject(
          new Error(`Network error: ${response.statusText || "Unknown error"}`),
        );
      },
      ontimeout: function () {
        reject(new Error("Request timed out."));
      },
    });
  });
}
