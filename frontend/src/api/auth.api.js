import { apiClient } from './client';
import { API_ENDPOINTS, API_BASE_URL } from './config';
import { tokenStorage } from '../utils/tokenStorage';

export const authApi = {
  /**
   * Login user and receive JWT tokens
   * Expected response: { access, refresh, user: { id, username, role } }
   */
   login: async (accountID, accountPass) => {
    const { data } = await apiClient.post(API_ENDPOINTS.LOGIN, {
      account_id: accountID,
      account_pass: accountPass,
    });
    
    // Handle JWT token response
    // Backend should return: { access, refresh, status, message, user_id }
    const result = {
      accessToken: data.access || data.token || data.access_token,
      refreshToken: data.refresh || data.refresh_token,
      user: {
        id: data.user_id || accountID,
        username: accountID,
        role: data.status, // 'Student' or 'Faculty'
      },
      message: data.message,
    };
    
    return result;
  },

  /**
   * Register new user
   */
  register: async (accountID, accountPass) => {
    const { data } = await apiClient.post(API_ENDPOINTS.REGISTER, {
      AccountID: accountID,
      AccountPass: accountPass,
    });
    return data;
  },

  /**
   * Logout user - invalidate tokens on server
   */
  logout: async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        await apiClient.post(API_ENDPOINTS.LOGOUT, {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      // Ignore logout errors - still clear local tokens
      console.warn('Logout API call failed:', error);
    } finally {
      tokenStorage.clearAll();
    }
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Direct fetch to avoid interceptor loops
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TOKEN_REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      tokenStorage.clearAll();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    tokenStorage.setAccessToken(data.access);
    
    return data.access;
  },

  /**
   * Verify if current token is still valid
   */
  verifyToken: async () => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TOKEN_VERIFY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: accessToken }),
      });
      
      return response.ok;
    } catch {
      return false;
    }
  },
};
