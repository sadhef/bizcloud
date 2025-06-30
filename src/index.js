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
    console.log('App is online');
    // Sync any pending data
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('sync-cloud-data');
      });
    }
  });
  
  window.addEventListener('offline', () => {
    console.log('App is offline');
  });
}

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Log performance metrics
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('Performance metrics:', {
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        totalLoadTime: perfData.loadEventEnd - perfData.fetchStart
      });
    }, 1000);
  });
}

// Global error handling for better UX
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Could send to error reporting service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Could send to error reporting service
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
      console.log('All caches and storage cleared');
    },
    
    showStorageInfo: () => {
      console.log('Storage info:', {
        localStorage: Object.keys(localStorage),
        sessionStorage: Object.keys(sessionStorage),
        indexedDB: 'Available: ' + (!!window.indexedDB)
      });
    },
    
    testOffline: () => {
      console.log('Testing offline mode...');
      window.dispatchEvent(new Event('offline'));
      setTimeout(() => {
        window.dispatchEvent(new Event('online'));
        console.log('Back online');
      }, 5000);
    }
  };
  
  console.log('Development tools available at window.biztrasDebug');
}