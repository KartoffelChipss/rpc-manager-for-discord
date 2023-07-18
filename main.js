const {app, BrowserWindow, Tray, Notification, nativeImage, Menu, MenuItem, globalShortcut, webContents, screen, clipboard, session} = require('electron')
const { webFrame, ipcRenderer } = require('electron/renderer')
const path = require('path')
const fetch = require('cross-fetch'); // required 'fetch'
const { ipcMain } = require('electron/main');
const Store = require('electron-store');
const RPC = require("discord-rpc");

const storeSchema = require("./storeSchema.json");

const store = new Store();
//store.openInEditor()

let client;

// let fakeClient = new RPC.Client()

// fakeClient.setActivity({
//     partyMax: 1,
//     partySize: 1,
// })

let top = {};
let systemTrayMsgSent = false;

app.whenReady().then(async () => {
    const screenHeight = screen.getPrimaryDisplay().workAreaSize.height;
    const screenWidth = screen.getPrimaryDisplay().workAreaSize.width;

    const windowWidth = 1200;
    const windowHeight = 950;

    let x = (screenWidth / 2) - (windowWidth / 2);
    let y = (screenHeight / 2) - (windowHeight / 2);

    top.mainWindow = new BrowserWindow({
        title: "Discord Custom RP Deluxe",
        width: windowWidth,
        height: windowHeight,
        y: y,
        x: x,
        frame: false,
        show: false,
        resizable: true,
        autoHideMenuBar: false,
        icon: __dirname + '/assets/typhon_colored_900x900.ico',
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
    
    top.mainWindow.show();
    
    top.tray = new Tray(nativeImage.createEmpty());

    const menu = Menu.buildFromTemplate([
        {
            label: "Open Menu",
            click: (item, window, event) => {
                top.mainWindow.show();
            }
        },
        {
            type: "separator"
        },
        {
            label: "Terminate",
            role: "quit"
        },
    ]);

    top.tray.setToolTip("Discord Custom Rich Presence");
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
                body: 'Discord Custom RP now lives in your System Tray!',
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

        let activityObject = {
            details: undefinedIfEmpty(arg.details),
            state: undefinedIfEmpty(arg.state),
            largeImageKey: undefinedIfEmpty(arg.large_image),
            largeImageText: undefinedIfEmpty(arg.large_text),
            smallImageKey: undefinedIfEmpty(arg.small_image),
            smallImageText: undefinedIfEmpty(arg.small_text),
            buttons: buttons,
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

            console.log(store.get())

            top.mainWindow.webContents.send("appConnectionSuccess", {});
        })
}