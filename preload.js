const {
    contextBridge,
    ipcRenderer
} = require("electron");

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }
})

contextBridge.exposeInMainWorld(
    "api", {
        invoke: (channel, data) => {
            let validChannels = ["minimize", "togglemaxwindow", "closeWindow", "updateActivity", "connectApp", "disconnectApp", "openExternalLink", "closeErrWindow", "closeSettingsWindow", "openSettingsWindow", "changeTheme", "changeZoom"];
            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, data); 
            }
        }
    }
);

contextBridge.exposeInMainWorld(
    'bridge', {
        // From main to render
        sendStorageData: (message) => {
            ipcRenderer.on('sendStorageData', message);
        },

        appConnectionSuccess: (message) => {
            ipcRenderer.on('appConnectionSuccess', message);
        },

        appConnectionFailure: (message) => {
            ipcRenderer.on('appConnectionFailure', message);
        },

        sendErrDetails: (message) => {
            ipcRenderer.on('sendErrDetails', message);
        },

        sendSettings: (message) => {
            ipcRenderer.on('sendSettings', message);
        }
    }
);