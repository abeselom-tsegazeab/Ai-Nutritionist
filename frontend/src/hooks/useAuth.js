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
  
  // Track if we know the token is invalid to prevent unnecessary API calls
  let knownInvalidToken = false;
  
  const fetchUserData = async () => {
    // Check if token is valid before attempting to fetch user data
    const isTokenValid = await checkAuthStatusService();
    if (!isTokenValid) {
      // Token is not valid, no point in trying to fetch user data
      dispatch(clearUser());
      dispatch(setError('Authentication token is not valid'));
      return { success: false, error: 'Authentication token is not valid' };
    }
    
    // If we already have user data with an ID, no need to fetch again
    if (user && user.id) {
      return { success: true, user: user };
    }
    
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
          role: result.user.role,
        }));
        // Reset the knownInvalidToken flag since we successfully got user data
        knownInvalidToken = false;
        return { success: true, user: result.user };
      } else {
        dispatch(setError(result.error));
        // If the fetch failed due to auth error, clear the user
        if (result.error.includes('401') || (result.status && result.status === 401) || result.error.includes('403') || (result.status && result.status === 403) || result.error.includes('Unauthorized')) {
          dispatch(clearUser());
          knownInvalidToken = true;
        }
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      // Check if it's an authentication error
      if (error.message.includes('401') || (error.status && error.status === 401) || error.message.includes('403') || (error.status && error.status === 403) || error.message.includes('Unauthorized')) {
        // Token is invalid, clear user state
        dispatch(clearUser());
        knownInvalidToken = true;
      }
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
        // Only fetch if we don't know the token is invalid and don't already have user data
        if (!fetchInProgress && !knownInvalidToken && (!user || !user.id)) {
          // Use async/await properly in the debounced function
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
            role: userDataResult.user.role,
          }));
          // Reset the knownInvalidToken flag since login was successful
          knownInvalidToken = false;
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
    // Reset the knownInvalidToken flag on logout
    knownInvalidToken = false;
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
          role: result.user.role,
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
      const isTokenValid = await checkAuthStatusService();
      
      if (isTokenValid) {
        // Reset the knownInvalidToken flag since token is valid
        knownInvalidToken = false;
        
        // If token exists, fetch user data to ensure it's up-to-date
        // This handles cases where user data might be stale or missing
        // But only fetch if we don't already have user data
        if (!user || !user.id) {
          try {
            dispatch(setLoading(true));
            const result = await getCurrentUser();
            
            if (result.success) {
              dispatch(setUser({
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role,
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
            if (error.message.includes('401') || (error.status && error.status === 401) || error.message.includes('403') || (error.status && error.status === 403) || error.message.includes('Unauthorized')) {
              dispatch(clearUser());
              knownInvalidToken = true;
            }
            dispatch(setError(error.message || 'Error fetching user data'));
            return false;
          } finally {
            dispatch(setLoading(false));
          }
        } else {
          // We already have user data, so just return true
          return true;
        }
      } else {
        // Token is not valid, ensure user state is cleared
        if (user || isAuthenticated) {
          dispatch(clearUser());
        }
        // Mark that we know the token is invalid
        knownInvalidToken = true;
      }
      
      return isTokenValid;
    } finally {
      authCheckInProgress = false;
    }
  };

  // Function to safely check auth without throwing errors
  const safeCheckAuthStatus = async () => {
    try {
      const result = await checkAuthStatus();
      // Reset the knownInvalidToken flag if auth check succeeds
      if (result) {
        knownInvalidToken = false;
      }
      return result;
    } catch (error) {
      console.error('Error in safeCheckAuthStatus:', error);
      return false;
    }
  };
  
  // Function to check if user is authenticated without making API calls
  const quickCheckAuthStatus = () => {
    // Just check if token exists in localStorage
    const token = localStorage.getItem('accessToken');
    return !!token;
  };
  
  // Function to reset the knownInvalidToken flag
  const resetTokenValidity = () => {
    knownInvalidToken = false;
  };



  const refreshUserData = async () => {
    // Only fetch user data if we're authenticated, don't know the token is invalid, 
    // and we don't already have user data with an ID
    if (isAuthenticated && !knownInvalidToken && (!user || !user.id)) {
      return await fetchUserData();
    }
    return { success: false, error: knownInvalidToken ? 'Known invalid token' : (user && user.id ? 'User data already loaded' : 'User not authenticated') };
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
    resetTokenValidity,
  };
};