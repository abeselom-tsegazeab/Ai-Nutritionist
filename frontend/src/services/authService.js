// authService.js - Authentication service to handle API calls

// Function to handle login
export const login = async (email, password) => {
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

      return { success: true, user: data };
    } else {
      // Handle FastAPI validation errors which come as an array
      let errorMessage = data.detail || 'Login failed';
      if (Array.isArray(data.detail)) {
        // Extract the first error message from FastAPI validation errors
        errorMessage = data.detail[0]?.msg || 'Validation error occurred';
      }
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    return { success: false, error: error.message || 'An error occurred during login' };
  }
};

// Function to handle logout
export const logout = () => {
  // Remove tokens from localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Function to handle registration
export const register = async (name, email, password) => {
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
      // Handle FastAPI validation errors which come as an array
      let errorMessage = data.detail || 'Registration failed';
      if (Array.isArray(data.detail)) {
        // Extract the first error message from FastAPI validation errors
        errorMessage = data.detail[0]?.msg || 'Validation error occurred';
      }
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    return { success: false, error: error.message || 'An error occurred during registration' };
  }
};

// Function to verify email
export const verifyEmail = async (verificationCode) => {
  try {
    const response = await fetch('http://localhost:8000/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ verification_code: verificationCode }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      // Handle FastAPI validation errors which come as an array
      let errorMessage = data.detail || 'Verification failed';
      if (Array.isArray(data.detail)) {
        // Extract the first error message from FastAPI validation errors
        errorMessage = data.detail[0]?.msg || 'Validation error occurred';
      }
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    return { success: false, error: error.message || 'An error occurred during verification' };
  }
};

// Function to resend verification code
export const resendVerification = async (email) => {
  try {
    const response = await fetch('http://localhost:8000/auth/resend-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      // Handle FastAPI validation errors which come as an array
      let errorMessage = data.detail || 'Failed to resend verification';
      if (Array.isArray(data.detail)) {
        // Extract the first error message from FastAPI validation errors
        errorMessage = data.detail[0]?.msg || 'Validation error occurred';
      }
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    return { success: false, error: error.message || 'An error occurred while resending verification' };
  }
};

// Function to request password reset
export const forgotPassword = async (email) => {
  try {
    const response = await fetch('http://localhost:8000/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      // Handle FastAPI validation errors which come as an array
      let errorMessage = data.detail || 'Failed to send password reset email';
      if (Array.isArray(data.detail)) {
        // Extract the first error message from FastAPI validation errors
        errorMessage = data.detail[0]?.msg || 'Validation error occurred';
      }
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    return { success: false, error: error.message || 'An error occurred during password reset request' };
  }
};

// Function to reset password
export const resetPassword = async (resetCode, newPassword) => {
  try {
    const response = await fetch('http://localhost:8000/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reset_code: resetCode, new_password: newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      // Handle FastAPI validation errors which come as an array
      let errorMessage = data.detail || 'Failed to reset password';
      if (Array.isArray(data.detail)) {
        // Extract the first error message from FastAPI validation errors
        errorMessage = data.detail[0]?.msg || 'Validation error occurred';
      }
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    return { success: false, error: error.message || 'An error occurred during password reset' };
  }
};

// Function to refresh the access token using the refresh token
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return { success: false, error: 'No refresh token found' };
    }
    
    const response = await fetch('http://localhost:8000/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store the new access token
      localStorage.setItem('accessToken', data.access_token);
      return { success: true, access_token: data.access_token };
    } else {
      // Refresh failed, clear tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return { success: false, error: data.detail || 'Token refresh failed' };
    }
  } catch (error) {
    return { success: false, error: error.message || 'An error occurred during token refresh' };
  }
};

// Function to check authentication status
export const checkAuthStatus = async () => {
  let token = localStorage.getItem('accessToken');
  
  // If token exists, try to use it first
  if (token) {
    try {
      // Try to verify the token is still valid by making a minimal request
      // We can use the /auth/me endpoint as a lightweight check
      const response = await fetch('http://localhost:8000/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        return true;
      } else {
        // Token is invalid, try to refresh
        const refreshResult = await refreshToken();
        return refreshResult.success;
      }
    } catch (error) {
      // If verification request fails, try to refresh the token
      const refreshResult = await refreshToken();
      return refreshResult.success;
    }
  }
  
  return false;
};

// Function to update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const response = await fetch('http://localhost:8000/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, user: data };
    } else {
      // Handle FastAPI validation errors which come as an array
      let errorMessage = data.detail || 'Failed to update profile';
      if (Array.isArray(data.detail)) {
        // Extract the first error message from FastAPI validation errors
        errorMessage = data.detail[0]?.msg || 'Validation error occurred';
      }
      return { success: false, error: errorMessage, status: response.status };
    }
  } catch (error) {
    return { success: false, error: error.message || 'An error occurred while updating profile' };
  }
};

// Function to get current user
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const response = await fetch('http://localhost:8000/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, user: data };
    } else {
      // Handle FastAPI validation errors which come as an array
      let errorMessage = data.detail || 'Failed to get user';
      if (Array.isArray(data.detail)) {
        // Extract the first error message from FastAPI validation errors
        errorMessage = data.detail[0]?.msg || 'Validation error occurred';
      }
      return { success: false, error: errorMessage, status: response.status };
    }
  } catch (error) {
    return { success: false, error: error.message || 'An error occurred while fetching user data' };
  }
};