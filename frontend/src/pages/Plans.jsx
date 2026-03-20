import React, { useState, useEffect } from 'react';
import { plansAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [error, setError] = useState('');
  const { user, updateUser } = useAuth();

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await plansAPI.getPlans();
      setPlans(response.data);
    } catch (error) {
      setError('Failed to load plans');
      console.error('Plans error:', error);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await plansAPI.getCurrentSubscription();
      setCurrentSubscription(response.data);
    } catch (error) {
      // No active subscription is fine
      setCurrentSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setSubscribing(planId);
    setError('');

    try {
      const response = await plansAPI.subscribe(planId);
      setCurrentSubscription(response.data);
      
      // Update user data
      updateUser({ currentPlan: response.data.plan });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to subscribe to plan');
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      await plansAPI.cancelSubscription();
      setCurrentSubscription(null);
      updateUser({ currentPlan: null });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getRecommendedPlan = () => {
    const riskLevel = user?.riskLevel || 'medium';
    return plans.find(plan => plan.riskLevel === riskLevel) || plans[1];
  };

  const recommendedPlan = getRecommendedPlan();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Insurance Plans
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Choose the right protection for your income
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Current Subscription */}
      {currentSubscription && (
        <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                Active Subscription
              </h3>
              <p className="mt-1 text-green-700 dark:text-green-300">
                {currentSubscription.plan?.name} Plan - ₹{currentSubscription.plan?.premium}/week
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Expires: {new Date(currentSubscription.endDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handleCancelSubscription}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      )}

      {/* Risk Level Info */}
      <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">📊</span>
          <div>
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
              Your Risk Profile
            </h3>
            <p className="mt-1 text-blue-700 dark:text-blue-300">
              Risk Level: <span className="font-semibold capitalize">{user?.riskLevel}</span>
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Based on your location and historical environmental data
            </p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isRecommended = plan._id === recommendedPlan._id;
          const isCurrentPlan = currentSubscription?.plan?._id === plan._id;
          const isSubscribing = subscribing === plan._id;

          return (
            <div
              key={plan._id}
              className={`
                bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden
                ${isRecommended ? 'ring-2 ring-primary-500' : ''}
                ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}
              `}
            >
              {isRecommended && (
                <div className="bg-primary-500 text-white text-center py-2 text-sm font-medium">
                  Recommended for You
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="bg-green-500 text-white text-center py-2 text-sm font-medium">
                  Current Plan
                </div>
              )}

              <div className="p-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-4xl font-bold text-primary-600 dark:text-primary-400">
                    ₹{plan.premium}
                    <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
                      /week
                    </span>
                  </p>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Coverage up to ₹{plan.coverageAmount}
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Risk Level: <span className="capitalize">{plan.riskLevel}</span>
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 mr-2">✓</span>
                      Weather protection (Rain, Heat)
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 mr-2">✓</span>
                      Air pollution coverage (AQI)
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 mr-2">✓</span>
                      Curfew/disruption protection
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 mr-2">✓</span>
                      Instant claim processing
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 mr-2">✓</span>
                      24/7 monitoring
                    </li>
                  </ul>
                </div>

                <div className="mt-6">
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full px-4 py-2 border border-green-500 text-green-600 dark:text-green-400 rounded-lg cursor-not-allowed"
                    >
                      Active Plan
                    </button>
                  ) : currentSubscription ? (
                    <button
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
                    >
                      Already Subscribed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan._id)}
                      disabled={isSubscribing}
                      className={`
                        w-full px-4 py-2 border border-transparent rounded-lg text-white font-medium
                        ${isRecommended 
                          ? 'bg-primary-600 hover:bg-primary-700' 
                          : 'bg-gray-600 hover:bg-gray-700'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {isSubscribing ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Subscribe Now'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Plan Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th key={plan._id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Weekly Premium
                  </td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ₹{plan.premium}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Coverage Amount
                  </td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ₹{plan.coverageAmount}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Risk Level
                  </td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {plan.riskLevel}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
