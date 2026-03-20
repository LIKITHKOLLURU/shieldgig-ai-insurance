import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminFraud = () => {
  const [fraudData, setFraudData] = useState({
    fraudClaims: [],
    suspiciousUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFraudData();
  }, []);

  const fetchFraudData = async () => {
    try {
      const response = await adminAPI.getFraudAlerts();
      setFraudData(response.data);
    } catch (error) {
      setError('Failed to load fraud data');
      console.error('Admin fraud error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { fraudClaims, suspiciousUsers } = fraudData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Fraud Detection & Alerts
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitor suspicious activities and potential fraud cases
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Fraud Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Fraudulent Claims"
          value={fraudClaims?.length || 0}
          icon="⚠️"
          color="red"
        />
        <StatCard
          title="Suspicious Users"
          value={suspiciousUsers?.length || 0}
          icon="👤"
          color="yellow"
        />
        <StatCard
          title="High Risk Claims"
          value={fraudClaims?.filter(c => c.fraudFlags?.length > 2).length || 0}
          icon="🚨"
          color="red"
        />
        <StatCard
          title="Under Review"
          value={fraudClaims?.filter(c => c.status === 'pending').length || 0}
          icon="👁️"
          color="blue"
        />
      </div>

      {/* Fraudulent Claims */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Fraudulent Claims
          </h2>

          {fraudClaims && fraudClaims.length > 0 ? (
            <div className="space-y-4">
              {fraudClaims.map((claim) => (
                <FraudClaimCard key={claim._id} claim={claim} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl">✅</span>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No Fraudulent Claims
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                All claims appear to be legitimate
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Suspicious Users */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Suspicious Users
          </h2>

          {suspiciousUsers && suspiciousUsers.length > 0 ? (
            <div className="space-y-4">
              {suspiciousUsers.map((user, index) => (
                <SuspiciousUserCard key={index} user={user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl">👥</span>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No Suspicious Users
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                User activity patterns appear normal
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fraud Patterns Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Common Fraud Patterns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                🎯 Multiple Claims in Short Time
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Users filing 3+ claims within 24 hours
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                📍 Location Anomalies
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Claims from locations far from registered address
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                💰 Amount Anomalies
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Claims significantly higher than user average
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                🔄 Repetitive Patterns
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Same trigger type claimed repeatedly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FraudClaimCard = ({ claim }) => {
  const getTriggerIcon = (triggerType) => {
    switch (triggerType) {
      case 'rain': return '🌧️';
      case 'heat': return '🌡️';
      case 'aqi': return '💨';
      case 'curfew': return '🚫';
      default: return '📋';
    }
  };

  const getRiskLevel = (flags) => {
    if (flags.length >= 4) return { level: 'High', color: 'red' };
    if (flags.length >= 2) return { level: 'Medium', color: 'yellow' };
    return { level: 'Low', color: 'blue' };
  };

  const riskLevel = getRiskLevel(claim.fraudFlags || []);

  return (
    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">{getTriggerIcon(claim.triggerType)}</span>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                {claim.triggerType} Trigger
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                User: {claim.user?.name} • Amount: ₹{claim.claimAmount}
              </p>
            </div>
          </div>

          <div className="mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${riskLevel.color}-100 dark:bg-${riskLevel.color}-900 text-${riskLevel.color}-800 dark:text-${riskLevel.color}-200`}>
              Risk Level: {riskLevel.level}
            </span>
            <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
              {claim.fraudFlags?.length || 0} Flags
            </span>
          </div>

          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Fraud Indicators:</h5>
            <div className="flex flex-wrap gap-2">
              {(claim.fraudFlags || []).map((flag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                >
                  {flag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            <p>Date: {new Date(claim.createdAt).toLocaleDateString()}</p>
            <p>Status: <span className="font-medium capitalize">{claim.status}</span></p>
          </div>
        </div>

        <div className="ml-4">
          <button className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg">
            Review
          </button>
        </div>
      </div>
    </div>
  );
};

const SuspiciousUserCard = ({ user }) => {
  return (
    <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/10">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user.userInfo?.[0]?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {user.userInfo?.[0]?.name || 'Unknown User'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.userInfo?.[0]?.email || 'No email'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Claims:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{user.claimCount}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total Amount:</span>
              <span className="ml-2 text-gray-900 dark:text-white">₹{user.totalAmount}</span>
            </div>
          </div>

          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p>⚠️ Filed {user.claimCount} claims in the last 7 days</p>
            <p>Pattern suggests potential claim abuse</p>
          </div>
        </div>

        <div className="ml-4 space-y-2">
          <button className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg">
            Investigate
          </button>
          <button className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg block">
            Suspend
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    green: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    red: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
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

export default AdminFraud;
