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
    if (passwordStrength < 25) return 'bg-error-500';
    if (passwordStrength < 50) return 'bg-warning-500';
    if (passwordStrength < 75) return 'bg-warning-400';
    return 'bg-success-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
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

      {/* Back Button */}
      <Link
        to="/login"
        className={`fixed top-6 left-6 z-50 p-3 rounded-xl shadow-lg transition-all duration-300 ${
          isDark 
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' 
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        } hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500`}
      >
        <FiArrowLeft size={20} />
      </Link>

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
              Create your account
            </h2>
            <p className={`mt-2 text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Join BizTras Cloud  Platform
            </p>
          </div>

          {/* Form Card */}
          <div className={`card-elevated p-8 ${
            isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/70 backdrop-blur-sm'
          }`}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="form-group">
                <label className="form-label">
                  Full name
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
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
                    className="input pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">
                  Email address
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
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
                    className="input pl-10"
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-10 pr-10"
                    placeholder="Create a strong password"
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Password strength:
                      </span>
                      <span className={`text-xs font-medium ${
                        passwordStrength < 50 ? 'text-error-500' : 
                        passwordStrength < 75 ? 'text-warning-500' : 'text-success-500'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label className="form-label">
                  Confirm password
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
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
                    className={`input pl-10 pr-10 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword 
                        ? 'input-error' : ''
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary-600 transition-colors ${
                      isDark ? 'text-gray-400' : 'text-gray-400'
                    }`}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-1 flex items-center">
                    {formData.password === formData.confirmPassword ? (
                      <div className="flex items-center text-success-600">
                        <FiCheck size={16} className="mr-1" />
                        <span className="text-xs">Passwords match</span>
                      </div>
                    ) : (
                      <span className="text-xs text-error-500">Passwords don't match</span>
                    )}
                  </div>
                )}
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
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Additional Info */}
          <div className={`text-center text-xs space-y-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
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