import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  FiUsers, 
  FiCloud, 
  FiHome, 
  FiX, 
  FiMenu,
  FiChevronLeft, 
  FiChevronRight 
} from 'react-icons/fi';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, setIsMobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  const navigation = [
    ...(currentUser?.role === 'admin' ? [
      {
        name: 'Dashboard',
        href: '/admin',
        icon: FiHome,
        description: 'Overview & Analytics'
      },
      {
        name: 'User Management',
        href: '/admin/users',
        icon: FiUsers,
        description: 'Manage Users & Permissions'
      }
    ] : []),
    ...(currentUser?.cloudUser ? [
      {
        name: 'Cloud Dashboard',
        href: '/cloud-dashboard',
        icon: FiCloud,
        description: 'Infrastructure Management'
      }
    ] : [])
  ];

  const quickStats = currentUser?.role === 'admin' ? [
    { label: 'Active Users', value: '24', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Cloud Services', value: '12', color: 'text-green-600 dark:text-green-400' },
    { label: 'Pending', value: '3', color: 'text-yellow-600 dark:text-yellow-400' }
  ] : [
    { label: 'Services', value: '8', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Online', value: '7', color: 'text-green-600 dark:text-green-400' },
    { label: 'Issues', value: '1', color: 'text-red-600 dark:text-red-400' }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ${
        // Mobile styles
        isMobileMenuOpen 
          ? 'w-80 translate-x-0' 
          : 'w-80 -translate-x-full lg:translate-x-0'
      } ${
        // Desktop styles
        'lg:w-72 xl:w-80'
      } ${
        isCollapsed && !isMobileMenuOpen ? 'lg:w-20' : ''
      } ${
        isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'
      } border-r backdrop-blur-md pt-16`}>
        
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className={`absolute top-4 right-4 p-2 rounded-lg lg:hidden ${
            isDark 
              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
              : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FiX size={20} />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-20 z-50 p-1.5 rounded-full border transition-all duration-200 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-300' 
              : 'bg-white border-gray-200 text-gray-600 hover:text-gray-700'
          } shadow-lg hover:shadow-xl hidden lg:flex items-center justify-center`}
        >
          {isCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`group relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? isDark
                      ? 'bg-primary-900/50 text-primary-300 shadow-lg'
                      : 'bg-primary-50 text-primary-700 shadow-md'
                    : isDark
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                } ${isCollapsed && !isMobileMenuOpen ? 'lg:justify-center' : ''}`}
                title={isCollapsed && !isMobileMenuOpen ? item.name : ''}
              >
                <div className="flex items-center space-x-3 min-w-0 w-full">
                  <item.icon 
                    className={`flex-shrink-0 transition-colors duration-200 ${
                      isActive 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`}
                    size={22}
                  />
                  {(!isCollapsed || isMobileMenuOpen) && (
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${
                        isActive 
                          ? 'text-primary-700 dark:text-primary-300' 
                          : 'text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white'
                      }`}>
                        {item.name}
                      </p>
                      <p className={`text-xs truncate mt-0.5 ${
                        isDark ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-600 rounded-r-full" />
                )}
              </NavLink>
            );
          })}
        </nav>


        {/* Footer */}
        <div className={`p-4 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          {(!isCollapsed || isMobileMenuOpen) ? (
            <div className="text-center">
              <p className={`text-sm font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                BizTras Cloud 
              </p>
              <p className={`text-xs ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                v1.0
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <span className={`text-xs font-bold ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  B
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;