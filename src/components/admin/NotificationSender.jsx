import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { FiBell, FiSend, FiUsers, FiX } from 'react-icons/fi';
import api from '../../services/api';

const NotificationSender = ({ isOpen, onClose, targetUser = null }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      const endpoint = targetUser 
        ? '/push-notifications/send-to-user'
        : '/push-notifications/send-to-all';
      
      const payload = {
        title: formData.title.trim(),
        message: formData.message.trim()
      };
      
      if (targetUser) {
        payload.userId = targetUser._id;
      }

      const response = await api.post(endpoint, payload);
      
      toast.success(
        targetUser 
          ? `Notification sent to ${targetUser.name}`
          : `Notification sent to ${response.data.sent} users`
      );
      
      setFormData({ title: '', message: '' });
      onClose();
    } catch (error) {
      console.error('Send notification error:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md mx-auto rounded-xl shadow-2xl border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <FiBell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Send Push Notification
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {targetUser ? `To: ${targetUser.name}` : 'To: All Users'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter notification title"
                maxLength={100}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              <p className={`text-xs mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formData.title.length}/100 characters
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter notification message"
                rows={4}
                maxLength={300}
                className={`w-full px-3 py-2 border rounded-lg resize-none ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              <p className={`text-xs mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formData.message.length}/300 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending || !formData.title.trim() || !formData.message.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" size={16} />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info */}
          <div className={`mt-4 p-3 rounded-lg ${
            isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
          } border`}>
            <div className="flex items-center space-x-2">
              {targetUser ? (
                <FiUsers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <FiBell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
              <p className={`text-xs ${
                isDark ? 'text-blue-200' : 'text-blue-800'
              }`}>
                {targetUser 
                  ? 'This notification will be sent only to the selected user.'
                  : 'This notification will be sent to all users who have enabled push notifications.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSender;