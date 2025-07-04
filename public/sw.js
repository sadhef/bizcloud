const CACHE_NAME = 'biztras-cloud-v2.2.0';
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
  /^\/api\/auth\/verify$/,
  /^\/api\/push-notifications\//
];

// API endpoints that can be cached longer
const LONG_CACHE_API_PATTERNS = [
  /^\/api\/admin\/stats$/,
  /^\/api\/admin\/pending-users$/
];

// Install event - cache core resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(CORE_CACHE_FILES);
        
        // Force activation of new service worker
        self.skipWaiting();
      } catch (error) {
        // Cache failed during install - handled silently
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
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
            return caches.delete(name);
          })
        );
        
        // Take control of all clients
        self.clients.claim();
      } catch (error) {
        // Activation failed - handled silently
      }
    })()
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  try {
    let notificationData = {
      title: 'BizTras Cloud',
      body: 'You have a new notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: {}
    };

    // Parse notification data
    if (event.data) {
      try {
        notificationData = event.data.json();
      } catch (error) {
        notificationData.body = event.data.text();
      }
    }

    // Enhanced notification options
    const notificationOptions = {
      body: notificationData.body,
      icon: notificationData.icon || '/icons/icon-192x192.png',
      badge: notificationData.badge || '/icons/icon-192x192.png',
      data: notificationData.data || {},
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/icons/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ],
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200],
      tag: 'biztras-notification',
      renotify: true,
      timestamp: Date.now(),
      dir: 'auto',
      lang: 'en'
    };

    event.waitUntil(
      self.registration.showNotification(notificationData.title, notificationOptions)
    );
  } catch (error) {
    // Show fallback notification
    event.waitUntil(
      self.registration.showNotification('BizTras Cloud', {
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        actions: [
          {
            action: 'open',
            title: 'Open App'
          }
        ]
      })
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    (async () => {
      try {
        const clients = await self.clients.matchAll({ type: 'window' });
        
        if (event.action === 'close') {
          return;
        }
        
        // Handle open action or notification body click
        const urlToOpen = event.notification.data?.url || '/dashboard';
        
        // Check if app is already open
        for (const client of clients) {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname === urlToOpen) {
            await client.focus();
            return;
          }
        }
        
        // Open new window/tab
        const newWindow = await self.clients.openWindow(urlToOpen);
        if (newWindow) {
          // Window opened successfully
        } else {
          // Failed to open new window - handled silently
        }
        
      } catch (error) {
        // Fallback: try to open dashboard
        try {
          await self.clients.openWindow('/dashboard');
        } catch (fallbackError) {
          // Fallback navigation failed - handled silently
        }
      }
    })()
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  // Track notification dismissal if needed
  const data = event.notification.data || {};
  if (data.trackDismissal) {
    // Could send analytics here if needed
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
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
  
  // Handle navigation messages from notification clicks
  if (event.data && event.data.type === 'NAVIGATION_REQUEST') {
    event.waitUntil(
      (async () => {
        try {
          const clients = await self.clients.matchAll({ type: 'window' });
          if (clients.length > 0) {
            // Focus the first available client and navigate
            await clients[0].focus();
            clients[0].postMessage({
              type: 'NAVIGATE_TO',
              url: event.data.url
            });
          }
        } catch (error) {
          // Navigation request failed - handled silently
        }
      })()
    );
  }
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
      return await fetch(request);
    }
    
    // Strategy 5: Static assets - Cache First
    if (url.pathname.startsWith('/static/') || 
        url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      return await cacheFirst(request, CACHE_NAME);
    }
    
    // Strategy 6: HTML pages - Network First
    return await networkFirst(request, CACHE_NAME);
    
  } catch (error) {
    // Return cached version or offline page
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      const offlinePage = await cache.match(OFFLINE_PAGE);
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

// Cache First strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
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
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Network First with short cache (30 seconds)
async function networkFirstShortCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
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
    const cached = await cache.match(request);
    
    if (cached) {
      const cacheTimestamp = cached.headers.get('sw-cache-timestamp');
      const cacheType = cached.headers.get('sw-cache-type');
      
      if (cacheTimestamp && cacheType === 'short') {
        const isStale = (Date.now() - parseInt(cacheTimestamp)) > 30000; // 30 seconds
        
        if (isStale) {
          cache.delete(request);
          throw error; // Don't use stale cache
        }
      }
      
      return cached;
    }
    
    throw error;
  }
}

// Network First with long cache (5 minutes)
async function networkFirstLongCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
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
    const cached = await cache.match(request);
    
    if (cached) {
      const cacheTimestamp = cached.headers.get('sw-cache-timestamp');
      const cacheType = cached.headers.get('sw-cache-type');
      
      if (cacheTimestamp && cacheType === 'long') {
        const isStale = (Date.now() - parseInt(cacheTimestamp)) > 300000; // 5 minutes
        
        if (isStale) {
          // Try to update in background but still serve cached version
          fetch(request).then(response => {
            if (response.status === 200) {
              const headers = new Headers(response.headers);
              headers.set('sw-cache-timestamp', Date.now().toString());
              headers.set('sw-cache-type', 'long');
              
              const updatedResponse = new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: headers
              });
              
              cache.put(request, updatedResponse);
            }
          }).catch(() => {
            // Background update failed - handled silently
          });
        }
      }
      
      return cached;
    }
    
    throw error;
  }
}

// Cleanup stale cache entries
async function cleanupStaleCache() {
  const cache = await caches.open(RUNTIME_CACHE);
  const requests = await cache.keys();
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const timestamp = response.headers.get('sw-cache-timestamp');
      const cacheType = response.headers.get('sw-cache-type');
      
      if (timestamp && cacheType) {
        const age = Date.now() - parseInt(timestamp);
        const maxAge = cacheType === 'short' ? 30000 : 300000; // 30s or 5m
        
        if (age > maxAge) {
          await cache.delete(request);
        }
      }
    }
  }
}

// Background sync event
self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-cloud-data') {
    event.waitUntil(syncCloudData());
  }
  
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupStaleCache());
  }
});

// Background sync function
async function syncCloudData() {
  try {
    // Sync cloud report data
    await fetch('/api/cloud-report/data');
    
    // Sync backup server data
    await fetch('/api/backup-server/data');
    
  } catch (error) {
    // Sync failed - handled silently
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
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
  // Error handled silently
});

self.addEventListener('unhandledrejection', (event) => {
  // Unhandled rejection handled silently
});

// Push subscription change event
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      try {
        // Re-subscribe with new subscription
        const newSubscription = await event.target.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: event.oldSubscription.options.applicationServerKey
        });
        
        // Send new subscription to server
        await fetch('/api/push-notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subscription: {
              endpoint: newSubscription.endpoint,
              keys: {
                p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(newSubscription.getKey('p256dh')))),
                auth: btoa(String.fromCharCode.apply(null, new Uint8Array(newSubscription.getKey('auth'))))
              }
            }
          })
        });
        
      } catch (error) {
        // Failed to handle subscription change - handled silently
      }
    })()
  );
});