// frontend/src/api/tor.api.js
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { extractData, extractArray } from './helpers';

export const torApi = {
  /**
   * Upload OCR images for processing
   * Returns: { student_name, school_name, ocr_results: [...], school_tor: [...] }
   */
  uploadOcr: async (images, accountId) => {
    const formData = new FormData();
    images.forEach((img) => {
      formData.append('images', img.file);
    });
    formData.append('account_id', accountId);

    const response = await apiClient.postFormData(API_ENDPOINTS.OCR, formData);
    return extractData(response.data);
  },

  /**
   * Upload demo OCR (no account required)
   */
  uploadDemoOcr: async (images) => {
    const formData = new FormData();
    images.forEach((img) => {
      if (img.file instanceof File) {
        formData.append('images', img.file, img.file.name);
      }
    });

    const response = await apiClient.postFormData(API_ENDPOINTS.DEMO_OCR, formData);
    return extractData(response.data);
  },

  /**
   * Delete OCR entries for account
   * Returns: { tor_deleted: number, compare_deleted: number }
   */
  deleteOcr: async (accountId) => {
    const response = await apiClient.delete(API_ENDPOINTS.OCR_DELETE, {
      account_id: accountId,
    });
    return extractData(response.data);
  },

  /**
   * Copy TOR entries to CompareResultTOR
   * Returns array of copied entries or { count: 0 }
   */
  copyTor: async (accountId) => {
    const response = await apiClient.post(API_ENDPOINTS.COPY_TOR, {
      account_id: accountId,
    });
    return response; // Return full response for count checking
  },

  /**
   * Update TOR results with passed/failed subjects
   */
  updateTorResults: async (accountId, failedSubjects, passedSubjects) => {
    const response = await apiClient.post(API_ENDPOINTS.UPDATE_TOR_RESULTS, {
      account_id: accountId,
      failed_subjects: failedSubjects,
      passed_subjects: passedSubjects,
    });
    return extractData(response.data);
  },

  /**
   * Sync completed TOR processing
   * Returns array of comparison results
   */
  syncCompleted: async (accountId) => {
    const response = await apiClient.post(API_ENDPOINTS.SYNC_COMPLETED, {
      account_id: accountId,
    });
    return extractData(response.data);
  },

  /**
   * Get comparison results between school TOR and applicant TOR
   * Returns array of comparison entries
   */
  getCompareResultTor: async (accountId) => {
    const response = await apiClient.get(API_ENDPOINTS.COMPARE_RESULT_TOR, {
      account_id: accountId,
    });
    return extractArray(response.data);
  },

  /**
   * Get CIT TOR content (school's curriculum)
   * Returns array of CIT TOR entries
   */
  getCitTorContent: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CIT_TOR_CONTENT);
    return extractArray(response.data);
  },

  /**
   * Update CIT TOR entry
   */
  updateCitTorEntry: async (entryData) => {
    const response = await apiClient.post(
      API_ENDPOINTS.UPDATE_CIT_TOR_ENTRY,
      entryData
    );
    return extractData(response.data);
  },

  /**
   * Update credit evaluation for subject
   */
  updateCreditEvaluation: async (id, creditEvaluation) => {
    const response = await apiClient.post(API_ENDPOINTS.UPDATE_CREDIT_EVALUATION, {
      id,
      credit_evaluation: creditEvaluation,
    });
    return extractData(response.data);
  },

  /**
   * Update notes for subject
   */
  updateNote: async (id, notes) => {
    const response = await apiClient.post(API_ENDPOINTS.UPDATE_NOTE, {
      id,
      notes,
    });
    return extractData(response.data);
  },
};