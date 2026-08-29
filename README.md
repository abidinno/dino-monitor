# 🦖 Dino Dev Monitor & Command Center

<div align="center">

![Dino Monitor Banner](assets/app-icon.svg)

### **Modern, Retro-Cyberpunk Desktop Tool for Real-Time Backend & Database Monitoring**
*A lightweight standalone Electron desktop application designed for full-stack developers to inspect live server logs, RAM/Uptime metrics, MySQL database schemas, and test API endpoints in real time.*

[![Version](https://img.shields.io/badge/version-1.1.0-orange.svg?style=for-the-badge)](package.json)
[![Electron](https://img.shields.io/badge/Electron-35.0-47848F?style=for-the-badge&logo=electron)](https://www.electronjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows)](https://www.microsoft.com/windows)

[Türkçe Dokümantasyon](#-türkçe-dokümantasyon) • [Features](#-features) • [Installation](#-quick-start) • [Backend Setup](#-backend-integration-expressjs) • [Build Executable](#-building-exe)

---

</div>

## 🌟 Key Features

* **📋 Real-Time Log Streaming:** Live server logs with smart syntax highlighting for `[ERROR]`, `[WARN]`, `[INFO]`, and critical uncaught exceptions.
* **🔔 Native Windows Toast Notifications:** Instant desktop alerts when backend errors or warnings occur, even when the window is minimized.
* **⚡ Integrated API Tester (Postman-Lite):** Send `GET`, `POST`, `PUT`, `DELETE`, and `PATCH` requests with JSON beautifier, response timing, status codes, and keyboard shortcut (`Ctrl + Enter`).
* **🗄️ Database Schema & Metrics Explorer:** Real-time table status, row counts, data size, and index size inspection for single or multi-database setups.
* **📌 Always-on-Top (PIN Mode):** Keep your logs floating above your IDE and code editor while developing.
* **🔒 Secure & Masked Environment Explorer:** View active server environment variables with automatic credential and password masking (`*****`).
* **🌐 Multi-Language Support:** Instant toggle between Turkish (TR) and English (EN).
* **⬇️ Smart Auto-Scroll:** Automatically follows the newest logs, with pause-on-scroll functionality.
* **💾 Export & Quick Copy:** One-click copy for log lines and `.txt` file export.

---

## 🚀 Quick Start

### 1. Requirements
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm

### 2. Run in Development Mode
```bash
# Clone the repository and navigate into the folder
cd dino-monitor

# Install dependencies
npm install

# Start the application
npm start
```

---

## 🛠️ Backend Integration (Express.js)

Dino Monitor connects to any Node.js / Express backend via a simple lightweight endpoint. You can copy and paste the snippet below into your Express server:

```javascript
// routes/dinoLogs.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Knex or MySQL instance

const LOG_USER = process.env.DINO_LOGS_USER || 'abidino';
const LOG_PASS = process.env.DINO_LOGS_PASS || 'devdino11';
const logHistory = []; // Or hook this into your Winston/Pino logger

// Hook console.log / console.error into logHistory
const originalConsoleLog = console.log;
console.log = (...args) => {
    logHistory.unshift(`[${new Date().toISOString()}] [INFO] ${args.join(' ')}`);
    if (logHistory.length > 500) logHistory.pop();
    originalConsoleLog.apply(console, args);
};

// Monitor Data Endpoint
router.post('/data', async (req, res) => {
    const { u, p } = req.body;
    if (u !== LOG_USER || p !== LOG_PASS) {
        return res.status(401).json({ success: false, message: 'Access Denied' });
    }

    try {
        const [tables] = await db.raw('SHOW TABLE STATUS');
        const memoryUsage = process.memoryUsage();

        res.json({
            success: true,
            logs: logHistory,
            dbStats: tables.map(t => ({
                name: t.Name,
                rows: t.Rows,
                dataSize: `${(t.Data_length / 1024).toFixed(2)} KB`,
                indexSize: `${(t.Index_length / 1024).toFixed(2)} KB`
            })),
            sysInfo: {
                uptime: `${Math.floor(process.uptime() / 60)} minutes`,
                ram: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
                node_version: process.version
            },
            envInfo: {
                NODE_ENV: process.env.NODE_ENV,
                PORT: process.env.PORT
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
```

Mount it in your `server.js`:
```javascript
app.use('/api/dino-logs', require('./routes/dinoLogs'));
```

---

## 📦 Building Standalone Executable (.EXE)

Build a fully portable single `.exe` file that runs anywhere without installing Node.js:

```bash
# Build Portable .EXE (Single file, no installation required)
npm run build:portable

# Build Windows Setup Installer (.exe with desktop shortcut and uninstaller)
npm run build:setup
```

The output executable will be created in the `dist/` directory:
* `dist/Dino Dev Monitor 1.1.0.exe`

---

<br/>

## 🇹🇷 Türkçe Dokümantasyon

### 🎯 Dino Monitor Nedir?
**Dino Dev Monitor**, Node.js ve Express tabanlı backend servislerinizi geliştirirken terminale bağımlı kalmadan canlı logları, bellek kullanımını, veritabanı tablolarını izlemenizi ve API isteklerini test etmenizi sağlayan modern bir masaüstü geliştirici aracıdır.

### 🌟 Başlıca Yetenekler:
1. **Canlı Log Akışı:** Terminal çıktılarını renkli ve filtrelenebilir şekilde anlık takip edin.
2. **Windows Toast Bildirimleri:** Arka planda çalışırken backend'de bir hata (`[ERROR]`, `TypeError`, `Uncaught`) yakalandığında sağ alttan yerel Windows bildirimi fırlar.
3. **API Test Aracı (Postman-Lite):** Hızlıca GET/POST/PUT/DELETE istekleri atın, JSON formatlayın ve yanıt sürelerini ölçün.
4. **Veritabanı Gezgini:** Tabloların satır sayılarını ve disk boyutlarını anlık görüntüleyin.
5. **Pencereyi Sabitleme (PIN):** Kod yazarken monitör penceresini her zaman en üstte tutun.

### 🚀 Çalıştırma & Derleme:
```bash
# Bağımlılıkları yükle
npm install

# Geliştirici modunda başlat
npm start

# Taşınabilir (Portable) Tek Dosya .EXE Oluştur
npm run build:portable
```

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Developed with 🦖 by **abidino**.
