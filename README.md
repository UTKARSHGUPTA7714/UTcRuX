# CRUX — Interactive Home-Screen Companion by UTCRUX

> **STATUS: MVP / DEVELOPMENT BUILD (v0.1.0)**

**CRUX** is a minimalist, Nothing OS-inspired home-screen widget companion designed to deliver glanceable campus announcements, quotes, facts, brain teasers, and interactive mini-MCQ games directly on your Android home screen.

Created by **UTCRUX** (`UTKARSH + CRUX = UTCRUX`).

---

## 📱 Download

### Android APK

Download the pre-built, shareable Android MVP build:

📥 **[Download CRUX MVP APK (v0.1.0)](releases/CRUX-MVP.apk)**

> [!NOTE]  
> **Android Sideloading Note**: Because this APK is distributed directly from GitHub outside the Google Play Store, Android will display a standard warning ("Install from unknown sources" or "App installed from external source"). Simply allow the installation prompt to proceed.

---

## ✨ Features

- **Nothing OS Minimalist Aesthetics**: Monochrome dot-matrix typography (`CRUX · UTCRUX`).
- **Responsive Layout Engine**: Dynamic visual scaling across **2×2**, **4×2**, and **4×4** launcher widget sizes.
- **Interactive MCQ Mini-Game**: Solve quick math reflex and brain teaser questions directly inside the home widget with instant correct (`✓ +10 PTS`) / incorrect (`✕`) feedback and score persistence.
- **Continuous 5-Item Carousel**: Touch-expanded navigation buttons (`‹ 01/05 ›` with 44dp×36dp touch targets) for seamless looping.
- **Offline-First Architecture**: Powered by Room SQLite local database persistence. Zero blank widgets when disconnected.
- **Admin Control Studio**: Web-based administration dashboard (`crux-admin`) for publishing and previewing new CRUX posts and MCQ trivia games.

---

## 🛠️ Project Structure

```
crux/
├── crux-android/        # Android App (Kotlin, Compose, Jetpack Glance, Room DB)
├── crux-backend/        # Local Backend Server (Node.js, Express.js)
├── crux-admin/          # Web Administrator Control Dashboard (HTML5 / Vanilla JS)
├── releases/            # Shareable Pre-built Android APK (CRUX-MVP.apk)
├── README.md            # Project Overview & Installation Guide
└── .gitignore           # Security & Build Exclusion Rules
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Android Studio / Android SDK (Platform 34, Build Tools 34.0.0)
- Java OpenJDK 17
- Node.js (v18+)

### 2. Launch Local Backend
```bash
cd crux-backend
npm install
node server.js
```
The local server will start listening on `http://0.0.0.0:3000` (LAN access: `http://192.168.1.7:3000`).

### 3. Open Admin Dashboard
Open `crux-admin/index.html` in any web browser. Login credentials:
- **Username**: `admin`
- **Password**: `cruxadmin2026`

### 4. Build & Install Android App
```bash
cd crux-android
.\gradlew assembleDebug
```
Install on your connected Android phone via ADB:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 📐 Widget Setup Guide

1. Long-press any empty space on your Android home screen.
2. Select **Widgets**.
3. Scroll down and choose **CRUX**.
4. Drag the widget onto your screen and adjust to your preferred size (`2×2`, `4×2`, or `4×4`).

---

## 📌 Current MVP Limitations vs. Planned Features

| Feature Area | Current MVP (v0.1.0) | Planned Production Feature |
| :--- | :--- | :--- |
| **Backend** | Local Node.js Express Server (Port 3000) | AWS Lambda + DynamoDB (Free Tier) |
| **Distribution** | Local network HTTP sync & Room DB caching | Firebase Cloud Messaging (FCM) push signals |
| **Widget Navigation** | Touch-expanded button controls (`‹` / `›`) | Dual Swipe + Button interaction |
| **Game Engine** | Daily MCQ Quiz with score tracking | Multiple trivia categories & leaderboards |

---

## 🔒 Security & Policy

- **Hard ₹0 Budget Policy**: 100% free and open-source software, zero subscriptions, zero paid APIs.
- **No Secrets in Repository**: Environment configs use `.env.example` templates. No private keys, keystores, or access credentials are stored in source code.

---

## 📄 License

Developed by **UTCRUX**. Distributed under the MIT License.
