// ==UserScript==
// @name         Add User Pictures and Add [irc] to Names
// @namespace    http://tampermonkey.net/
// @version      2.0.1
// @description  Add pictures to users in Cinny Matrix client by user ID and add [irc] to their display names
// @author       loregamer
// @match        https://chat.rpghq.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rpghq.org
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

  const userPictures = [
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
  ];

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

      const user = userPictures.find((user) => user.userId === userId);

      if (user && avatarContainer) {
        if (!avatarContainer.querySelector("img")) {
          const img = document.createElement("img");
          img.alt = user.userId;
          img.classList.add("_1684mq5c", "_1mqalmd1", "_1mqalmd0", "awo2r00");
          img.style.width = "100%";
          img.style.height = "100%";
          setImageSource(img, user.baseImageUrl);

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
        const user = userPictures.find((user) => user.userId === userId);
        const avatarContainer = element
          .closest(".profile-viewer__user")
          .querySelector(".avatar-container");

        if (user && avatarContainer) {
          if (!avatarContainer.querySelector("img")) {
            const img = document.createElement("img");
            img.draggable = false;
            img.alt = user.userId;
            img.style.backgroundColor = "transparent";
            setImageSource(img, user.baseImageUrl);
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
        const user = userPictures.find((user) => user.userId === userId);
        const avatarContainer = element.querySelector(
          "span._1684mq5d, span._1684mq51"
        );

        if (user && avatarContainer) {
          if (!avatarContainer.querySelector("img")) {
            const img = document.createElement("img");
            img.draggable = false;
            img.alt = user.userId;
            img.classList.add("_1684mq5c", "_1mqalmd1", "_1mqalmd0", "awo2r00");
            img.style.width = "32px";
            img.style.height = "32px";
            setImageSource(img, user.baseImageUrl);
            avatarContainer.innerHTML = "";
            avatarContainer.appendChild(img);
          }
        }
      }
    });
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        addUserPictures();
        addSidebarNames();
        updateProfileViewer();
        updatePingUserBox();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("load", function () {
    addUserPictures();
    addSidebarNames();
    updateProfileViewer();
    updatePingUserBox();
  });

  function handleDynamicElements() {
    document.body.addEventListener("DOMNodeInserted", function (event) {
      if (
        event.target &&
        event.target.classList &&
        event.target.classList.contains("ReactModal__Content")
      ) {
        addUserPictures();
        addSidebarNames();
        updateProfileViewer();
        updatePingUserBox();
      }
    });
  }

  handleDynamicElements();
})();
