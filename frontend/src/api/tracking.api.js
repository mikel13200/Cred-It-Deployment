import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { extractData, extractArray } from './helpers';

export const trackingApi = {
  /**
   * Check if user exists in RequestTOR
   * Returns: { exists: boolean, data: {...} } or array of requests
   */
  getUserProgress: async (accountId) => {
    const response = await apiClient.get(API_ENDPOINTS.TRACK_USER_PROGRESS, {
      accountID: accountId, // Note: endpoint uses accountID
    });
    return extractData(response.data);
  },

  /**
   * Check if user exists in PendingRequest
   * Returns: { exists: boolean, data: {...} } or array of pending requests
   */
  getPendingProgress: async (accountId) => {
    const response = await apiClient.get(API_ENDPOINTS.PENDING_TRACK_PROGRESS, {
      applicant_id: accountId,
    });
    return extractData(response.data);
  },

  /**
   * Check if user exists in FinalDocuments
   * Returns: { exists: boolean, data: {...} } or array of final documents
   */
  getFinalProgress: async (accountId) => {
    const response = await apiClient.get(API_ENDPOINTS.FINAL_TRACK_PROGRESS, {
      accountID: accountId,
    });
    return extractData(response.data);
  },

  /**
   * Get tracker accreditation details
   * Returns array of accreditation entries
   */
  getTrackerAccreditation: async (accountId) => {
    const response = await apiClient.get(API_ENDPOINTS.TRACKER_ACCREDITATION, {
      account_id: accountId,
    });
    return extractArray(response.data);
  },
};