const { app, BrowserWindow, ipcMain, clipboard, shell, Notification } = require('electron');
const path = require('path');

// Windows Bildirimleri için App User Model ID
if (process.platform === 'win32') {
    app.setAppUserModelId('Dino.Dev.Monitor');
}

let mainWindow;

function createWindow() {
    const iconPath = path.join(__dirname, 'assets', 'app-icon.svg');

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 840,
        minWidth: 900,
        minHeight: 600,
        icon: iconPath,
        backgroundColor: '#0d1117',
        title: '🦖 Dino Dev Monitor & Command Center',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        },
        autoHideMenuBar: true
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

    // Open links in external browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handlers
ipcMain.handle('get-app-info', () => {
    return {
        name: 'Dino Dev Monitor',
        version: app.getVersion(),
        nodeVersion: process.versions.node,
        electronVersion: process.versions.electron,
        platform: process.platform
    };
});

ipcMain.handle('toggle-always-on-top', (event, flag) => {
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(flag);
        return mainWindow.isAlwaysOnTop();
    }
    return false;
});

ipcMain.handle('copy-text', (event, text) => {
    clipboard.writeText(text);
    return true;
});

ipcMain.handle('show-notification', (event, { title, body, silent = false }) => {
    if (Notification.isSupported()) {
        const notif = new Notification({
            title: title || '🦖 Dino Dev Monitor',
            body: body || '',
            icon: path.join(__dirname, 'assets', 'app-icon.svg'),
            silent: silent
        });
        notif.show();
        notif.on('click', () => {
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.focus();
            }
        });
        return true;
    }
    return false;
});
