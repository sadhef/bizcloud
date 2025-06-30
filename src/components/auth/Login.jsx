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
    <div className={`min-h-screen flex ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 ${
          isDark ? 'bg-blue-500' : 'bg-blue-200'
        } blur-3xl`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 ${
          isDark ? 'bg-purple-500' : 'bg-purple-200'
        } blur-3xl`}></div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-50 p-3 rounded-xl shadow-lg transition-all duration-300 ${
          isDark 
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border border-gray-700' 
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        } hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500`}
      >
        {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center">
            <div className="relative inline-block">
              <img
                className={`w-16 h-16 mx-auto rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105 ${
                  isDark ? 'ring-4 ring-gray-700' : 'ring-4 ring-white'
                }`}
                src="/biztras.png"
                alt="BizTras Logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className={`absolute -inset-1 rounded-2xl blur opacity-30 ${
                isDark ? 'bg-blue-500' : 'bg-blue-400'
              }`}></div>
            </div>
            <h2 className={`mt-6 text-3xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome back
            </h2>
            <p className={`mt-2 text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Sign in to your BizTras Cloud account
            </p>
          </div>

          {/* Form Card */}
          <div className={`card-elevated p-8 ${
            isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/70 backdrop-blur-sm'
          }`}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">
                  Email address
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-6 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
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
                    className="input pl-11"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">
                  Password
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
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
                    className="input pl-12 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary-600 transition-colors ${
                      isDark ? 'text-gray-400' : 'text-gray-400'
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
                className="btn btn-primary btn-lg w-full relative overflow-hidden"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <FiLoader className="animate-spin mr-2" size={20} />
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>

              {/* Register Link */}
              <div className="text-center pt-4">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;