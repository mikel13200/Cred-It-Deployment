import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { extractData, extractArray } from './helpers';

export const profileApi = {
  /**
   * Get user profile by ID
   * Returns: { user_id, name, school_name, email, phone, address, date_of_birth }
   */
  getProfile: async (userId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.PROFILE}${userId}/`);
    return extractData(response.data); // Extract from APIResponse wrapper
  },

  /**
   * Save or update user profile
   * Creates new profile if doesn't exist, updates if exists
   */
  saveProfile: async (profileData) => {
    const response = await apiClient.post(API_ENDPOINTS.PROFILE_SAVE, profileData);
    return extractData(response.data);
  },

  /**
   * Check if profile exists (helper method)
   */
  checkExists: async (userId) => {
    try {
      await profileApi.getProfile(userId);
      return true;
    } catch (error) {
      // 404 means profile doesn't exist
      if (error.message?.includes('404')) {
        return false;
      }
      throw error;
    }
  },
};