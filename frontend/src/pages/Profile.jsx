import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const { updateUser } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      setError('Failed to load profile');
      console.error('Profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await userAPI.updateProfile(profile);
      setProfile(response.data);
      updateUser(response.data);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setProfile({
        ...profile,
        location: {
          ...profile.location,
          [locationField]: value
        }
      });
    } else if (name.startsWith('platforms.')) {
      const platform = value;
      const currentPlatforms = profile.platforms || [];
      const updatedPlatforms = currentPlatforms.includes(platform)
        ? currentPlatforms.filter(p => p !== platform)
        : [...currentPlatforms, platform];
      
      setProfile({
        ...profile,
        platforms: updatedPlatforms
      });
    } else {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const platforms = [
    { value: 'swiggy', label: 'Swiggy' },
    { value: 'zomato', label: 'Zomato' },
    { value: 'zepto', label: 'Zepto' },
    { value: 'uber', label: 'Uber' },
    { value: 'ola', label: 'Ola' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your personal information and preferences
          </p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg"
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profile?.name || ''}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profile?.phone || ''}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="workType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Work Type
                  </label>
                  <select
                    id="workType"
                    name="workType"
                    value={profile?.workType || 'delivery'}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="delivery">Delivery</option>
                    <option value="ride-sharing">Ride Sharing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Platforms */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Work Platforms
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {platforms.map((platform) => (
                  <label key={platform.value} className="flex items-center">
                    <input
                      type="checkbox"
                      name="platforms"
                      value={platform.value}
                      checked={profile?.platforms?.includes(platform.value) || false}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {platform.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </label>
                  <input
                    id="address"
                    name="location.address"
                    type="text"
                    value={profile?.location?.address || ''}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    City
                  </label>
                  <input
                    id="city"
                    name="location.city"
                    type="text"
                    value={profile?.location?.city || ''}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    State
                  </label>
                  <input
                    id="state"
                    name="location.state"
                    type="text"
                    value={profile?.location?.state || ''}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Risk Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Risk Assessment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Risk Level
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white capitalize">
                    {profile?.riskLevel || 'Medium'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Risk Score
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {profile?.riskScore || 50}/100
                  </p>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Risk assessment is based on your location and historical environmental data
              </p>
            </div>

            {/* Account Statistics */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Account Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Claims
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {profile?.totalClaims || 0}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Payouts
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    ₹{profile?.totalPayouts || 0}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Member Since
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {editMode && (
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
