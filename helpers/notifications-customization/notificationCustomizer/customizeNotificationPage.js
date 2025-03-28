/**
 * Customize notifications on the notification page
 */
export function customizeNotificationPage() {
  document.querySelectorAll(".cplist .row").forEach(async (row) => {
    if (row.dataset.customized === "true") return;

    // Ensure row has position relative for absolute positioning
    row.style.position = "relative";
    row.style.paddingBottom = "20px"; // Make room for timestamp

    // Handle the notifications_time elements
    const timeElement = row.querySelector(".notifications_time");
    if (timeElement) {
      Object.assign(timeElement.style, NOTIFICATIONS_TIME_STYLE);
    }

    const notificationBlock = row.querySelector(".notifications");
    const anchorElement = notificationBlock.querySelector("a");

    if (anchorElement) {
      const titleElement = anchorElement.querySelector(
        ".notifications_title"
      );
      let titleText = titleElement.innerHTML;

      // Handle mentioned notifications specially
      if (titleText.includes("You were mentioned by")) {
        const parts = titleText.split("<br>");
        if (parts.length === 2) {
          titleText = parts[0] + " " + parts[1];

          // Create the new HTML structure for mentions
          const newHtml = `
            <div class="notification-block">
              <div class="notification-title">${titleText}</div>
              <div class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; margin-top: 5px;">
                Loading...
              </div>
            </div>
          `;

          anchorElement.innerHTML = newHtml;

          // Queue the content fetch
          const referenceElement = anchorElement.querySelector(
            ".notification-reference"
          );
          if (referenceElement) {
            queuePostContentFetch(
              anchorElement.href,
              referenceElement
            );
          }
        }
      }
      // Handle reaction notifications
      else if (titleText.includes("reacted to")) {
        const usernameElements = Array.from(
          titleElement.querySelectorAll(".username, .username-coloured")
        );
        const usernames = usernameElements.map((el) =>
          el.textContent.trim()
        );

        const postId = extractPostId(anchorElement.href);
        if (postId) {
          const reactions = await fetchReactions(
            postId,
            false
          );
          const filteredReactions = reactions.filter((reaction) =>
            usernames.includes(reaction.username)
          );
          const reactionHTML = formatReactions(filteredReactions);

          // Keep everything up to the first username
          const firstPart = titleText.split(
            usernameElements[0].outerHTML
          )[0];

          const smallAnd =
            '<span style="font-size: 0.85em; padding: 0 0.25px;">and</span>';

          // Format usernames based on count
          let formattedUsernames;
          if (usernameElements.length === 2) {
            formattedUsernames = `${usernameElements[0].outerHTML} ${smallAnd} ${usernameElements[1].outerHTML}`;
          } else if (usernameElements.length > 2) {
            formattedUsernames =
              usernameElements
                .slice(0, -1)
                .map((el) => el.outerHTML)
                .join(", ") +
              `, ${smallAnd} ${
                usernameElements[usernameElements.length - 1].outerHTML
              }`;
          } else {
            formattedUsernames = usernameElements[0].outerHTML;
          }

          titleText =
            firstPart +
            formattedUsernames +
            ` <b style="color: #3889ED;">reacted</b> ${reactionHTML} to:`;

          // Create the new HTML structure
          const newHtml = `
            <div class="notification-block">
              <div class="notification-title">${titleText}</div>
              <div class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; margin-top: 5px;">
                Loading...
              </div>
            </div>
          `;

          anchorElement.innerHTML = newHtml;

          // Queue the content fetch
          const referenceElement = anchorElement.querySelector(
            ".notification-reference"
          );
          if (referenceElement) {
            queuePostContentFetch(
              anchorElement.href,
              referenceElement
            );
          }
        }
      }
      // Handle other notifications with quotes
      else {
        const lastQuoteMatch = titleText.match(/"([^"]*)"$/);
        if (lastQuoteMatch) {
          // Only remove the quote from title if it's not a "Quoted" notification
          if (!titleText.includes("<strong>Quoted</strong>")) {
            titleText = titleText.replace(/"[^"]*"$/, "").trim();
          }

          // Apply text styling
          titleText = titleText
            .replace(
              /\b(by|and|in|from)\b(?!-)/g,
              '<span style="font-size: 0.85em; padding: 0 0.25px;">$1</span>'
            )
            .replace(
              /<strong>Quoted<\/strong>/,
              '<strong style="color: #FF4A66;">Quoted</strong>'
            )
            .replace(
              /<strong>Reply<\/strong>/,
              '<strong style="color: #95DB00;">Reply</strong>'
            );

          // Create the new HTML structure
          const newHtml = `
            <div class="notification-block">
              <div class="notification-title">${titleText}</div>
              <div class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; margin-top: 5px;">
                Loading...
              </div>
            </div>
          `;

          anchorElement.innerHTML = newHtml;

          // Queue the content fetch
          const referenceElement = anchorElement.querySelector(
            ".notification-reference"
          );
          if (referenceElement) {
            queuePostContentFetch(
              anchorElement.href,
              referenceElement
            );
          }
        }
      }

      // Convert username-coloured to username
      anchorElement.querySelectorAll(".username-coloured").forEach((el) => {
        el.classList.replace("username-coloured", "username");
        el.style.color = "";
      });
    }

    row.dataset.customized = "true";
  });
}