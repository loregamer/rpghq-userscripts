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

  // Default avatars
  const defaultUserPictures = [
    {
      userId: "@irc_Gregz:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=87",
    },
    {
      userId: "@irc_Kalarion:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=71",
    },
    {
      userId: "@irc_Kalarion1:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=71",
    },
    {
      userId: "@irc_Kalarion7:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=71",
    },
    {
      userId: "@irc_Kalarionis:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=71",
    },
    {
      userId: "@irc_Tweed:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=68",
    },
    {
      userId: "@irc_Tweedagain:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=68",
    },
    {
      userId: "@irc_WhiteShark:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=63",
    },
    {
      userId: "@irc_decline:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=225",
    },
    {
      userId: "@irc_Norfleet:rpghq.org",
      baseImageUrl: "https://i.postimg.cc/T2z1mDLK/image",
    },
    {
      userId: "@irc_Sex_Cult_Leader:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=65",
    },
    {
      userId: "@irc_stackofturtles:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=3301",
    },
    {
      userId: "@irc_twig:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=2",
    },
    {
      userId: "@irc_Roguey:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=86",
    },
    {
      userId: "@irc_Chonkem:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=69",
    },
    {
      userId: "@irc_Chonkem:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=69",
    },
    {
      userId: "@irc_herkzter:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=289",
    },
    {
      userId: "@irc_The_Mask:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=113",
    },
    {
      userId: "@irc_Eyestabber:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=85",
    },
    {
      userId: "@irc_wraith:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=62",
    },
    {
      userId: "@irc_rusty_mobile:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=58",
    },
    {
      userId: "@irc_[Classix]:rpghq.org",
      baseImageUrl:
        "https://rpghq.org/forums/download/file.php?avatar=3607_1722022475",
    },
    {
      userId: "@irc_wunderbar:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=90",
    },
    {
      userId: "@irc_tars:rpghq.org",
      baseImageUrl: "https://f.rpghq.org/Zuzzdn8HsDAA.png?n=pasted-file.png",
    },
    {
      userId: "@irc_Ammazzaratti:rpghq.org",
      baseImageUrl: "https://f.rpghq.org/SUqopfrg82m2.png?n=404.png",
    },
    {
      userId: "@irc_Dedd:rpghq.org",
      baseImageUrl: "https://f.rpghq.org/SUqopfrg82m2.png?n=404.png",
    },
  ];

  // Load saved overrides or use an empty array if not found
  let userPictureOverrides = GM_getValue("userPictureOverrides", []);

  console.log("Loaded userPictureOverrides:", userPictureOverrides);

  // Function to get the avatar URL for a user
  function getAvatarUrl(userId) {
    const override = userPictureOverrides.find(
      (user) => user.userId === userId
    );
    if (override) {
      return override.baseImageUrl;
    }
    const defaultAvatar = defaultUserPictures.find(
      (user) => user.userId === userId
    );
    return defaultAvatar ? defaultAvatar.baseImageUrl : null;
  }

  function setImageSource(img, baseImageUrl) {
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
          if (!imageSet) {
            img.src = `${baseImageUrl}.jpg`; // Fallback
          }
        };
      }
    });
  }

  function addUserPictures() {
    const allUserElements = document.querySelectorAll(
      "[data-user-id], .profile-viewer__user__info, .prxiv40, ._13tt0gb6"
    );

    allUserElements.forEach(function (element) {
      const userId =
        element.getAttribute("data-user-id") ||
        element.querySelector("p.text.text-b2.text-normal, p._1xny9xlc")
          ?.textContent;
      const avatarContainer = element.querySelector(
        "span._1684mq5d, .avatar__border, span._1684mq51"
      );
      const displayNameElement = element.querySelector(
        "span._1xny9xl0 b, h4.text.text-s1.text-medium, p._1xny9xl0, span._1xny9xl1"
      );

      const avatarUrl = getAvatarUrl(userId);

      if (avatarUrl && avatarContainer) {
        if (!avatarContainer.querySelector("img")) {
          const img = document.createElement("img");
          img.alt = userId;
          img.classList.add("_1684mq5c", "_1mqalmd1", "_1mqalmd0", "awo2r00");
          img.style.width = "100%";
          img.style.height = "100%";
          setImageSource(img, avatarUrl);

          avatarContainer.innerHTML = "";
          avatarContainer.appendChild(img);
        }
      }

      if (
        userId &&
        userId.includes("@irc") &&
        displayNameElement &&
        !displayNameElement.textContent.includes("[irc]") &&
        !element.classList.contains("_13tt0gb6")
      ) {
        displayNameElement.textContent += " [irc]";
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
          if (!avatarContainer.querySelector("img")) {
            const img = document.createElement("img");
            img.draggable = false;
            img.alt = userId;
            img.style.backgroundColor = "transparent";
            setImageSource(img, avatarUrl);
            avatarContainer.innerHTML = "";
            avatarContainer.appendChild(img);
          }
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

    if (userIdElement) {
      const userId = userIdElement.textContent.trim(); // This will get "@vergil:rpghq.org"
      const newAvatarUrl = prompt(
        "Enter the new avatar URL (leave empty to reset):",
        ""
      );

      updateUserAvatar(userId, newAvatarUrl);
    } else {
      console.error("Could not find user ID element");
    }
  }

  function updateUserAvatar(userId, newAvatarUrl) {
    const existingOverrideIndex = userPictureOverrides.findIndex(
      (user) => user.userId === userId
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
        userPictureOverrides.push({ userId, baseImageUrl: newAvatarUrl });
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
      img.alt = userId;
      img.style.backgroundColor = "transparent";
      const avatarUrl = getAvatarUrl(userId);
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
