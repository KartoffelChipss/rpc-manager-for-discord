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

    updatePreview();

    if (settings.presets) {
        settings.presets.forEach((preset, index) => {
            document.getElementById("presets").innerHTML += `<div class="presetbox">
                <input type="text" data-prevname="${preset.name}" class="name" placeholder="Rename Preset" oninput="changeName('${preset.id}', this)" value="${preset.name}" title="Load Preset">
                <div class="buttons">
                    <button type="button" onclick="loadPreset('${preset.id}')" title="Load Preset"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fefefe"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 6C4 4.89543 4.89543 4 6 4H12H14.1716C14.702 4 15.2107 4.21071 15.5858 4.58579L19.4142 8.41421C19.7893 8.78929 20 9.29799 20 9.82843V12V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M8 4H13V7C13 7.55228 12.5523 8 12 8H9C8.44772 8 8 7.55228 8 7V4Z" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M7 15C7 13.8954 7.89543 13 9 13H15C16.1046 13 17 13.8954 17 15V20H7V15Z" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></button>
                    <button type="button" onclick="removePreset('${preset.id}', this)" title="Delete Preset"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fefefe"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 12V17" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 12V17" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M4 7H20" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></button>
                </div>
            </div>`
        });
    }
});

const nameList = [ "Gold Preset", "Silver Preset", "Gold Preset", "Platinum Preset", "Iron Preset", "Hydrogen Preset" , "Helium Preset", "Lithium Preset", "Beryllium Preset", "Nitrogen Preset", "Oxygen Preset", "Neon Preset", "Sodium Preset", "Sulfur Preset", "Carbon Preset", "Phosphorus Preset", "Titanium Preset", "Krypton Preset", "Cesium Preset", "Bismuth Preset", "Uranium Preset" ];

function savePreset() {
    let partyPlayers = Number(document.getElementById("partyAmount").value);
    if (partyPlayers <= 0) partyPlayers = -1;

    let partyMayPlayers = Number(document.getElementById("partyMaxAmount").value);
    if (partyMayPlayers <= 0) partyMayPlayers = -1;

    const presetName = nameList[Math.floor( Math.random() * nameList.length )];
    const presetId = Date.now().toString(32) + Math.random().toString(16).replace(/\./g, '');

    window.api.invoke("addPreset", {
        id: presetId,
        name: presetName,
        config: {
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
    });

    document.getElementById("presets").innerHTML += `<div class="presetbox">
            <input type="text" data-prevname="${presetName}" class="name" placeholder="Rename Preset" oninput="changeName('${presetId}', this)" value="${presetName}" title="Load Preset">
            <div class="buttons">
                <button type="button" onclick="loadPreset('${presetId}')" title="Load Preset"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fefefe"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 6C4 4.89543 4.89543 4 6 4H12H14.1716C14.702 4 15.2107 4.21071 15.5858 4.58579L19.4142 8.41421C19.7893 8.78929 20 9.29799 20 9.82843V12V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M8 4H13V7C13 7.55228 12.5523 8 12 8H9C8.44772 8 8 7.55228 8 7V4Z" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M7 15C7 13.8954 7.89543 13 9 13H15C16.1046 13 17 13.8954 17 15V20H7V15Z" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></button>
                <button type="button" onclick="removePreset('${presetId}', this)" title="Delete Preset"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fefefe"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 12V17" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 12V17" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M4 7H20" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></button>
            </div>
        </div>`
}

function removePreset(presetid, btn) {
    window.api.invoke("rmvPreset", presetid);

    btn.parentNode.parentNode.remove();
}

function loadPreset(presetid) {
    window.api.invoke("loadPreset", presetid);
}

function changeName(presetid, input) {
    console.log(input)
    window.api.invoke("renamePreset", {
        presetId: presetid,
        name: input.value
    });
}

window.bridge.loadPreset((event, preset) => {
    document.getElementById("details").value = preset.config.details || "";
    document.getElementById("state").value = preset.config.state || "";

    document.getElementById("partyAmount").value = preset.config.party_players || -1;
    document.getElementById("partyMaxAmount").value = preset.config.party_maxplayers || -1;

    document.getElementById("large_image").value = preset.config.large_image || "";
    document.getElementById("large_text").value = preset.config.large_text || "";
    document.getElementById("small_image").value = preset.config.small_image || "";
    document.getElementById("small_text").value = preset.config.small_text || "";

    document.getElementById("button_1_label").value = preset.config.buttons[0].label || "";
    document.getElementById("button_1_url").value = preset.config.buttons[0].url || "";
    document.getElementById("button_2_label").value = preset.config.buttons[1].label || "";
    document.getElementById("button_2_url").value = preset.config.buttons[1].url || "";

    document.getElementById("customtimestamp").value = new Date(preset.config.customtimestamp).toISOString().slice(0, -1);

    if (preset.config.start_time === "custom") {
        document.getElementById("timestamp_none").selected = false;
        document.getElementById("timestamp_custom").selected = true;
    } else if (preset.config.start_time === "localtime") {
        document.getElementById("timestamp_none").selected = false;
        document.getElementById("timestamp_localtime").selected = true;
    } else if (preset.config.start_time === "lastupdate") {
        document.getElementById("timestamp_none").selected = false;
        document.getElementById("timestamp_lastupdate").selected = true;
    } else if (preset.config.start_time === "appstart") {
        document.getElementById("timestamp_none").selected = false;
        document.getElementById("timestamp_appstart").selected = true;
    }

    updatePreview();
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