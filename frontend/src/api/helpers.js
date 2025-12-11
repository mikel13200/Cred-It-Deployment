// frontend/src/api/helpers.js
/**
 * API Response Helpers
 * Standardizes extraction of data from backend APIResponse format
 */

/**
 * Extract data from standardized API response
 * Backend returns: { success: true, data: {...}, message: "...", timestamp: "..." }
 * 
 * @param {Object} response - API response from apiClient
 * @returns {*} - Extracted data
 */
export function extractData(response) {
  // Handle cases where response is already unwrapped
  if (response && typeof response === 'object') {
    // If response has 'data' property, extract it
    if ('data' in response) {
      return response.data;
    }
    // Otherwise return response as-is (already unwrapped)
    return response;
  }
  return response;
}

/**
 * Extract data from response or return default
 * 
 * @param {Object} response - API response
 * @param {*} defaultValue - Default value if extraction fails
 * @returns {*} - Extracted data or default
 */
export function extractDataOrDefault(response, defaultValue = null) {
  try {
    const data = extractData(response);
    return data !== undefined && data !== null ? data : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Extract array from response, ensuring it's always an array
 * 
 * @param {Object} response - API response
 * @returns {Array} - Extracted array or empty array
 */
export function extractArray(response) {
  const data = extractData(response);
  
  // Already an array
  if (Array.isArray(data)) {
    return data;
  }
  
  // Has nested data array
  if (data && Array.isArray(data.data)) {
    return data.data;
  }
  
  // Empty or invalid
  return [];
}

/**
 * Check if API response indicates success
 * 
 * @param {Object} response - API response
 * @returns {boolean}
 */
export function isSuccess(response) {
  if (!response) return false;
  
  // Check explicit success flag
  if ('success' in response) {
    return response.success === true;
  }
  
  // If no success flag, assume success if data exists
  return 'data' in response || response !== null;
}

/**
 * Extract error message from response
 * 
 * @param {Object} response - API response or error
 * @returns {string} - Error message
 */
export function extractError(response) {
  if (!response) return 'Unknown error';
  
  // Check common error fields
  return (
    response.error ||
    response.message ||
    response.detail ||
    response.statusText ||
    'An error occurred'
  );
}