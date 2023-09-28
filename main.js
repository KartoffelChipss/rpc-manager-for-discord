const {app, BrowserWindow, Tray, Notification, dialog, nativeImage, Menu, shell, screen, nativeTheme} = require('electron')
const path = require('path')
const fetch = require('cross-fetch');
const { ipcMain } = require('electron/main');
const Store = require('electron-store');
const RPC = require("discord-rpc");
var AutoLaunch = require('auto-launch');
const fs = require("fs");

const availableLogTypes = ["neutral", "warning", "danger", "critical", "success"];

const storeSchema = require("./storeSchema.json");

const store = new Store({
    "appid": {
        "type": "string"
    },
    "preset": {
        "type": "string",
        "default": "none"
    },
    "config": {
        "details": {
            "type": "string"
        },
        "state": {
            "type": "string"
        },
        "large_image": {
            "type": "string"
        },
        "large_text": {
            "type": "string"
        },
        "small_image": {
            "type": "string"
        },
        "small_text": {
            "type": "string"
        },
        "party_players": {
            "type": "number",
            "minimum": -1,
            "maximum": 100,
            "default": -1
        },
        "party_maxplayers": {
            "type": "number",
            "minimum": -1,
            "maximum": 100,
            "default": -1
        },
        "start_time": {
            "type": "string",
            "default": "none"
        },
        "customtimestamp": {
            "type": "number",
            "minimum": 0,
            "default": 0
        },
        "buttons": [
            {
                "label": {
                    "type": "string"
                },
                "url": {
                    "type": "string"
                }
            },
            {
                "label": {
                    "type": "string"
                },
                "url": {
                    "type": "string"
                }
            }
        ]
    },
    "presets": [],
    "logs": [],
    "settings": {
        "theme": {
            "type": "string",
            "default": "dark",
        },
        "zoom": {
            "type": "number",
            "default": 1,
        },
        "createLogs": {
            "type": "boolean",
            "default": false,
        }
    }
});

store.openInEditor()

let appStartTime = new Date().getTime();
let lastUpdate = new Date().getTime();

let client;

let top = {};
let systemTrayMsgSent = false;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (top.mainWindow) {
            top.mainWindow.show();
            if (top.mainWindow.isMinimized()) top.mainWindow.restore();
            top.mainWindow.focus();
        }
    });

    app.whenReady().then(async () => {
        if (process.platform === 'win32') {
            app.setAppUserModelId("RPC Manager for Discord");
        }
    
        const screenHeight = screen.getPrimaryDisplay().workAreaSize.height;
        const screenWidth = screen.getPrimaryDisplay().workAreaSize.width;
    
        let windowWidth = 1300;
        let windowHeight = 1050;
    
        if (screenHeight < 1300) windowHeight = 800
    
        // let x = (screenWidth / 2) - (windowWidth / 2);
        // let y = (screenHeight / 2) - (windowHeight / 2);
    
        top.mainWindow = new BrowserWindow({
            title: "RPC Manager for Discord",
            width: windowWidth,
            height: windowHeight,
            // y: y,
            // x: x,
            minHeight: 600,
            minWidth: 850,
            center: true,
            frame: false,
            show: false,
            backgroundColor: "#313338",
            resizable: true,
            autoHideMenuBar: false,
            icon: __dirname + '/public/img/logo.ico',
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
            }
        });
    
        top.mainWindow.loadFile("public/main.html").then(() => {
            top.mainWindow.webContents.send("sendSettings", store.get("settings"));
            top.mainWindow.webContents.send("sendStorageData", store.get());
            connectApp(store.get("appid"));
        })
    
    
        // !!! COMMENT OUT FOR DEVELOPMENT !!! //
    
        //top.mainWindow.removeMenu();
    
        // !!! COMMENT OUT FOR DEVELOPMENT !!! //
        
        top.mainWindow.show();
    
        let autoLaunch = new AutoLaunch({
            name: 'RPC Manager for Discord',
            path: app.getPath('exe'),
        });
    
        autoLaunch.isEnabled().then((isEnabled) => {
            if (!isEnabled) autoLaunch.enable();
        });
    
        let iconColor = "black";
        if (nativeTheme.shouldUseDarkColors) {
            iconColor = "white";
        }
        
        top.tray = new Tray(__dirname + '/public/img/logo.ico');
    
        const menu = Menu.buildFromTemplate([
            {
                label: "Help",
                icon: nativeImage.createFromPath(__dirname + `/public/img/icons/${iconColor}/help.ico`).resize({width:16}),
                click: (item, window, event) => {
                    shell.openExternal("http://tools.strassburger.org")
                }
            },
            {
                label: "Open Menu",
                icon: nativeImage.createFromPath(__dirname + `/public/img/icons/${iconColor}/home.ico`).resize({width:16}),
                click: (item, window, event) => {
                    top.mainWindow.show();
                },
            },
            {
                label: "Update Activity",
                icon: nativeImage.createFromPath(__dirname + `/public/img/icons/${iconColor}/reload.ico`).resize({width:16}),
                click: (item, window, event) => {
                    updateDCActivity(store.get("config"));
                    item.enabled = false;
                    item.toolTip = "Wait a moment before doing this again!";
    
                    setTimeout(() => {
                        item.enabled = true;
                        item.toolTip = undefined;
                    }, 15000)
                }
            },
            {
                type: "separator"
            },
            {
                label: "Settings",
                icon: nativeImage.createFromPath(__dirname + `/public/img/icons/${iconColor}/settings.ico`).resize({width:16}),
                click: (item, window, event) => {
                    openSettingsWindow();
                }
            },
            {
                type: "separator"
            },
            {
                label: "Terminate",
                icon: nativeImage.createFromPath(__dirname + `/public/img/icons/${iconColor}/off.ico`).resize({width:16}),
                role: "quit"
            },
        ]);
    
        top.tray.setToolTip("RPC Manager for Discord");
        top.tray.setContextMenu(menu);
    
        top.tray.on('click', function(e){
            if (top.mainWindow.isVisible()) {
                top.mainWindow.hide()
            } else {
                top.mainWindow.show()
            }
        });
    
        ipcMain.handle('minimize', (event, arg) => {
            top.mainWindow.isMinimized() ? top.mainWindow.restore() : top.mainWindow.minimize();
        });
    
        ipcMain.handle('togglemaxwindow', (event, arg) => {
            top.mainWindow.isMaximized() ? top.mainWindow.unmaximize() : top.mainWindow.maximize();
        });
    
        ipcMain.handle('closeWindow', (event, arg) => {
            top.mainWindow.hide();
    
            if (!systemTrayMsgSent) {
                let trayNotification = new Notification({
                    title: undefined,
                    silent: true,
                    icon: nativeImage.createFromPath(__dirname + '/public/img/logo.ico'),
                    body: 'RPC Manager for Discord now lives in your System Tray!',
                });
                trayNotification.show();
                systemTrayMsgSent = true;
            }
        });
    
        ipcMain.handle("delData", (event, arg) => {
            if (arg.type === "all") {
                store.clear();
            } else if (arg.type === "config") {
                store.delete("config");
            } else if (arg.type === "presets") {
                store.delete("presets");
            } else if (arg.type === "logs") {
                store.delete("logs");
            }
        });
    
        ipcMain.handle('updateActivity', (event, arg) => {
            updateDCActivity(arg);
    
            store.set("config", arg);
    
            console.log("Saved new Config")
        });
    
    
        ipcMain.handle('connectApp', (event, arg) => {
            connectApp(arg.appid);
            logAction("Tried to connect to app", `Tried to connect to '${arg.appid}'`);
        });
    
        ipcMain.handle("disconnectApp", (event, arg) => {
            client.destroy();
            client = undefined;
            logAction("Disconnected app", ``);
        });
    
        ipcMain.handle("openExternalLink", (event, arg) => {
            shell.openExternal(arg.link);
        })
    
        ipcMain.handle("closeErrWindow", (event, arg) => {
            if (top.errWindow?.isDestroyed()) return;
    
            top.errWindow.close();
        })
    
        ipcMain.handle("openSettingsWindow", (event, arg) => {
            openSettingsWindow();
        })
    
        ipcMain.handle("closeSettingsWindow", (event, arg) => {
            if (top.settingsWindow?.isDestroyed()) return;
    
            top.settingsWindow.close();
        })
    
        ipcMain.handle("openLogsWindow", (event, arg) => {
            openLogsWindow();
        })
    
        ipcMain.handle("closeLogsWindow", (event, arg) => {
            if (top.logsWindow?.isDestroyed()) return;
    
            top.logsWindow.close();
        })
    
        ipcMain.handle("refreshLogs", (event, arg) => {
            top.logsWindow.webContents.send("sendLogs", store.get("logs"));
        });
    
        ipcMain.handle("changeTheme", (event, arg) => {
            store.set("settings.theme", arg.theme);
            
            top.mainWindow.webContents.send("sendSettings", store.get("settings"));
    
            if (top.settingsWindow && !top.settingsWindow?.isDestroyed()) {
                top.settingsWindow.webContents.send("sendSettings", store.get("settings"));
            }
    
            if (top.logsWindow && !top.logsWindow?.isDestroyed()) {
                top.logsWindow.webContents.send("sendSettings", store.get("settings"));
            }
    
            logAction("Changed theme", `Changed theme to '${arg.theme}'`);
        })
    
        ipcMain.handle("changeZoom", (event, arg) => {
            store.set("settings.zoom", arg.zoomLevel);
            
            top.mainWindow.webContents.send("sendSettings", store.get("settings"));
    
            if (!top.settingsWindow?.isDestroyed()) {
                top.settingsWindow.webContents.send("sendSettings", store.get("settings"));
            }
    
            logAction("Zoom changed", `Zoom changed to '${arg.zoomLevel}'`);
        })
    
        ipcMain.handle("changelogging", (event, data) => {
            store.set("settings.createLogs", data.value);
    
            if (data.value === false) store.delete("logs");
        });
    
        ipcMain.handle("exportLogs", async (event, arg) => {
            let logs = store.get("logs");
    
            if (!logs) logs = [];
    
            let options = {
                title: "Save file",
                defaultPath : "logs",
                buttonLabel : "Save",
    
                filters : [
                    { name: 'json', extensions: ['json'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            };
    
            dialog.showSaveDialog(null, options).then(({ filePath }) => {
                fs.writeFileSync(filePath, JSON.stringify(logs.reverse(), null, 2), 'utf-8');
            }).catch(err => {
                console.log(err);
                logAction("Error while exporting logs", err.message + "", "warning");
            })
        })

        ipcMain.handle("addPreset", (event, preset) => {
            let previousPresets = store.get("presets");

            if (!previousPresets || typeof previousPresets !== "object") previousPresets = [];

            previousPresets.push(preset);

            store.set("presets", previousPresets);

            logAction("Added Preset", `Added "${preset.name}"`, "neutral");
        });

        ipcMain.handle("rmvPreset", (event, presetid) => {
            let previousPresets = store.get("presets");

            if (!previousPresets || typeof previousPresets !== "object") return;

            previousPresets = previousPresets.filter(x => x.id !== presetid);

            store.set("presets", previousPresets);

            logAction("Deleted Preset", ``, "neutral");
        });

        ipcMain.handle("loadPreset", (event, presetId) => {
            let presets = store.get("presets");

            if (!presets || typeof presets !== "object") return;

            const preset = presets.find(o => o.id === presetId);

            top.mainWindow.webContents.send("loadPreset", preset);

            store.set("config", preset.config)
            
            updateDCActivity(preset.config);

            logAction("Loaded Preset", `Loaded "${preset.name}"`, "neutral");
        });

        ipcMain.handle("renamePreset", (event, args) => {
            let presets = store.get("presets");

            if (!presets || typeof presets !== "object") return;

            let presetIndex = presets.findIndex((x => x.id === args.presetId));

            console.log(presets[presetIndex] + " : " + args.name)

            presets[presetIndex].name = args.name;

            store.set("presets", presets);
        });
    
        logAction("App started", "", "success");
    });
    
    app.on("before-quit", ev => {
        top.win.removeAllListeners("close");
        top = null;
    });
    
    function undefinedIfEmpty(str) {
        if (!str || str.length === 0) return undefined
        else return str
    }
    
    function updateDCActivity(arg) {
        if (client) {
            lastUpdate = new Date().getTime();
    
            if (!arg) return;
    
            let partyPlayers = Number(arg.party_players);
            if (partyPlayers === -1) partyPlayers = undefined;
    
            let partyMaxPlayers = Number(arg.party_maxplayers);
            if (partyMaxPlayers === -1) partyMaxPlayers = undefined;
    
            let buttons = []
    
            if (arg.buttons[0].label && arg.buttons[0].url) {
                buttons.push({
                    "label": undefinedIfEmpty(arg.buttons[0].label),
                    "url": undefinedIfEmpty(arg.buttons[0].url),
                })
            }
    
            if (arg.buttons[1].label && arg.buttons[0].url) {
                buttons.push({
                    "label": undefinedIfEmpty(arg.buttons[1].label),
                    "url": undefinedIfEmpty(arg.buttons[1].url),
                })
            }
    
            if (buttons.length < 1) buttons = undefined;
    
            let now = new Date().getTime();
            var startTimestamp = undefined;
            if (arg.start_time) {
                if (arg.start_time === "appstart") {
                    startTimestamp = appStartTime;
                } else if (arg.start_time === "lastupdate") {
                    startTimestamp = lastUpdate;
                } else if (arg.start_time === "localtime") {
                    let now = new Date();
                    let currentTime = now.getTime();
                    let hour = now.getHours();
                    let minute = now.getMinutes();
                    let second = now.getSeconds();
                    
                    startTimestamp = (currentTime - (hour * 60 * 60 * 1000) - (minute * 60 * 1000) - (second * 1000));
                } else if (arg.start_time === "custom") {
                    startTimestamp = arg.customtimestamp || now;
                }
            }
    
            let activityObject = {
                details: undefinedIfEmpty(arg.details),
                state: undefinedIfEmpty(arg.state),
                largeImageKey: undefinedIfEmpty(arg.large_image),
                largeImageText: undefinedIfEmpty(arg.large_text),
                smallImageKey: undefinedIfEmpty(arg.small_image),
                smallImageText: undefinedIfEmpty(arg.small_text),
                buttons: buttons,
            }
    
            if (now < startTimestamp && arg.start_time === "custom") {
                activityObject.endTimestamp = startTimestamp;
            } else {
                activityObject.startTimestamp = startTimestamp;
            }
    
            if (partyPlayers && partyMaxPlayers) {
                activityObject.partyMax = partyMaxPlayers;
                activityObject.partySize = partyPlayers;
            }
    
            client.setActivity(activityObject)
            var activityObjectStr = JSON.stringify(activityObject, null, 4);
            logAction("Updated Activity", `Updated to the following:\n<br><br><div class="jsobjectbox">${activityObjectStr}</div>`);
        }
    }
    
    function connectApp(clientId) {
    
        console.log(clientId)
    
        var connectionSuccess = true;
    
        client = new RPC.Client({ transport: "ipc" })
    
        client.on("ready", () => {
            updateDCActivity(store.get("config"));
        });
    
        client.login({ clientId: clientId })
            .catch(err => {
                if (err) {
                    console.log(err);
                    top.mainWindow.webContents.send("appConnectionFailure", err);
                    connectionSuccess = false;
                    openErrWindow(err)
                    logAction("Login failure", err.message + "", "warning");
                    return;
                }
            })
            .then(() => {
                if (!connectionSuccess) return;
                store.set("appid", clientId);
    
                fetch(`https://discordapp.com/api/oauth2/applications/${clientId}/assets`)
                    .then(res => res.json())
                    .then(data => {
                        let assets = {};
    
                        data.forEach((asset) => {
                            assets[asset.name] = {
                                type: asset.type,
                                id: asset.id,
                            }
                        });
    
                        top.mainWindow.webContents.send("appConnectionSuccess", {
                            assets: assets,
                            user: client.user,
                            application: client.application,
                            appid: clientId,
                        });
                    });
    
                logAction("Login success", `Successful login to ${clientId}`);
            })
    }
}

function openErrWindow(err) {
    if (top.errWindow && !top.errWindow.isDestroyed()) {
        top.errWindow.loadFile("public/error.html").then(() => {
            if (err) {
                top.errWindow.webContents.send("sendErrDetails", {
                    name: `${err.name}: ${err.message}`,
                    message: getErrMessageFromName(err.message),
                });
            }
            top.errWindow.webContents.send("sendSettings", store.get("settings"));
        })
        top.errWindow.show();

        return;
    }

    top.errWindow = new BrowserWindow({
        title: "RPC Manager for Discord",
        center: true,
        width: 500,
        height: 500,
        minHeight: 500,
        minWidth: 500,
        frame: false,
        show: false,
        resizable: true,
        backgroundColor: "#313338",
        autoHideMenuBar: false,
        icon: __dirname + '/public/img/logo.ico',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    top.errWindow.loadFile("public/error.html").then(() => {
        if (err) {
            top.errWindow.webContents.send("sendErrDetails", {
                name: `${err.name}: ${err.message}`,
                message: getErrMessageFromName(err.message),
            });
        }
        top.errWindow.webContents.send("sendSettings", store.get("settings"));
        top.errWindow.show();
    })
}

function getErrMessageFromName(errName) {
    switch(errName) {
        case "Could not connect":
            return `<p>This error mostly occurs, when Discord isn't running on your pc. Make sure that you started discord and have the "Settings > Windows Settings > Minimize to Tray" enabled if you want to close Discord.</p><p>Read more about this error <button type="button" class="link" onclick="openExternalLink('https:\/\/tools.strassburger.org')">here</button>.</p>`;
        
        case "connection closed":
            return `<p>This error mostly occurs, when your application ID is wrong or you didn't enter any application ID at all. Make sure your app ID is correct and try again.</p><p>If you need help getting an application id, you can get help <button type="button" class="link" onclick="openExternalLink('https:\/\/tools.strassburger.org')">here</button>.</p>`;
    
        case "RPC_CONNECTION_TIMEOUT":
            return `<p>This error mostly occurs, when your activity has been updated too often. To resolve this error, just wait a few minutes or try completely restarting Discord.</p>`

        default:
            return `<p>This is an unexpected error. If this error continues to occurr, please report it on the <button type="button" class="link" onclick="openExternalLink('https:\/\/tools.strassburger.org/discord')">Support Discord</button></p>`;
    }
}

function openSettingsWindow() {
    if (top.settingsWindow && !top.settingsWindow.isDestroyed()) {
        top.settingsWindow.loadFile("public/settings.html").then(() => {
            // top.settingsWindow.webContents.send("sendErrDetails", {
            //     name: `${err.name}: ${err.message}`,
            //     message: getErrMessageFromName(err.message),
            // });
            top.settingsWindow.webContents.send("sendSettings", store.get("settings"));
        })
        top.settingsWindow.show();

        return;
    }

    top.settingsWindow = new BrowserWindow({
        title: "RPC Manager for Discord",
        center: true,
        width: 800,
        height: 800,
        minHeight: 500,
        minWidth: 500,
        frame: false,
        show: false,
        resizable: false,
        movable: true,
        autoHideMenuBar: false,
        icon: __dirname + '/public/img/logo.ico',
        backgroundColor: "#313338",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    top.settingsWindow.loadFile("public/settings.html").then(() => {
        top.settingsWindow.webContents.send("sendSettings", store.get("settings"));
    })
    top.settingsWindow.show();
}

function openLogsWindow() {
    if (top.logsWindow && !top.logsWindow.isDestroyed()) {
        top.logsWindow.loadFile("public/logs.html").then(() => {
            // top.logsWindow.webContents.send("sendErrDetails", {
            //     name: `${err.name}: ${err.message}`,
            //     message: getErrMessageFromName(err.message),
            // });
            top.logsWindow.webContents.send("sendLogs", store.get("logs"));
        })
        top.logsWindow.show();

        return;
    }

    top.logsWindow = new BrowserWindow({
        title: "RPC Manager for Discord",
        center: true,
        width: 500,
        height: 700,
        minHeight: 500,
        minWidth: 500,
        frame: false,
        show: false,
        resizable: false,
        movable: true,
        autoHideMenuBar: false,
        icon: __dirname + '/public/img/logo.ico',
        backgroundColor: "#313338",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    top.logsWindow.loadFile("public/logs.html").then(() => {
        top.logsWindow.webContents.send("sendLogs", store.get("logs"));
    })
    top.logsWindow.show();
}

function logAction(title, description, type) {
    if (!store.get("settings.createLogs")) return;

    let previousLogs = store.get("logs");

    if (!previousLogs) previousLogs = [];

    let currentTimestamp = new Date().getTime();

    if (!type || !availableLogTypes.includes(type)) {
        type = "neutral";
    }

    previousLogs.push({
        title: title,
        description: description,
        timestamp: currentTimestamp,
        type: type,
    });

    store.set("logs", previousLogs);
}