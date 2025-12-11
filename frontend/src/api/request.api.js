import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export const requestApi = {
  requestTor: async (accountId) => {
    const { data } = await apiClient.post(API_ENDPOINTS.REQUEST_TOR, {
      account_id: accountId,
    });
    return data;
  },

  getRequestTorList: async () => {
    const { data } = await apiClient.get(API_ENDPOINTS.REQUEST_TOR_LIST);
    return data;
  },

  getPendingRequests: async () => {
    const { data } = await apiClient.get(API_ENDPOINTS.PENDING_REQUEST);
    return data;
  },

  acceptRequest: async (accountId) => {
  const response = await apiClient.post(API_ENDPOINTS.ACCEPT_REQUEST, {
    account_id: accountId, // Field name changed
  });
  return response; // Return full response object
  },

  denyRequest: async (applicantId) => {
    const { data } = await apiClient.delete(
      `${API_ENDPOINTS.DENY_REQUEST}${applicantId}/`
    );
    return data;
  },

  cancelRequest: async (accountId) => {
    const { data } = await apiClient.delete(
      `${API_ENDPOINTS.CANCEL_REQUEST}${accountId}/`
    );
    return data;
  },

  updateRequestStatus: async (applicantId, status) => {
    const { data } = await apiClient.post(
      API_ENDPOINTS.PENDING_REQUEST_UPDATE_STATUS,
      {
        applicant_id: applicantId,
        status,
      }
    );
    return data;
  },

  getFinalDocuments: async () => {
    const { data } = await apiClient.get(API_ENDPOINTS.FINAL_DOCUMENTS_LIST);
    return data;
  },

  finalizeRequest: async (accountId) => {
    const { data } = await apiClient.post(API_ENDPOINTS.FINALIZE_REQUEST, {
      account_id: accountId,
    });
    return data;
  },
};