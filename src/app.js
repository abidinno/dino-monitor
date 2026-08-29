// Dino Dev Monitor Client Application with Multi-Language (TR / EN) Support

const state = {
    lang: localStorage.getItem('dino_lang') || 'tr',
    url: localStorage.getItem('dino_url') || 'http://localhost:5000',
    user: localStorage.getItem('dino_user') || 'abidino',
    pass: localStorage.getItem('dino_pass') || 'devdino11',
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

    // Boot / Connection
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
    setLanguage(state.lang);

    appendBootLog(t('bootReady'));
    appendBootLog(`${t('bootTarget')} ${state.url}`);
    
    // Test initial connection
    testConnection(false);
});

function initClock() {
    setInterval(() => {
        const now = new Date();
        elements.bootClock.innerText = now.toLocaleTimeString(state.lang === 'tr' ? 'tr-TR' : 'en-US');
    }, 1000);
}

function loadPreferences() {
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

    // Live Stream Toggle
    elements.btnLiveToggle.addEventListener('click', toggleLiveStream);

    // Boot / Connection
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

    elements.btnRefreshLogs.addEventListener('click', fetchServerData);
    elements.btnRefreshEnv.addEventListener('click', fetchServerData);
    elements.btnClearLogs.addEventListener('click', () => {
        state.currentLogs = [];
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
        logs = logs.filter(l => l.includes(`[${state.filterLevel}]`));
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
        if (log.includes('[HATA]')) color = 'var(--red)';
        else if (log.includes('[UYARI]')) color = 'var(--yellow)';
        else if (log.includes('[BİLGİ]')) color = '#79c0ff';

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
