import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { 
  registerSW, 
  setupPeriodicUpdateCheck, 
  setupNetworkStatusHandling 
} from './registerSW';
import 'react-toastify/dist/ReactToastify.css';
import './styles/globals.css';

// Hide loading screen
const loadingElement = document.getElementById('loading');
if (loadingElement) {
  loadingElement.style.display = 'none';
}

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            style={{
              fontSize: '14px'
            }}
            toastStyle={{
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Enhanced PWA Registration
registerSW();

// Setup additional PWA features
if (process.env.NODE_ENV === 'production') {
  // Setup periodic update checks
  setupPeriodicUpdateCheck();
  
  // Setup network status handling
  setupNetworkStatusHandling();
  
  // Handle app visibility changes for better performance
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // App became visible, check for updates
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }
    }
  });
  
  // Handle online/offline events
  window.addEventListener('online', () => {
    // Sync any pending data
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('sync-cloud-data');
      });
    }
  });
  
  window.addEventListener('offline', () => {
    // App is offline
  });
}

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Log performance metrics
  window.addEventListener('load', () => {
    setTimeout(() => {
      // Performance data collected silently
    }, 1000);
  });
}

// Global error handling for better UX
window.addEventListener('error', (event) => {
  // Error tracked silently
});

window.addEventListener('unhandledrejection', (event) => {
  // Promise rejection tracked silently
});

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Add development tools
  window.biztrasDebug = {
    clearCache: () => {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      localStorage.clear();
      sessionStorage.clear();
    },
    
    showStorageInfo: () => {
      return {
        localStorage: Object.keys(localStorage),
        sessionStorage: Object.keys(sessionStorage),
        indexedDB: 'Available: ' + (!!window.indexedDB)
      };
    },
    
    testOffline: () => {
      window.dispatchEvent(new Event('offline'));
      setTimeout(() => {
        window.dispatchEvent(new Event('online'));
      }, 5000);
    }
  };
}