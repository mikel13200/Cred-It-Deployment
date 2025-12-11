// frontend/src/features/transcript/hooks/useTorUpload.js
/**
 * TOR Upload hook - Updated for new backend
 */

import { useState } from "react";
import { useNotification } from "../../../hooks"; 
import { torApi } from '../../../api';

export function useTorUpload() {
  const [loading, setLoading] = useState(false);
  const [ocrResults, setOcrResults] = useState(null);
  const { showError, showSuccess } = useNotification();

  const uploadOcr = async (images, accountId) => {
    if (!images || images.length === 0) {
      showError('No images to upload');
      return null;
    }

    setLoading(true);
    try {
      // Backend returns: { success: true, data: { student_name, school_name, ocr_results, school_tor } }
      const data = await torApi.uploadOcr(images, accountId);
      
      // Transform response to expected format
      const transformedData = {
        student_name: data.student_name,
        school_name: data.school_name,
        ocr_results: data.ocr_results || [],
        school_tor: data.school_tor || [],
      };
      
      setOcrResults(transformedData);
      showSuccess('OCR processing completed successfully!');
      return transformedData;
    } catch (error) {
      console.error('OCR Upload Error:', error);
      showError(error.message || 'Failed to process OCR');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteOcr = async (accountId) => {
    try {
      // Backend returns: { success: true, data: { tor_deleted, compare_deleted } }
      const data = await torApi.deleteOcr(accountId);
      showSuccess(`Deleted ${data.tor_deleted + data.compare_deleted} entries`);
      return true;
    } catch (error) {
      showError(error.message || 'Failed to delete OCR entries');
      return false;
    }
  };

  const reset = () => {
    setLoading(false);
    setOcrResults(null);
  };

  return { 
    uploadOcr, 
    deleteOcr,
    loading, 
    ocrResults, 
    reset 
  };
}