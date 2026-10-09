# Penanganan Kendala Client

Sistem manajemen tiket klien — monorepo FE + BE.

## Struktur

- `webPenangananKendalaClientFE/` — Frontend React 19 + Vite 8 + Tailwind 4 (SPA + PWA)
- `webPenangananKendalaClientBE/` — Backend Laravel 12 + Sanctum 4 (REST API)

## Setup Backend

```bash
cd webPenangananKendalaClientBE
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

## Setup Frontend

```bash
cd webPenangananKendalaClientFE
npm install
npm run dev
```

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19, Vite 8, Tailwind 4, react-router-dom 7 |
| Backend | Laravel 12, Sanctum 4, MySQL |
| PWA | vite-plugin-pwa, Workbox |
| Testing | Vitest (FE), PHPUnit (BE) |
