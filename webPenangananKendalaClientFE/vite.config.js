import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const previewAllowedHosts = env.VITE_PREVIEW_ALLOWED_HOSTS
    ? env.VITE_PREVIEW_ALLOWED_HOSTS.split(',').map((h) => h.trim())
    : ['localhost']

  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Process-Driven Ticket Handling System',
        short_name: 'TicketApp',
        description: 'Sistem manajemen tiket klien dengan dashboard React dan API Laravel Sanctum.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        importScripts: ['sw-custom.js'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/storage\//],
        runtimeCaching: [
          {
            urlPattern: /\/api\/(tickets|client\/tickets|notifications\/in-app|me)(\/.*)?$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/api\//,
            handler: 'NetworkOnly'
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'exes-slang-navigate.ngrok-free.dev',
      'localhost',
    ],
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
      '/storage': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: previewAllowedHosts,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
      '/storage': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.js',
  },
}
})
