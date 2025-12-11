import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Button, Loader, ConfirmDialog } from '../../components/common';
import { profileApi, torApi, requestApi } from '../../api';
import { useNotification } from '../../hooks';

export default function RequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [citTor, setCitTor] = useState([]);
  const [applicantTor, setApplicantTor] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDenyDialog, setShowDenyDialog] = useState(false);

  const { showSuccess, showError } = useNotification();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileData, citTorData, applicantTorData] = await Promise.all([
        profileApi.getProfile(id),
        torApi.getCitTorContent(),
        torApi.getCompareResultTor(id),
      ]);

      // Extract data from API responses
      // Profile data might be a single object or an array (legacy)
      let profileObj = null;
      if (Array.isArray(profileData)) {
        profileObj = profileData.length > 0 ? profileData[0] : null;
      } else if (profileData && typeof profileData === 'object') {
        // If it has a 'data' property that is an array, extract from there
        if (Array.isArray(profileData.data)) {
          profileObj = profileData.data.length > 0 ? profileData.data[0] : null;
        } else if (profileData.user_id || profileData.name) {
          // It's likely the profile object itself
          profileObj = profileData;
        }
      }

      const citTorList = Array.isArray(citTorData) ? citTorData : (citTorData?.data || []);
      const applicantTorList = Array.isArray(applicantTorData) ? applicantTorData : (applicantTorData?.data || []);

      setProfile(profileObj);
      setCitTor(citTorList);
      setApplicantTor(applicantTorList);
    } catch (error) {
      showError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      await requestApi.acceptRequest(id);
      showSuccess('Request accepted and moved to Pending Requests.');
      setTimeout(() => navigate('/DepartmentHome'), 1500);
    } catch (error) {
      showError(error.message || 'Failed to accept request');
    } finally {
      setProcessing(false);
      setShowAcceptDialog(false);
    }
  };

  const handleDeny = async () => {
    setProcessing(true);
    try {
      await requestApi.denyRequest(id);
      showSuccess('Request denied successfully.');
      setTimeout(() => navigate('/DepartmentHome'), 1500);
    } catch (error) {
      showError(error.message || 'Failed to deny request');
    } finally {
      setProcessing(false);
      setShowDenyDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader text="Loading request data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Applicant Request</h1>
      </div>

      {/* Applicant Info */}
      {profile ? (
        <div className="bg-white shadow border rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Applicant Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <p>
              <strong>Name:</strong> {profile.name}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            <p>
              <strong>Phone:</strong> {profile.phone}
            </p>
            <p>
              <strong>School:</strong> {profile.school_name}
            </p>
            <p>
              <strong>User ID:</strong> {profile.user_id}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 mb-6">Loading applicant info...</p>
      )}

      {/* Tables */}
      <div className="grid grid-cols-2 gap-6">
        {/* CIT TOR */}
        <div className="bg-white shadow border rounded-lg p-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3">
            School's TOR
          </h3>
          <div className="overflow-y-auto max-h-[400px] border-t">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 border-b sticky top-0">
                <tr>
                  <th className="px-3 py-2 font-medium">Subject Code</th>
                  <th className="px-3 py-2 font-medium">Units</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {citTor.length > 0 ? (
                  citTor.map((subj, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{subj.subject_code}</td>
                      <td className="px-3 py-2">{subj.units}</td>
                      <td className="px-3 py-2">
                        {Array.isArray(subj.description)
                          ? subj.description.join(', ')
                          : subj.description}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-3 py-3 text-center text-gray-500">
                      No school TOR found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Applicant TOR */}
        <div className="bg-white shadow border rounded-lg p-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3">
            Applicant's TOR
          </h3>
          <div className="overflow-y-auto max-h-[400px] border-t">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 border-b sticky top-0">
                <tr>
                  <th className="px-3 py-2 font-medium">Subject Code</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Units</th>
                  <th className="px-3 py-2 font-medium">Final Grade</th>
                  <th className="px-3 py-2 font-medium">Evaluation</th>
                  <th className="px-3 py-2 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {applicantTor.length > 0 ? (
                  applicantTor.map((entry, index) => {
                    // Color coding for evaluation status - matching student modal
                    let statusColor = 'bg-gray-100 text-gray-700';
                    if (entry.credit_evaluation === 'Accepted') {
                      statusColor = 'bg-green-100 text-green-700 border border-green-200';
                    } else if (entry.credit_evaluation === 'Denied') {
                      statusColor = 'bg-red-100 text-red-700 border border-red-200';
                    } else if (entry.credit_evaluation === 'Void') {
                      statusColor = 'bg-orange-100 text-orange-700 border border-orange-200';
                    } else if (entry.credit_evaluation === 'Investigate') {
                      statusColor = 'bg-yellow-100 text-yellow-700 border border-yellow-200';
                    }

                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{entry.subject_code}</td>
                        <td className="px-3 py-2">{entry.subject_description}</td>
                        <td className="px-3 py-2">{entry.total_academic_units}</td>
                        <td className="px-3 py-2">{entry.final_grade}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                            {entry.credit_evaluation || 'Pending'}
                          </span>
                        </td>
                        <td className="px-3 py-2">{entry.remarks}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-3 py-3 text-center text-gray-500">
                      No applicant TOR found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <Button variant="outline" onClick={() => navigate('/DepartmentHome')}>
          Cancel
        </Button>

        <Button
          variant="danger"
          onClick={() => setShowDenyDialog(true)}
          disabled={processing}
        >
          Deny Request
        </Button>

        <Button
          variant="success"
          onClick={() => setShowAcceptDialog(true)}
          disabled={processing}
        >
          Accept Request
        </Button>
      </div>

      {/* Accept Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showAcceptDialog}
        onClose={() => setShowAcceptDialog(false)}
        onConfirm={handleAccept}
        title="Accept Request"
        message="Are you sure you want to accept this request?"
        confirmText="Yes, Accept"
        loading={processing}
      />

      {/* Deny Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDenyDialog}
        onClose={() => setShowDenyDialog(false)}
        onConfirm={handleDeny}
        title="Deny Request"
        message="Do you want to deny this request?"
        confirmText="Yes, Deny"
        type="danger"
        loading={processing}
      />
    </div>
  );
}