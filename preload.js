const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),
    toggleAlwaysOnTop: (flag) => ipcRenderer.invoke('toggle-always-on-top', flag),
    copyText: (text) => ipcRenderer.invoke('copy-text', text),
    showNotification: (options) => ipcRenderer.invoke('show-notification', options),
    
    // SSH API
    sshConnect: (config) => ipcRenderer.invoke('ssh-connect', config),
    sshDisconnect: () => ipcRenderer.invoke('ssh-disconnect'),
    sshGetPm2List: () => ipcRenderer.invoke('ssh-get-pm2-list'),
    sshStreamLogs: (options) => ipcRenderer.invoke('ssh-stream-logs', options),
    onSshLogChunk: (callback) => ipcRenderer.on('ssh-log-chunk', (event, data) => callback(data)),
    onSshStatus: (callback) => ipcRenderer.on('ssh-status', (event, data) => callback(data)),
    removeSshListeners: () => {
        ipcRenderer.removeAllListeners('ssh-log-chunk');
        ipcRenderer.removeAllListeners('ssh-status');
    }
});
