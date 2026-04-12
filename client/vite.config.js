import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  envDir: "..",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      includeAssets: [
        "favicon.svg",
        "apple-touch-icon.png",
        "icons/icon-72.png",
        "icons/icon-96.png",
        "icons/icon-128.png",
        "icons/icon-144.png",
        "icons/icon-152.png",
        "icons/icon-192.png",
        "icons/icon-384.png",
        "icons/icon-512.png"
      ],
      manifest: {
        name: "GymForge — AI Workout Planner",
        short_name: "GymForge",
        description: "AI-powered workout plans, habit tracking, and motivation for athletes who mean it.",
        theme_color: "#f97316",
        background_color: "#0a0a0a",
        display: "standalone",
        display_override: ["standalone", "minimal-ui"],
        scope: "/",
        start_url: "/?source=pwa",
        orientation: "portrait-primary",
        categories: ["fitness", "health", "lifestyle"],
        lang: "en",
        dir: "ltr",
        icons: [
          { src: "/icons/icon-72.png", sizes: "72x72", type: "image/png" },
          { src: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
          { src: "/icons/icon-128.png", sizes: "128x128", type: "image/png" },
          { src: "/icons/icon-144.png", sizes: "144x144", type: "image/png" },
          { src: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-384.png", sizes: "384x384", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ],
        screenshots: [
          {
            src: "/screenshots/dashboard.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "GymForge Dashboard"
          },
          {
            src: "/screenshots/workout.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "Workout Detail"
          }
        ],
        shortcuts: [
          {
            name: "Dashboard",
            short_name: "Dashboard",
            description: "View your fitness dashboard",
            url: "/dashboard",
            icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }]
          },
          {
            name: "Today's Workout",
            short_name: "Workout",
            description: "Open today's workout plan",
            url: "/workout",
            icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }]
          },
          {
            name: "Todo List",
            short_name: "Todos",
            description: "Check your daily todos",
            url: "/todos",
            icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }]
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: null,
        offlineGoogleAnalytics: false,
        additionalManifestEntries: [{ url: "/offline.html", revision: "1" }],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.onrender\.com\/api\/auth\/me/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "auth-cache",
              expiration: { maxEntries: 5, maxAgeSeconds: 60 },
              networkTimeoutSeconds: 5
            }
          },
          {
            urlPattern: /^https:\/\/.*\.onrender\.com\/api\/workout\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "workout-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 600 },
              networkTimeoutSeconds: 8
            }
          },
          {
            urlPattern: /^https:\/\/.*\.onrender\.com\/api\/todos.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "todos-cache",
              expiration: { maxEntries: 30, maxAgeSeconds: 120 },
              networkTimeoutSeconds: 6
            }
          },
          {
            urlPattern: /^https:\/\/.*\.onrender\.com\/api\/.*/i,
            handler: "NetworkOnly"
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          charts: ["recharts"]
        }
      }
    }
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups"
    }
  }
});
