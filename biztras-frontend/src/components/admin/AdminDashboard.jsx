import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { 
  FiUsers, 
  FiCloud, 
  FiActivity, 
  FiTrendingUp, 
  FiUserCheck, 
  FiUserX, 
  FiArrowUp, 
  FiArrowDown,
  FiMoreVertical,
  FiRefreshCw
} from 'react-icons/fi';
import api from '../../services/api';

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    cloudUsers: 0,
    pendingRequests: 0,
    activeReports: 0
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, usersResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/pending-users')
      ]);

      setStats(statsResponse.data);
      setPendingUsers(usersResponse.data.users || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handleUserAction = async (userId, action) => {
    try {
      await api.post(`/admin/users/${userId}/${action}`);
      
      toast.success(`User ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchDashboardData();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, description }) => (
    <div className={`card p-6 hover:shadow-lg transition-all duration-200 ${
      isDark ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {value}
          </p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend.positive ? 'text-success-600' : 'text-error-600'
            }`}>
              {trend.positive ? <FiArrowUp size={16} /> : <FiArrowDown size={16} />}
              <span className="ml-1">{trend.value}%</span>
              <span className={`ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                vs last month
              </span>
            </div>
          )}
          {description && (
            <p className={`text-xs mt-1 ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>
              {description}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`card p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="skeleton h-4 w-20 mb-4"></div>
              <div className="skeleton h-8 w-16 mb-2"></div>
              <div className="skeleton h-3 w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Admin Dashboard
          </h1>
          <p className={`mt-2 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-secondary mt-4 sm:mt-0"
        >
          <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={FiUsers}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          trend={{ positive: true, value: 12 }}
          description="Registered users"
        />
        <StatCard
          title="Cloud Users"
          value={stats.cloudUsers}
          icon={FiCloud}
          color="bg-gradient-to-r from-green-500 to-green-600"
          trend={{ positive: true, value: 8 }}
          description="Active cloud access"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={FiActivity}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
          description="Awaiting approval"
        />
        <StatCard
          title="Active Reports"
          value={stats.activeReports}
          icon={FiTrendingUp}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          trend={{ positive: true, value: 5 }}
          description="Cloud reports"
        />
      </div>

      {/* Pending Users Section */}
      <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Pending User Requests
              </h2>
              <p className={`text-sm mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Users waiting for cloud access approval
              </p>
            </div>
            <span className="badge badge-warning">
              {pendingUsers.length} pending
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {pendingUsers.length === 0 ? (
            <div className="p-12 text-center">
              <FiUserCheck className={`mx-auto h-12 w-12 mb-4 ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                No pending requests
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                All user requests have been processed.
              </p>
            </div>
          ) : (
            pendingUsers.map((user) => (
              <div key={user._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-medium ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {user.name}
                      </h3>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {user.email}
                      </p>
                      <p className={`text-xs mt-1 ${
                        isDark ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        Requested {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUserAction(user._id, 'approve')}
                      className="btn btn-success btn-sm"
                    >
                      <FiUserCheck className="mr-1" size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleUserAction(user._id, 'reject')}
                      className="btn btn-danger btn-sm"
                    >
                      <FiUserX className="mr-1" size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;