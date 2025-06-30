import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff, FiMail, FiLock, FiSun, FiMoon, FiLoader } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Advanced Background Pattern */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className={`absolute top-20 left-20 w-96 h-96 rounded-full opacity-30 blur-3xl animate-pulse ${
          isDark ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-blue-300 to-cyan-300'
        }`}></div>
        <div className={`absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-20 blur-3xl animate-pulse delay-1000 ${
          isDark ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-purple-300 to-pink-300'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-25 blur-2xl animate-pulse delay-500 ${
          isDark ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-green-300 to-blue-300'
        }`}></div>
        
        {/* Grid pattern overlay */}
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]' 
            : 'bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)]'
        } bg-[size:100px_100px]`}></div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-50 p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105 ${
          isDark 
            ? 'bg-white/10 border-white/20 text-yellow-400 hover:bg-white/20 shadow-lg' 
            : 'bg-white/30 border-white/30 text-gray-700 hover:bg-white/50 shadow-xl'
        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
      >
        {isDark ? <FiSun size={24} /> : <FiMoon size={24} />}
      </button>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className={`absolute -inset-4 rounded-3xl blur-xl opacity-50 ${
                isDark ? 'bg-gradient-to-r from-blue-400 to-purple-400' : 'bg-gradient-to-r from-blue-300 to-purple-300'
              }`}></div>
              <img
                className="relative w-20 h-20 mx-auto rounded-3xl shadow-2xl transition-transform duration-300 hover:scale-110"
                src="/icons/icon-192x192.png"
                alt="BizTras Logo"
                onError={(e) => {
                  e.target.src = '/biztras.png';
                }}
              />
            </div>
            <div className="space-y-3">
              <h2 className={`text-4xl font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Welcome back
              </h2>
              <p className={`text-lg ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Sign in to your BizTras Cloud account
              </p>
            </div>
          </div>

          {/* Form Card with Glassmorphism */}
          <div className={`relative backdrop-blur-xl rounded-3xl p-8 shadow-2xl border transition-all duration-300 ${
            isDark 
              ? 'bg-white/5 border-white/10 shadow-black/20' 
              : 'bg-white/20 border-white/30 shadow-black/10'
          }`}>
            {/* Gradient border effect */}
            <div className={`absolute -inset-0.5 rounded-3xl opacity-30 blur-sm ${
              isDark 
                ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' 
                : 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400'
            }`}></div>
            
            <form className="relative space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Email address
                </label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <FiMail size={20} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-200 ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:bg-white/10 focus:border-white/20' 
                        : 'bg-white/30 border-white/20 text-gray-900 placeholder-gray-600 focus:bg-white/50 focus:border-white/40'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <FiLock size={20} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-200 ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:bg-white/10 focus:border-white/20' 
                        : 'bg-white/30 border-white/20 text-gray-900 placeholder-gray-600 focus:bg-white/50 focus:border-white/40'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                } focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <FiLoader className="animate-spin mr-3" size={20} />
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>

              {/* Register Link */}
              <div className="text-center pt-4">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Additional Info */}
          <div className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>Secure access to your cloud infrastructure</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;