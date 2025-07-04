import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const PushContext = createContext();

export const usePush = () => {
  const context = useContext(PushContext);
  if (!context) {
    throw new Error('usePush must be used within PushProvider');
  }
  return context;
};

// Check if push notifications are supported
const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

// Convert VAPID key
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const PushProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);
  const [vapidKey, setVapidKey] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize
  useEffect(() => {
    const init = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);
      
      if (supported && currentUser) {
        try {
          // Get VAPID key
          const response = await api.get('/push-notifications/vapid-key');
          setVapidKey(response.data.publicKey);
          
          // Check subscription status
          const statusResponse = await api.get('/push-notifications/status');
          setIsSubscribed(statusResponse.data.isSubscribed);
        } catch (error) {
          console.error('Push init error:', error);
        }
      }
      
      setLoading(false);
    };

    init();
  }, [currentUser]);

  // Subscribe to notifications
  const subscribe = async () => {
    if (!isSupported || !currentUser || !vapidKey) {
      throw new Error('Push notifications not supported');
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission !== 'granted') {
        throw new Error('Permission denied');
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      // Send subscription to server
      await api.post('/push-notifications/subscribe', {
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
          }
        }
      });

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Subscribe error:', error);
      throw error;
    }
  };

  // Unsubscribe from notifications
  const unsubscribe = async () => {
    try {
      await api.post('/push-notifications/unsubscribe');
      
      // Also unsubscribe from browser
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      throw error;
    }
  };

  const value = {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribe,
    unsubscribe
  };

  return (
    <PushContext.Provider value={value}>
      {children}
    </PushContext.Provider>
  );
};