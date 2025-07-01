const CACHE_NAME = 'biztras-cloud-v2.1.0';
const RUNTIME_CACHE = 'biztras-runtime-v2';
const OFFLINE_PAGE = '/offline.html';

// Core files to cache
const CORE_CACHE_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/biztras.png'
];

// API endpoints that should have very short cache times
const SHORT_CACHE_API_PATTERNS = [
  /^\/api\/cloud-report\/data$/,
  /^\/api\/backup-server\/data$/,
  /^\/api\/auth\/verify$/
];

// API endpoints that can be cached longer
const LONG_CACHE_API_PATTERNS = [
  /^\/api\/admin\/stats$/,
  /^\/api\/admin\/pending-users$/
];

// Install event - cache core resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[SW] Caching core files');
        await cache.addAll(CORE_CACHE_FILES);
        
        // Force activation of new service worker
        self.skipWaiting();
      } catch (error) {
        console.error('[SW] Cache failed during install:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name !== CACHE_NAME && name !== RUNTIME_CACHE
        );
        
        await Promise.all(
          oldCaches.map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
        );
        
        // Take control of all clients
        self.clients.claim();
      } catch (error) {
        console.error('[SW] Activation failed:', error);
      }
    })()
  );
});

// Fetch event - implement enhanced caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Core files - Cache First
    if (CORE_CACHE_FILES.some(file => url.pathname === file || url.pathname.startsWith(file))) {
      return await cacheFirst(request, CACHE_NAME);
    }
    
    // Strategy 2: Short cache API calls - Network First with very short cache
    if (url.pathname.startsWith('/api/') && SHORT_CACHE_API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await networkFirstShortCache(request, RUNTIME_CACHE);
    }
    
    // Strategy 3: Long cache API calls - Network First with longer cache
    if (url.pathname.startsWith('/api/') && LONG_CACHE_API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await networkFirstLongCache(request, RUNTIME_CACHE);
    }
    
    // Strategy 4: Other API calls - Network Only (no cache for save operations)
    if (url.pathname.startsWith('/api/')) {
      console.log('[SW] Network only for API:', request.url);
      return await fetch(request);
    }
    
    // Strategy 5: Static assets - Cache First
    if (url.pathname.startsWith('/static/') || 
        url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
      return await cacheFirst(request, CACHE_NAME);
    }
    
    // Strategy 6: Navigation - Network First with offline fallback
    if (request.mode === 'navigate') {
      return await navigationHandler(request);
    }
    
    // Default: Network only
    return await fetch(request);
    
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const cache = await caches.open(CACHE_NAME);
      return await cache.match(OFFLINE_PAGE) || new Response('Offline');
    }
    
    return new Response('Network error', { status: 408 });
  }
}

// Cache First strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }
  
  console.log('[SW] Cache miss, fetching:', request.url);
  const response = await fetch(request);
  
  if (response.status === 200) {
    cache.put(request, response.clone());
  }
  
  return response;
}

// Network First with short cache (30 seconds)
async function networkFirstShortCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    console.log('[SW] Network first (short cache):', request.url);
    const response = await fetch(request);
    
    if (response.status === 200) {
      // Add timestamp to response headers
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());
      headers.set('sw-cache-type', 'short');
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      const cacheTimestamp = cached.headers.get('sw-cache-timestamp');
      const cacheType = cached.headers.get('sw-cache-type');
      
      if (cacheTimestamp && cacheType === 'short') {
        const isStale = (Date.now() - parseInt(cacheTimestamp)) > 30000; // 30 seconds
        
        if (isStale) {
          console.log('[SW] Cache is stale, removing:', request.url);
          cache.delete(request);
          throw error; // Don't use stale cache
        }
      }
      
      console.log('[SW] Using cached response:', request.url);
      return cached;
    }
    
    throw error;
  }
}

// Network First with long cache (5 minutes)
async function networkFirstLongCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    console.log('[SW] Network first (long cache):', request.url);
    const response = await fetch(request);
    
    if (response.status === 200) {
      // Add timestamp to response headers
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());
      headers.set('sw-cache-type', 'long');
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      const cacheTimestamp = cached.headers.get('sw-cache-timestamp');
      const cacheType = cached.headers.get('sw-cache-type');
      
      if (cacheTimestamp && cacheType === 'long') {
        const isStale = (Date.now() - parseInt(cacheTimestamp)) > 300000; // 5 minutes
        
        if (isStale) {
          console.log('[SW] Cache is stale, removing:', request.url);
          cache.delete(request);
          throw error; // Don't use stale cache
        }
      }
      
      console.log('[SW] Using cached response:', request.url);
      return cached;
    }
    
    throw error;
  }
}

// Navigation handler with offline support
async function navigationHandler(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('[SW] Navigation offline, serving app shell');
    const cache = await caches.open(CACHE_NAME);
    return await cache.match('/') || new Response('Offline', { status: 503 });
  }
}

// Clean up stale cache entries periodically
async function cleanupStaleCache() {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const requests = await cache.keys();
    const now = Date.now();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const cacheTimestamp = response.headers.get('sw-cache-timestamp');
        const cacheType = response.headers.get('sw-cache-type');
        
        if (cacheTimestamp) {
          const age = now - parseInt(cacheTimestamp);
          const maxAge = cacheType === 'short' ? 30000 : 300000; // 30s or 5min
          
          if (age > maxAge) {
            console.log('[SW] Cleaning up stale cache entry:', request.url);
            await cache.delete(request);
          }
        }
      }
    }
  } catch (error) {
    console.error('[SW] Cache cleanup failed:', error);
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-cloud-data') {
    event.waitUntil(syncCloudData());
  }
  
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupStaleCache());
  }
});

async function syncCloudData() {
  try {
    console.log('[SW] Syncing cloud data...');
    
    // Clear stale cache entries before sync
    await cleanupStaleCache();
    
    // Notify all clients that sync is happening
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_START',
        message: 'Syncing latest data...'
      });
    });
    
    console.log('[SW] Cloud data sync completed');
    
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('BizTras Cloud', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Enhanced message handling from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      (async () => {
        await cleanupStaleCache();
        event.ports[0].postMessage({ success: true });
      })()
    );
  }
  
  if (event.data && event.data.type === 'FORCE_REFRESH') {
    event.waitUntil(
      (async () => {
        // Clear all runtime cache
        const cache = await caches.open(RUNTIME_CACHE);
        const requests = await cache.keys();
        await Promise.all(requests.map(request => cache.delete(request)));
        
        event.ports[0].postMessage({ success: true });
      })()
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'sync-cloud-data') {
    event.waitUntil(syncCloudData());
  }
  
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupStaleCache());
  }
});

// Regular cache cleanup every 10 minutes
setInterval(() => {
  cleanupStaleCache();
}, 10 * 60 * 1000);

// Error handling
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled rejection:', event.reason);
});

console.log('[SW] Service Worker v2.1.0 loaded successfully with enhanced caching');