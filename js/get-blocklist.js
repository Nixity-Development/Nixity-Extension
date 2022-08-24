// get-blocklist.js || DEPRECATED

let blockList;

var xhr = new XMLHttpRequest();
xhr.open("GET", "https://raw.githubusercontent.com/duckduckgo/tracker-blocklists/main/web/tds.json");

xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status == 200) {
        blockList = JSON.parse(xhr.responseText);
        chrome.runtime.sendMessage({ blockList: blockList, action: "updateList" });
    }
}

xhr.send();