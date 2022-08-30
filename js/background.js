let blockingTrackers = true;
let blockCount;
let blockList = [];

let firstTime = true;

let netRequestRules = [];

/*chrome.runtime.onInstalled.addListener(() => {
    //chrome.tabs.create({ url: "../html/setup.html" }/*)
})*/

function toggleOn() {
    console.log("Nixity | Recieved message: ON")
    chrome.declarativeNetRequest.updateDynamicRules({
        addRules: netRequestRules,
        removeRuleIds: []
    })
}

function toggleOff() {
    console.log("Nixity | Recieved message: OFF")
    
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
        let rulesToRemove = [];
        for (let i = 0; i < rules.length; i++) {
            rulesToRemove.push(rules[i].id)
        }
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: rulesToRemove
        })
    })
}

toggleOff();

function setupBlocklist() {
    let url = "https://raw.githubusercontent.com/duckduckgo/tracker-blocklists/main/web/tds.json";
    fetch(url)
        .then((response) => response.text())
        .then((text) => {
            console.log("Nixity | attempting blocklist setup...")
            try {
                let listJSON = JSON.parse(text);
                let trackerList = listJSON.trackers;

                for (let i in trackerList) {
                    let trackerData = trackerList[i];
                    if (trackerData.default == "block") blockList.push(trackerData.domain);
                }

                for (let i = 0; i < blockList.length; i++) {
                    netRequestRules.push({
                        id: i + 1,
                        priority: 1,
                        action: { type: "block" },
                        condition: {
                            urlFilter: `||${blockList[i]}/`,
                            resourceTypes: ["xmlhttprequest", "script"]
                        }
                    })
                }
                console.log("Nixity | blocklist setup was successful.")

                chrome.storage.sync.get(["privacyProtection"], (items) => {
                    if (!items.privacyProtection) return;
                    toggleOn();
                    console.log("Nixity | Toggled privacy protection on startup");
                })
            }
            catch {
                console.log("Nixity | unable to setup blocklist, retrying 10 seconds...");
                setTimeout(() => setupBlocklist(), 10000);
            }
        })
        .catch(() => {
            console.log("Nixity | unable to setup blocklist, retrying 10 seconds...");
            setTimeout(() => setupBlocklist(), 10000);
        })
}

setupBlocklist();

chrome.declarativeNetRequest.setExtensionActionOptions({ displayActionCountAsBadgeText: true })

chrome.runtime.onConnect.addListener((port) => {
    if (port.name != "nixity") return;

    port.onMessage.addListener((request) => {
        if (request.action == "toggleOff") toggleOff();
        else if (request.action == "toggleOn") toggleOn();
    })
})

function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function compareArrays(a1, a2) {
    let equalItems = 0;
    if (a1.length != a2.length) return false;

    for (let i = 0; i < a1.length; i++) {
        if (a1[i] == a2[i]) equalItems++;
    }

    if (equalItems == a1.length) return true;
}

async function checkEmails(emails, breachedBefore) {
    let breachedEmails = [];
    for (let i = 0; i < emails.length; i++) {
        let url = "https://hibp-proxy.denver11.repl.co/search/" + encodeURIComponent(emails[i].address);
        let response = await fetch(url);
        let text = await response.text();

        console.log(`Nixity | attempting to fetch email ${emails[i].address}...`)
        try {
            let breachList = JSON.parse(text);
            if (breachList.length > 0) {
                breachedEmails.push(emails[i].address);
                emails[i].isBreached = true;
            };
        } catch {
            console.log(`Nixity | unable to fetch data for ${emails[i].address}`);
        }
        await timeout(1700);
    }
    chrome.storage.sync.get(["breachNotifications"], (items) => {
        if (!items.breachNotifications) return;
        if (breachedEmails.length == 0) return;
        if (compareArrays(breachedEmails, breachedBefore) == true) return;

        let randomId = `nixityBreachNotification_${Math.random()}`

        chrome.notifications.create(randomId, {
            type: "basic",
            iconUrl: "../icons/warning.png",
            title: "Warning",
            message: `Nixity has found database breaches that contain ${breachedEmails.length} of your emails.`,
            priority: 0
        })
        chrome.notifications.onClicked.addListener((notificationId) => {
            if (randomId == notificationId) chrome.tabs.create({url: "../html/dashboard.html"});
        })
    })
    chrome.storage.sync.set({
        nixityEmails: emails,
    }, () => console.log("UPDATED BREACHED EMAILS"));
    chrome.storage.sync.set({
        breachedBefore: breachedEmails,
    })
}

chrome.storage.sync.get(["nixityEmails", "breachedBefore"], (items) => {
    if (!items.nixityEmails) return;
    checkEmails(items.nixityEmails, items.breachedBefore || []);
})

// Runs every 15 minutes (hopefully)
setInterval(() => {
    chrome.storage.sync.get(["nixityEmails", "breachedBefore"], (items) => {
        if (!items.nixityEmails) return;
        checkEmails(items.nixityEmails, items.breachedBefore || []);
    })
}, 900000)
