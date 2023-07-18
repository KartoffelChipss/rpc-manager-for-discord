const {app, BrowserWindow, Tray, Notification, nativeImage, Menu, shell, screen} = require('electron')
const path = require('path')
const fetch = require('cross-fetch');
const { ipcMain } = require('electron/main');
const Store = require('electron-store');
const RPC = require("discord-rpc");
var AutoLaunch = require('auto-launch');

const storeSchema = require("./storeSchema.json");

const store = new Store();
//store.openInEditor()

let appStartTime = new Date().getTime();
let lastUpdate = new Date().getTime();

let client;

let top = {};
let systemTrayMsgSent = false;

app.whenReady().then(async () => {
    if (process.platform === 'win32') {
        app.setAppUserModelId("Discord Custom RP Plus");
    }

    const screenHeight = screen.getPrimaryDisplay().workAreaSize.height;
    const screenWidth = screen.getPrimaryDisplay().workAreaSize.width;

    const windowWidth = 1300;
    const windowHeight = 1050;

    let x = (screenWidth / 2) - (windowWidth / 2);
    let y = (screenHeight / 2) - (windowHeight / 2);

    top.mainWindow = new BrowserWindow({
        title: "Discord Custom RP Plus",
        width: windowWidth,
        height: windowHeight,
        y: y,
        x: x,
        minHeight: 600,
        minWidth: 850,
        frame: false,
        show: false,
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
        top.mainWindow.webContents.send("sendStorageData", store.get())
        connectApp(store.get("appid"));
    })


    // !!! COMMENT OUT FOR DEVELOPMENT !!! //

    top.mainWindow.removeMenu();

    // !!! COMMENT OUT FOR DEVELOPMENT !!! //
    
    top.mainWindow.show();

    let autoLaunch = new AutoLaunch({
        name: 'Discord Custom RP Plus',
        path: app.getPath('exe'),
    });

    autoLaunch.isEnabled().then((isEnabled) => {
        if (!isEnabled) autoLaunch.enable();
    });
    
    top.tray = new Tray(__dirname + '/public/img/logo.ico');

    const menu = Menu.buildFromTemplate([
        {
            label: "Help",
            icon: nativeImage.createFromPath(__dirname + '/public/img/icons/help.ico').resize({width:16}),
            click: (item, window, event) => {
                shell.openExternal("http://www.google.com")
            }
        },
        {
            label: "Open Menu",
            icon: nativeImage.createFromPath(__dirname + '/public/img/icons/home.ico').resize({width:16}),
            click: (item, window, event) => {
                top.mainWindow.show();
            },
        },
        {
            label: "Update Activity",
            icon: nativeImage.createFromPath(__dirname + '/public/img/icons/reload.ico').resize({width:16}),
            click: (item, window, event) => {
                updateDCActivity(store.get("config"));
                item.enabled = false;
                item.toolTip = "Wait a moment before doing this again!"

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
            label: "Terminate",
            icon: nativeImage.createFromPath(__dirname + '/public/img/icons/off.ico').resize({width:16}),
            role: "quit"
        },
    ]);

    top.tray.setToolTip("Discord Custom RP Plus");
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
                body: 'Discord Custom RP Plus now lives in your System Tray!',
            });
            trayNotification.show();
            systemTrayMsgSent = true;
        }
    });

    // let clientId = store.get("appid");

    // client = new RPC.Client({ transport: "ipc" })

    // let partyPlayers = store.get("config.party_players");
    // if (partyPlayers === -1) partyPlayers = undefined;

    // let partyMaxPlayers = store.get("config.party_maxplayers");
    // if (partyMaxPlayers === -1) partyMaxPlayers = undefined;

    // client.on("ready", () => {
    //     updateDCActivity(store.get("config"));
    // });

    // client.login({
    //     clientId: clientId
    // }).catch(err => {
    //     if (err) console.log(err)
    // })

    ipcMain.handle('updateActivity', (event, arg) => {
        updateDCActivity(arg);

        store.set("config", arg);

        console.log("Saved new Config")
    });


    ipcMain.handle('connectApp', (event, arg) => {
        connectApp(arg.appid);
    });

    ipcMain.handle("disconnectApp", (event, arg) => {
        client.destroy();
        client = undefined;
    });
})

app.on("before-quit", ev => {
    top.win.removeAllListeners("close");
    top = null;
});

function updateClient() {
    if (client) client.destroy();

    let clientId = store.get("appid");

    client = new RPC.Client({ transport: "ipc" })

    client.on("ready", () => {
        updateDCActivity(store.get("config"));

        console.log("Set activbity to the following:")
        console.log(store.get("config"))
    });

    client.login({
        clientId: clientId
    }).catch(err => {
        if (err) console.log(err);
    })
}

function undefinedIfEmpty(str) {
    if (!str || str.length === 0) return undefined
    else return str
}

function updateDCActivity(arg) {
    if (client) {
        lastUpdate = new Date().getTime();

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
        })
}