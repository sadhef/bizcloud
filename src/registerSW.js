// Fixed registerSW.js - Complete file
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function registerSW() {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl);
        
        // Add some helpful logging for localhost
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service worker. ' +
            'To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        registerValidSW(swUrl);
      }
    });
  }
}

function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('SW registered: ', registration);
      
      // Update available
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content available, show update notification
              showUpdateAvailableNotification();
            } else {
              // Content cached for offline use
              console.log('Content is cached for offline use.');
            }
          }
        });
      });
    })
    .catch((error) => {
      console.log('SW registration failed: ', error);
    });
}

function checkValidServiceWorker(swUrl) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

function showUpdateAvailableNotification() {
  // Create a custom notification for app updates
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div id="update-notification" style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      z-index: 10000;
      max-width: 320px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      animation: slideInFromRight 0.3s ease-out;
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <strong style="font-size: 14px;">Update Available</strong>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          margin-left: 10px;
        ">×</button>
      </div>
      <p style="margin: 0 0 12px 0; font-size: 13px; opacity: 0.9;">
        A new version of BizTras Cloud is available.
      </p>
      <button onclick="window.location.reload()" style="
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s ease;
      " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
        Update Now
      </button>
    </div>
    <style>
      @keyframes slideInFromRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    </style>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    const notificationElement = document.getElementById('update-notification');
    if (notificationElement) {
      notificationElement.style.animation = 'slideInFromRight 0.3s ease-out reverse';
      setTimeout(() => {
        notificationElement.remove();
      }, 300);
    }
  }, 10000);
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Enhanced service worker with better caching strategies
export function updateServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.update();
    });
  }
}

// Check for updates periodically
export function setupPeriodicUpdateCheck() {
  if ('serviceWorker' in navigator) {
    setInterval(() => {
      updateServiceWorker();
    }, 60000); // Check every minute
  }
}

// Handle offline/online status
export function setupNetworkStatusHandling() {
  function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    
    // Create status notification
    const statusNotification = document.createElement('div');
    statusNotification.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isOnline ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        font-weight: 500;
        animation: statusSlideUp 0.3s ease-out;
      ">
        ${isOnline ? '🟢 Back online' : '🔴 You are offline'}
      </div>
      <style>
        @keyframes statusSlideUp {
          from {
            transform: translateX(-50%) translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      </style>
    `;
    
    document.body.appendChild(statusNotification);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      statusNotification.style.animation = 'statusSlideUp 0.3s ease-out reverse';
      setTimeout(() => {
        statusNotification.remove();
      }, 300);
    }, 3000);
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
}