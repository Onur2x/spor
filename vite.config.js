import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'FitPro - Spor Antreman Takip',
        short_name: 'FitPro',
        description: 'Kişisel spor antrenman, beslenme ve gelişim takip uygulaması',
        theme_color: '#22c55e',
        background_color: '#07101d',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['health', 'fitness', 'lifestyle'],
        shortcuts: [
          {
            name: 'Bugünkü Antrenman',
            short_name: 'Antrenman',
            description: 'Bugünkü antrenman programını gör',
            url: '/?tab=home',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Egzersiz Kütüphanesi',
            short_name: 'Egzersizler',
            description: 'Tüm egzersizleri ve GIF\'leri gör',
            url: '/?tab=exercises',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/.*\.giphy\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-gifs',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'esnext',
    minify: 'esbuild'
  },
  resolve: {
    alias: {
      '@': '/js'
    }
  },
  optimizeDeps: {
    exclude: ['ornek']
  }
})