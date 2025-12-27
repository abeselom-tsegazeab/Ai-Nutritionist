// authService.js - Authentication service to handle API calls and Redux dispatches

import { setUser, clearUser, setLoading, setError } from '../store/userSlice';
import { useDispatch } from 'react-redux';

// Function to handle login
export const useAuth = () => {
  const dispatch = useDispatch();

  const login = async (email, password) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        
        // Dispatch user data to Redux store
        dispatch(setUser({
          id: data.user_id,
          email: data.email,
          name: data.name,
          // Add other user data as needed
        }));

        return { success: true, user: data };
      } else {
        const error = data.detail || 'Login failed';
        dispatch(setError(error));
        return { success: false, error };
      }
    } catch (error) {
      dispatch(setError(error.message || 'An error occurred during login'));
      return { success: false, error: error.message || 'An error occurred during login' };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = () => {
    // Remove tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Clear user data from Redux store
    dispatch(clearUser());
  };

  const register = async (name, email, password) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, user: data };
      } else {
        const error = data.detail || 'Registration failed';
        dispatch(setError(error));
        return { success: false, error };
      }
    } catch (error) {
      dispatch(setError(error.message || 'An error occurred during registration'));
      return { success: false, error: error.message || 'An error occurred during registration' };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const checkAuthStatus = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // In a real implementation, you might want to verify the token
      // For now, we'll just return whether a token exists
      return !!token;
    }
    return false;
  };

  return {
    login,
    logout,
    register,
    checkAuthStatus,
  };
};