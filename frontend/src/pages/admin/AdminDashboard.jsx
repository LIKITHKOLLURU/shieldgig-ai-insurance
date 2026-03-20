import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Admin dashboard error:', error);
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

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  const { stats, recentClaims, activeTriggers } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of ShieldGig operations and metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Total Claims"
          value={stats?.totalClaims || 0}
          icon="📋"
          color="yellow"
        />
        <StatCard
          title="Total Payouts"
          value={`₹${stats?.totalPayouts || 0}`}
          icon="💰"
          color="purple"
        />
      </div>

      {/* Claims Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Claims"
          value={stats?.pendingClaims || 0}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="Approved Claims"
          value={stats?.approvedClaims || 0}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Rejected Claims"
          value={stats?.rejectedClaims || 0}
          icon="❌"
          color="red"
        />
        <StatCard
          title="Fraud Claims"
          value={stats?.fraudClaims || 0}
          icon="⚠️"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Claims */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Claims
              </h2>
              <Link
                to="/admin/claims"
                className="text-primary-600 hover:text-primary-500 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {recentClaims && recentClaims.length > 0 ? (
              <div className="space-y-4">
                {recentClaims.map((claim) => (
                  <div key={claim._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg capitalize">
                            {claim.triggerType === 'rain' && '🌧️'}
                            {claim.triggerType === 'heat' && '🌡️'}
                            {claim.triggerType === 'aqi' && '💨'}
                            {claim.triggerType === 'curfew' && '🚫'}
                          </span>
                          <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                            {claim.triggerType} Trigger
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          User: {claim.user?.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Amount: ₹{claim.claimAmount}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Date: {new Date(claim.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          claim.status === 'approved' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : claim.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {claim.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl">📋</span>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  No Recent Claims
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  All claims will appear here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Active Triggers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Active Environmental Triggers
            </h2>

            {activeTriggers && activeTriggers.length > 0 ? (
              <div className="space-y-4">
                {activeTriggers.map((trigger, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg capitalize">
                            {trigger.type === 'rain' && '🌧️'}
                            {trigger.type === 'heat' && '🌡️'}
                            {trigger.type === 'aqi' && '💨'}
                            {trigger.type === 'curfew' && '🚫'}
                          </span>
                          <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                            {trigger.type} Alert
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Current: {trigger.currentValue} (Threshold: {trigger.threshold})
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Location: {trigger.location?.city || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Affected Users: {trigger.affectedUsers?.length || 0}
                        </p>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl">🌤️</span>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  No Active Triggers
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Environmental conditions are normal
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="text-2xl mr-3">👥</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Manage Users</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">View and manage user accounts</p>
              </div>
            </Link>

            <Link
              to="/admin/claims"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="text-2xl mr-3">📋</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Review Claims</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Process and approve claims</p>
              </div>
            </Link>

            <Link
              to="/admin/fraud"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Fraud Alerts</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Review suspicious activities</p>
              </div>
            </Link>

            <div className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Analytics</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">View detailed reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-2xl mr-3">🟢</span>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">API Services</p>
                <p className="text-sm text-green-600 dark:text-green-400">All systems operational</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-2xl mr-3">🟢</span>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">Database</p>
                <p className="text-sm text-green-600 dark:text-green-400">Connected and healthy</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-2xl mr-3">🟢</span>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">Monitoring</p>
                <p className="text-sm text-green-600 dark:text-green-400">Active and monitoring</p>
              </div>
            </div>
          </div>
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

export default AdminDashboard;
