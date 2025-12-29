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

  const login = async (email, password) => {
    dispatch(setLoading(true));
    try {
      const result = await loginService(email, password);

      if (result.success) {
        // Dispatch user data to Redux store
        dispatch(setUser({
          id: result.user.user_id,
          email: result.user.email,
          name: result.user.name,
        }));
        return { success: true, user: result.user };
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

  const checkAuthStatus = () => {
    return checkAuthStatusService();
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
  };
};