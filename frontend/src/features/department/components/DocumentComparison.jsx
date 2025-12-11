// frontend/src/features/department/components/DocumentComparison.jsx
import React, { useState, useEffect } from 'react';
import { torApi } from '../../../../api';
import { useNotification } from '../../../../hooks';
import SummaryView from '../../transcript/components/Results/SummaryView';
import { Loader } from '../../../../components/common';

export default function DocumentComparison({ accountId }) {
  const [applicantTor, setApplicantTor] = useState([]);
  const [schoolTor, setSchoolTor] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    if (accountId) {
      fetchTorData();
    }
  }, [accountId]);

  const fetchTorData = async () => {
    setLoading(true);
    try {
      // Fetch applicant's processed TOR
      const applicantData = await torApi.getCompareResultTor(accountId);
      setApplicantTor(applicantData || []);
      
      // Fetch school's standard TOR (CIT curriculum)
      const schoolData = await torApi.getCitTorContent();
      setSchoolTor(schoolData || []);
    } catch (error) {
      console.error('Failed to fetch TOR data:', error);
      showError('Failed to load TOR data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader />
        <span className="ml-2">Loading TOR data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* School's TOR Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">School's TOR</h3>
        {schoolTor.length > 0 ? (
          <div className="border border-gray-300 rounded max-h-[400px] overflow-y-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-3 border text-left">Subject Code</th>
                  <th className="p-3 border text-left">Units</th>
                  <th className="p-3 border text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                {schoolTor.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 border">{row.subject_code}</td>
                    <td className="p-3 border">{row.units || row.total_academic_units}</td>
                    <td className="p-3 border">{row.subject_description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">No school TOR data available</p>
        )}
      </div>

      {/* Applicant's TOR Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Applicant's TOR</h3>
        {applicantTor.length > 0 ? (
          <SummaryView data={applicantTor} />
        ) : (
          <div className="border border-gray-300 rounded p-8 text-center">
            <p className="text-gray-500 italic">No applicant TOR found.</p>
            <p className="text-sm text-gray-400 mt-2">
              The student may not have completed TOR processing yet.
            </p>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchTorData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Refresh TOR Data
        </button>
      </div>
    </div>
  );
}