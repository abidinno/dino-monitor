// Dino Dev Monitor Client Application with Multi-Language (TR / EN) Support

const state = {
    lang: localStorage.getItem('dino_lang') || 'tr',
    url: localStorage.getItem('dino_url') || 'http://localhost:5000',
    user: localStorage.getItem('dino_user') || 'abidino',
    pass: localStorage.getItem('dino_pass') || 'devdino11',

    // SSH Live Mode State
    connMode: localStorage.getItem('dino_conn_mode') || 'ssh', // 'ssh' or 'http'
    sshHost: localStorage.getItem('dino_ssh_host') || '',
    sshPort: localStorage.getItem('dino_ssh_port') || '22',
    sshUser: localStorage.getItem('dino_ssh_user') || 'root',
    sshPass: localStorage.getItem('dino_ssh_pass') || '',
    sshRemember: localStorage.getItem('dino_ssh_remember') !== 'false',
    sshAutoReconnect: localStorage.getItem('dino_ssh_auto_reconnect') !== 'false',
    sshIsConnected: false,
    sshSelectedTarget: 'all',
    pm2List: [],
    reconnectCountdown: 5,
    reconnectTimer: null,

    liveMode: false,
    pollIntervalMs: parseInt(localStorage.getItem('dino_interval')) || 2000,
    pollTimer: null,
    isPinned: false,
    autoScroll: true,
    filterLevel: 'ALL',
    searchTerm: '',
    dbSearchTerm: '',
    currentLogs: [],
    mainDbStats: [],
    extDbStats: null,
    isOnline: false,
    notificationsMode: localStorage.getItem('dino_notifications') || 'ALL',
    seenLogSignatures: new Set()
};

// Translation Helper
function t(key) {
    const dict = window.dinoI18n || {};
    const langDict = dict[state.lang] || dict['tr'] || {};
    return langDict[key] || key;
}

// --- DOM Elements ---
const elements = {
    quickLangSelect: document.getElementById('quick-lang-select'),
    settingLanguage: document.getElementById('setting-language'),
    navTabs: document.querySelectorAll('.nav-tab'),
    tabViews: document.querySelectorAll('.tab-view'),
    statusBadge: document.getElementById('status-badge'),
    statusText: document.getElementById('status-text'),
    btnLiveToggle: document.getElementById('btn-live-toggle'),
    liveText: document.getElementById('live-text'),
    btnPin: document.getElementById('btn-pin'),
    pinText: document.getElementById('pin-text'),
    btnConnectModal: document.getElementById('btn-connect-modal'),

    // Boot / Connection - Mode & Subforms
    tabModeSsh: document.getElementById('tab-mode-ssh'),
    tabModeHttp: document.getElementById('tab-mode-http'),
    formSshConnect: document.getElementById('form-ssh-connect'),
    formHttpConnect: document.getElementById('form-http-connect'),

    // SSH Inputs
    sshHost: document.getElementById('ssh-host'),
    sshPort: document.getElementById('ssh-port'),
    sshUser: document.getElementById('ssh-user'),
    sshPass: document.getElementById('ssh-pass'),
    btnToggleSshEye: document.getElementById('btn-toggle-ssh-eye'),
    sshRemember: document.getElementById('ssh-remember'),
    sshAutoReconnect: document.getElementById('ssh-auto-reconnect'),
    btnSshConnect: document.getElementById('btn-ssh-connect'),
    btnQuickSshDev: document.getElementById('btn-quick-ssh-dev'),

    // PM2 Site Selector
    sshSiteControls: document.getElementById('ssh-site-controls'),
    sshSiteSelect: document.getElementById('ssh-site-select'),
    btnRefreshPm2: document.getElementById('btn-refresh-pm2'),

    // SSH Reconnect Modal
    sshReconnectModal: document.getElementById('ssh-reconnect-modal'),
    reconnectModalTitle: document.getElementById('reconnect-modal-title'),
    sshDisconnectReason: document.getElementById('ssh-disconnect-reason'),
    sshCountdownBox: document.getElementById('ssh-countdown-box'),
    sshCountdownTimer: document.getElementById('ssh-countdown-timer'),
    btnModalReconnectNow: document.getElementById('btn-modal-reconnect-now'),
    btnModalCancel: document.getElementById('btn-modal-cancel'),

    // Boot / Connection - HTTP
    connUrl: document.getElementById('conn-url'),
    connUser: document.getElementById('conn-user'),
    connPass: document.getElementById('conn-pass'),
    btnTestConnect: document.getElementById('btn-test-connect'),
    btnQuickDev: document.getElementById('btn-quick-dev'),
    bootLogs: document.getElementById('boot-logs'),
    bootClock: document.getElementById('boot-clock'),

    // Dashboard Metrics
    mStatus: document.getElementById('m-status'),
    mUptime: document.getElementById('m-uptime'),
    mRam: document.getElementById('m-ram'),
    mNode: document.getElementById('m-node'),
    mLogCount: document.getElementById('m-log-count'),

    // Logs & Env
    logList: document.getElementById('log-list'),
    logSearch: document.getElementById('log-search'),
    filterBtns: document.querySelectorAll('.filter-btn[data-filter]'),
    btnScrollLock: document.getElementById('btn-scroll-lock'),
    btnRefreshLogs: document.getElementById('btn-refresh-logs'),
    btnClearLogs: document.getElementById('btn-clear-logs'),
    btnExportLogs: document.getElementById('btn-export-logs'),
    envList: document.getElementById('env-list'),
    btnRefreshEnv: document.getElementById('btn-refresh-env'),

    // Database Explorer
    dbSearch: document.getElementById('db-search'),
    btnRefreshDb: document.getElementById('btn-refresh-db'),
    dbTabs: document.querySelectorAll('.db-tab'),
    tabDbExt: document.getElementById('tab-db-ext'),
    tableDbMain: document.getElementById('table-db-main'),
    tableDbExt: document.getElementById('table-db-ext'),
    tbodyMain: document.getElementById('tbody-main'),
    tbodyExt: document.getElementById('tbody-ext'),

    // API Tester
    reqMethod: document.getElementById('req-method'),
    reqUrl: document.getElementById('req-url'),
    reqBody: document.getElementById('req-body'),
    btnSendReq: document.getElementById('btn-send-req'),
    sendText: document.getElementById('send-text'),
    btnFormatJson: document.getElementById('btn-format-json'),
    btnCopyRes: document.getElementById('btn-copy-res'),
    resStatusBadge: document.getElementById('res-status-badge'),
    resTime: document.getElementById('res-time'),
    resSize: document.getElementById('res-size'),
    resOutput: document.getElementById('res-output'),
    presetBtns: document.querySelectorAll('.btn-preset'),

    // Settings
    settingUrl: document.getElementById('setting-url'),
    settingInterval: document.getElementById('setting-interval'),
    settingAutoConnect: document.getElementById('setting-autoconnect'),
    settingNotifications: document.getElementById('setting-notifications'),
    btnTestNotif: document.getElementById('btn-test-notif'),
    btnSaveSettings: document.getElementById('btn-save-settings')
};

// --- Language Management ---
function setLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('dino_lang', lang);

    if (elements.quickLangSelect) elements.quickLangSelect.value = lang;
    if (elements.settingLanguage) elements.settingLanguage.value = lang;

    // Replace all static elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = t(key);
    });

    // Update dynamic state labels
    updateDynamicTranslations();
    renderLogs();
    renderDatabaseTables();
}

function updateDynamicTranslations() {
    elements.liveText.innerText = state.liveMode ? t('streamOn') : t('streamOff');
    elements.pinText.innerText = state.isPinned ? t('pinOn') : t('pinOff');
    elements.btnScrollLock.innerText = state.autoScroll ? t('autoScrollOn') : t('autoScrollOff');
    setOnlineStatus(state.isOnline);
}

// --- Initialization ---
window.addEventListener('DOMContentLoaded', () => {
    initClock();
    loadPreferences();
    setupEventListeners();
    setupSshListeners();
    setLanguage(state.lang);
    setConnectionMode(state.connMode);

    appendBootLog(t('bootReady'));
    if (state.connMode === 'ssh') {
        appendBootLog(`${t('bootTarget')} SSH [${state.sshUser}@${state.sshHost}:${state.sshPort}]`);
        if (state.sshPass) {
            connectSsh(false);
        }
    } else {
        appendBootLog(`${t('bootTarget')} HTTP [${state.url}]`);
        testConnection(false);
    }
});

function initClock() {
    setInterval(() => {
        const now = new Date();
        elements.bootClock.innerText = now.toLocaleTimeString(state.lang === 'tr' ? 'tr-TR' : 'en-US');
    }, 1000);
}

function loadPreferences() {
    // SSH Inputs
    if (elements.sshHost) elements.sshHost.value = state.sshHost;
    if (elements.sshPort) elements.sshPort.value = state.sshPort;
    if (elements.sshUser) elements.sshUser.value = state.sshUser;
    if (elements.sshPass) elements.sshPass.value = state.sshPass;
    if (elements.sshRemember) elements.sshRemember.checked = state.sshRemember;
    if (elements.sshAutoReconnect) elements.sshAutoReconnect.checked = state.sshAutoReconnect;

    // HTTP Inputs
    elements.connUrl.value = state.url;
    elements.connUser.value = state.user;
    elements.connPass.value = state.pass;
    elements.settingUrl.value = state.url;
    elements.settingInterval.value = state.pollIntervalMs;
    if (elements.settingNotifications) elements.settingNotifications.value = state.notificationsMode;
    if (elements.quickLangSelect) elements.quickLangSelect.value = state.lang;
    if (elements.settingLanguage) elements.settingLanguage.value = state.lang;
}

// --- Navigation Tabs ---
function switchTab(targetViewId) {
    elements.tabViews.forEach(view => {
        if (view.id === targetViewId) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    elements.navTabs.forEach(tab => {
        if (tab.dataset.tab === targetViewId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

function setupEventListeners() {
    // Language Switchers
    if (elements.quickLangSelect) {
        elements.quickLangSelect.addEventListener('change', (e) => setLanguage(e.target.value));
    }
    if (elements.settingLanguage) {
        elements.settingLanguage.addEventListener('change', (e) => setLanguage(e.target.value));
    }

    // Navigation
    elements.navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    elements.btnConnectModal.addEventListener('click', () => switchTab('view-connect'));

    // Always on top PIN toggle
    elements.btnPin.addEventListener('click', async () => {
        state.isPinned = !state.isPinned;
        if (window.electronAPI && window.electronAPI.toggleAlwaysOnTop) {
            const res = await window.electronAPI.toggleAlwaysOnTop(state.isPinned);
            state.isPinned = res;
        }
        elements.btnPin.classList.toggle('active', state.isPinned);
        elements.pinText.innerText = state.isPinned ? t('pinOn') : t('pinOff');
    });

    // Live Stream Toggle (HTTP Mode)
    elements.btnLiveToggle.addEventListener('click', toggleLiveStream);

    // Mode Switcher (SSH vs HTTP)
    if (elements.tabModeSsh) {
        elements.tabModeSsh.addEventListener('click', () => setConnectionMode('ssh'));
    }
    if (elements.tabModeHttp) {
        elements.tabModeHttp.addEventListener('click', () => setConnectionMode('http'));
    }

    // SSH Controls
    if (elements.btnToggleSshEye) {
        elements.btnToggleSshEye.addEventListener('click', toggleSshPassVisibility);
    }
    if (elements.btnQuickSshDev) {
        elements.btnQuickSshDev.addEventListener('click', fillQuickSshInfo);
    }
    if (elements.btnSshConnect) {
        elements.btnSshConnect.addEventListener('click', () => connectSsh(false));
    }
    if (elements.sshSiteSelect) {
        elements.sshSiteSelect.addEventListener('change', (e) => startSshLogStream(e.target.value));
    }
    if (elements.btnRefreshPm2) {
        elements.btnRefreshPm2.addEventListener('click', () => refreshPm2List());
    }

    // Reconnect Modal Controls
    if (elements.btnModalReconnectNow) {
        elements.btnModalReconnectNow.addEventListener('click', () => {
            hideReconnectModal();
            connectSsh(true);
        });
    }
    if (elements.btnModalCancel) {
        elements.btnModalCancel.addEventListener('click', () => hideReconnectModal());
    }

    // Boot / Connection - HTTP
    elements.btnTestConnect.addEventListener('click', () => testConnection(true));
    elements.btnQuickDev.addEventListener('click', () => {
        elements.connUrl.value = 'http://localhost:5000';
        elements.connUser.value = 'abidino';
        elements.connPass.value = 'devdino11';
        testConnection(true);
    });

    // Log Controls
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filterLevel = btn.dataset.filter;
            renderLogs();
        });
    });

    elements.logSearch.addEventListener('input', (e) => {
        state.searchTerm = e.target.value.toLowerCase();
        renderLogs();
    });

    elements.btnScrollLock.addEventListener('click', () => {
        state.autoScroll = !state.autoScroll;
        elements.btnScrollLock.innerText = state.autoScroll ? t('autoScrollOn') : t('autoScrollOff');
        elements.btnScrollLock.classList.toggle('active', state.autoScroll);
    });

    elements.btnRefreshLogs.addEventListener('click', () => {
        if (state.connMode === 'ssh') {
            refreshPm2List();
            renderLogs();
        } else {
            fetchServerData();
        }
    });
    elements.btnRefreshEnv.addEventListener('click', fetchServerData);
    elements.btnClearLogs.addEventListener('click', () => {
        state.currentLogs = [];
        elements.mLogCount.innerText = '0';
        renderLogs();
    });

    elements.btnExportLogs.addEventListener('click', exportLogs);

    // Database Explorer
    elements.dbSearch.addEventListener('input', (e) => {
        state.dbSearchTerm = e.target.value.toLowerCase();
        renderDatabaseTables();
    });

    elements.btnRefreshDb.addEventListener('click', fetchServerData);

    elements.dbTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.dbTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.dbtab;
            if (target === 'main') {
                elements.tableDbMain.style.display = 'table';
                elements.tableDbExt.style.display = 'none';
            } else {
                elements.tableDbMain.style.display = 'none';
                elements.tableDbExt.style.display = 'table';
            }
        });
    });

    // API Tester
    elements.btnSendReq.addEventListener('click', executeApiRequest);
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            if (document.getElementById('view-api-tester').classList.contains('active')) {
                executeApiRequest();
            }
        }
    });

    elements.btnFormatJson.addEventListener('click', () => {
        try {
            const raw = elements.reqBody.value.trim();
            if (raw) {
                const parsed = JSON.parse(raw);
                elements.reqBody.value = JSON.stringify(parsed, null, 2);
            }
        } catch (e) {
            alert(t('invalidJson') + ' ' + e.message);
        }
    });

    elements.btnCopyRes.addEventListener('click', () => {
        copyText(elements.resOutput.innerText);
    });

    elements.presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.reqMethod.value = btn.dataset.method;
            elements.reqUrl.value = state.url + btn.dataset.url;
            elements.reqBody.value = btn.dataset.body ? JSON.stringify(JSON.parse(btn.dataset.body), null, 2) : '';
        });
    });

    // Settings
    if (elements.btnTestNotif) {
        elements.btnTestNotif.addEventListener('click', () => {
            if (window.electronAPI && window.electronAPI.showNotification) {
                window.electronAPI.showNotification({
                    title: '🦖 Dino Dev Monitor',
                    body: 'Windows bildirim sistemi başarıyla çalışıyor! (Test Bildirimi)'
                });
            } else {
                alert('Electron bildirim desteği bu ortamda bulunamadı.');
            }
        });
    }

    elements.btnSaveSettings.addEventListener('click', () => {
        state.url = elements.settingUrl.value.trim();
        state.pollIntervalMs = parseInt(elements.settingInterval.value);
        state.lang = elements.settingLanguage.value;
        if (elements.settingNotifications) {
            state.notificationsMode = elements.settingNotifications.value;
            localStorage.setItem('dino_notifications', state.notificationsMode);
        }
        localStorage.setItem('dino_url', state.url);
        localStorage.setItem('dino_interval', state.pollIntervalMs);
        setLanguage(state.lang);
        alert(t('settingsSaved'));
    });
}

function appendBootLog(text) {
    const div = document.createElement('div');
    div.className = 'boot-line';
    div.innerText = text;
    elements.bootLogs.appendChild(div);
    elements.bootLogs.scrollTop = elements.bootLogs.scrollHeight;
}

// ─── SSH & PM2 Live Stream Management ──────────────────────────────────────────
function setConnectionMode(mode) {
    state.connMode = mode;
    localStorage.setItem('dino_conn_mode', mode);

    if (mode === 'ssh') {
        if (elements.tabModeSsh) elements.tabModeSsh.classList.add('active');
        if (elements.tabModeHttp) elements.tabModeHttp.classList.remove('active');
        if (elements.formSshConnect) elements.formSshConnect.style.display = 'block';
        if (elements.formHttpConnect) elements.formHttpConnect.style.display = 'none';
        if (elements.sshSiteControls) elements.sshSiteControls.style.display = 'flex';
    } else {
        if (elements.tabModeHttp) elements.tabModeHttp.classList.add('active');
        if (elements.tabModeSsh) elements.tabModeSsh.classList.remove('active');
        if (elements.formHttpConnect) elements.formHttpConnect.style.display = 'block';
        if (elements.formSshConnect) elements.formSshConnect.style.display = 'none';
        if (elements.sshSiteControls) elements.sshSiteControls.style.display = 'none';
    }
}

function toggleSshPassVisibility() {
    if (!elements.sshPass) return;
    const isPass = elements.sshPass.type === 'password';
    elements.sshPass.type = isPass ? 'text' : 'password';
    if (elements.btnToggleSshEye) {
        elements.btnToggleSshEye.innerText = isPass ? '🙈' : '👁️';
    }
}

function fillQuickSshInfo() {
    if (elements.sshPort) elements.sshPort.value = '22';
    if (elements.sshUser) elements.sshUser.value = 'root';
    if (elements.sshHost && !elements.sshHost.value) elements.sshHost.focus();
    else if (elements.sshPass) elements.sshPass.focus();
}

async function connectSsh(isReconnect = false) {
    if (elements.sshHost) state.sshHost = elements.sshHost.value.trim();
    if (elements.sshPort) state.sshPort = parseInt(elements.sshPort.value.trim()) || 22;
    if (elements.sshUser) state.sshUser = elements.sshUser.value.trim();
    if (elements.sshPass) state.sshPass = elements.sshPass.value;
    if (elements.sshRemember) state.sshRemember = elements.sshRemember.checked;
    if (elements.sshAutoReconnect) state.sshAutoReconnect = elements.sshAutoReconnect.checked;

    if (state.sshRemember) {
        localStorage.setItem('dino_ssh_host', state.sshHost);
        localStorage.setItem('dino_ssh_port', state.sshPort);
        localStorage.setItem('dino_ssh_user', state.sshUser);
        localStorage.setItem('dino_ssh_pass', state.sshPass);
        localStorage.setItem('dino_ssh_remember', 'true');
    } else {
        localStorage.removeItem('dino_ssh_pass');
        localStorage.setItem('dino_ssh_remember', 'false');
    }
    localStorage.setItem('dino_ssh_auto_reconnect', state.sshAutoReconnect ? 'true' : 'false');

    if (!state.sshHost || !state.sshUser) {
        alert('Lütfen Host ve Kullanıcı adı girin.');
        return;
    }

    if (elements.btnSshConnect) elements.btnSshConnect.disabled = true;
    appendBootLog(`${t('sshConnecting')} ${state.sshUser}@${state.sshHost}:${state.sshPort}...`);

    try {
        if (!window.electronAPI || !window.electronAPI.sshConnect) {
            throw new Error('Electron SSH API bulunamadı');
        }

        const res = await window.electronAPI.sshConnect({
            host: state.sshHost,
            port: state.sshPort,
            username: state.sshUser,
            password: state.sshPass
        });

        if (res.success) {
            state.sshIsConnected = true;
            setOnlineStatus(true);
            appendBootLog(t('sshConnected'));

            if (isReconnect) {
                hideReconnectModal();
                if (window.electronAPI.showNotification) {
                    window.electronAPI.showNotification({
                        title: '🦖 Dino Dev Monitor',
                        body: t('sshReconnected')
                    });
                }
                // Retain existing logs, just append reconnect marker
                state.currentLogs.push(`[${new Date().toLocaleTimeString()}] === 🔄 ${t('sshReconnected')} ===`);
                renderLogs();
            } else {
                setTimeout(() => switchTab('view-dashboard'), 400);
            }

            await refreshPm2List();
            await startSshLogStream(state.sshSelectedTarget || 'all');
        } else {
            state.sshIsConnected = false;
            setOnlineStatus(false);
            appendBootLog(`❌ [SSH FAIL] ${res.error || 'Bağlantı kurulamadı'}`);
            if (!isReconnect) {
                alert(`SSH Bağlantı Hatası: ${res.error || 'Bilinmeyen hata'}`);
            }
        }
    } catch (err) {
        state.sshIsConnected = false;
        setOnlineStatus(false);
        appendBootLog(`❌ [SSH ERROR] ${err.message}`);
        if (!isReconnect) {
            alert(`SSH Hatası: ${err.message}`);
        }
    } finally {
        if (elements.btnSshConnect) elements.btnSshConnect.disabled = false;
    }
}

async function refreshPm2List() {
    if (!state.sshIsConnected || !window.electronAPI || !window.electronAPI.sshGetPm2List) return;
    try {
        const res = await window.electronAPI.sshGetPm2List();
        if (res.success && Array.isArray(res.list)) {
            state.pm2List = res.list;
            renderPm2Dropdown(res.list);
        } else if (res.error) {
            appendBootLog(`⚠️ [PM2] ${res.error}`);
        }
    } catch (err) {
        console.error('PM2 list fetch error:', err);
    }
}

function renderPm2Dropdown(list) {
    const select = elements.sshSiteSelect;
    if (!select) return;
    const currentVal = state.sshSelectedTarget;
    select.innerHTML = `<option value="all">${t('pm2AllSites')}</option>`;

    list.forEach(proc => {
        const opt = document.createElement('option');
        opt.value = proc.name;
        const statusSymbol = proc.status === 'online' ? '🟢' : '🔴';
        opt.innerText = `${statusSymbol} ${proc.name} (id:${proc.id} | ${proc.memory}MB)`;
        select.appendChild(opt);
    });

    select.value = currentVal;
}

async function startSshLogStream(target = 'all') {
    if (!state.sshIsConnected || !window.electronAPI || !window.electronAPI.sshStreamLogs) return;
    try {
        state.sshSelectedTarget = target;
        appendBootLog(`${t('sshStreamStarted')} ${target}`);
        await window.electronAPI.sshStreamLogs({ target, lines: 50 });
    } catch (err) {
        console.error('Stream logs error:', err);
    }
}

function showReconnectModal(reason = '') {
    if (!elements.sshReconnectModal) return;
    if (elements.sshDisconnectReason) {
        elements.sshDisconnectReason.innerText = reason 
            ? `${t('modalSshDesc')} [${reason}]`
            : t('modalSshDesc');
    }

    elements.sshReconnectModal.style.display = 'flex';

    if (state.sshAutoReconnect) {
        if (elements.sshCountdownBox) elements.sshCountdownBox.style.display = 'flex';
        state.reconnectCountdown = 5;
        if (elements.sshCountdownTimer) elements.sshCountdownTimer.innerText = `${state.reconnectCountdown}s`;

        if (state.reconnectTimer) clearInterval(state.reconnectTimer);
        state.reconnectTimer = setInterval(() => {
            state.reconnectCountdown--;
            if (elements.sshCountdownTimer) elements.sshCountdownTimer.innerText = `${state.reconnectCountdown}s`;
            if (state.reconnectCountdown <= 0) {
                clearInterval(state.reconnectTimer);
                state.reconnectTimer = null;
                connectSsh(true);
            }
        }, 1000);
    } else {
        if (elements.sshCountdownBox) elements.sshCountdownBox.style.display = 'none';
    }
}

function hideReconnectModal() {
    if (state.reconnectTimer) {
        clearInterval(state.reconnectTimer);
        state.reconnectTimer = null;
    }
    if (elements.sshReconnectModal) {
        elements.sshReconnectModal.style.display = 'none';
    }
}

function setupSshListeners() {
    if (!window.electronAPI) return;

    if (window.electronAPI.onSshLogChunk) {
        window.electronAPI.onSshLogChunk((data) => {
            if (!data) return;
            const text = data.text || data.chunk || '';
            const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
            if (lines.length > 0) {
                state.currentLogs.push(...lines);
                if (state.currentLogs.length > 2000) {
                    state.currentLogs = state.currentLogs.slice(-2000);
                }
                elements.mLogCount.innerText = state.currentLogs.length;
                renderLogs();
                processLogNotifications(lines);
            }
        });
    }

    if (window.electronAPI.onSshStatus) {
        window.electronAPI.onSshStatus((statusData) => {
            if (statusData.status === 'closed' || statusData.status === 'ended' || statusData.status === 'error') {
                const wasConnected = state.sshIsConnected;
                state.sshIsConnected = false;
                setOnlineStatus(false);
                appendBootLog(`⚠️ ${t('sshDisconnectedNotice')} (${statusData.error || statusData.status})`);

                if (state.connMode === 'ssh' && wasConnected) {
                    showReconnectModal(statusData.error || statusData.status);
                }
            } else if (statusData.status === 'ready') {
                state.sshIsConnected = true;
                setOnlineStatus(true);
                hideReconnectModal();
            }
        });
    }
}

// --- Connection & Data Fetching ---
async function testConnection(shouldSwitch = false) {
    state.url = elements.connUrl.value.trim().replace(/\/+$/, '');
    state.user = elements.connUser.value.trim();
    state.pass = elements.connPass.value.trim();

    localStorage.setItem('dino_url', state.url);
    localStorage.setItem('dino_user', state.user);
    localStorage.setItem('dino_pass', state.pass);

    appendBootLog(`${t('testingConn')} ${state.url}/api/dino-logs/data ...`);

    try {
        const res = await fetch(`${state.url}/api/dino-logs/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ u: state.user, p: state.pass })
        });

        const data = await res.json();
        if (data.success) {
            setOnlineStatus(true);
            appendBootLog(t('connSuccess'));
            appendBootLog(`> Node: ${data.sysInfo.node_version} | Uptime: ${data.sysInfo.uptime}`);
            
            updateUIWithData(data);

            if (shouldSwitch) {
                setTimeout(() => {
                    switchTab('view-dashboard');
                    if (!state.liveMode) toggleLiveStream();
                }, 600);
            }
            return true;
        } else {
            setOnlineStatus(false);
            appendBootLog(`${t('accessDenied')} ${data.message || ''}`);
            return false;
        }
    } catch (err) {
        setOnlineStatus(false);
        appendBootLog(`${t('connError')} (${err.message})`);
        return false;
    }
}

async function fetchServerData() {
    try {
        const res = await fetch(`${state.url}/api/dino-logs/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ u: state.user, p: state.pass })
        });

        const data = await res.json();
        if (data.success) {
            setOnlineStatus(true);
            updateUIWithData(data);
        } else {
            setOnlineStatus(false);
        }
    } catch (e) {
        setOnlineStatus(false);
    }
}

function setOnlineStatus(online) {
    state.isOnline = online;
    if (online) {
        elements.statusBadge.className = 'badge-status badge-online';
        elements.statusText.innerText = t('statusOnline');
        elements.mStatus.innerText = t('statusOnline');
        elements.mStatus.style.color = 'var(--green)';
    } else {
        elements.statusBadge.className = 'badge-status badge-offline';
        elements.statusText.innerText = t('statusOffline');
        elements.mStatus.innerText = t('statusOffline');
        elements.mStatus.style.color = 'var(--red)';
    }
}

function toggleLiveStream() {
    state.liveMode = !state.liveMode;
    if (state.liveMode) {
        elements.btnLiveToggle.classList.add('active');
        elements.liveText.innerText = t('streamOn');
        fetchServerData();
        state.pollTimer = setInterval(fetchServerData, state.pollIntervalMs);
    } else {
        elements.btnLiveToggle.classList.remove('active');
        elements.liveText.innerText = t('streamOff');
        if (state.pollTimer) clearInterval(state.pollTimer);
    }
}

// --- Render Functions ---
function updateUIWithData(data) {
    // 1. System Metrics
    elements.mUptime.innerText = data.sysInfo.uptime || '--';
    elements.mRam.innerText = data.sysInfo.ram || '--';
    elements.mNode.innerText = data.sysInfo.node_version || '--';

    // 2. Logs
    if (Array.isArray(data.logs)) {
        state.currentLogs = data.logs;
        elements.mLogCount.innerText = data.logs.length;
        renderLogs();
        processLogNotifications(data.logs);
    }

    // 3. Database Explorer
    state.mainDbStats = data.dbStats || [];
    state.extDbStats = data.dbExtStats || null;
    renderDatabaseTables();

    // 4. Env Info
    if (data.envInfo) {
        renderEnvironment(data.envInfo);
    }
}

function processLogNotifications(newLogs) {
    if (state.notificationsMode === 'OFF' || !Array.isArray(newLogs)) return;
    if (!window.electronAPI || !window.electronAPI.showNotification) return;

    // İlk açılışta eski logları hafızaya al, bildirim patlamasını önle
    if (state.seenLogSignatures.size === 0) {
        newLogs.forEach(l => state.seenLogSignatures.add(l));
        return;
    }

    newLogs.forEach(logLine => {
        if (!state.seenLogSignatures.has(logLine)) {
            state.seenLogSignatures.add(logLine);

            const isError = logLine.includes('[ERROR]') || logLine.includes('[CRITICAL]') || logLine.includes('TypeError') || logLine.includes('Error:') || logLine.includes('Kritik');
            const isWarn = logLine.includes('[WARN]') || logLine.includes('Warning') || logLine.includes('Uyarı');

            if (isError && (state.notificationsMode === 'ALL' || state.notificationsMode === 'ERROR')) {
                const cleanSnippet = logLine.replace(/^\[[^\]]+\]\s*/, '').slice(0, 140);
                window.electronAPI.showNotification({
                    title: '🦖 Dino Monitor: Kritik Hata Algılandı!',
                    body: cleanSnippet || 'Sunucuda yeni bir hata yakalandı.'
                });
            } else if (isWarn && state.notificationsMode === 'ALL') {
                const cleanSnippet = logLine.replace(/^\[[^\]]+\]\s*/, '').slice(0, 140);
                window.electronAPI.showNotification({
                    title: '⚠️ Dino Monitor: Sistem Uyarısı',
                    body: cleanSnippet || 'Sistemde yeni bir uyarı kaydedildi.'
                });
            }
        }
    });

    if (state.seenLogSignatures.size > 2000) {
        state.seenLogSignatures.clear();
        newLogs.forEach(l => state.seenLogSignatures.add(l));
    }
}

function renderLogs() {
    let logs = state.currentLogs;

    // Filter by Level
    if (state.filterLevel !== 'ALL') {
        logs = logs.filter(l => {
            const up = l.toUpperCase();
            if (state.filterLevel === 'HATA') {
                return up.includes('[HATA]') || up.includes('[ERROR]') || up.includes('ERR') || up.includes('EXCEPTION') || up.includes('FAIL');
            } else if (state.filterLevel === 'UYARI') {
                return up.includes('[UYARI]') || up.includes('[WARN]') || up.includes('WARNING');
            } else if (state.filterLevel === 'BİLGİ') {
                return up.includes('[BİLGİ]') || up.includes('[INFO]') || up.includes('INFO:');
            }
            return up.includes(state.filterLevel);
        });
    }

    // Filter by Search Term
    if (state.searchTerm) {
        logs = logs.filter(l => l.toLowerCase().includes(state.searchTerm));
    }

    if (logs.length === 0) {
        elements.logList.innerHTML = `<div style="color:var(--text-secondary); text-align:center; padding:20px;">${t('noLogsMatching')}</div>`;
        return;
    }

    elements.logList.innerHTML = logs.map(log => {
        let color = 'var(--text-primary)';
        const up = log.toUpperCase();
        if (up.includes('[HATA]') || up.includes('[ERROR]') || up.includes('CRITICAL') || up.includes('TYPEERROR') || up.includes('EXCEPTION')) {
            color = 'var(--red)';
        } else if (up.includes('[UYARI]') || up.includes('[WARN]') || up.includes('WARNING')) {
            color = 'var(--yellow)';
        } else if (up.includes('[BİLGİ]') || up.includes('[INFO]')) {
            color = '#79c0ff';
        } else if (log.includes('=== 🔄') || up.includes('CONNECTED') || up.includes('[SSH OK]')) {
            color = 'var(--green)';
        }

        return `
            <div class="log-item">
                <span class="log-text" style="color:${color}">${escapeHtml(log)}</span>
                <button class="log-copy-btn" onclick="copyLogLine(this)">${t('copyBtn')}</button>
            </div>
        `;
    }).join('');

    if (state.autoScroll) {
        elements.logList.scrollTop = elements.logList.scrollHeight;
    }
}

function renderDatabaseTables() {
    const filter = state.dbSearchTerm;

    // Main Tables
    const filteredMain = state.mainDbStats.filter(t => !filter || t.name.toLowerCase().includes(filter));
    elements.tbodyMain.innerHTML = filteredMain.map(t => `
        <tr>
            <td style="color:var(--yellow); font-weight:bold;">${t.name}</td>
            <td>${t.rows}</td>
            <td>${t.dataSize}</td>
            <td>${t.indexSize || '—'}</td>
        </tr>
    `).join('');

    // Secondary Tables
    if (state.extDbStats) {
        elements.tabDbExt.style.display = 'block';
        const filteredExt = state.extDbStats.filter(t => !filter || t.name.toLowerCase().includes(filter));
        elements.tbodyExt.innerHTML = filteredExt.map(t => `
            <tr>
                <td style="color:var(--blue); font-weight:bold;">${t.name}</td>
                <td>${t.rows}</td>
                <td>${t.dataSize}</td>
                <td>${t.indexSize || '—'}</td>
            </tr>
        `).join('');
    } else {
        elements.tabDbExt.style.display = 'none';
    }
}

function renderEnvironment(envInfo) {
    elements.envList.innerHTML = Object.entries(envInfo).map(([key, val]) => `
        <div class="env-row">
            <span class="env-key">${escapeHtml(key)}:</span>
            <span class="env-val">${escapeHtml(String(val))}</span>
        </div>
    `).join('');
}

// --- API Tester Logic (Postman-Lite) ---
async function executeApiRequest() {
    const method = elements.reqMethod.value;
    let url = elements.reqUrl.value.trim();
    const bodyText = elements.reqBody.value.trim();

    if (!url) {
        alert(t('urlRequired'));
        return;
    }

    elements.sendText.innerText = t('btnSending');
    elements.btnSendReq.disabled = true;

    const startTime = performance.now();

    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (['POST', 'PUT', 'PATCH'].includes(method) && bodyText) {
            options.body = bodyText;
        }

        const response = await fetch(url, options);
        const elapsedMs = Math.round(performance.now() - startTime);

        elements.resTime.innerText = `${elapsedMs} ms`;
        elements.resStatusBadge.innerText = `${response.status} ${response.statusText}`;

        if (response.ok) {
            elements.resStatusBadge.className = 'res-tag res-tag-success';
        } else {
            elements.resStatusBadge.className = 'res-tag res-tag-error';
        }

        const rawText = await response.text();
        elements.resSize.innerText = `${(new Blob([rawText]).size / 1024).toFixed(2)} KB`;

        try {
            const parsed = JSON.parse(rawText);
            elements.resOutput.innerText = JSON.stringify(parsed, null, 2);
        } catch {
            elements.resOutput.innerText = rawText;
        }

    } catch (err) {
        const elapsedMs = Math.round(performance.now() - startTime);
        elements.resTime.innerText = `${elapsedMs} ms`;
        elements.resStatusBadge.innerText = `ERR`;
        elements.resStatusBadge.className = 'res-tag res-tag-error';
        elements.resOutput.innerText = `${t('reqError')} ${err.message}`;
    } finally {
        elements.sendText.innerText = t('btnSend');
        elements.btnSendReq.disabled = false;
    }
}

// --- Utilities ---
function copyText(text) {
    if (window.electronAPI && window.electronAPI.copyText) {
        window.electronAPI.copyText(text);
    } else {
        navigator.clipboard.writeText(text);
    }
}

window.copyLogLine = function(btn) {
    const logText = btn.previousElementSibling.innerText;
    copyText(logText);
    const orig = btn.innerText;
    btn.innerText = t('copiedBtn');
    btn.style.color = 'var(--green)';
    setTimeout(() => {
        btn.innerText = orig;
        btn.style.color = '';
    }, 1200);
};

function exportLogs() {
    if (state.currentLogs.length === 0) {
        alert(t('noExportLogs'));
        return;
    }
    const blob = new Blob([state.currentLogs.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dino-logs-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
