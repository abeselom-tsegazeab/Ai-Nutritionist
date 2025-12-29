import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();

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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Show success toast
        showSuccess('Login successful!');
        
        // Redirect to home page after successful login
        navigate('/');
      } else {
        // Check if the error is related to unverified email
        if (result.error && result.error.includes('verified')) {
          showSuccess('Please verify your email before logging in. Redirecting to verification page...');
          setTimeout(() => {
            navigate('/verify-email');
          }, 2000);
        } else {
          const errorMessage = result.error || 'Login failed';
          setErrors({
            general: errorMessage
          });
          showError(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please check your credentials and try again.';
      setErrors({
        general: errorMessage
      });
      showError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white dark:text-white mb-2">Welcome Back</h2>
          <p className="text-gray-300 dark:text-gray-300">Sign in to your account</p>
        </div>
        
        <div className={`mt-8 bg-white/10 dark:bg-gray-800/30 backdrop-blur-md p-8 rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl ${theme === 'dark' ? 'dark' : ''}`}>
          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center">
              {errors.general}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
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
                    ? 'border-red-500 bg-red-500/10' 
                    : 'border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 dark:text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.password 
                    ? 'border-red-500 bg-red-500/10' 
                    : 'border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                placeholder="Enter your password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-white/10"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a 
                  href="/forgot-password" 
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/forgot-password');
                  }}
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300 dark:text-gray-300">
              Don't have an account?{' '}
              <a 
                href="/register" 
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/register');
                }}
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;