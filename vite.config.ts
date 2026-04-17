import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'SoundScape Music Player',
        short_name: 'SoundScape',
        description: 'Modern offline-ready music player UI built in React',
        theme_color: '#000000',
        background_color: '#121212',
        display: 'standalone',
        icons: [
          {
            src: '/icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // Cache audio blobs eagerly
            urlPattern: /^https:\/\/www\.soundhelix\.com\/.*\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days limits
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Network first to fetch fresh catalogs but fallback beautifully if device is disconnected
            urlPattern: /.*\/api\/songs\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mock-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 1 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
