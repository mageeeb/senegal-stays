// Teranga Home PWA Service Worker
// Advanced caching strategy for mobile-first experience
const CACHE_NAME = 'teranga-cache-v2';
const RUNTIME_CACHE = 'teranga-runtime-v2';
const OFFLINE_URL = '/';
const OFFLINE_FALLBACK_URL = '/';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/teranga_home.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.webmanifest'
];

// Assets to cache at runtime
const RUNTIME_CACHEABLE = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\/(properties|vehicles|long-stays|auth)/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== RUNTIME_CACHE) {
            return caches.delete(key);
          }
        })
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch event - advanced caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (except fonts and images)
  if (url.origin !== self.origin && !RUNTIME_CACHEABLE.some(pattern => pattern.test(request.url))) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cached) => {
        // Return cached version if available
        if (cached) return cached;

        // Fetch and cache for runtime cacheable resources
        if (RUNTIME_CACHEABLE.some(pattern => pattern.test(request.url))) {
          return fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const copy = response.clone();
                caches.open(RUNTIME_CACHE)
                  .then((cache) => cache.put(request, copy))
                  .catch(() => {});
              }
              return response;
            })
            .catch(() => {
              // Return offline fallback for navigation requests
              if (request.destination === 'document') {
                return caches.match(OFFLINE_FALLBACK_URL);
              }
            });
        }

        // For other requests, try network first
        return fetch(request)
          .catch(() => {
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match(OFFLINE_FALLBACK_URL);
            }
          });
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any background sync operations here
      Promise.resolve()
    );
  }
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'teranga-notification',
      requireInteraction: true
    };

    event.waitUntil(
      self.registration.showNotification('Teranga Home', options)
    );
  }
});
