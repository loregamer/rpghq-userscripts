// ==UserScript==
// @name         Bypass FileCrypt
// @name:it   Bypassa FileCrypt
// @namespace    StephenP
// @version      1.4.0.4
// @description  Bypass FileCrypt and get the original link!
// @description:it Bypassa Filecrypt e ottieni il collegamento originale!
// @author       StephenP
// @grant        GM.xmlHttpRequest
// @match        http://filecrypt.cc/*
// @match        http://www.filecrypt.cc/*
// @match        http://filecrypt.co/*
// @match        http://www.filecrypt.co/*
// @match        https://filecrypt.cc/*
// @match        https://www.filecrypt.cc/*
// @match        https://filecrypt.co/*
// @match        https://www.filecrypt.co/*
// @run-at       document-end
// @connect      dcrypt.it
// @connect      self
// @contributionURL https://buymeacoffee.com/stephenp_greasyfork
// @downloadURL https://update.greasyfork.org/scripts/403170/Bypass%20FileCrypt.user.js
// @updateURL https://update.greasyfork.org/scripts/403170/Bypass%20FileCrypt.meta.js
// ==/UserScript==
(function () {
  var usenetAd = document.getElementsByTagName("A"); //come on, why should anyone pay for access to pirated content?
  for (var i = 0; i < usenetAd.length; i++) {
    if (usenetAd[i].href.includes("/pink/")) {
      usenetAd[i].parentNode.remove();
      i = usenetAd.length;
    }
  }
  if (document.location.href.includes("/Link/")) {
    getSingleLink();
  } else if (document.location.href.includes("/Container/")) {
    let art =
      document.getElementsByClassName("download")[0].parentNode.parentNode
        .parentNode.parentNode;
    let load = document.createElement("DIV");
    load.id = "dcryptLoadMsg";
    load.style.marginBottom = "2em";
    load.textContent = "Loading decrypted links list from dcrypt.it...";
    art.parentNode.insertBefore(load, art);
    getCNL();
  }
})();
function getSingleLink() {
  if (document.body.getElementsByTagName("SCRIPT").length == 0) {
    window.stop();
    if (body.children.length > 0) {
      const a = document.body.innerHTML.lastIndexOf("http");
      top.location.href = document.body.innerHTML
        .substring(a, document.body.innerHTML.indexOf("id=", a) + 43)
        .replace("&amp;", "&");
    } else {
      GM.xmlHttpRequest({
        method: "GET",
        url: document.location.href,
        onload: function (response) {
          const a = response.responseText.lastIndexOf("http");
          top.location.href = response.responseText.substring(
            a,
            response.responseText.indexOf("id=", a) + 43
          );
        },
      });
    }
  }
}
function getCNL() {
  var dlcButton = document.getElementsByClassName("dlcdownload");
  if (dlcButton.length > 0) {
    var inputs = document.getElementsByTagName("INPUT");
    var dlcId;
    /*for(var i=0;i<inputs.length;i++){
        if(inputs[i].getAttribute('name')=='hidden_cnl_id'){
          dlcId=inputs[i].getAttribute('value');
          i=inputs.length;
        }
      }*/ //left for reference
    dlcId = document
      .getElementsByClassName("dlcdownload")[0]
      .attributes["onclick"].nodeValue.split("'")[1];
    //console.log('dlcId='+dlcId);
    GM.xmlHttpRequest({
      method: "GET",
      url: "https://" + document.location.hostname + "/DLC/" + dlcId + ".dlc",
      onload: function (response) {
        dcrypt(response.responseText);
      },
      onerror: function (response) {
        xhrLinkExtract();
      },
    });
  } else {
    try {
      xhrLinkExtract();
    } catch (e) {
      console.log("Error decrypting the links locally: ");
      console.log(e);
      document.getElementById("dcryptLoadMsg").textContent =
        "No DLC file is available for bulk download. You'll have to click on the download buttons to retrieve the links. This operation isn't currently automated by Bypass FileCrypt script.";
      document.getElementById("dcryptLoadMsg").style.color = "red";
    }
  }
}
function dcrypt(content) {
  //console.log(content);
  GM.xmlHttpRequest({
    method: "POST",
    url: "http://dcrypt.it/decrypt/paste",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: "content=" + encodeURIComponent(content),
    onload: function (response) {
      //console.log(response);
      var obj = JSON.parse(response.response);
      //console.log(obj);
      var finalLinksDiv = document.createElement("DIV");
      finalLinksDiv.style.backgroundColor = bgColor();
      finalLinksDiv.style.borderRadius = "10px";
      finalLinksDiv.style.padding = "1em";
      finalLinksDiv.style.marginTop = "1em";
      finalLinksDiv.style.color = textColor();
      finalLinksDiv.style.zIndex = "10";
      finalLinksDiv.style.position = "relative";
      finalLinksDiv.style.marginBottom = "1em";
      let a = document.createElement("SPAN");
      a.textContent = "Decrypted links:";
      finalLinksDiv.appendChild(a);

      // Add copy all button
      let copyButton = document.createElement("BUTTON");
      copyButton.textContent = "Copy All Links";
      copyButton.style.marginLeft = "1em";
      copyButton.style.padding = "0.5em 1em";
      copyButton.style.borderRadius = "5px";
      copyButton.style.cursor = "pointer";
      copyButton.style.backgroundColor =
        bgColor() === "white" ? "#f0f0f0" : "#1a1d2b";
      copyButton.style.border = "1px solid " + textColor();
      copyButton.style.color = textColor();

      // Create a container for all links that we'll use for copying
      let allLinks = [];

      copyButton.addEventListener("click", function () {
        const linkText = allLinks.join("\n");
        navigator.clipboard
          .writeText(linkText)
          .then(function () {
            const originalText = copyButton.textContent;
            copyButton.textContent = "Copied!";
            setTimeout(() => {
              copyButton.textContent = originalText;
            }, 2000);
          })
          .catch(function (err) {
            console.error("Failed to copy links: ", err);
            copyButton.textContent = "Failed to copy";
            setTimeout(() => {
              copyButton.textContent = "Copy All Links";
            }, 2000);
          });
      });

      finalLinksDiv.appendChild(copyButton);
      finalLinksDiv.appendChild(document.createElement("BR"));
      finalLinksDiv.appendChild(document.createElement("BR"));
      if (obj.success.links.length > 0) {
        try {
          for (let i = 0; i < obj.success.links.length; i++) {
            const link = obj.success.links[i];
            allLinks.push(link); // Add link to our collection
            console.log("Decrypted using dcrypt.it: " + link);
            let b = document.createElement("DIV");
            b.style.display = "flex";
            b.style.alignItems = "center";
            b.style.marginBottom = "0.5em";

            let num = document.createElement("SPAN");
            num.textContent = i + 1 + ". ";
            num.style.marginRight = "0.5em";
            num.style.color = textColor();

            let linkElem = document.createElement("A");
            linkElem.href = link;
            linkElem.textContent = link;
            linkElem.style.color = textColor();
            linkElem.style.textDecoration = "underline";
            linkElem.style.cursor = "pointer";
            linkElem.target = "_blank";

            b.appendChild(num);
            b.appendChild(linkElem);
            finalLinksDiv.appendChild(b);
          }
          console.log(finalLinksDiv);
          document.getElementById("dcryptLoadMsg").replaceWith(finalLinksDiv);
        } catch (e) {
          console.log(e);
          xhrLinkExtract();
        }
        /*What was this code doing? I can't remember, but it seems it's not needed anymore
          const config = { attributes: true, childList: false, subtree: false };
          const callback = function(mutationList, observer) {
              for (const mutation of mutationList) {
                  console.log(mutation);
                  mutation.target.removeAttribute(mutation.attributeName);
  
              }
          };
          const observer = new MutationObserver(callback);
          observer.observe(finalLinksDiv, config);
          */
      } else {
        xhrLinkExtract();
      }
    },
    onerror: function (response) {
      xhrLinkExtract();
    },
  });
}
function xhrLinkExtract() {
  var finalLinksDiv = document.createElement("DIV");
  finalLinksDiv.style.backgroundColor = bgColor();
  finalLinksDiv.style.borderRadius = "10px";
  finalLinksDiv.style.padding = "1em";
  finalLinksDiv.style.marginTop = "1em";
  finalLinksDiv.style.color = textColor();
  finalLinksDiv.style.zIndex = "10";
  finalLinksDiv.style.position = "relative";
  finalLinksDiv.style.marginBottom = "1em";
  let a = document.createElement("SPAN");
  a.textContent = "Decrypted links:";
  finalLinksDiv.appendChild(a);
  finalLinksDiv.appendChild(document.createElement("BR"));
  finalLinksDiv.appendChild(document.createElement("BR"));
  var encLinks = document.querySelectorAll("[onclick^=openLink]"); //get all the encrypted links
  for (let l of encLinks) {
    let passA = l.getAttribute("onclick");
    let passB = passA.split("'");
    let passC = l.getAttribute(passB[1]);
    let link =
      "http://" + document.location.hostname + "/Link/" + passC + ".html";
    GM.xmlHttpRequest({
      method: "GET",
      url: link,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      onload: function (response) {
        let scripts = response.responseXML.getElementsByTagName("SCRIPT");
        for (let s of scripts) {
          if (s.innerHTML.includes("top.location.href=")) {
            getFinalLink(s.innerHTML.split("'")[1], finalLinksDiv);
            continue;
          }
        }
      },
    });
  }
  document.getElementById("dcryptLoadMsg").replaceWith(finalLinksDiv);
}
function getFinalLink(encLink, finalLinksDiv) {
  let req = GM.xmlHttpRequest({
    method: "OPTIONS",
    url: encLink,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    onreadystatechange: function (response) {
      req.abort();
      console.log(response);
      console.log("Decrypted locally: " + response.finalUrl);

      // Get or create the allLinks array
      let copyButton = finalLinksDiv.querySelector("button");
      if (!copyButton) {
        // Create copy button if it doesn't exist
        copyButton = document.createElement("BUTTON");
        copyButton.textContent = "Copy All Links";
        copyButton.style.marginLeft = "1em";
        copyButton.style.padding = "0.5em 1em";
        copyButton.style.borderRadius = "5px";
        copyButton.style.cursor = "pointer";
        copyButton.style.backgroundColor =
          bgColor() === "white" ? "#f0f0f0" : "#1a1d2b";
        copyButton.style.border = "1px solid " + textColor();
        copyButton.style.color = textColor();

        // Insert the button after the "Decrypted links:" text
        const firstSpan = finalLinksDiv.querySelector("span");
        if (firstSpan) {
          firstSpan.parentNode.insertBefore(copyButton, firstSpan.nextSibling);
        }

        copyButton.addEventListener("click", function () {
          const links = Array.from(finalLinksDiv.querySelectorAll("a")).map(
            (a) => a.href
          );
          const linkText = links.join("\n");
          navigator.clipboard
            .writeText(linkText)
            .then(function () {
              const originalText = copyButton.textContent;
              copyButton.textContent = "Copied!";
              setTimeout(() => {
                copyButton.textContent = originalText;
              }, 2000);
            })
            .catch(function (err) {
              console.error("Failed to copy links: ", err);
              copyButton.textContent = "Failed to copy";
              setTimeout(() => {
                copyButton.textContent = "Copy All Links";
              }, 2000);
            });
        });
      }

      let linkCount = finalLinksDiv.querySelectorAll("div").length;
      let b = document.createElement("DIV");
      b.style.display = "flex";
      b.style.alignItems = "center";
      b.style.marginBottom = "0.5em";

      let num = document.createElement("SPAN");
      num.textContent = linkCount + 1 + ". ";
      num.style.marginRight = "0.5em";
      num.style.color = textColor();

      let linkElem = document.createElement("A");
      linkElem.href = response.finalUrl;
      linkElem.textContent = response.finalUrl;
      linkElem.style.color = textColor();
      linkElem.style.textDecoration = "underline";
      linkElem.style.cursor = "pointer";
      linkElem.target = "_blank";

      b.appendChild(num);
      b.appendChild(linkElem);
      finalLinksDiv.appendChild(b);
    },
  });
}
function bgColor() {
  var color = "white";
  const colorTag = document.head.querySelector('meta[name="theme-color"]');
  if (colorTag) {
    color = "#0b0d15";
  }
  return color;
}
function textColor() {
  var color = "black";
  const colorTag = document.head.querySelector('meta[name="theme-color"]');
  if (colorTag) {
    color = "white";
  }
  return color;
}
