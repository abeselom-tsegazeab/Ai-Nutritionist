import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would come from your auth context

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Mock function to handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    // Actual logout logic would go here
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'py-2 bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20' 
          : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-white hover:text-blue-300 transition-colors duration-300">
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
                className="text-white hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 transform"
              >
                Home
              </Link>
              <Link 
                to="/meal-plans" 
                className="text-white hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 transform"
              >
                Meal Plans
              </Link>
              <Link 
                to="/about" 
                className="text-white hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 transform"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-white hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 transform"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Auth/User Menu - Only shown when logged in */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                    <img 
                      src="https://ui-avatars.com/api/?name=John+Doe&background=random" 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">John</span>
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
                <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right border border-white/20">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-300"
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-300"
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-300"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link 
                  to="/login" 
                  className="text-white hover:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 transform border border-white/30 hover:border-white/50"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 transform hover:shadow-lg hover:shadow-blue-500/25"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/10 backdrop-blur-md border-t border-white/20">
          <Link 
            to="/" 
            className="text-white hover:text-blue-300 block px-3 py-2 rounded-md text-base font-medium transition-all duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/meal-plans" 
            className="text-white hover:text-blue-300 block px-3 py-2 rounded-md text-base font-medium transition-all duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Meal Plans
          </Link>
          <Link 
            to="/about" 
            className="text-white hover:text-blue-300 block px-3 py-2 rounded-md text-base font-medium transition-all duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className="text-white hover:text-blue-300 block px-3 py-2 rounded-md text-base font-medium transition-all duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          
          {isLoggedIn ? (
            <div className="pt-4 pb-2 border-t border-white/20">
              <div className="flex items-center px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
                  <img 
                    src="https://ui-avatars.com/api/?name=John+Doe&background=random" 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="text-white font-medium">John Doe</span>
              </div>
              <Link 
                to="/profile" 
                className="block px-4 py-2 text-white hover:bg-white/10 rounded-md text-base font-medium transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link 
                to="/settings" 
                className="block px-4 py-2 text-white hover:bg-white/10 rounded-md text-base font-medium transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-md text-base font-medium transition-all duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 pb-2 border-t border-white/20 space-y-3">
              <Link 
                to="/login" 
                className="block w-full text-center text-white hover:text-blue-300 bg-white/10 hover:bg-white/20 py-2 px-4 rounded-md text-base font-medium transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
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