import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { FiActivity, FiAlertCircle, FiMail } from 'react-icons/fi';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, loading } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-specific access
  if (requiredRole) {
    if (requiredRole === 'admin' && currentUser.role !== 'admin') {
      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <div className={`card p-6 sm:p-8 max-w-md mx-auto text-center ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <FiAlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Access Denied
            </h2>
            <p className={`mb-6 text-sm sm:text-base ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              You need administrator privileges to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn btn-secondary w-full sm:w-auto"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    if (requiredRole === 'clouduser' && (!currentUser.cloudUser || currentUser.cloudUser !== true)) {
      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <div className={`card p-6 sm:p-8 max-w-md mx-auto text-center ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <FiActivity className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Cloud Access Pending
            </h2>
            <p className={`mb-4 text-sm sm:text-base ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Your cloud access is pending admin approval. You'll receive an email notification once approved.
            </p>
            <div className={`p-4 rounded-lg mb-6 ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="flex items-center text-sm">
                <FiMail className="mr-2 text-gray-500" size={16} />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Status will be sent to: {currentUser?.email}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Contact your administrator for faster approval
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;