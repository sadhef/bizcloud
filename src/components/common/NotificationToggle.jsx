import React, { useState } from 'react';
import { usePush } from '../../context/PushContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { FiBell, FiBellOff, FiLoader } from 'react-icons/fi';

const NotificationToggle = () => {
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe } = usePush();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success('Push notifications disabled');
      } else {
        await subscribe();
        toast.success('Push notifications enabled! You\'ll receive important updates.');
      }
    } catch (error) {
      if (error.message.includes('Permission denied')) {
        toast.error('Please enable notifications in your browser settings');
      } else {
        toast.error('Failed to update notification settings');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading || permission === 'denied'}
      className={`p-2 rounded-lg transition-colors ${
        isDark 
          ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      } ${permission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isSubscribed ? 'Disable notifications' : 'Enable notifications'}
    >
      {loading ? (
        <FiLoader className="animate-spin" size={20} />
      ) : isSubscribed ? (
        <FiBell className="text-green-500" size={20} />
      ) : (
        <FiBellOff size={20} />
      )}
    </button>
  );
};

export default NotificationToggle;