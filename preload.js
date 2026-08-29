const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),
    toggleAlwaysOnTop: (flag) => ipcRenderer.invoke('toggle-always-on-top', flag),
    copyText: (text) => ipcRenderer.invoke('copy-text', text),
    showNotification: (options) => ipcRenderer.invoke('show-notification', options)
});
