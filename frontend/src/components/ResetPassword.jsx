import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [formData, setFormData] = useState({
    resetCode: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
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

    if (!formData.resetCode) {
      newErrors.resetCode = 'Reset code is required';
    } else if (formData.resetCode.length !== 6 || !/^\d{6}$/.test(formData.resetCode)) {
      newErrors.resetCode = 'Please enter a valid 6-digit code';
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

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success - in a real app, you would call the backend API with reset code and new password
      console.log('Password reset with code:', formData.resetCode, 'and password:', formData.password);
      
      // Show success message
      setIsSubmitted(true);
    } catch (error) {
      setErrors({
        general: 'Failed to reset password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white dark:text-white mb-2 animate-slide-down">Reset Your Password</h2>
              <p className="text-gray-300 dark:text-gray-300 animate-slide-down delay-100">
                Create a new password for your account
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
                  <label htmlFor="resetCode" className="block text-sm font-medium text-gray-200 dark:text-gray-200 mb-2">
                    Reset Code
                  </label>
                  <input
                    id="resetCode"
                    name="resetCode"
                    type="text"
                    value={formData.resetCode}
                    onChange={handleChange}
                    maxLength={6}
                    className={`w-full px-4 py-3 rounded-lg border text-center text-2xl tracking-widest ${
                      errors.resetCode 
                        ? 'border-red-500 bg-red-500/10 animate-shake' 
                        : 'border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    placeholder="000000"
                    autoComplete="off"
                  />
                  {errors.resetCode && <p className="mt-1 text-sm text-red-400 animate-fade-in">{errors.resetCode}</p>}
                  <p className="mt-2 text-sm text-gray-400 dark:text-gray-400">Please enter the 6-digit code sent to your email</p>
                </div>

                <div className="animate-slide-in-left delay-100">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-200 dark:text-gray-200 mb-2">
                    New Password
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

                <div className="animate-slide-in-left delay-200">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 dark:text-gray-200 mb-2">
                    Confirm New Password
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
                    placeholder="Confirm your new password"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-400 animate-fade-in">{errors.confirmPassword}</p>}
                </div>

                <div className="animate-slide-in-left delay-300">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    <span className="relative z-10">
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Resetting...
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
              <h2 className="text-3xl font-bold text-white dark:text-white mb-2 animate-slide-down">Password Reset Successful!</h2>
              <p className="text-gray-300 dark:text-gray-300 animate-slide-down delay-100">
                Your password has been successfully updated
              </p>
            </div>
            
            <div className={`mt-8 bg-white/10 dark:bg-gray-800/30 backdrop-blur-md p-8 rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl ${theme === 'dark' ? 'dark' : ''} animate-fade-in-up`}>
              <div className="space-y-4">
                <p className="text-gray-300 dark:text-gray-300 text-center">
                  You can now sign in with your new password.
                </p>
                <button
                  onClick={handleGoToLogin}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;