---
name: pwa-fullstack-integration
description: >-
  Use this skill when developing, debugging, or verifying Progressive Web App (PWA) features,
  offline queue synchronization, Service Worker registration, and Web Push notifications.
---

# Progressive Web App (PWA) Fullstack Integration

## Overview
This skill covers the end-to-end PWA architecture connecting the React 19 + Vite frontend with the Laravel 11 backend.

---

## 1. Frontend PWA Architecture (`webPenangananKendalaClientFE`)
- **Plugin**: `vite-plugin-pwa`
- **Manifest**: `dist/manifest.webmanifest` (or `src/manifest.json`)
  - Configures app name, icons (192x192, 512x512), theme color, and standalone display mode.
- **Service Worker**: Auto-registered in `src/main.jsx` via `registerSW`.
- **Offline Sync Queue**: Located in `src/utils/offlineSync.js`.
  - Queues failed network actions (e.g. creating tickets offline) in `localStorage` or `IndexedDB`.
  - Automatically replays queued mutations when `window.addEventListener('online')` triggers.
- **App Badge Counter**: `src/utils/appBadge.js` synchronizes unread notification counts with OS app icon badges using `navigator.setAppBadge()`.

---

## 2. Backend PWA Endpoints (`webPenangananKendalaClientBE`)
- `GET /api/health` — Verifies database connection and `pwa_ready: true` status flag.
- `GET /api/vapid-public-key` — Provides the public VAPID key to browser clients for PushManager subscriptions.
- `POST /api/push-subscriptions` — Saves user browser push endpoints to the `push_subscriptions` database table.
- `POST /api/send-test-push` — Dispatches test Web Push payloads using the webpush protocol.

---

## 3. Verification & PWA Testing Lab
1. Build the production assets: `npm run build` in `webPenangananKendalaClientFE`.
2. Ensure Service Worker precache bundle (`dist/sw.js` and `workbox-*.js`) is generated without error.
3. Use the integrated `PWATestingLab.jsx` component to test offline toggle, push subscription, and background sync events.
