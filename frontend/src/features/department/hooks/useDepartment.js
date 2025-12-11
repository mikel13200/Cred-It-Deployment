// frontend/src/features/department/hooks/useDepartment.js
import { useState, useCallback } from 'react'; // <-- ADDED useCallback
import { requestApi } from '../../../api';
import { useNotification } from '../../../hooks';

/**
 * Department hook for faculty/admin - Updated for new backend
 * Manages TOR request workflow: Request -> Pending -> Final
 */
export function useDepartment() {
  const [requests, setRequests] = useState([]);
  const [applications, setApplications] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  /**
   * Fetch all data from three workflow stages
   * (Wrapped in useCallback to prevent infinite re-renders in consuming component's useEffect)
   */
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [requestsData, applicationsData, acceptedData] = await Promise.all([
        requestApi.getRequestTorList(),     // Returns array
        requestApi.getPendingRequests(),    // Returns array
        requestApi.getFinalDocuments(),     // Returns array
      ]);

      // Extract the data array from the API response object
      // The backend returns { success: true, data: [...], ... }
      setRequests(requestsData.data || []);
      setApplications(applicationsData.data || []);
      setAccepted(acceptedData.data || []);
    } catch (error) {
      showError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [showError]); // Dependency on showError (from useNotification)

  /**
   * Accept request (RequestTOR -> PendingRequest)
   */
  const acceptRequest = useCallback(async (accountId) => {
    try {
      const data = await requestApi.acceptRequest(accountId);

      showSuccess(data.message || 'Request accepted successfully');
      await fetchAllData(); // Refresh all data
      return true;
    } catch (error) {
      showError(error.message || 'Failed to accept request');
      return false;
    }
  }, [fetchAllData, showSuccess, showError]); // Dependencies on fetchAllData, showSuccess, showError

  /**
   * Deny request (deletes from RequestTOR and all related data)
   */
  const denyRequest = useCallback(async (accountId) => {
    try {
      const data = await requestApi.denyRequest(accountId);

      const totalDeleted = Object.values(data).reduce((sum, count) => sum + count, 0);
      showSuccess(`Request denied. Removed ${totalDeleted} record(s).`);
      await fetchAllData(); // Refresh all data
      return true;
    } catch (error) {
      showError(error.message || 'Failed to deny request');
      return false;
    }
  }, [fetchAllData, showSuccess, showError]);

  /**
   * Finalize request (PendingRequest -> FinalDocuments)
   */
  const finalizeRequest = useCallback(async (accountId) => {
    try {
      const data = await requestApi.finalizeRequest(accountId);

      showSuccess(data.message || 'Request finalized successfully');
      await fetchAllData(); // Refresh all data
      return true;
    } catch (error) {
      showError(error.message || 'Failed to finalize request');
      return false;
    }
  }, [fetchAllData, showSuccess, showError]);

  /**
   * Update status in PendingRequest
   */
  const updateStatus = useCallback(async (accountId, status) => {
    try {
      const data = await requestApi.updateRequestStatus(accountId, status);

      showSuccess(data.message || `Status updated to "${status}"`);
      await fetchAllData(); // Refresh all data
      return true;
    } catch (error) {
      showError(error.message || 'Failed to update status');
      return false;
    }
  }, [fetchAllData, showSuccess, showError]);

  return {
    // State
    requests,
    applications,
    accepted,
    loading,

    // Methods
    fetchAllData,
    acceptRequest,
    denyRequest,
    finalizeRequest,
    updateStatus,
  };
}