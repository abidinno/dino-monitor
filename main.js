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

// ─── SSH2 CONNECTION & STREAMING MANAGER ──────────────────────────────────────
const { Client: SSHClient } = require('ssh2');

let sshClient = null;
let activeLogStream = null;
let isIntentionalDisconnect = false;

function cleanSshState() {
    if (activeLogStream) {
        try { activeLogStream.close(); } catch (e) {}
        activeLogStream = null;
    }
    if (sshClient) {
        try { sshClient.end(); } catch (e) {}
        sshClient = null;
    }
}

ipcMain.handle('ssh-connect', async (event, config) => {
    cleanSshState();
    isIntentionalDisconnect = false;

    return new Promise((resolve) => {
        const conn = new SSHClient();
        let isResolved = false;

        conn.on('ready', () => {
            sshClient = conn;
            isResolved = true;
            resolve({ success: true });
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('ssh-status', { status: 'ready' });
            }
        });

        conn.on('error', (err) => {
            console.error('SSH Connection Error:', err.message);
            if (!isResolved) {
                isResolved = true;
                resolve({ success: false, error: err.message });
            }
            if (mainWindow && !mainWindow.isDestroyed() && !isIntentionalDisconnect) {
                mainWindow.webContents.send('ssh-status', { status: 'error', error: err.message });
            }
        });

        conn.on('close', () => {
            if (mainWindow && !mainWindow.isDestroyed() && !isIntentionalDisconnect) {
                mainWindow.webContents.send('ssh-status', { status: 'closed' });
            }
            cleanSshState();
        });

        conn.on('end', () => {
            if (mainWindow && !mainWindow.isDestroyed() && !isIntentionalDisconnect) {
                mainWindow.webContents.send('ssh-status', { status: 'ended' });
            }
            cleanSshState();
        });

        try {
            conn.connect({
                host: config.host || '127.0.0.1',
                port: Number(config.port) || 22,
                username: config.username || 'root',
                password: config.password,
                keepaliveInterval: 10000,
                keepaliveCountMax: 6,
                readyTimeout: 20000
            });
        } catch (e) {
            if (!isResolved) {
                isResolved = true;
                resolve({ success: false, error: e.message });
            }
        }
    });
});

// Helper: SSH non-interactive oturumlarda NVM ve PATH ortam değişkenlerini yükler
function prepareSshCommand(cmd) {
    const envInit = [
        'export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"',
        'export NVM_DIR="$HOME/.nvm"',
        '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"',
        'export PATH="$PATH:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$HOME/.npm-global/bin:$HOME/.nvm/current/bin:$HOME/.fnm/current/bin:$HOME/.n/bin"'
    ].join('; ');

    return `${envInit}; ${cmd}`;
}

ipcMain.handle('ssh-disconnect', () => {
    isIntentionalDisconnect = true;
    cleanSshState();
    return { success: true };
});

ipcMain.handle('ssh-get-pm2-list', async () => {
    if (!sshClient) return { success: false, error: 'SSH bağlantısı aktif değil' };

    const command = prepareSshCommand('pm2 jlist');

    return new Promise((resolve) => {
        sshClient.exec(command, (err, stream) => {
            if (err) return resolve({ success: false, error: err.message });

            let data = '';
            let errData = '';
            stream.on('data', chunk => { data += chunk.toString('utf-8'); });
            stream.stderr.on('data', chunk => { errData += chunk.toString('utf-8'); });
            stream.on('close', () => {
                try {
                    const firstBracket = data.indexOf('[');
                    const lastBracket = data.lastIndexOf(']');
                    let jsonStr = data;
                    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                        jsonStr = data.substring(firstBracket, lastBracket + 1);
                    }
                    const list = JSON.parse(jsonStr);
                    const parsed = list.map(p => ({
                        id: p.pm_id,
                        name: p.name,
                        status: p.pm2_env?.status || 'unknown',
                        cpu: p.monit?.cpu || 0,
                        memory: Math.round((p.monit?.memory || 0) / (1024 * 1024)),
                        uptime: p.pm2_env?.pm_uptime || 0
                    }));
                    resolve({ success: true, list: parsed });
                } catch (parseErr) {
                    const errorMsg = errData.trim() || parseErr.message;
                    resolve({ success: false, error: 'PM2 listesi alınamadı: ' + errorMsg });
                }
            });
        });
    });
});

ipcMain.handle('ssh-stream-logs', async (event, { target = 'all', lines = 50 }) => {
    if (!sshClient) return { success: false, error: 'SSH bağlantısı aktif değil' };

    if (activeLogStream) {
        try { activeLogStream.close(); } catch (e) {}
        activeLogStream = null;
    }

    const baseCmd = (target === 'all' || !target)
        ? `pm2 logs --lines ${lines} --raw`
        : `pm2 logs "${target}" --lines ${lines} --raw`;

    const command = prepareSshCommand(baseCmd);

    return new Promise((resolve) => {
        sshClient.exec(command, (err, stream) => {
            if (err) return resolve({ success: false, error: err.message });

            activeLogStream = stream;
            resolve({ success: true, command });

            stream.on('data', chunk => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('ssh-log-chunk', { text: chunk.toString('utf-8') });
                }
            });

            stream.stderr.on('data', chunk => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('ssh-log-chunk', { text: chunk.toString('utf-8'), isErr: true });
                }
            });

            stream.on('close', () => {
                if (activeLogStream === stream) activeLogStream = null;
            });
        });
    });
});
