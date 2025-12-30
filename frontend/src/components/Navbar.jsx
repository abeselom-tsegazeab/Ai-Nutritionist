import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, loading, error, checkAuthStatus, logout, fetchUserData, safeCheckAuthStatus, debouncedFetchUserData, quickCheckAuthStatus, resetTokenValidity } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check authentication status on component mount and fetch user data if needed
    const checkAuth = async () => {
      // First do a quick check without API calls
      if (quickCheckAuthStatus()) {
        // If token exists, do a full check
        await safeCheckAuthStatus();
      }
    };
    
    checkAuth();
  }, [safeCheckAuthStatus, quickCheckAuthStatus]);
  
  // Effect to handle logout when error indicates invalid token
  useEffect(() => {
    if (error && (error.includes('401') || error.includes('Unauthorized'))) {
      logout();
    }
  }, [error, logout]);
  
  // Effect to reset token validity when user navigates to login/register pages
  useEffect(() => {
    const handleRouteChange = () => {
      // Reset the known invalid token flag when navigating to auth pages
      if (window.location.pathname === '/login' || window.location.pathname === '/register') {
        resetTokenValidity();
      }
    };
    
    // Listen for popstate events (browser navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [resetTokenValidity]);

  // Additional effect to refresh user data if needed
  useEffect(() => {
    if (isAuthenticated && (!user || !user.id)) {
      debouncedFetchUserData();
    }
  }, [isAuthenticated, user, debouncedFetchUserData]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'py-2 bg-white/10 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-white/20 dark:border-gray-700' 
          : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-white dark:text-gray-100 hover:text-blue-300 transition-colors duration-300">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                AI Nutritionist
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link 
                to="/" 
                className="text-white dark:text-gray-200 hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 transform"
              >
                Home
              </Link>
              <Link 
                to="/meal-planner" 
                className="text-white dark:text-gray-200 hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 transform"
              >
                Meal Planner
              </Link>
              <Link 
                to="/features" 
                className="text-white dark:text-gray-200 hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 transform"
              >
                Features
              </Link>
            </div>
          </div>

          {/* Dark Mode Toggle and Auth/User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/10 dark:bg-gray-700 text-white dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-600 transition-colors duration-300"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-white dark:text-gray-200 hover:text-blue-300 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">{user?.name || 'User'}</span>
                  <svg 
                    className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* User Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white/10 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right border border-white/20 dark:border-gray-700">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-white dark:text-gray-200 hover:bg-white/10 dark:hover:bg-gray-700 transition-colors duration-300"
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm text-white dark:text-gray-200 hover:bg-white/10 dark:hover:bg-gray-700 transition-colors duration-300"
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-white dark:text-gray-200 hover:bg-white/10 dark:hover:bg-gray-700 transition-colors duration-300"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-3">
            
                <Link 
                  to="/login" 
                  className="text-white dark:text-gray-200 hover:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 transform border border-white/30 dark:border-gray-600 hover:border-white/50 dark:hover:border-gray-500"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 transform hover:shadow-lg hover:shadow-blue-500/25"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/10 dark:bg-gray-700 text-white dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-600 transition-colors duration-300"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white dark:text-gray-200 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6 transition-transform duration-300`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6 transition-transform duration-300`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/10 dark:bg-gray-900/80 backdrop-blur-md border-t border-white/20 dark:border-gray-700">
          <Link 
            to="/" 
            className="text-white dark:text-gray-200 hover:text-blue-300 block px-3 py-2 rounded-md text-base font-medium transition-all duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/meal-planner" 
            className="text-white dark:text-gray-200 hover:text-blue-300 block px-3 py-2 rounded-md text-base font-medium transition-all duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Meal Planner
          </Link>
          <Link 
            to="/features" 
            className="text-white dark:text-gray-200 hover:text-blue-300 block px-3 py-2 rounded-md text-base font-medium transition-all duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          
          {isAuthenticated ? (
            <div className="pt-4 pb-2 border-t border-white/20 dark:border-gray-700">
              <div className="flex items-center px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="text-white dark:text-gray-200 font-medium">{user?.name || 'User'}</span>
              </div>
              <Link 
                to="/profile" 
                className="block px-4 py-2 text-white dark:text-gray-200 hover:bg-white/10 dark:hover:bg-gray-700 rounded-md text-base font-medium transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link 
                to="/settings" 
                className="block px-4 py-2 text-white dark:text-gray-200 hover:bg-white/10 dark:hover:bg-gray-700 rounded-md text-base font-medium transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-white dark:text-gray-200 hover:bg-white/10 dark:hover:bg-gray-700 rounded-md text-base font-medium transition-all duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 pb-2 border-t border-white/20 dark:border-gray-700 space-y-3">
              <Link 
                to="/login" 
                className="block w-full text-center text-white dark:text-gray-200 hover:text-blue-300 bg-white/10 dark:bg-gray-800 hover:bg-white/20 dark:hover:bg-gray-700 py-2 px-4 rounded-md text-base font-medium transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="block w-full text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-md text-base font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;