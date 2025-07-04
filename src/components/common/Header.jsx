import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationToggle from './NotificationToggle';
import { FiSun, FiMoon, FiUser, FiLogOut, FiChevronDown, FiSettings, FiMenu } from 'react-icons/fi';

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = () => {
    if (currentUser?.role === 'admin') {
      return 'Administrator';
    }
    return currentUser?.cloudUser ? 'Cloud User' : 'User';
  };

  const getRoleColor = () => {
    if (currentUser?.role === 'admin') {
      return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900';
    }
    return currentUser?.cloudUser 
      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900'
      : 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800';
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 ${
      isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'
    } backdrop-blur-md border-b transition-all duration-200`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side - Logo & Mobile Menu */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg lg:hidden transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiMenu size={20} />
            </button>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src="/biztras.png"
                  alt="BizTras"
                  className="w-8 h-8 rounded-lg transition-transform duration-200 hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-sm"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  BizTras Cloud
                </h1>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                } hidden md:block`}>
                  Infrastructure Management
                </p>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Push Notification Toggle */}
            <NotificationToggle />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-800' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  {getInitials(currentUser?.name || 'User')}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{currentUser?.name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {getRoleBadge()}
                  </p>
                </div>
                <FiChevronDown size={16} className={`hidden sm:block transition-transform ${
                  showUserMenu ? 'rotate-180' : ''
                }`} />
              </button>

              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl shadow-lg ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                } animate-scale-in`}>
                  <div className="p-4">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-medium ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {getInitials(currentUser?.name || 'User')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {currentUser?.name}
                        </p>
                        <p className={`text-sm truncate ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {currentUser?.email}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleColor()}`}>
                          {getRoleBadge()}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-4 space-y-1">
                      <button
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          isDark 
                            ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <FiSettings size={18} />
                        <span className="text-sm">Settings</span>
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FiLogOut size={18} />
                        <span className="text-sm">Sign out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;