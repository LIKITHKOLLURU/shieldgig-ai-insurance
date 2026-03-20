import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    user: ''
  });

  useEffect(() => {
    fetchClaims();
  }, [pagination.currentPage, filters]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getClaims({
        page: pagination.currentPage,
        limit: 10,
        ...filters
      });
      setClaims(response.data.claims);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      setError('Failed to load claims');
      console.error('Admin claims error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (claimId, newStatus) => {
    setUpdating(claimId);
    try {
      await adminAPI.updateClaim(claimId, { status: newStatus });
      fetchClaims();
    } catch (error) {
      setError('Failed to update claim status');
      console.error('Update claim error:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'processed':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const getTriggerIcon = (triggerType) => {
    switch (triggerType) {
      case 'rain':
        return '🌧️';
      case 'heat':
        return '🌡️';
      case 'aqi':
        return '💨';
      case 'curfew':
        return '🚫';
      default:
        return '📋';
    }
  };

  if (loading && claims.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Claims Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Review and manage all insurance claims
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status Filter
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="processed">Processed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search User
            </label>
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', user: '' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Claim Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Plan & Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {claims.map((claim) => (
                <ClaimRow
                  key={claim._id}
                  claim={claim}
                  updating={updating}
                  onUpdate={handleStatusUpdate}
                  getStatusColor={getStatusColor}
                  getTriggerIcon={getTriggerIcon}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span> ({pagination.total} total)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    const isCurrentPage = pageNum === pagination.currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isCurrentPage
                            ? 'z-10 bg-primary-50 dark:bg-primary-900 border-primary-500 text-primary-600 dark:text-primary-300'
                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {claims.length === 0 && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <span className="text-6xl">📋</span>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No claims found
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {Object.values(filters).some(v => v) ? 'Try adjusting your filters' : 'No claims have been submitted yet'}
          </p>
        </div>
      )}
    </div>
  );
};

const ClaimRow = ({ claim, updating, onUpdate, getStatusColor, getTriggerIcon }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getTriggerIcon(claim.triggerType)}</span>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {claim.triggerType} Trigger
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Value: {claim.triggerValue}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(claim.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {claim.user?.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {claim.user?.email}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 dark:text-white">
            {claim.plan?.name} Plan
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            ₹{claim.claimAmount}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Premium: ₹{claim.plan?.premium}/week
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 dark:text-white">
            {claim.location?.city}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
            {claim.location?.address}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
            {claim.status}
          </span>
          {claim.fraudFlags && claim.fraudFlags.length > 0 && (
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                ⚠️ Fraud Flags
              </span>
            </div>
          )}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {showDetails ? 'Hide' : 'Details'}
            </button>
            
            {claim.status === 'pending' && (
              <>
                <button
                  onClick={() => onUpdate(claim._id, 'approved')}
                  disabled={updating === claim._id}
                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                >
                  {updating === claim._id ? <LoadingSpinner size="sm" /> : 'Approve'}
                </button>
                <button
                  onClick={() => onUpdate(claim._id, 'rejected')}
                  disabled={updating === claim._id}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </td>
      </tr>

      {showDetails && (
        <tr>
          <td colSpan="6" className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Event Details</h4>
                {claim.eventData?.weather && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Weather:</strong> {claim.eventData.weather.temperature}°C, 
                    Humidity: {claim.eventData.weather.humidity}%, 
                    Rainfall: {claim.eventData.weather.rainfall}mm
                  </div>
                )}
                {claim.eventData?.aqi && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>AQI:</strong> {claim.eventData.aqi.value} ({claim.eventData.aqi.category})
                  </div>
                )}
              </div>

              {claim.fraudFlags && claim.fraudFlags.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Fraud Flags</h4>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {claim.fraudFlags.join(', ')}
                  </div>
                </div>
              )}

              {claim.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {claim.notes}
                  </div>
                </div>
              )}

              {claim.payoutReference && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payout Information</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Reference:</strong> {claim.payoutReference}<br />
                    <strong>Processed:</strong> {new Date(claim.processedAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default AdminClaims;
