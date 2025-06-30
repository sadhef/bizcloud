import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const LoadingSpinner = ({ size = 'default', text = 'Loading...' }) => {
  const { isDark } = useTheme();

  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="text-center space-y-4 animate-fade-in">
        {/* Logo with Animation */}
        <div className="relative inline-block">
          <img
            src="/biztras.png"
            alt="BizTras"
            className="w-16 h-16 mx-auto rounded-2xl shadow-lg animate-pulse-slow"
          />
          <div className="absolute inset-0 rounded-2xl border-4 border-t-primary-500 border-r-transparent border-b-primary-500 border-l-transparent animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <div className="space-y-2">
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {text}
          </h3>
          <div className="flex justify-center space-x-1">
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              isDark ? 'bg-primary-400' : 'bg-primary-600'
            }`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              isDark ? 'bg-primary-400' : 'bg-primary-600'
            }`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              isDark ? 'bg-primary-400' : 'bg-primary-600'
            }`} style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;