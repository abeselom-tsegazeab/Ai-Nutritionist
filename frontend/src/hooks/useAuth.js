import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearUser, setLoading, setError } from '../store/userSlice';
import {
  login as loginService,
  logout as logoutService,
  register as registerService,
  checkAuthStatus as checkAuthStatusService,
  getCurrentUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
} from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector(state => state.user);
  
  // Check if user data needs to be refreshed
  const needsUserDataRefresh = isAuthenticated && (!user || !user.id);
  
  // Function to fetch user data
  // Track if a fetch is currently in progress to prevent duplicate calls
  let fetchInProgress = false;
  
  const fetchUserData = async () => {
    // Prevent duplicate requests if one is already in progress
    if (fetchInProgress) {
      // Wait a bit and return, assuming the ongoing request will update the state
      await new Promise(resolve => setTimeout(resolve, 100));
      return { success: true, user: user }; // Return current user state
    }
    
    try {
      fetchInProgress = true;
      dispatch(setLoading(true));
      const result = await getCurrentUser();
      
      if (result.success) {
        dispatch(setUser({
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        }));
        return { success: true, user: result.user };
      } else {
        dispatch(setError(result.error));
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      dispatch(setError(error.message || 'Error fetching user data'));
      return { success: false, error: error.message || 'Error fetching user data' };
    } finally {
      fetchInProgress = false;
      dispatch(setLoading(false));
    }
  };
  
  // Debounced version of fetchUserData to prevent excessive API calls
  const debouncedFetchUserData = (function() {
    let timeout;
    return function() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!fetchInProgress) {
          fetchUserData();
        }
      }, 300); // 300ms delay to prevent excessive calls
    };
  })();

  const login = async (email, password) => {
    dispatch(setLoading(true));
    try {
      const result = await loginService(email, password);

      if (result.success) {
        // Fetch user data after successful login
        const userDataResult = await getCurrentUser();
        if (userDataResult.success) {
          dispatch(setUser({
            id: userDataResult.user.id,
            email: userDataResult.user.email,
            name: userDataResult.user.name,
          }));
        }
        return { success: true, user: userDataResult.user };
      } else {
        dispatch(setError(result.error));
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch(setError(error.message || 'An error occurred during login'));
      return { success: false, error: error.message || 'An error occurred during login' };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = () => {
    logoutService();
    dispatch(clearUser());
  };

  const register = async (name, email, password) => {
    dispatch(setLoading(true));
    try {
      const result = await registerService(name, email, password);

      if (result.success) {
        // Don't store tokens immediately after registration
        // User needs to verify email first
        
        // Dispatch user data to Redux store (but user is not yet authenticated)
        dispatch(setUser({
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        }));

        return { success: true, user: result.user };
      } else {
        dispatch(setError(result.error));
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch(setError(error.message || 'An error occurred during registration'));
      return { success: false, error: error.message || 'An error occurred during registration' };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Track if auth check is in progress
  let authCheckInProgress = false;
  
  const checkAuthStatus = async () => {
    // Prevent duplicate auth checks
    if (authCheckInProgress) {
      // Wait a bit and return current auth status
      await new Promise(resolve => setTimeout(resolve, 100));
      return isAuthenticated;
    }
    
    try {
      authCheckInProgress = true;
      const isTokenValid = checkAuthStatusService();
      
      if (isTokenValid) {
        // If token exists, fetch user data to ensure it's up-to-date
        // This handles cases where user data might be stale or missing
        try {
          dispatch(setLoading(true));
          const result = await getCurrentUser();
          
          if (result.success) {
            dispatch(setUser({
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
            }));
            return true;
          } else {
            // Token exists but user fetch failed, clear the invalid state
            dispatch(clearUser());
            return false;
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Only clear user if it's a 401/403 error (invalid token), not for network errors
          if (error.message.includes('401') || error.message.includes('403')) {
            dispatch(clearUser());
          }
          dispatch(setError(error.message || 'Error fetching user data'));
          return false;
        } finally {
          dispatch(setLoading(false));
        }
      } else {
        // Token is not valid, ensure user state is cleared
        if (user || isAuthenticated) {
          dispatch(clearUser());
        }
      }
      
      return isTokenValid;
    } finally {
      authCheckInProgress = false;
    }
  };

  // Function to safely check auth without throwing errors
  const safeCheckAuthStatus = async () => {
    try {
      return await checkAuthStatus();
    } catch (error) {
      console.error('Error in safeCheckAuthStatus:', error);
      return false;
    }
  };

  // Function to check auth status without blocking
  const quickCheckAuthStatus = () => {
    return checkAuthStatusService();
  };

  const refreshUserData = async () => {
    if (isAuthenticated) {
      return await fetchUserData();
    }
    return { success: false, error: 'User not authenticated' };
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register,
    checkAuthStatus,
    fetchUserData,
    refreshUserData,
    safeCheckAuthStatus,
    quickCheckAuthStatus,
  };
};