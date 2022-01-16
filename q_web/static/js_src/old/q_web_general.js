const sidebar = document.getElementById("sidebar");
const topbar = document.getElementById("topbar");
const content = document.getElementById("content");
const toggle = document.getElementById("sidebarToggle");
document.getElementById("sidebarToggle").addEventListener("click", function() {
    if (sidebar.classList.contains("close")) {
        sidebar.classList.remove("close");
    } else {
        sidebar.classList.add("close");
    }
    if (topbar.classList.contains("close")) {
        topbar.classList.remove("close");
    } else {
        topbar.classList.add("close");
    }
    if (content.classList.contains("close")) {
        content.classList.remove("close");
    } else {
        content.classList.add("close");
    }
    if (toggle.classList.contains("close")) {
        toggle.classList.remove("close");
        toggle.classList.add("open");
    } else {
        toggle.classList.add("close");
        toggle.classList.remove("open");
    }
});

function destroySelf(evt) {
    var modal = document.getElementById(evt.currentTarget.id);
    modal.remove();
}

function generateModal() {
    var back = document.createElement("div");
    back.classList.add("modalBackground");
    back.id = "modal";
    back.addEventListener("click", destroySelf)

    var box = document.createElement("div");
    box.classList.add("modalBox");
    box.addEventListener("click", (evt) => {evt.stopPropagation();});

    back.appendChild(box);
    document.body.appendChild(back);
    return box;
}

function updateDeclaration(proxyId, csrf_token) {
    var url = "/declaration/proxy/" + proxyId + "/updateDeclaration";
    var params = "csrfmiddlewaretoken=" + csrf_token;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    var modal = generateModal();
    var img = document.createElement("img");
    img.src = "/static/img/loader.svg";
    img.alt = "Loading..";
    img.classList.add("rotate");
    img.classList.add("bigImg");
    modal.appendChild(img);

    var text = document.createElement("p");
    text.innerText = "Waiting...";
    modal.appendChild(text);

    var button = document.createElement("button");
    button.addEventListener("click", function () {
        document.getElementById("modal").remove();
    });
    button.innerText = "OK";
    button.type = "button";
    button.style = "display: none";
    button.classList.add("button");
    modal.appendChild(button);

    xhr.send(params);
    xhr.onload = () => {
        button.style = "";
        img.classList.remove("rotate");

        var ret_code = xhr.status;
        if (ret_code === 200 || ret_code === 201) {
            var ret = JSON.parse(xhr.responseText);
            img.src = "/static/img/check-circle.svg";
            var msg = "";
            for (let i = 0; i < ret.data.status.length; i++) {
                if (ret.data.status[i]["return_code"] !== 200) {
                    img.src = "/static/img/x-circle.svg";
                }
                msg += ret.data.status[i]["return_code"].toString()  + " " + ret.data.status[i]["message"] + "<br>";
            }
            text.innerHTML = "Elapsed time: " + ret.data["elapsed_time"] + "s <br>" + msg;
        } else {
            img.src = "/static/img/x-circle.svg";
            text.innerText = "Internal server error occurred";
        }
    }
}

function generateConfiguration(proxyId, csrf_token) {
    var url = "/declaration/proxy/" + proxyId + "/generateConfiguration";
    var params = "csrfmiddlewaretoken=" + csrf_token;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    var modal = generateModal();
    var img = document.createElement("img");
    img.src = "/static/img/loader.svg";
    img.alt = "Loading..";
    img.classList.add("rotate");
    img.classList.add("bigImg");
    modal.appendChild(img);

    var text = document.createElement("p");
    text.innerText = "Waiting...";
    modal.appendChild(text);

    var div = document.createElement("div");
    div.classList.add("modalRow");
    modal.appendChild(div);

    var input = document.createElement("textarea");
    input.classList.add("darkInput");
    input.style = "display: none";
    div.appendChild(input);

    var copy = document.createElement("button");
    copy.style = "display: none;"
    copy.classList.add("colorless");
    copy.classList.add("button");
    copy.addEventListener("click", () => {
        if (input.select) {
            input.select();
            try {
                document.execCommand("copy");
            } catch (err) {
                alert('please press Ctrl/Cmd+C to copy manually');
            }
        }
    });
    div.appendChild(copy);

    var copyImg = document.createElement("img");
    copyImg.src = "/static/img/clipboard.svg";
    copyImg.alt = "Copy";
    copy.appendChild(copyImg);

    var button = document.createElement("button");
    button.addEventListener("click", function () {
        document.getElementById("modal").remove();
    });
    button.innerText = "OK";
    button.type = "button";
    button.style = "display: none";
    button.classList.add("button");
    modal.appendChild(button);

    xhr.send(params);
    xhr.onload = () => {
        button.style = "";
        img.classList.remove("rotate");

        var ret_code = xhr.status;
        if (ret_code === 200 || ret_code === 201) {
            var ret = JSON.parse(xhr.responseText);
            img.remove();
            text.innerHTML = "Execute the following on the proxy. (Beware of sensitive data)";
            input.innerText = ret.data;
            input.style = "width: 550px; height: 200px;";
            copy.style = "";
        } else {
            img.src = "/static/img/x-circle.svg";
            if (ret_code !== 500) {
                var ret = JSON.parse(xhr.responseText);
                text.innerText = ret.message;
            } else {
                text.innerText = "Internal server error occurred";
            }
        }
    }
}


function showHidePassword() {
    var pw = document.getElementById("id_password");
    var toggleImg = document.getElementById("toggleEyePwImg");
    var static_path = toggleImg.src.split("/");
    static_path.pop();
    static_path = static_path.join("/")
    if (pw.type === "password") {
        pw.type = "text";
        toggleImg.src =  static_path + "/eye-off.svg"
    } else {
        pw.type = "password";
        toggleImg.src =  static_path + "/eye.svg"
    }
}

var buttonsStopPropagation = document.getElementsByClassName("stopPropagation");
for (const buttonsStopPropagationElement of buttonsStopPropagation) {
    buttonsStopPropagationElement.addEventListener("click", (evt) => {evt.stopPropagation();} );
}
