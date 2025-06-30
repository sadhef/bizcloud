import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import CloudDashboard from './components/cloud/CloudDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { currentUser, loading } = useAuth();
  const { isDark } = useTheme();

  if (loading) {
    return <LoadingSpinner text="Initializing BizTras Cloud..." />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'dark' : ''}`}>
      <Routes>
        <Route 
          path="/login" 
          element={!currentUser ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!currentUser ? <Register /> : <Navigate to="/dashboard" />} 
        />

        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/cloud-dashboard" 
            element={
              <ProtectedRoute requiredRole="clouduser">
                <CloudDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                {currentUser?.role === 'admin' ? (
                  <Navigate to="/admin" />
                ) : currentUser?.cloudUser ? (
                  <Navigate to="/cloud-dashboard" />
                ) : (
                  <ProtectedRoute />
                )}
              </ProtectedRoute>
            } 
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}

export default App;