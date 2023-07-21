var assets = {};
var currentAppID;
var previewTimestamp;

window.addEventListener('load', () => {
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  
    now.setMilliseconds(null)
    now.setSeconds(null)
  
    document.getElementById('customtimestamp').value = now.toISOString().slice(0, -1);
});

function closeWindow() {
    window.api.invoke("closeWindow");
}

function minimizeWindow() {
    window.api.invoke("minimize");
}

function toggleMaxWindow() {
    window.api.invoke("togglemaxwindow");
}

// Update the preview WIndow in the right
function updatePreview() {
    document.getElementById("preview_details").innerHTML = document.getElementById("details").value;
    document.getElementById("preview_state").innerHTML = document.getElementById("state").value;

    if (Number(document.getElementById("partyAmount").value) < 1 || Number(document.getElementById("partyMaxAmount").value) < 1) {
        document.getElementById("playersBox").classList.add("hidden");
    } else {
        document.getElementById("preview_partyplayers").innerHTML = document.getElementById("partyAmount").value;
        document.getElementById("preview_partyMaxPlayers").innerHTML = document.getElementById("partyMaxAmount").value;
        document.getElementById("playersBox").classList.remove("hidden");
    }

    let timestampMode = document.getElementById("timestamp").value;
    let preview_timestampBox = document.getElementById("preview_timestampBox");
    let customtimestampInput = document.getElementById("customtimestamp");
    if (timestampMode === "none") {
        preview_timestampBox.style.display = "none";
        customtimestampInput.style.display = "none";
    } else if (timestampMode === "appstart") {
        preview_timestampBox.style.display = "block";
        customtimestampInput.style.display = "none";

        previewTimestamp = new Date(document.getElementById("customtimestamp").value).getTime();
    } else if (timestampMode === "lastupdate") {
        preview_timestampBox.style.display = "block";
        customtimestampInput.style.display = "none";

        previewTimestamp = new Date(document.getElementById("customtimestamp").value).getTime();
    } else if (timestampMode === "localtime") {
        preview_timestampBox.style.display = "block";
        customtimestampInput.style.display = "none";

        let now = new Date();
        let currentTime = now.getTime();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let second = now.getSeconds();
        
        previewTimestamp = currentTime - (hour * 60 * 60) - (minute * 60) - second;
    } else if (timestampMode === "custom") {
        preview_timestampBox.style.display = "block";
        customtimestampInput.style.display = "block";

        previewTimestamp = new Date(document.getElementById("customtimestamp").value).getTime();
    }

    let largeImgKey = document.getElementById("large_image").value
    if (assets[largeImgKey]) {
        document.getElementById("preview_bigImg").style.display = "block";
        document.getElementById("preview_bigImg").src = `https://cdn.discordapp.com/app-assets/${currentAppID}/${assets[largeImgKey].id}.png?size=1024`;
    } else {
        document.getElementById("preview_bigImg").style.display = "none";
    }

    let smallImgKey = document.getElementById("small_image").value
    if (assets[smallImgKey]) {
        document.getElementById("preview_smallImg").style.display = "block";
        document.getElementById("preview_smallImg").src = `https://cdn.discordapp.com/app-assets/${currentAppID}/${assets[smallImgKey].id}.png?size=1024`;
    } else {
        document.getElementById("preview_smallImg").style.display = "none";
    }

    // If only the small image is present
    if (!assets[largeImgKey] && assets[smallImgKey]) {
        document.getElementById("preview_smallImg").style.position = "relative";
    } else {
        document.getElementById("preview_smallImg").style.position = "absolute";
    }

    let button_1_label = document.getElementById("button_1_label").value;
    let button_1_url = document.getElementById("button_1_url").value;
    if (!button_1_label || button_1_label === "" || !button_1_url) {
        document.getElementById("preview_btn_1").style.display = "none";
    } else {
        document.getElementById("preview_btn_1").style.display = "block";
        document.getElementById("preview_btn_1").innerHTML = button_1_label;
        document.getElementById("preview_btn_1").dataset.url = button_1_url;
    }

    let button_2_label = document.getElementById("button_2_label").value;
    let button_2_url = document.getElementById("button_2_url").value;
    if (!button_2_label || button_2_label === "" || !button_2_url) {
        document.getElementById("preview_btn_2").style.display = "none";
    } else {
        document.getElementById("preview_btn_2").style.display = "block";
        document.getElementById("preview_btn_2").innerHTML = button_2_label;
        document.getElementById("preview_btn_2").dataset.url = button_2_url;
    }
}

// Update the input fields when app starts
window.bridge.sendStorageData((event, settings) => {
    document.getElementById("appID").value = settings.appid || "";

    document.getElementById("details").value = settings.config.details || "";
    document.getElementById("state").value = settings.config.state || "";

    document.getElementById("partyAmount").value = settings.config.party_players || -1;
    document.getElementById("partyMaxAmount").value = settings.config.party_maxplayers || -1;

    document.getElementById("large_image").value = settings.config.large_image || "";
    document.getElementById("large_text").value = settings.config.large_text || "";
    document.getElementById("small_image").value = settings.config.small_image || "";
    document.getElementById("small_text").value = settings.config.small_text || "";

    document.getElementById("button_1_label").value = settings.config.buttons[0].label || "";
    document.getElementById("button_1_url").value = settings.config.buttons[0].url || "";
    document.getElementById("button_2_label").value = settings.config.buttons[1].label || "";
    document.getElementById("button_2_url").value = settings.config.buttons[1].url || "";

    document.getElementById("customtimestamp").value = new Date(settings.config.customtimestamp).toISOString().slice(0, -1);

    if (settings.config.start_time === "custom") {
        document.getElementById("timestamp_none").selected = false;
        document.getElementById("timestamp_custom").selected = true;
    } else if (settings.config.start_time === "localtime") {
        document.getElementById("timestamp_none").selected = false;
        document.getElementById("timestamp_localtime").selected = true;
    } else if (settings.config.start_time === "lastupdate") {
        document.getElementById("timestamp_none").selected = false;
        document.getElementById("timestamp_lastupdate").selected = true;
    } else if (settings.config.start_time === "appstart") {
        document.getElementById("timestamp_none").selected = false;
        document.getElementById("timestamp_appstart").selected = true;
    }

    updatePreview()
});

function updateActivity(btnEle) {
    let partyPlayers = Number(document.getElementById("partyAmount").value);
    if (partyPlayers <= 0) partyPlayers = -1;

    let partyMayPlayers = Number(document.getElementById("partyMaxAmount").value);
    if (partyMayPlayers <= 0) partyMayPlayers = -1;

    let dataObject = {
        "details": document.getElementById("details").value,
        "state": document.getElementById("state").value,
        "large_image": document.getElementById("large_image").value,
        "large_text": document.getElementById("large_text").value,
        "small_image": document.getElementById("small_image").value,
        "small_text": document.getElementById("small_text").value,
        "party_players": partyPlayers,
        "party_maxplayers": partyMayPlayers,
        "start_time": document.getElementById("timestamp").value,
        "customtimestamp": new Date(document.getElementById("customtimestamp").value).getTime(),
        "buttons": [
            {
                "label": document.getElementById("button_1_label").value,
                "url": document.getElementById("button_1_url").value
            },
            {
                "label": document.getElementById("button_2_label").value,
                "url": document.getElementById("button_2_url").value
            }
        ]
    }

    window.api.invoke("updateActivity", dataObject);

    btnEle.disabled = true;
    btnEle.setAttribute("title", "Wait 15s before updating again!")

    setTimeout(() => {
        btnEle.disabled = false;
        btnEle.setAttribute("title", "")
    }, 15000)
}

function connectApp() {
    let appid = document.getElementById("appID").value.trim();

    window.api.invoke("connectApp", {
        appid: appid,
    });
}

function disconnectApp() {
    const connectbtn = document.getElementById("connectbtn");
    const disconnectBtn = document.getElementById("disconnectBtn");
    const appIdInput = document.getElementById("appID");

    connectbtn.disabled = false;
    disconnectBtn.disabled = true;
    appIdInput.classList.remove("success");
    appIdInput.classList.add("danger");

    window.api.invoke("disconnectApp", {});
}

window.bridge.appConnectionFailure((event, data) => {
    console.log("Connection failure")

    const connectbtn = document.getElementById("connectbtn");
    const disconnectBtn = document.getElementById("disconnectBtn");
    const appIdInput = document.getElementById("appID");

    connectbtn.disabled = false;
    disconnectBtn.disabled = true;
    appIdInput.classList.remove("success");
    appIdInput.classList.add("danger");

    assets = {};
    currentAppID = undefined;

    document.getElementById("preview_username").innerHTML = "Your username";
    document.getElementById("preview_pp").src = "./img/defaultavatar_purple.png";
    document.getElementById("preview_appname").innerHTML = "Your app name";
});

window.bridge.appConnectionSuccess((event, data) => {
    console.log("Connection success")

    const connectbtn = document.getElementById("connectbtn");
    const disconnectBtn = document.getElementById("disconnectBtn");
    const appIdInput = document.getElementById("appID");

    connectbtn.disabled = true;
    disconnectBtn.disabled = false;
    appIdInput.classList.add("success");
    appIdInput.classList.remove("danger");

    assets = data.assets;

    currentAppID = data.appid;

    document.getElementById("preview_username").innerHTML = data.user.username || "Username not found";
    document.getElementById("preview_pp").src = `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.jpg?size=128`;
    document.getElementById("preview_appname").innerHTML = data.application.name;

    setTimeout(() => {
        updatePreview()
    }, 5000)
});

function openExternalLink(link) {
    window.api.invoke("openExternalLink", {
        link: link,
    })
}

function openSettings() {
    window.api.invoke("openSettingsWindow", {});
}