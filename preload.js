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
            let validChannels = ["minimize", "togglemaxwindow", "closeWindow", "updateActivity", "connectApp"]; // list of ipcMain.handle channels you want access in frontend to
            if (validChannels.includes(channel)) {
                // ipcRenderer.invoke accesses ipcMain.handle channels like 'myfunc'
                // make sure to include this return statement or you won't get your Promise back
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
        }
    }
)

contextBridge.exposeInMainWorld(
    'appConnectionSuccess', {
        // From main to render
        sendStorageData: (message) => {
            ipcRenderer.on('appConnectionSuccess', message);
        }
    }
)

contextBridge.exposeInMainWorld(
    'appConnectionFailure', {
        // From main to render
        sendStorageData: (message) => {
            ipcRenderer.on('appConnectionFailure', message);
        }
    }
)