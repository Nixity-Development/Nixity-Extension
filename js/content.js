const passwordFields = document.querySelectorAll("input[type='password']");

let timeout;
let timeout2;

async function Sha1(str) {
    const textEncoder = new TextEncoder("utf-8");
    var encoded = textEncoder.encode(str);

    var digest = await crypto.subtle.digest("SHA-1", encoded)

    const int8array = new Uint8Array(digest);

    var result = Array.from(int8array).map((hex) => hex.toString(16).padStart(2, "0")).join("");

    return result;
}

function checkPassword(span, value) {
    chrome.storage.sync.get(["passwordCheck"], (items) => {
        if (items.passwordCheck == true) {
            Sha1(value).then((result) => {
                result = result.toUpperCase()
        
                var url = `https://api.pwnedpasswords.com/range/${result.substring(0, 5)}`;
        
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url);
            
                xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status == 200) {
                    var lines = xhr.responseText.split("\n");
                    lines.forEach((value) => {
                        if (value.split(":")[0] == result.substring(5)) {
                            span.innerHTML = `<b>Heads Up!</b><br>That password has been found in ${value.split(":")[1]} compromised database(s)`
                            span.classList.remove("invisible")
                            span.classList.add("visible")

                            timeout2 = setTimeout(() => {
                                span.classList.add("invisible")
                                span.classList.remove("visible")
                            }, 2000)
                        }
                    })
                }};
            
                xhr.send();
            })
        }
    })
}

function addToField(field) {
    var parentDiv = field.parentNode;

    var span = document.createElement('span');
    span.innerHTML = "Test";
    span.classList.add("nixity-pwd-tooltip")
    parentDiv.appendChild(span);

    if (field.value != "") {
        checkPassword(span, field.value)
    }

    field.classList.add("nixity-pwd-input");
    field.addEventListener("input", () => {
        span.classList.add("invisible")
        span.classList.remove("visible")
        clearTimeout(timeout);
        clearTimeout(timeout2);

        timeout = setTimeout(() => {
            if (field.value == "") {
                span.classList.add("invisible")
                span.classList.remove("visible")
            } 
            else checkPassword(span, field.value);
        }, 500)
    })
}

for (var i = 0; i < passwordFields.length; i++) { 
    addToField(passwordFields[i])
}

const config = { attributes: true, childList: true, subtree: true };

const observer = new MutationObserver((list) => {
    list.forEach((mutation) => {
        if (mutation.type == "childList") {
            mutation.addedNodes.forEach((mutatednode) => {
                if (mutatednode.querySelectorAll) {
                    var descendants = mutatednode.querySelectorAll("*");
                    descendants.forEach((node) => {
                        if (node.type && node.type == "password") {
                            addToField(node)
                        }
                    })
                }
            })
        }
    })
})
observer.observe(document.querySelectorAll("body")[0], config)