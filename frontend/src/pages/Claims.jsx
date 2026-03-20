import React, { useState, useEffect } from 'react';
import { claimsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await claimsAPI.getClaims();
      setClaims(response.data);
    } catch (error) {
      setError('Failed to load claims');
      console.error('Claims error:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
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
            Your Claims
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your insurance claims and payouts
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg"
        >
          Test Claim
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Test Claim Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Create Test Claim
          </h3>
          <TestClaimForm
            onSubmit={async (claimData) => {
              setCreating(true);
              try {
                await claimsAPI.createClaim(claimData);
                setShowCreateForm(false);
                fetchClaims();
              } catch (error) {
                setError(error.response?.data?.message || 'Failed to create claim');
              } finally {
                setCreating(false);
              }
            }}
            onCancel={() => setShowCreateForm(false)}
            loading={creating}
          />
        </div>
      )}

      {/* Claims List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          {claims.length > 0 ? (
            <div className="space-y-4">
              {claims.map((claim) => (
                <ClaimCard key={claim._id} claim={claim} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl">📋</span>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No Claims Yet
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Claims are automatically generated when environmental triggers are detected
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You can create a test claim to see how the system works
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Claims Statistics */}
      {claims.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Claims"
            value={claims.length}
            icon="📋"
            color="blue"
          />
          <StatCard
            title="Approved"
            value={claims.filter(c => c.status === 'approved').length}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Pending"
            value={claims.filter(c => c.status === 'pending').length}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="Total Payout"
            value={`₹${claims
              .filter(c => c.status === 'approved')
              .reduce((sum, c) => sum + c.claimAmount, 0)}`}
            icon="💰"
            color="purple"
          />
        </div>
      )}
    </div>
  );
};

const ClaimCard = ({ claim }) => {
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

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getTriggerIcon(claim.triggerType)}</span>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                {claim.triggerType} Trigger
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Value: {claim.triggerValue} • Claim Amount: ₹{claim.claimAmount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Date: {new Date(claim.createdAt).toLocaleDateString()} • 
                Time: {new Date(claim.createdAt).toLocaleTimeString()}
              </p>
              {claim.location?.address && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Location: {claim.location.address}
                </p>
              )}
            </div>
          </div>
          
          {claim.eventData && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event Details:
              </p>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {claim.eventData.weather && (
                  <div>
                    Temperature: {claim.eventData.weather.temperature}°C • 
                    Humidity: {claim.eventData.weather.humidity}% • 
                    Rainfall: {claim.eventData.weather.rainfall}mm
                  </div>
                )}
                {claim.eventData.aqi && (
                  <div>
                    AQI: {claim.eventData.aqi.value} ({claim.eventData.aqi.category})
                  </div>
                )}
              </div>
            </div>
          )}

          {claim.fraudFlags && claim.fraudFlags.length > 0 && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                Fraud Flags:
              </p>
              <div className="text-xs text-red-600 dark:text-red-400">
                {claim.fraudFlags.join(', ')}
              </div>
            </div>
          )}
        </div>

        <div className="ml-4 text-right">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
            {claim.status}
          </span>
          
          {claim.payoutReference && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ref: {claim.payoutReference}
              </p>
              {claim.processedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Processed: {new Date(claim.processedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TestClaimForm = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    triggerType: 'rain',
    triggerValue: 60,
    claimAmount: 800,
    location: {
      address: 'Test Location',
      latitude: 19.0760,
      longitude: 72.8777
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Trigger Type
          </label>
          <select
            value={formData.triggerType}
            onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="rain">Rain</option>
            <option value="heat">Heat</option>
            <option value="aqi">AQI</option>
            <option value="curfew">Curfew</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Trigger Value
          </label>
          <input
            type="number"
            value={formData.triggerValue}
            onChange={(e) => setFormData({ ...formData, triggerValue: Number(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Claim Amount (₹)
          </label>
          <input
            type="number"
            value={formData.claimAmount}
            onChange={(e) => setFormData({ ...formData, claimAmount: Number(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Test Location
          </label>
          <input
            type="text"
            value={formData.location.address}
            onChange={(e) => setFormData({
              ...formData,
              location: { ...formData.location, address: e.target.value }
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Create Test Claim'}
        </button>
      </div>
    </form>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    green: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Claims;
