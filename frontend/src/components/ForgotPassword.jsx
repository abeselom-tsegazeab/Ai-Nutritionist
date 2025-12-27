import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { loading, error } = useAuth();
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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:8000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Show success message
        setIsSubmitted(true);
        toast.success('Password reset instructions sent to your email!');
      } else {
        const errorMessage = data.detail || 'Failed to send password reset email. Please try again.';
        setErrors({
          general: errorMessage
        });
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message || 'An error occurred. Please try again.';
      setErrors({
        general: errorMessage
      });
      toast.error(errorMessage);
    }
  };

  const handleResend = () => {
    setIsSubmitted(false);
    setFormData({ email: '' });
    setErrors({});
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
        {!isSubmitted ? (
          <div className="animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 animate-bounce-once">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white dark:text-white mb-2 animate-slide-down">Forgot Password?</h2>
              <p className="text-gray-300 dark:text-gray-300 animate-slide-down delay-100">
                No worries, we'll send you reset instructions
              </p>
            </div>
            
            <div className={`mt-8 bg-white/10 dark:bg-gray-800/30 backdrop-blur-md p-8 rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl ${theme === 'dark' ? 'dark' : ''} animate-fade-in-up`}>
              {errors.general && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center animate-shake">
                  {errors.general}
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="animate-slide-in-left">
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
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    <span className="relative z-10">
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        'Reset Password'
                      )}
                    </span>
                    {!isLoading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center animate-fade-in delay-400">
                <p className="text-gray-300 dark:text-gray-300">
                  Remember your password?{' '}
                  <button 
                    onClick={() => navigate('/login')}
                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4 animate-bounce-once">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white dark:text-white mb-2 animate-slide-down">Check Your Email</h2>
              <p className="text-gray-300 dark:text-gray-300 animate-slide-down delay-100">
                We've sent password reset instructions to
              </p>
              <p className="text-lg font-medium text-white dark:text-white mt-2 animate-fade-in">
                {formData.email}
              </p>
            </div>
            
            <div className={`mt-8 bg-white/10 dark:bg-gray-800/30 backdrop-blur-md p-8 rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl ${theme === 'dark' ? 'dark' : ''} animate-fade-in-up`}>
              <div className="space-y-4">
                <p className="text-gray-300 dark:text-gray-300 text-center">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <button
                  onClick={handleResend}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Resend Instructions
                </button>
              </div>

              <div className="mt-6 text-center animate-fade-in delay-200">
                <p className="text-gray-300 dark:text-gray-300">
                  Remember your password?{' '}
                  <button 
                    onClick={() => navigate('/login')}
                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;