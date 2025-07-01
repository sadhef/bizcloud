const STORAGE_KEYS = {
  AUTH: 'biztras_auth',
  THEME: 'biztras_theme',
  USER_PREFERENCES: 'biztras_preferences',
  DASHBOARD_CACHE: 'biztras_dashboard_cache',
  LAST_SYNC: 'biztras_last_sync',
  APP_VERSION: 'biztras_app_version'
};

// Storage utilities with enhanced error handling
const storage = {
  // Generic get method with error handling
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return defaultValue;
    }
  },

  // Generic set method with error handling
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      return false;
    }
  },

  // Generic remove method
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      return false;
    }
  },

  // Clear all app data
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing all storage:', error);
      return false;
    }
  },

  // Check storage quota
  checkQuota: async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentUsed = quota > 0 ? (usage / quota * 100).toFixed(2) : 0;
        
        console.log(`Storage usage: ${usage} bytes (${percentUsed}% of ${quota} bytes)`);
        
        return {
          usage,
          quota,
          percentUsed: parseFloat(percentUsed),
          available: quota - usage
        };
      } catch (error) {
        console.error('Error checking storage quota:', error);
        return null;
      }
    }
    return null;
  }
};

// Auth-specific functions
export const getStoredAuth = () => {
  const auth = storage.get(STORAGE_KEYS.AUTH);
  
  // Validate auth structure
  if (auth && typeof auth === 'object' && auth.token && auth.user) {
    return auth;
  }
  
  // Clear invalid auth data
  if (auth) {
    console.warn('Invalid auth data found, clearing...');
    clearStoredAuth();
  }
  
  return null;
};

export const setStoredAuth = (authData) => {
  if (!authData || !authData.token || !authData.user) {
    console.error('Invalid auth data provided');
    return false;
  }
  
  const success = storage.set(STORAGE_KEYS.AUTH, {
    ...authData,
    timestamp: Date.now() // Add timestamp for validation
  });
  
  if (success) {
    console.log('Auth data stored successfully');
  }
  
  return success;
};

export const clearStoredAuth = () => {
  const success = storage.remove(STORAGE_KEYS.AUTH);
  if (success) {
    console.log('Auth data cleared');
  }
  return success;
};

// Theme-specific functions
export const getStoredTheme = () => {
  return storage.get(STORAGE_KEYS.THEME, 'light');
};

export const setStoredTheme = (theme) => {
  if (!['light', 'dark'].includes(theme)) {
    console.error('Invalid theme provided:', theme);
    return false;
  }
  
  return storage.set(STORAGE_KEYS.THEME, theme);
};

// Dashboard cache functions
export const getDashboardCache = () => {
  const cache = storage.get(STORAGE_KEYS.DASHBOARD_CACHE);
  
  // Check if cache is expired (older than 5 minutes)
  if (cache && cache.timestamp) {
    const age = Date.now() - cache.timestamp;
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    if (age > maxAge) {
      console.log('Dashboard cache expired, clearing...');
      clearDashboardCache();
      return null;
    }
    
    return cache.data;
  }
  
  return null;
};

export const setDashboardCache = (data) => {
  if (!data) {
    console.error('No data provided for dashboard cache');
    return false;
  }
  
  const cacheData = {
    data,
    timestamp: Date.now(),
    version: '1.0'
  };
  
  const success = storage.set(STORAGE_KEYS.DASHBOARD_CACHE, cacheData);
  if (success) {
    console.log('Dashboard cache updated');
  }
  
  return success;
};

export const clearDashboardCache = () => {
  return storage.remove(STORAGE_KEYS.DASHBOARD_CACHE);
};

// Last sync tracking
export const getLastSync = () => {
  return storage.get(STORAGE_KEYS.LAST_SYNC);
};

export const setLastSync = (syncData) => {
  const data = {
    ...syncData,
    timestamp: Date.now()
  };
  
  return storage.set(STORAGE_KEYS.LAST_SYNC, data);
};

// App version tracking
export const getStoredAppVersion = () => {
  return storage.get(STORAGE_KEYS.APP_VERSION);
};

export const setStoredAppVersion = (version) => {
  return storage.set(STORAGE_KEYS.APP_VERSION, {
    version,
    timestamp: Date.now()
  });
};

// User preferences
export const getUserPreferences = () => {
  return storage.get(STORAGE_KEYS.USER_PREFERENCES, {
    autoSave: true,
    syncInterval: 30000, // 30 seconds
    notifications: true,
    compactMode: false
  });
};

export const setUserPreferences = (preferences) => {
  const currentPrefs = getUserPreferences();
  const updatedPrefs = {
    ...currentPrefs,
    ...preferences,
    lastUpdated: Date.now()
  };
  
  return storage.set(STORAGE_KEYS.USER_PREFERENCES, updatedPrefs);
};

// Migration utilities
export const migrateStorageData = () => {
  try {
    console.log('Checking for storage migration...');
    
    // Check current app version
    const storedVersion = getStoredAppVersion();
    const currentVersion = process.env.REACT_APP_VERSION || '1.0.0';
    
    if (!storedVersion || storedVersion.version !== currentVersion) {
      console.log(`Migrating from ${storedVersion?.version || 'unknown'} to ${currentVersion}`);
      
      // Clear potentially incompatible cache
      clearDashboardCache();
      
      // Update version
      setStoredAppVersion(currentVersion);
      
      console.log('Storage migration completed');
    }
    
    return true;
  } catch (error) {
    console.error('Storage migration failed:', error);
    return false;
  }
};

// Storage health check
export const performStorageHealthCheck = async () => {
  const health = {
    status: 'healthy',
    issues: [],
    recommendations: []
  };
  
  try {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      health.status = 'critical';
      health.issues.push('localStorage not available');
      return health;
    }
    
    // Test write/read capability
    const testKey = 'biztras_health_check';
    const testValue = { test: true, timestamp: Date.now() };
    
    localStorage.setItem(testKey, JSON.stringify(testValue));
    const retrieved = JSON.parse(localStorage.getItem(testKey));
    localStorage.removeItem(testKey);
    
    if (!retrieved || retrieved.test !== true) {
      health.status = 'critical';
      health.issues.push('localStorage read/write failed');
    }
    
    // Check storage quota
    const quota = await storage.checkQuota();
    if (quota) {
      if (quota.percentUsed > 90) {
        health.status = 'warning';
        health.issues.push(`Storage almost full (${quota.percentUsed}%)`);
        health.recommendations.push('Clear browser data or contact support');
      } else if (quota.percentUsed > 75) {
        health.recommendations.push('Consider clearing old data to free up space');
      }
    }
    
    // Check for corrupted auth data
    try {
      const auth = getStoredAuth();
      if (auth && (!auth.token || !auth.user)) {
        health.issues.push('Corrupted auth data detected');
        health.recommendations.push('Please log out and log back in');
      }
    } catch (error) {
      health.issues.push('Auth data corruption detected');
      health.recommendations.push('Clear browser data and log in again');
    }
    
    // Check cache age
    const cache = storage.get(STORAGE_KEYS.DASHBOARD_CACHE);
    if (cache && cache.timestamp) {
      const age = Date.now() - cache.timestamp;
      const hours = age / (1000 * 60 * 60);
      
      if (hours > 24) {
        health.recommendations.push('Cache is old, consider refreshing data');
      }
    }
    
    return health;
    
  } catch (error) {
    console.error('Storage health check failed:', error);
    return {
      status: 'critical',
      issues: ['Health check failed', error.message],
      recommendations: ['Clear browser data and try again']
    };
  }
};

// Cleanup utilities
export const performStorageCleanup = () => {
  try {
    console.log('Performing storage cleanup...');
    
    // Clear expired cache
    clearDashboardCache();
    
    // Clean up old sync data
    const lastSync = getLastSync();
    if (lastSync && lastSync.timestamp) {
      const age = Date.now() - lastSync.timestamp;
      const days = age / (1000 * 60 * 60 * 24);
      
      if (days > 7) {
        storage.remove(STORAGE_KEYS.LAST_SYNC);
        console.log('Cleared old sync data');
      }
    }
    
    // Remove any orphaned keys
    const validKeys = Object.values(STORAGE_KEYS);
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (key.startsWith('biztras_') && !validKeys.includes(key)) {
        console.log('Removing orphaned key:', key);
        localStorage.removeItem(key);
      }
    });
    
    console.log('Storage cleanup completed');
    return true;
    
  } catch (error) {
    console.error('Storage cleanup failed:', error);
    return false;
  }
};

// Export storage utilities
export const storageUtils = {
  ...storage,
  performHealthCheck: performStorageHealthCheck,
  performCleanup: performStorageCleanup,
  migrate: migrateStorageData
};

// Auto-initialize
if (typeof window !== 'undefined') {
  // Perform migration on load
  migrateStorageData();
  
  // Auto-cleanup every hour
  setInterval(performStorageCleanup, 60 * 60 * 1000);
  
  // Health check on visibility change
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      performStorageHealthCheck().then(health => {
        if (health.status === 'critical') {
          console.error('Storage health critical:', health);
        }
      });
    }
  });
}

export default storage;