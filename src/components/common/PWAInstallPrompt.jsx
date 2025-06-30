import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FiDownload, FiX, FiSmartphone, FiMonitor } from 'react-icons/fi';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if app is already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt
      if (!standalone) {
        setShowInstallPrompt(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS devices, show manual install instructions
    if (iOS && !standalone) {
      // Show iOS install prompt after a delay
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferredPrompt
      setDeferredPrompt(null);
    }
    
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isStandalone || 
      sessionStorage.getItem('pwa-install-dismissed') || 
      !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-in">
      <div className={`relative backdrop-blur-xl rounded-2xl p-6 shadow-2xl border transition-all duration-300 ${
        isDark 
          ? 'bg-white/10 border-white/20 shadow-black/20' 
          : 'bg-white/90 border-white/30 shadow-black/10'
      }`}>
        {/* Gradient border effect */}
        <div className={`absolute -inset-0.5 rounded-2xl opacity-30 blur-sm ${
          isDark 
            ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' 
            : 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400'
        }`}></div>
        
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className={`absolute top-3 right-3 p-1 rounded-lg transition-colors ${
            isDark 
              ? 'text-gray-400 hover:text-gray-300 hover:bg-white/10' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'
          }`}
        >
          <FiX size={18} />
        </button>

        <div className="relative space-y-4">
          {/* Header with icon */}
          <div className="flex items-start space-x-3">
            <div className={`p-3 rounded-xl ${
              isDark ? 'bg-blue-500/20' : 'bg-blue-500/10'
            }`}>
              {isIOS ? (
                <FiSmartphone className="w-6 h-6 text-blue-500" />
              ) : (
                <FiDownload className="w-6 h-6 text-blue-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-lg ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Install BizTras Cloud
              </h3>
              <p className={`text-sm mt-1 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {isIOS 
                  ? 'Add to your home screen for quick access'
                  : 'Install our app for a better experience'
                }
              </p>
            </div>
          </div>

          {/* iOS specific instructions */}
          {isIOS && (
            <div className={`p-4 rounded-xl border ${
              isDark 
                ? 'bg-blue-500/10 border-blue-500/20' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${
                  isDark ? 'text-blue-300' : 'text-blue-800'
                }`}>
                  To install:
                </p>
                <ol className={`text-sm space-y-1 ${
                  isDark ? 'text-blue-200' : 'text-blue-700'
                }`}>
                  <li>1. Tap the Share button <span className="inline-block w-4 h-4 bg-blue-500 rounded text-white text-xs text-center">↗</span></li>
                  <li>2. Select "Add to Home Screen"</li>
                  <li>3. Tap "Add" in the top right</li>
                </ol>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-3">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Install App
              </button>
            )}
            <button
              onClick={handleDismiss}
              className={`${isIOS ? 'flex-1' : 'px-4'} py-3 rounded-xl font-medium transition-colors ${
                isDark 
                  ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {isIOS ? 'Got it' : 'Later'}
            </button>
          </div>

          {/* Features list */}
          <div className="space-y-2">
            <p className={`text-xs font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Benefits:
            </p>
            <ul className={`text-xs space-y-1 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <li>• Faster loading times</li>
              <li>• Offline functionality</li>
              <li>• Desktop notifications</li>
              <li>• No browser bars</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;