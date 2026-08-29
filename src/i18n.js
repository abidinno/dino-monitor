// Dino Monitor Localization / Dil Dosyası (TR / EN)

const translations = {
    tr: {
        appName: "DINO-MONITOR",
        version: "v1.0",
        
        // Header
        tabLogs: "Loglar & Panel",
        tabDb: "Veritabanı Gezgini",
        tabApiTester: "API Test Aracı",
        tabSettings: "Ayarlar",
        statusOnline: "ONLINE",
        statusOffline: "OFFLINE",
        streamOn: "AKIS: AÇIK",
        streamOff: "AKIS: KAPALI",
        pinOn: "SABİT",
        pinOff: "SABİTLE",
        serverBtn: "Sunucu",

        // Boot / Connect View
        terminalTitle: "🦖 DINO TERMINAL BAĞLANTISI",
        bootInit: "> Dino Monitor alt sistemi başlatılıyor...",
        bootReady: "> Dino Monitor v1.0.0 hazır.",
        bootTarget: "> Hedef API:",
        serverUrlLabel: "Backend Sunucu URL",
        usernameLabel: "Kullanıcı Adı",
        passwordLabel: "Şifre",
        btnConnect: "BAĞLAN VE DOĞRULA",
        btnQuickDev: "⚡ Hızlı Geliştirici Modu",
        testingConn: "> [AUTH] Bağlantı sınanıyor:",
        connSuccess: "> [OK] BAĞLANTI BAŞARILI / CONNECTED! 🦖",
        accessDenied: "> [FAIL] Giriş reddedildi:",
        connError: "> [ERROR] Sunucuya ulaşılamadı. Backend açık mı?",

        // Dashboard Metrics
        serverStatus: "Sunucu Durumu",
        serverUptime: "Sunucu Çalışma Süresi",
        ramUsage: "RAM Kullanımı (RSS)",
        nodeRuntime: "Node Çalışma Zamanı",
        totalLogCount: "Toplam Log Sayısı",

        // Logs Panel
        systemLogStream: "SİSTEM LOG AKIŞI",
        filterAll: "HEPSİ",
        filterErr: "HATA",
        filterWarn: "UYARI",
        filterInfo: "BİLGİ",
        filterPlaceholder: "🔍 Loglarda ara...",
        autoScrollOn: "⬇️ Otomatik",
        autoScrollOff: "⏸️ Duraklatıldı",
        clearBtn: "🗑️ Temizle",
        exportBtn: "💾 Dışa Aktar",
        waitingConn: "Bağlantı bekleniyor... (Akışı başlatmak için Bağlan'a basın)",
        noLogsMatching: "Filtreye uygun log kaydı bulunamadı.",
        copyBtn: "KOPYALA",
        copiedBtn: "ALINDI! ✅",
        noExportLogs: "Dışa aktarılacak log bulunmuyor.",

        // Safe Env Panel
        safeEnvTitle: "GÜVENLİ ORTAM DEĞİŞKENLERİ (ENV)",
        envNotLoaded: "Bilgiler yüklenmedi",

        // DB Explorer
        dbExplorerTitle: "VERİTABANI TABLOLARI & METRİKLER",
        dbSearchPlaceholder: "Tablolarda ara...",
        refreshDbBtn: "🔄 DB Yenile",
        mainDbTab: "ANA VERİTABANI",
        secondaryDbTab: "İKİNCİL VERİTABANI",
        colTableName: "TABLO ADI",
        colRowCount: "SATIR SAYISI",
        colDataSize: "VERİ BOYUTU",
        colIndexSize: "İNDEKS BOYUTU",

        // API Tester
        quickPresets: "Hızlı Şablonlar:",
        presetLogsData: "Dino Log Verisi",
        presetLogsStatus: "Dino Log Durumu",
        presetApiRoot: "API Kök Dizin",
        btnSend: "GÖNDER (Ctrl+Enter)",
        btnSending: "⏳ GÖNDERİLİYOR...",
        reqBodyTab: "İstek Gövdesi (JSON)",
        reqHeadersTab: "Başlıklar (Headers)",
        btnFormatJson: "✨ JSON Düzenle",
        btnCopyResponse: "📋 Yanıtı Kopyala",
        responsePlaceholder: "// API yanıtı burada görüntülenecektir...",
        urlRequired: "Lütfen geçerli bir URL girin",
        invalidJson: "Geçersiz JSON formatı:",
        reqError: "İstek Hatası:",

        // Settings
        settingsTitle: "Dino Monitor Tercihleri",
        languageLabel: "Uygulama Dili / Language",
        defaultUrlLabel: "Varsayılan Backend URL",
        pollingIntervalLabel: "Canlı Akış Yoklama Sıklığı",
        interval1s: "1 Saniye (Çok Hızlı)",
        interval2s: "2 Saniye (Önerilen)",
        interval5s: "5 Saniye (Hafif)",
        autoConnectLabel: "Başlangıçta Otomatik Bağlan",
        notificationsLabel: "Windows Bildirimleri (Toast)",
        notifAll: "Hatalar ve Uyarılar",
        notifErrorsOnly: "Sadece Kritik Hatalar",
        notifDisabled: "Devre Dışı",
        btnTestNotif: "🔔 Test Bildirimi Gönder",
        optEnabled: "Etkin",
        optDisabled: "Devre Dışı",
        btnSaveSettings: "💾 Tercihleri Kaydet",
        settingsSaved: "Ayarlar başarıyla kaydedildi!"
    },

    en: {
        appName: "DINO-MONITOR",
        version: "v1.0",
        
        // Header
        tabLogs: "Logs & Dashboard",
        tabDb: "Database Explorer",
        tabApiTester: "API Tester",
        tabSettings: "Settings",
        statusOnline: "ONLINE",
        statusOffline: "OFFLINE",
        streamOn: "STREAM: ON",
        streamOff: "STREAM: OFF",
        pinOn: "PINNED",
        pinOff: "PIN",
        serverBtn: "Server",

        // Boot / Connect View
        terminalTitle: "🦖 DINO TERMINAL CONNECTION",
        bootInit: "> Initializing Dino Monitor subsystem...",
        bootReady: "> Dino Monitor v1.0.0 ready.",
        bootTarget: "> Target API:",
        serverUrlLabel: "Backend Server URL",
        usernameLabel: "Username",
        passwordLabel: "Password",
        btnConnect: "CONNECT & VERIFY",
        btnQuickDev: "⚡ Quick Dev Mode",
        testingConn: "> [AUTH] Testing connection:",
        connSuccess: "> [OK] CONNECTION SUCCESSFUL / CONNECTED! 🦖",
        accessDenied: "> [FAIL] Access Denied:",
        connError: "> [ERROR] Server unreachable. Is backend running?",

        // Dashboard Metrics
        serverStatus: "Server Status",
        serverUptime: "Server Uptime",
        ramUsage: "RAM Usage (RSS)",
        nodeRuntime: "Node Runtime",
        totalLogCount: "Total Log Count",

        // Logs Panel
        systemLogStream: "SYSTEM LOG STREAM",
        filterAll: "ALL",
        filterErr: "ERR",
        filterWarn: "WARN",
        filterInfo: "INFO",
        filterPlaceholder: "🔍 Filter logs...",
        autoScrollOn: "⬇️ Auto",
        autoScrollOff: "⏸️ Paused",
        clearBtn: "🗑️ Clear",
        exportBtn: "💾 Export",
        waitingConn: "Waiting for connection... (Press Connect to start streaming)",
        noLogsMatching: "No log records found matching the filter.",
        copyBtn: "COPY",
        copiedBtn: "COPIED! ✅",
        noExportLogs: "No logs available to export.",

        // Safe Env Panel
        safeEnvTitle: "SAFE ENVIRONMENT CONFIG (ENV)",
        envNotLoaded: "Information not loaded",

        // DB Explorer
        dbExplorerTitle: "DATABASE TABLES & METRICS",
        dbSearchPlaceholder: "Search tables...",
        refreshDbBtn: "🔄 Refresh DB",
        mainDbTab: "MAIN DATABASE",
        secondaryDbTab: "SECONDARY DB",
        colTableName: "TABLE NAME",
        colRowCount: "ROW COUNT",
        colDataSize: "DATA SIZE",
        colIndexSize: "INDEX SIZE",

        // API Tester
        quickPresets: "Quick Presets:",
        presetLogsData: "Dino Logs Data",
        presetLogsStatus: "Dino Logs Status",
        presetApiRoot: "API Root",
        btnSend: "SEND (Ctrl+Enter)",
        btnSending: "⏳ SENDING...",
        reqBodyTab: "Request Body (JSON)",
        reqHeadersTab: "Headers",
        btnFormatJson: "✨ Beautify JSON",
        btnCopyResponse: "📋 Copy Response",
        responsePlaceholder: "// Response will appear here...",
        urlRequired: "Please enter a valid URL",
        invalidJson: "Invalid JSON format:",
        reqError: "Request Error:",

        // Settings
        settingsTitle: "Dino Monitor Preferences",
        languageLabel: "Application Language",
        defaultUrlLabel: "Default Backend URL",
        pollingIntervalLabel: "Live Stream Polling Frequency",
        interval1s: "1 Second (Very Fast)",
        interval2s: "2 Seconds (Recommended)",
        interval5s: "5 Seconds (Light)",
        autoConnectLabel: "Auto Connect on Startup",
        notificationsLabel: "Windows Notifications (Toast)",
        notifAll: "Errors & Warnings",
        notifErrorsOnly: "Critical Errors Only",
        notifDisabled: "Disabled",
        btnTestNotif: "🔔 Send Test Notification",
        optEnabled: "Enabled",
        optDisabled: "Disabled",
        btnSaveSettings: "💾 Save Preferences",
        settingsSaved: "Settings saved successfully!"
    }
};

window.dinoI18n = translations;
