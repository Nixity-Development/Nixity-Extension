window.addEventListener("DOMContentLoaded", () => {
    const settings = document.getElementById("settings-btn");
    const dashboard = document.getElementById("dashboard-btn");
    const about = document.getElementById("about-btn");
    const support = document.getElementById("support-btn");

    const search = document.getElementById("search");

    settings.addEventListener("click", () => {
        chrome.tabs.create({url: "../html/settings.html"})
    })

    dashboard.addEventListener("click", () => {
        chrome.tabs.create({url: "../html/dashboard.html"})
    })

    about.addEventListener("click", () => {
        chrome.tabs.create({url: "../html/about.html"})
    })

    support.addEventListener("click", () => {
        chrome.tabs.create({url: "https://nixity.denver11.repl.co/support"});
    })

    search.addEventListener("keyup", (event) => {
        if (event.key == "Enter" && search.value != "") {
            let url = "https://hibp-proxy.denver11.repl.co/search/";

            var xhr = new XMLHttpRequest();
            xhr.open("GET", url + encodeURIComponent(search.value));

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status == 200) {
                        let response = JSON.parse(xhr.responseText);
                        console.log(response)
                        if (response.length > 0) search.value = `Breached - found in ${response.length} ${(response.length == 1 && "database.") || "databases."}`
                        else search.value = "No breach detected."
                    } else {
                        search.value = "Error - try again later."
                    }
                }
            }

            xhr.send();
        }
    })
})