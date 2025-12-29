import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const { theme } = useTheme();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await register(formData.name, formData.email, formData.password);
      
      if (result.success) {
        // Show success toast
        toast.success('Registration successful! Please check your email for a verification code to complete your registration.');
        
        // Redirect to verify email page after successful registration
        navigate('/verify-email');
      } else {
        const errorMessage = result.error || 'Registration failed';
        setErrors({
          general: errorMessage
        });
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setErrors({
        general: errorMessage
      });
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 animate-bounce-once">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white dark:text-white mb-2 animate-slide-down">Create Account</h2>
          <p className="text-gray-300 dark:text-gray-300 animate-slide-down delay-100">Join our community today</p>
        </div>
        
        <div className={`mt-8 bg-white/10 dark:bg-gray-800/30 backdrop-blur-md p-8 rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl ${theme === 'dark' ? 'dark' : ''} animate-fade-in-up`}>
          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center animate-shake">
              {errors.general}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="animate-slide-in-left">
              <label htmlFor="name" className="block text-sm font-medium text-gray-200 dark:text-gray-200 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name 
                    ? 'border-red-500 bg-red-500/10 animate-shake' 
                    : 'border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-400 animate-fade-in">{errors.name}</p>}
            </div>

            <div className="animate-slide-in-left delay-100">
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 dark:text-gray-200 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email 
                    ? 'border-red-500 bg-red-500/10 animate-shake' 
                    : 'border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-400 animate-fade-in">{errors.email}</p>}
            </div>

            <div className="animate-slide-in-left delay-200">
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 dark:text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.password 
                    ? 'border-red-500 bg-red-500/10 animate-shake' 
                    : 'border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                placeholder="Create a strong password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-400 animate-fade-in">{errors.password}</p>}
            </div>

            <div className="animate-slide-in-left delay-300">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 dark:text-gray-200 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.confirmPassword 
                    ? 'border-red-500 bg-red-500/10 animate-shake' 
                    : 'border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400 animate-fade-in">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-center animate-slide-in-left delay-400">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-white/10"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300 dark:text-gray-300">
                I agree to the <a href="#" className="text-blue-400 hover:text-blue-300">Terms and Conditions</a>
              </label>
            </div>

            <div className="animate-slide-in-left delay-500">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                <span className="relative z-10">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </span>
                {!loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center animate-fade-in delay-600">
            <p className="text-gray-300 dark:text-gray-300">
              Already have an account?{' '}
              <a 
                href="/login" 
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;