import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { verifyEmail, resendVerification } from '../services/authService';

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleChange = (e) => {
    const value = e.target.value;
    setVerificationCode(value);
    // Clear error when user starts typing
    if (errors.verificationCode) {
      setErrors({
        ...errors,
        verificationCode: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate verification code (6 digits)
    if (!verificationCode || verificationCode.length !== 6 || !/^\d{6}$/.test(verificationCode)) {
      setErrors({
        verificationCode: 'Please enter a valid 6-digit code'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await verifyEmail(verificationCode);
      
      if (result.success) {
        // Show success message
        setIsVerified(true);
      } else {
        setErrors({
          general: result.error || 'Invalid verification code. Please try again.'
        });
      }
    } catch (error) {
      setErrors({
        general: 'An error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would need to pass the user's email to resend the verification code
      // This would typically be retrieved from the user's session or passed as a parameter
      const email = prompt('Please enter your email address to resend the verification code:');
      if (!email) return;
      
      const result = await resendVerification(email);
      
      if (result.success) {
        console.log('Verification code resent successfully');
      } else {
        setErrors({
          general: result.error || 'Failed to resend verification code. Please try again.'
        });
      }
    } catch (error) {
      setErrors({
        general: 'An error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
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
        {!isVerified ? (
          <div className="animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 animate-bounce-once">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white dark:text-white mb-2 animate-slide-down">Verify Your Email</h2>
              <p className="text-gray-300 dark:text-gray-300 animate-slide-down delay-100">
                Enter the 6-digit code sent to your email
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
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-200 dark:text-gray-200 mb-2">
                    Verification Code
                  </label>
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={handleChange}
                    maxLength={6}
                    className={`w-full px-4 py-3 rounded-lg border text-center text-2xl tracking-widest ${
                      errors.verificationCode 
                        ? 'border-red-500 bg-red-500/10 animate-shake' 
                        : 'border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    placeholder="000000"
                    autoComplete="off"
                  />
                  {errors.verificationCode && <p className="mt-1 text-sm text-red-400 animate-fade-in">{errors.verificationCode}</p>}
                  <p className="mt-2 text-sm text-gray-400 dark:text-gray-400">Please enter the 6-digit code sent to your email</p>
                </div>

                <div className="animate-slide-in-left delay-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    <span className="relative z-10">
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </div>
                      ) : (
                        'Verify Email'
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
                  Didn't receive the code?{' '}
                  <button 
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300 disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </p>
              </div>

              <div className="mt-4 text-center animate-fade-in delay-500">
                <p className="text-gray-300 dark:text-gray-300">
                  Already verified?{' '}
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
              <h2 className="text-3xl font-bold text-white dark:text-white mb-2 animate-slide-down">Email Verified!</h2>
              <p className="text-gray-300 dark:text-gray-300 animate-slide-down delay-100">
                Your email has been successfully verified
              </p>
            </div>
            
            <div className={`mt-8 bg-white/10 dark:bg-gray-800/30 backdrop-blur-md p-8 rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl ${theme === 'dark' ? 'dark' : ''} animate-fade-in-up`}>
              <div className="space-y-4">
                <p className="text-gray-300 dark:text-gray-300 text-center">
                  You can now sign in to your account.
                </p>
                <button
                  onClick={() => navigate('/login')}
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

export default VerifyEmail;