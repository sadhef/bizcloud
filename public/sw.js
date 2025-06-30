const CACHE_NAME = 'biztras-cloud-v2.0.0';
const RUNTIME_CACHE = 'biztras-runtime-v1';
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

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^\/api\/auth\/verify$/,
  /^\/api\/cloud-report\/data$/,
  /^\/api\/backup-server\/data$/
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

// Fetch event - implement caching strategies
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
    
    // Strategy 2: API calls - Network First with cache fallback
    if (url.pathname.startsWith('/api/')) {
      return await networkFirst(request, RUNTIME_CACHE);
    }
    
    // Strategy 3: Static assets - Cache First
    if (url.pathname.startsWith('/static/') || 
        url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
      return await cacheFirst(request, CACHE_NAME);
    }
    
    // Strategy 4: Navigation - Network First with offline fallback
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

// Network First strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    console.log('[SW] Network first:', request.url);
    const response = await fetch(request);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
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

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-cloud-data') {
    event.waitUntil(syncCloudData());
  }
});

async function syncCloudData() {
  try {
    // Get pending sync data from IndexedDB or localStorage
    console.log('[SW] Syncing cloud data...');
    
    // Implementation would depend on your offline data strategy
    // This is a placeholder for your sync logic
    
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

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'sync-cloud-data') {
    event.waitUntil(syncCloudData());
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled rejection:', event.reason);
});

console.log('[SW] Service Worker loaded successfully');