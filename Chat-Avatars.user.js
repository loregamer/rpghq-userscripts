// ==UserScript==
// @name         Add User Pictures and Add [irc] to Names
// @namespace    http://tampermonkey.net/
// @version      2.0.6
// @description  Add pictures to users in Cinny Matrix client by user ID and add [irc] to their display names
// @author       loregamer
// @match        https://chat.rpghq.org/*
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Chat-Avatars.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Chat-Avatars.user.js
// @grant        none
// @license      MIT
// ==/UserScript==

/*
MIT License

Copyright (c) 2024 loregamer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function () {
  "use strict";

  // Initialize userPictureOverrides as an empty array if it doesn't exist
  let userPictureOverrides = GM_getValue("userPictureOverrides", []);

  // Ensure userPictureOverrides is always an array
  if (!Array.isArray(userPictureOverrides)) {
    userPictureOverrides = [];
  }

  console.log("Loaded userPictureOverrides:", userPictureOverrides);

  // Default avatars
  const defaultUserPictures = [
    {
      userId: "@irc_Gregz:rpghq.org",
      displayName: "Gregz",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=87",
    },
    {
      userId: "@irc_Kalarion:rpghq.org",
      displayName: "Kalarion",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=71",
    },
    {
      userId: "@irc_Kalarion1:rpghq.org",
      displayName: "Kalarion1",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=71",
    },
    {
      userId: "@irc_Kalarion7:rpghq.org",
      displayName: "Kalarion7",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=71",
    },
    {
      userId: "@irc_Kalarionis:rpghq.org",
      displayName: "Kalarionis",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=71",
    },
    {
      userId: "@irc_Tweed:rpghq.org",
      displayName: "Tweed",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=68",
    },
    {
      userId: "@irc_Tweedagain:rpghq.org",
      displayName: "Tweedagain",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=68",
    },
    {
      userId: "@irc_WhiteShark:rpghq.org",
      displayName: "WhiteShark",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=63",
    },
    {
      userId: "@irc_decline:rpghq.org",
      displayName: "decline",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=225",
    },
    {
      userId: "@irc_Norfleet:rpghq.org",
      displayName: "Norfleet",
      baseImageUrl: "https://i.postimg.cc/T2z1mDLK/image",
    },
    {
      userId: "@irc_Sex_Cult_Leader:rpghq.org",
      displayName: "Sex_Cult_Leader",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=65",
    },
    {
      userId: "@irc_stackofturtles:rpghq.org",
      displayName: "stackofturtles",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=3301",
    },
    {
      userId: "@irc_twig:rpghq.org",
      displayName: "twig",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=2",
    },
    {
      userId: "@irc_Roguey:rpghq.org",
      displayName: "Roguey",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=86",
    },
    {
      userId: "@irc_Chonkem:rpghq.org",
      displayName: "Chonkem",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=69",
    },
    {
      userId: "@irc_Chonkem:rpghq.org",
      displayName: "Chonkem",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=69",
    },
    {
      userId: "@irc_herkzter:rpghq.org",
      displayName: "herkzter",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=289",
    },
    {
      userId: "@irc_The_Mask:rpghq.org",
      displayName: "The_Mask",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=113",
    },
    {
      userId: "@irc_Eyestabber:rpghq.org",
      displayName: "Eyestabber",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=85",
    },
    {
      userId: "@irc_wraith:rpghq.org",
      displayName: "wraith",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=62",
    },
    {
      userId: "@irc_rusty_mobile:rpghq.org",
      displayName: "rusty_mobile",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=58",
    },
    {
      userId: "@irc_[Classix]:rpghq.org",
      displayName: "[Classix]",
      baseImageUrl:
        "https://rpghq.org/forums/download/file.php?avatar=3607_1722022475",
    },
    {
      userId: "@irc_wunderbar:rpghq.org",
      displayName: "wunderbar",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=90",
    },
    {
      userId: "@irc_tars:rpghq.org",
      displayName: "tars",
      baseImageUrl: "https://f.rpghq.org/Zuzzdn8HsDAA.png?n=pasted-file.png",
    },
    {
      userId: "@irc_Ammazzaratti:rpghq.org",
      displayName: "Ammazzaratti",
      baseImageUrl: "https://f.rpghq.org/SUqopfrg82m2.png?n=404.png",
    },
    {
      userId: "@irc_Dedd:rpghq.org",
      displayName: "Dedd",
      baseImageUrl: "https://f.rpghq.org/SUqopfrg82m2.png?n=404.png",
    },
  ];

  // Function to get the avatar URL for a user
  function getAvatarUrl(identifier) {
    const override = userPictureOverrides.find(
      (user) => user.userId === identifier || user.displayName === identifier
    );
    if (override) {
      return override.baseImageUrl;
    }
    const defaultAvatar = defaultUserPictures.find(
      (user) => user.userId === identifier || user.displayName === identifier
    );
    return defaultAvatar ? defaultAvatar.baseImageUrl : null;
  }

  function setImageSource(img, baseImageUrl) {
    // Check if the URL already ends with an image extension
    if (/\.(jpg|jpeg|png|gif)$/i.test(baseImageUrl)) {
      img.src = baseImageUrl;
      return;
    }

    const extensions = ["jpg", "jpeg", "png", "gif"];
    let imageSet = false;

    extensions.forEach((ext) => {
      if (!imageSet) {
        const imgSrc = `${baseImageUrl}.${ext}`;
        const testerImg = new Image();
        testerImg.src = imgSrc;

        testerImg.onload = () => {
          if (testerImg.complete && testerImg.naturalHeight !== 0) {
            img.src = imgSrc;
            imageSet = true;
          }
        };

        testerImg.onerror = () => {
          if (!imageSet && ext === extensions[extensions.length - 1]) {
            img.src = baseImageUrl; // Use the original URL as a fallback
          }
        };
      }
    });
  }

  function addUserPictures() {
    const allUserElements = document.querySelectorAll(
      "[data-user-id], .profile-viewer__user__info, .prxiv40, ._13tt0gb6, ._1684mq51"
    );

    allUserElements.forEach(function (element) {
      const userId =
        element.getAttribute("data-user-id") ||
        element.querySelector("p.text.text-b2.text-normal, p._1xny9xlc")
          ?.textContent;
      const displayNameElement = element.querySelector(
        "span._1xny9xl0 b, h4.text.text-s1.text-medium, p._1xny9xl0, span._1xny9xl1"
      );
      const displayName = displayNameElement?.textContent.trim();
      let avatarContainer = element.querySelector(
        "span._1684mq5d, .avatar__border, span._1684mq51"
      );

      // If avatarContainer is not found, the element itself might be the avatar container
      if (!avatarContainer && element.classList.contains("_1684mq51")) {
        avatarContainer = element;
      }

      const avatarUrl = getAvatarUrl(displayName) || getAvatarUrl(userId);

      if (avatarUrl && avatarContainer) {
        let img = avatarContainer.querySelector("img");
        if (!img) {
          img = document.createElement("img");
          img.alt = displayName || userId;
          img.classList.add("_1684mq5c", "_1mqalmd1", "_1mqalmd0", "awo2r00");
          img.style.width = "100%";
          img.style.height = "100%";
          avatarContainer.innerHTML = "";
          avatarContainer.appendChild(img);
        }
        // Always update the image source, even if the img element already exists
        setImageSource(img, avatarUrl);
      }

      // Add [irc] to names
      if (
        userId &&
        userId.includes("@irc") &&
        displayNameElement &&
        !displayNameElement.textContent.includes("[irc]") &&
        !element.classList.contains("_13tt0gb6")
      ) {
        displayNameElement.textContent =
          displayNameElement.textContent + " [irc]";
      }
    });
  }

  function addSidebarNames() {
    const sidebarElements = document.querySelectorAll(
      "[data-user-id], .prxiv40, ._13tt0gb6"
    );

    sidebarElements.forEach(function (element) {
      const userId =
        element.getAttribute("data-user-id") ||
        element.querySelector("p._1xny9xlc")?.textContent;
      const sidebarNameElement = element.querySelector(
        "div.prxiv40._1mqalmd1._1mqalmd0.prxiv41.prxiv41s p._1xny9xl0._1mqalmd1._1mqalmd0._1xny9xla._1xny9xlr._1xny9xln, span._1xny9xl1"
      );

      if (
        userId &&
        userId.includes("@irc") &&
        sidebarNameElement &&
        !sidebarNameElement.textContent.includes("[irc]")
      ) {
        sidebarNameElement.textContent += " [irc]";
      }
    });
  }

  function updateProfileViewer() {
    const profileViewerElements = document.querySelectorAll(
      ".ReactModal__Content .profile-viewer__user__info"
    );

    profileViewerElements.forEach(function (element) {
      const userIdElement = element.querySelector("p.text.text-b2.text-normal");
      if (userIdElement) {
        const userId = userIdElement.textContent;
        const avatarContainer = element
          .closest(".profile-viewer__user")
          .querySelector(".avatar-container");

        const avatarUrl = getAvatarUrl(userId);

        if (avatarUrl && avatarContainer) {
          let img = avatarContainer.querySelector("img");
          if (!img) {
            img = document.createElement("img");
            img.draggable = false;
            img.alt = userId;
            img.style.backgroundColor = "transparent";
            avatarContainer.innerHTML = "";
            avatarContainer.appendChild(img);
          }
          setImageSource(img, avatarUrl);
        }
      }
    });
  }

  function updatePingUserBox() {
    const pingUserBoxElements = document.querySelectorAll("._13tt0gb6");

    pingUserBoxElements.forEach(function (element) {
      const userIdElement = element.querySelector("p._1xny9xlc");
      if (userIdElement) {
        const userId = userIdElement.textContent;
        const avatarContainer = element.querySelector(
          "span._1684mq5d, span._1684mq51"
        );

        const avatarUrl = getAvatarUrl(userId);

        if (avatarUrl && avatarContainer) {
          if (!avatarContainer.querySelector("img")) {
            const img = document.createElement("img");
            img.draggable = false;
            img.alt = userId;
            img.classList.add("_1684mq5c", "_1mqalmd1", "_1mqalmd0", "awo2r00");
            img.style.width = "32px";
            img.style.height = "32px";
            setImageSource(img, avatarUrl);
            avatarContainer.innerHTML = "";
            avatarContainer.appendChild(img);
          }
        }
      }
    });
  }

  function makeProfilePictureClickable() {
    const profileViewer = document.querySelector(
      ".ReactModal__Content .profile-viewer"
    );
    if (profileViewer) {
      const avatarContainer = profileViewer.querySelector(".avatar-container");
      if (avatarContainer && !avatarContainer.hasAttribute("data-clickable")) {
        avatarContainer.style.cursor = "pointer";
        avatarContainer.setAttribute("data-clickable", "true");
        avatarContainer.addEventListener("click", handleAvatarClick);
      }
    }
  }

  function handleAvatarClick() {
    const profileViewer = document.querySelector(
      ".ReactModal__Content .profile-viewer"
    );
    const userIdElement = profileViewer.querySelector(
      ".profile-viewer__user__info p.text.text-b2.text-normal"
    );
    const displayNameElement = profileViewer.querySelector(
      ".profile-viewer__user__info h4.text.text-s1.text-medium"
    );

    if (userIdElement && displayNameElement) {
      const userId = userIdElement.textContent.trim();
      const displayName = displayNameElement.textContent.trim();
      const newAvatarUrl = prompt(
        "Enter the new avatar URL (leave empty to reset):",
        ""
      );

      updateUserAvatar(userId, displayName, newAvatarUrl);
    } else {
      console.error("Could not find user ID or display name element");
    }
  }

  function updateUserAvatar(userId, displayName, newAvatarUrl) {
    // Ensure userPictureOverrides is an array
    if (!Array.isArray(userPictureOverrides)) {
      userPictureOverrides = [];
    }

    const existingOverrideIndex = userPictureOverrides.findIndex(
      (user) => user.userId === userId || user.displayName === displayName
    );

    if (newAvatarUrl === "") {
      // Remove the override if the URL is empty (reset to default)
      if (existingOverrideIndex !== -1) {
        userPictureOverrides.splice(existingOverrideIndex, 1);
      }
    } else if (newAvatarUrl) {
      // Update or add the override with the new avatar URL
      if (existingOverrideIndex !== -1) {
        userPictureOverrides[existingOverrideIndex].baseImageUrl = newAvatarUrl;
      } else {
        userPictureOverrides.push({
          userId,
          displayName,
          baseImageUrl: newAvatarUrl,
        });
      }
    } else {
      // If newAvatarUrl is null (user cancelled the prompt), do nothing
      return;
    }

    // Save the updated overrides
    GM_setValue("userPictureOverrides", userPictureOverrides);

    // Update the avatar immediately
    const avatarContainer = document.querySelector(
      ".ReactModal__Content .profile-viewer .avatar-container"
    );
    if (avatarContainer) {
      const img =
        avatarContainer.querySelector("img") || document.createElement("img");
      img.draggable = false;
      img.alt = displayName || userId;
      img.style.backgroundColor = "transparent";
      const avatarUrl = getAvatarUrl(displayName) || getAvatarUrl(userId);
      if (avatarUrl) {
        setImageSource(img, avatarUrl);
      } else {
        // Set to a default avatar if no custom or default avatar is found
        img.src = ""; // Or set to a generic default avatar URL
      }
      avatarContainer.innerHTML = "";
      avatarContainer.appendChild(img);
    }

    // Refresh all avatars on the page
    addUserPictures();
    updateProfileViewer();
    updatePingUserBox();

    console.log("Updated userPictureOverrides:", userPictureOverrides);
  }

  function observeProfileViewer() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const profileViewer = document.querySelector(
            ".ReactModal__Content .profile-viewer"
          );
          if (profileViewer) {
            makeProfilePictureClickable();
            observer.disconnect(); // Stop observing once the avatar is made clickable
            break;
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Modify the existing observer
  const mainObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        addUserPictures();
        addSidebarNames();
        updateProfileViewer();
        updatePingUserBox();

        const profileViewer = document.querySelector(
          ".ReactModal__Content .profile-viewer"
        );
        if (profileViewer) {
          observeProfileViewer(); // Start observing for the profile viewer
        }
      }
    });
  });

  function initializeScript() {
    addUserPictures();
    addSidebarNames();
    updateProfileViewer();
    updatePingUserBox();
    observeProfileViewer(); // Start observing for the profile viewer
  }

  // Run the initialization
  initializeScript();
  mainObserver.observe(document.body, { childList: true, subtree: true });
})();
