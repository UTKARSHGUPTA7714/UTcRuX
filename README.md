# CRUX by UTcRuX

> **Glanceable Android Home-Screen Companion for Short Updates, Announcements, and Interactive Mini-Games**

CRUX by UTcRuX is a modern, lightweight Android home-screen widget system built with **Jetpack Glance**, **Room DB**, and **Cloudflare Workers**. It delivers concise updates, quotes, announcements, and interactive MCQ mini-games directly to your phone's home screen without requiring you to open an application.

---

## 🌟 Key Features

- **Home-Screen Native Widget**: Rendered using Jetpack Glance with adaptive responsive layouts (`2x2`, `4x2`, `4x4`).
- **UTcRuX Minimalist Branding**: Clean, subtle visual hierarchy designed to blend seamlessly with custom Android launchers.
- **Interactive MCQ Mini-Games**: Play quick quizzes (`GAME` cards) directly on the home screen with instant option feedback (`✓` / `✕`) and local score tracking.
- **Quick Game Access (`▶`)**: Jump directly to active published mini-games with one tap.
- **Universal Arrow Navigation**: Seamlessly loop between published cards using expanded `‹` and `›` touch controls.
- **Offline Room Cache**: Full offline reliability. Content is cached locally in SQLite via Room DB.
- **System Local Timezone Conversion**: Automatic UTC $\rightarrow$ device system local timezone formatting.
- **Public Cloudflare Backend**: Serverless public distribution powered by **Cloudflare Workers** and **Cloudflare D1**.
- **₹0 / $0 Budget**: 100% free serverless infrastructure operating within Cloudflare Free tier bounds.

---

## 📱 Device Compatibility

| Device / Brand | Status | Details |
| :--- | :---: | :--- |
| **Nothing Phone (2a)** | **PASS** | Physically tested & verified on Android 16 |
| **Google Pixel** | **COMPATIBLE** | Broad Android SDK 34 / Glance compatibility |
| **Samsung Galaxy** | **COMPATIBLE** | Broad Android SDK 34 / Glance compatibility |
| **OnePlus** | **COMPATIBLE** | Broad Android SDK 34 / Glance compatibility |
| **Xiaomi / POCO** | **COMPATIBLE** | Broad Android SDK 34 / Glance compatibility |
| **Motorola** | **COMPATIBLE** | Broad Android SDK 34 / Glance compatibility |

---

## 📥 Installation & Setup

> **Distribution Note**: CRUX is currently distributed as a standalone APK package and is not yet published on Google Play.

1. **Download APK**: Get [`releases/CRUX-MVP.apk`](releases/CRUX-MVP.apk) from the latest GitHub Release.
2. **Install**: Tap the `.apk` file on your Android device and allow installation from unknown sources if prompted.
3. **Initialize**: Open the CRUX app once to perform initial local DB setup.
4. **Add Widget**:
   - Long press any empty space on your Android home screen.
   - Select **Widgets** $\rightarrow$ scroll to **CRUX**.
   - Drag a `2x2`, `4x2`, or `4x4` widget onto your home screen.
5. **Enjoy**: View live updates, navigate cards, and play mini-games directly from your home screen.

---

## 🌐 Public Cloudflare Infrastructure

- **Production API**: `https://crux-api.utcrux.workers.dev`
- **Database**: Cloudflare D1 SQLite (`crux-db`)
- **Cost**: **$0 / ₹0** (Cloudflare Workers Free Tier)

### Public Endpoints (Read-Only)
- `GET /health` — API status & health monitor
- `GET /content/feed` — Published content feed sorted by date & priority
- `GET /content/latest` — Latest published CRUX or GAME card
- `GET /content/:id` — Single item lookup

---

## 🔒 Security & Privacy

- **Zero Permissions Abuse**: Requests only `INTERNET`, `ACCESS_NETWORK_STATE`, and `POST_NOTIFICATIONS`.
- **Zero PII Collection**: No personal data, location tracking, or telemetry collected.
- **Secured Admin Endpoint**: Content publishing requires HMAC-signed Bearer tokens via Cloudflare Worker Secrets.
- **Backend Credentials Isolated**: Firebase service keys and admin credentials are restricted to server environments and never packaged inside the APK.

---

## 📄 License & Attribution

Developed by **UTCRUX** (2026). All rights reserved. Built with Jetpack Glance, Room DB, Retrofit, Kotlin, and Cloudflare Workers.
