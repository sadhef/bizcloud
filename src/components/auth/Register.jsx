import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiSun, FiMoon, FiArrowLeft, FiLoader, FiCheck } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    return strength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const result = await register(formData);
      
      if (result.success) {
        toast.success(result.message);
        navigate('/login');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    setFormData(newFormData);
    
    if (e.target.name === 'password') {
      setPasswordStrength(calculatePasswordStrength(e.target.value));
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-yellow-500';
    if (passwordStrength < 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
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

      {/* Back Button */}
      <Link
        to="/login"
        className={`fixed top-6 left-6 z-50 p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105 ${
          isDark 
            ? 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 shadow-lg' 
            : 'bg-white/30 border-white/30 text-gray-700 hover:bg-white/50 shadow-xl'
        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
      >
        <FiArrowLeft size={24} />
      </Link>

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
                Create your account
              </h2>
              <p className={`text-lg ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Join BizTras Cloud Platform
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
              {/* Name Field */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Full name
                </label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <FiUser size={20} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-200 ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:bg-white/10 focus:border-white/20' 
                        : 'bg-white/30 border-white/20 text-gray-900 placeholder-gray-600 focus:bg-white/50 focus:border-white/40'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-200 ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:bg-white/10 focus:border-white/20' 
                        : 'bg-white/30 border-white/20 text-gray-900 placeholder-gray-600 focus:bg-white/50 focus:border-white/40'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
                    placeholder="Create a strong password"
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Password strength:
                      </span>
                      <span className={`text-xs font-medium ${
                        passwordStrength < 50 ? 'text-red-500' : 
                        passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Confirm password
                </label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <FiLock size={20} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-200 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword 
                        ? 'border-red-500' 
                        : isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:bg-white/10 focus:border-white/20' 
                        : 'bg-white/30 border-white/20 text-gray-900 placeholder-gray-600 focus:bg-white/50 focus:border-white/40'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-2">
                    {formData.password === formData.confirmPassword ? (
                      <div className="flex items-center text-green-500">
                        <FiCheck size={16} className="mr-2" />
                        <span className="text-sm">Passwords match</span>
                      </div>
                    ) : (
                      <span className="text-sm text-red-500">Passwords don't match</span>
                    )}
                  </div>
                )}
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
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Additional Info */}
          <div className={`text-center text-sm space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
            <p className="font-medium">
              Your account will be reviewed by an administrator before cloud access is granted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;