import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { 
  FiSearch, 
  FiUserCheck, 
  FiUserX, 
  FiTrash2, 
  FiFilter,
  FiMoreVertical,
  FiRefreshCw,
  FiUsers,
  FiEye
} from 'react-icons/fi';
import api from '../../services/api';

const UserManagement = () => {
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', '10');
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const data = await api.get(`/admin/users?${params.toString()}`);
      setUsers(data.data.users);
      setTotalPages(data.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await api.post(`/admin/users/${userId}/${action}`);
      toast.success(`User ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const toggleCloudAccess = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/cloud-access`, {
        cloudUser: !currentStatus
      });
      toast.success(`Cloud access ${!currentStatus ? 'granted' : 'revoked'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating cloud access:', error);
      toast.error('Failed to update cloud access');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'badge badge-warning',
      approved: 'badge badge-success',
      rejected: 'badge badge-error'
    };

    return (
      <span className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="skeleton h-8 w-48"></div>
          <div className="skeleton h-10 w-24"></div>
        </div>
        <div className="card p-4">
          <div className="skeleton h-10 w-full mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border-b">
              <div className="skeleton h-12 w-12 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32"></div>
                <div className="skeleton h-3 w-48"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            User Management
          </h1>
          <p className={`mt-2 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage user accounts and cloud access permissions
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="btn btn-secondary"
        >
          <FiRefreshCw size={16} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className={`card p-4 sm:p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-blue-500">
              <FiUsers className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Users
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {users.length}
              </p>
            </div>
          </div>
        </div>

        <div className={`card p-4 sm:p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-green-500">
              <FiUserCheck className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Approved
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {users.filter(u => u.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className={`card p-4 sm:p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-yellow-500">
              <FiUserX className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {users.filter(u => u.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`card p-4 sm:p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDark ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input min-w-0 flex-1 sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary sm:hidden"
            >
              <FiFilter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className={`card overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Mobile View */}
        <div className="sm:hidden">
          {users.map((user) => (
            <div key={user._id} className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
              isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
            }`}>
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-medium ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {getInitials(user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-sm ${
                        isDark ? 'text-white' : 'text-gray-900'
                      } truncate`}>
                        {user.name}
                      </h3>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      } truncate`}>
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        {getStatusBadge(user.status)}
                        <button
                          onClick={() => toggleCloudAccess(user._id, user.cloudUser)}
                          disabled={user.role === 'admin'}
                          className={`text-xs px-2 py-1 rounded-full ${
                            user.cloudUser
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          } ${user.role === 'admin' ? 'opacity-50' : ''}`}
                        >
                          {user.cloudUser ? 'Cloud ✓' : 'No Cloud'}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUserAction(user._id, 'approve')}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                          >
                            <FiUserCheck size={16} />
                          </button>
                          <button
                            onClick={() => handleUserAction(user._id, 'reject')}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <FiUserX size={16} />
                          </button>
                        </>
                      )}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    <span>{user.lastLogin ? `Last login: ${new Date(user.lastLogin).toLocaleDateString()}` : 'Never'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">User</th>
                <th className="text-left">Status</th>
                <th className="text-left">Cloud Access</th>
                <th className="text-left">Join Date</th>
                <th className="text-left">Last Login</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        } truncate`}>
                          {user.name}
                        </p>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        } truncate`}>
                          {user.email}
                        </p>
                        {user.role === 'admin' && (
                          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            Administrator
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>
                    <button
                      onClick={() => toggleCloudAccess(user._id, user.cloudUser)}
                      disabled={user.role === 'admin'}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        user.cloudUser
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                      } ${user.role === 'admin' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      {user.cloudUser ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td>
                    <div className="flex justify-end space-x-1">
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUserAction(user._id, 'approve')}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                            title="Approve"
                          >
                            <FiUserCheck size={16} />
                          </button>
                          <button
                            onClick={() => handleUserAction(user._id, 'reject')}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Reject"
                          >
                            <FiUserX size={16} />
                          </button>
                        </>
                      )}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-12 text-center">
            <FiUsers className={`mx-auto h-12 w-12 mb-4 ${
              isDark ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-900'
            }`}>
              No users found
            </h3>
            <p className={`text-sm ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Try adjusting your search criteria.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`px-4 sm:px-6 py-4 border-t ${
            isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;