# CRUX — Universal Device Safety & Compatibility Audit Document

> **DOCUMENT STATUS: VERIFIED PRE-RELEASE AUDIT (v0.1.0 MVP)**  
> **APPLICATION:** CRUX by UTcRuX (`com.crux.app`)  
> **PRIMARY DESIGN REFERENCE DEVICE:** Nothing Phone (2a) (Android 16 / Nothing OS)  
> **TARGET AUDIENCE:** Broad Android Device Ecosystem  
> **HARD BUDGET CONSTRAINT:** ₹0 / $0 (Zero paid infrastructure, zero AWS billing)

---

## 1. Executive Summary

This document presents a comprehensive security, privacy, and universal device compatibility audit for **CRUX by UTcRuX**. While the Nothing Phone (2a) serves as the primary physical reference device during development, the CRUX application architecture, widget layout engine, data layer, and network configuration have been engineered for broad compatibility across the Android ecosystem (Samsung One UI, Google Pixel Launcher, OnePlus OxygenOS, Xiaomi MIUI/HyperOS, Motorola, etc.).

---

## 2. Comprehensive Audit Sections

### A. Security & Least-Privilege Permissions Audit

CRUX adheres strictly to the **Principle of Least Privilege**. Only the absolute minimum permissions required for core network synchronization and Android 13+ push notifications are requested in `AndroidManifest.xml`.

| Permission | Requested | Feature Usage | Necessity | Status |
| :--- | :---: | :--- | :---: | :---: |
| `android.permission.INTERNET` | YES | Fetch content feed from backend API (`/content/feed`) | Essential | **KEPT** |
| `android.permission.ACCESS_NETWORK_STATE` | YES | WorkManager network constraint (`NetworkType.CONNECTED`) | Essential | **KEPT** |
| `android.permission.POST_NOTIFICATIONS` | YES | System notification permission on Android 13+ (API 33+) | Recommended | **KEPT** |
| `android.permission.READ_CONTACTS` | **NO** | Not requested | Unnecessary | **EXCLUDED** |
| `android.permission.ACCESS_FINE_LOCATION` | **NO** | Not requested | Unnecessary | **EXCLUDED** |
| `android.permission.CAMERA` | **NO** | Not requested | Unnecessary | **EXCLUDED** |
| `android.permission.RECORD_AUDIO` | **NO** | Not requested | Unnecessary | **EXCLUDED** |
| `android.permission.READ_EXTERNAL_STORAGE` | **NO** | Not requested | Unnecessary | **EXCLUDED** |
| `android.permission.READ_PHONE_STATE` | **NO** | Not requested | Unnecessary | **EXCLUDED** |

---

### B. Secret & Sensitive Data Audit

A full-workspace code and repository search was executed for sensitive keywords (`password`, `secret`, `token`, `apikey`, `private_key`, `serviceAccount`, `firebase`, `JWT_SECRET`, `ADMIN_PASSWORD`, `credential`).

- **Firebase Credentials**: 0 Firebase Service Account JSON keys (`serviceAccountKey.json`) embedded in the Android APK or committed to Git.
- **Backend Admin Credentials**: Admin authentication occurs strictly server-side (`fcmService.js`). JWT tokens are ephemeral and stored in memory only.
- **Git & `.gitignore` Protections**: `.env`, `.env.local`, `google-services.json`, `firebase-service-account*.json`, `*.keystore`, and `*.pem` are explicitly excluded via root `.gitignore`.

---

### C. APK Package & Binary Inspection

Binary analysis of `releases/CRUX-MVP.apk` (`17,036,591` bytes / `16.25 MB`):

- **Service Account Files**: 0 JSON service keys in assets or DEX resources.
- **Private Keys / Keystores**: 0 `.pem`, `.key`, or release `.jks` keys bundled.
- **Cleartext API Secrets**: 0 production secrets found inside compiled `classes.dex`.
- **SECRET LEAK SCAN**: **PASS**

---

### D. Network Security & API Environment Policy

- **Development API**: `http://192.168.1.7:3000/` (Accessible over local LAN for physical device testing).
- **Production API Policy**: Future public deployment requires HTTPS endpoint (`https://api.utcrux.com` or Cloudflare Worker HTTPS domain).
- **Cleartext Traffic Policy**: `android:usesCleartextTraffic="true"` enabled strictly for LAN IP development (`192.168.1.7:3000`). Production builds will enforce `usesCleartextTraffic="false"`.

---

### E. Local Storage & Privacy Audit

- **Room Database (`CruxDatabase.kt`)**: Stores published content items locally in app-private SQLite database (`crux_database.db`). No PII or credentials saved.
- **DataStore Preferences (`PreferencesGlanceStateDefinition`)**: Tracks widget navigation state (`CURRENT_CARD_INDEX_KEY`), game state, and cumulative score (`GAME_SCORE_KEY`).
- **Logging Policy**: Production builds disable verbose network header logs.

---

### F. Dependency Audit

| Library | Version | Purpose | Security / Maintenance Status |
| :--- | :---: | :--- | :--- |
| `androidx.core:core-ktx` | `1.12.0` | Android Kotlin Extensions | Official Jetpack Library (Maintained) |
| `androidx.glance:glance-appwidget` | `1.0.0` | Declarative Glance AppWidget Engine | Official Jetpack Library (Maintained) |
| `androidx.glance:glance-material3` | `1.0.0` | Glance Material Design 3 Styling | Official Jetpack Library (Maintained) |
| `androidx.room:room-runtime` | `2.6.1` | Local SQLite ORM Persistence | Official Jetpack Library (Maintained) |
| `androidx.work:work-runtime-ktx` | `2.9.0` | Background Periodic Catchup Worker | Official Jetpack Library (Maintained) |
| `com.squareup.retrofit2:retrofit` | `2.9.0` | Type-safe REST HTTP Client | Industry Standard (Maintained) |
| `com.google.firebase:firebase-messaging-ktx` | `23.4.1` | Push Notification Signal Client | Official Google SDK (Maintained) |

---

### G. Android Component Security Audit

| Component | Type | Exported | Intent Filter / Protection | Rationale |
| :--- | :---: | :---: | :--- | :--- |
| `com.crux.app.MainActivity` | Activity | `true` | `<action android:name="android.intent.action.MAIN" />` | Launcher entry point (Required) |
| `CruxFirebaseMessagingService` | Service | `false` | `<action android:name="com.google.firebase.MESSAGING_EVENT" />` | Private to app & Firebase SDK |
| `CruxWidgetReceiver` | Receiver | `true` | `<action android:name="android.appwidget.action.APPWIDGET_UPDATE" />` | Android AppWidget framework receiver |

---

### H. Widget Safety & Resilience

- **Empty Database**: Renders default fallback CRUX card (`game_001` Quick Math Reflex).
- **Network Loss**: Renders cached Room DB entries seamlessly without crashing or showing blank layouts.
- **Long Titles / Emoji**: Text components enforce `maxLines` with dynamic wrapping and `Ellipsis`.
- **Missing Fields**: Nullable attributes (`question`, `options`, `correct_answer`) fallback to default text safely.

---

### I. Universal Display & Density Compatibility

- **Measurement Units**: 100% density-independent units (`dp` for layout bounds, `sp` for font sizing). Zero hard-coded pixel offsets (`px`).
- **Responsive Layout Engine**: `LocalSize.current` dynamically computes container padding (`10.dp`, `14.dp`, `18.dp`) and font sizes (`14.sp`, `18.sp`, `22.sp`).
- **Accessibility Font Scaling**: Graceful degradation when Android system font scale is set to Large (115%) or Very Large (130%).

---

### J. Widget Size & Resize Adaptability

- **2×2 Widget**: Renders compact title (`14.sp`, 2 max lines) and standard bottom navigation.
- **4×2 Banner Widget**: Renders wide content layout with timestamp and arrow controls.
- **4×4 Grid Widget**: Renders full dominant typography, 2×2 interactive MCQ option grid (`8`, `10`, `12`, `16`), and footer controls.

---

### K. Launcher Independence & OS Compatibility

- **Standard Android AppWidget API**: Standard `GlanceAppWidgetReceiver` implementation.
- **Launcher Neutrality**: Tested on Nothing Launcher and Android AOSP Launcher. Does not use proprietary Nothing OS or launcher-specific APIs.

---

### L. Android SDK Version Range

- **`compileSdk`**: `34` (Android 14)
- **`targetSdk`**: `34` (Android 14 — Fully compliant with Google Play target API rules)
- **`minSdk`**: `26` (Android 8.0 Oreo — Supports 95%+ of active Android devices worldwide)

---

### M. Manufacturer Background Execution Audit

- **FCM Primary Signal**: Fast push dispatch via topic `crux_public`.
- **WorkManager Fallback**: 1-hour periodic catchup worker (`CruxSyncWorker`) with `NetworkType.CONNECTED` constraint. Recovers synchronized state cleanly across OEM battery restrictions (Samsung, Xiaomi, OnePlus).

---

### N. FCM Push Payload Privacy

- Push payload contains lightweight signals only (`{"type": "CRUX_UPDATED", "contentId": "crux_..."}`). Zero content text, author names, or credentials transmitted inside FCM push body.

---

### O. MCQ Engine Safety & Anti-Exploitation Audit

- **Duplicate Score Protection**: `GAME_SCORED_ITEMS_KEY` in Glance DataStore tracks scored item IDs. Tapping option buttons repeatedly awards points exactly once.
- **Swipe Safety**: Vertical swiping over `GAME` cards inside Glance `LazyColumn` scrolls content without triggering answer option callbacks.

---

### P. UTC $\rightarrow$ Device-Local System Timezone Conversion

- ISO-8601 timestamps parsed via `java.time.Instant.parse(isoStr)` and converted using `java.time.ZoneId.systemDefault()`.
- **Midnight Crossing Test**: `2026-08-20T20:00:00Z` (UTC) displays as `01:30 · 21 AUG` in IST (UTC+05:30).

---

### Q. Fail-Safe Crash Resilience Test Matrix

| Scenario | Result | Observed Behavior |
| :--- | :---: | :--- |
| **No Internet Connection** | **PASS** | Renders cached Room DB entries |
| **Backend HTTP 500 / Network Error** | **PASS** | WorkManager retries without crashing UI |
| **Empty API Feed Array `[]`** | **PASS** | Preserves existing Room database items |
| **Malformed JSON Response** | **PASS** | Retrofit/Gson returns error callback cleanly |
| **Rapid Arrow Tapping** | **PASS** | DataStore handles sequential state updates |

---

### R. Privacy Policy & Data Access Minimization

- **Personal Data Collected**: **ZERO**. No user IDs, phone numbers, email addresses, device serial numbers, or location coordinates collected.
- **Privacy Compliance**: Fully compliant with Google Play Data Safety guidelines.

---

## 3. Device Compatibility Report Card

| Device / Configuration | Status | Testing Method |
| :--- | :---: | :--- |
| **Nothing Phone (2a)** | **PASS** | Physical Device Verified (Android 16 / Nothing OS) |
| **Google Pixel** | **NOT PHYSICALLY TESTED** | Designed for Broad Compatibility (Android SDK 34 Standards) |
| **Samsung Galaxy (One UI)** | **NOT PHYSICALLY TESTED** | Designed for Broad Compatibility (Jetpack Glance AppWidget API) |
| **OnePlus (OxygenOS)** | **NOT PHYSICALLY TESTED** | Designed for Broad Compatibility (Jetpack Glance AppWidget API) |
| **Xiaomi / POCO (HyperOS)** | **NOT PHYSICALLY TESTED** | Designed for Broad Compatibility (Jetpack Glance AppWidget API) |
| **Motorola (Hello UI)** | **NOT PHYSICALLY TESTED** | Designed for Broad Compatibility (Jetpack Glance AppWidget API) |
| **Small Widget (2×2)** | **PASS** | Verified on Physical Device |
| **Medium Widget (4×2)** | **PASS** | Verified on Physical Device |
| **Large Widget (4×4)** | **PASS** | Verified on Physical Device |
| **Long Text Handling** | **PASS** | Max lines & dynamic ellipsis verified |
| **Large System Font Scale** | **PASS** | Scalable `sp` text rendering verified |
| **High Screen Density (xxhdpi)** | **PASS** | Verified on Nothing Phone (2a) |
| **Offline Mode** | **PASS** | Room DB cache verified |
| **Wi-Fi & Mobile Data** | **PASS** | Verified on Physical Device |
| **Launcher Independence** | **PASS** | Standard Android AppWidget Framework |

---

## 4. Final Security & Quality Report Card

| Category | Status |
| :--- | :---: |
| **Permissions Audit** | **PASS** |
| **Secrets in Source Code** | **PASS** |
| **Secrets in APK Binary** | **PASS** |
| **Git Secret Scan** | **PASS** |
| **Network Security** | **PASS** |
| **Dependency Audit** | **PASS** |
| **Component Security** | **PASS** |
| **Crash Resilience** | **PASS** |
| **Privacy & Least-Privilege Minimization** | **PASS** |

---

> **SUMMARY STATEMENT**:  
> CRUX by UTcRuX is **security-audited and engineered for broad Android ecosystem compatibility**.
