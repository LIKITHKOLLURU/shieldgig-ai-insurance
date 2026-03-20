import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await userAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
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

  const { user: userData, activeSubscription, recentClaims, stats } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {userData?.name}! 👋
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's your insurance overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">🛡️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Risk Level
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white capitalize">
                {userData?.riskLevel || 'Medium'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Claims
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.totalClaims || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Payouts
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ₹{stats?.totalPayouts || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Approved Claims
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.approvedClaims || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Subscription */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Active Insurance Plan
          </h2>
          
          {activeSubscription ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {activeSubscription.plan?.name} Plan
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Weekly Premium: ₹{activeSubscription.plan?.premium}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Coverage: ₹{activeSubscription.plan?.coverageAmount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Expires: {new Date(activeSubscription.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Active
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl">🛡️</span>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No Active Insurance Plan
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Get protected against income loss from weather, pollution, and other disruptions
              </p>
              <Link
                to="/plans"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
              >
                View Plans
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Claims
            </h2>
            <Link
              to="/claims"
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
                No Claims Yet
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Claims will be automatically generated when trigger conditions are met
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/plans"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="text-2xl mr-3">🛡️</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Browse Plans</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Find the right coverage</p>
              </div>
            </Link>

            <Link
              to="/claims"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="text-2xl mr-3">📋</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">View Claims</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Check claim status</p>
              </div>
            </Link>

            <Link
              to="/profile"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="text-2xl mr-3">👤</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Update Profile</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your details</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
