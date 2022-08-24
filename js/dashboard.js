window.addEventListener("DOMContentLoaded", () => {
    let emails;
    chrome.storage.sync.get(["nixityEmails"], (items) => {
        emails = items.nixityEmails || [];

        const emailRows = document.getElementById('email-row');

        console.log(emails);
    
        function updateEmails(array) {
            var child = emailRows.lastElementChild;
            while (child) {
                emailRows.removeChild(child);
                child = emailRows.lastElementChild;
            }
            for (let i = 0; i < array.length; i++) {
                let value = array[i];
                let address = value.address;
                let isBreached = value.isBreached;

                let emailDisplay = document.createElement("p")
                emailRows.appendChild(emailDisplay);
                emailDisplay.innerHTML = address;
                emailDisplay.classList.add("p-row");
                if (isBreached) emailDisplay.innerHTML += " [BREACHED]";
                
                let lineBreak = document.createElement("br");
                emailRows.appendChild(lineBreak);
    
                emailDisplay.addEventListener("click", () => {
                    console.log(`REMOVED EMAIL | ${address}`)
                    emails.splice(emails.indexOf(value), 1);
                    updateEmails(emails);
                })
            }
            chrome.storage.sync.set({
                nixityEmails: array,
            }, () => console.log("SAVED EMAILS TO STORAGE"));
        }
    
        updateEmails(emails)
    
        const emailInput = document.getElementById('email-input');
        emailInput.addEventListener("keyup", (event) => {
            if (event.key == "Enter") {
                if (emails.indexOf(emailInput.value) == -1 && emailInput.value != "") {
                    console.log(`ADDED EMAIL | ${emailInput.value}`);
                    emails.push({
                        address: emailInput.value,
                        isBreached: false
                    });
                    updateEmails(emails);
                }
            }
        })
    })

})