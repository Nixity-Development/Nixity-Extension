function sendMessageToBackground(name, data) {
    let port = chrome.runtime.connect({ name: name });
    port.postMessage(data);
    port.disconnect();
}

window.addEventListener("DOMContentLoaded", () => {
    const passwordCheckBox = document.getElementById("password-check");
    const privacyProtectionBox = document.getElementById("privacy-protection");
    const breachNotificationsBox = document.getElementById("breach-notifications");
    chrome.storage.sync.get(["passwordCheck", "privacyProtection", "breachNotifications"], (items) => {
        passwordCheckBox.checked = items.passwordCheck;
        privacyProtectionBox.checked = items.privacyProtection;
        breachNotificationsBox.checked = items.breachNotifications;
    })
    passwordCheckBox.addEventListener("change", () => {
        chrome.storage.sync.set({
            passwordCheck: passwordCheckBox.checked
        }, () => {
            console.log("Set password-check to", passwordCheckBox.checked);
        })
    })
    privacyProtectionBox.addEventListener("change", () => {
        chrome.storage.sync.set({
            privacyProtection: privacyProtectionBox.checked
        }, () => {
            console.log("Set privacy-protection to", privacyProtectionBox.checked);
        })
        
        // chrome.runtime.sendMessage({ action: (privacyProtectionBox.checked && "toggleOn") || "toggleOff" });
        sendMessageToBackground("nixity", { action: (privacyProtectionBox.checked && "toggleOn") || "toggleOff" })
    })
    breachNotificationsBox.addEventListener("change", () => {
        chrome.storage.sync.set({
            breachNotifications: breachNotificationsBox.checked
        }, () => {
            console.log("Set breach-notifications to", breachNotificationsBox.checked);
        })
    })
})