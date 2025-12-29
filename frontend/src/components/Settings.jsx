import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated, fetchUserData, debouncedFetchUserData } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && (!user || !user.id)) {
      debouncedFetchUserData();
    }
  }, [isAuthenticated, user, debouncedFetchUserData]);
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: theme === 'dark',
    privacyMode: false
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!user || !user.id) {
        await fetchUserData();
      }
    };
    
    loadUserData();
  }, [user, fetchUserData]);

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'security', label: 'Security' }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white dark:text-white mb-2">Settings</h1>
          <p className="text-gray-300 dark:text-gray-300">Manage your account preferences</p>
        </div>

        <div className={`bg-white/10 dark:bg-gray-800/30 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl ${theme === 'dark' ? 'dark' : ''}`}>
          {/* Tab Navigation */}
          <div className="border-b border-white/20 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white dark:text-white mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.name || ""}
                        className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email || ""}
                        className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/20 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-white dark:text-white mb-4">Profile Picture</h3>
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                        Change Photo
                      </button>
                      <p className="text-sm text-gray-400 dark:text-gray-400 mt-2">
                        JPG, GIF or PNG. Max size of 1MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white dark:text-white mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white dark:text-white font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-400 dark:text-gray-400">Receive notifications via email</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('emailNotifications')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                          settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                            settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white dark:text-white font-medium">Push Notifications</p>
                        <p className="text-sm text-gray-400 dark:text-gray-400">Receive push notifications on your device</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('pushNotifications')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                          settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                            settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white dark:text-white font-medium">Meal Plan Reminders</p>
                        <p className="text-sm text-gray-400 dark:text-gray-400">Get reminders for meal times</p>
                      </div>
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 bg-blue-600`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 translate-x-6`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white dark:text-white mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white dark:text-white font-medium">Private Profile</p>
                        <p className="text-sm text-gray-400 dark:text-gray-400">Hide your profile from public search</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('privacyMode')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                          settings.privacyMode ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                            settings.privacyMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white dark:text-white font-medium">Data Sharing</p>
                        <p className="text-sm text-gray-400 dark:text-gray-400">Allow sharing of anonymized data for research</p>
                      </div>
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 bg-gray-600`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 translate-x-1`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white dark:text-white font-medium">Location Data</p>
                        <p className="text-sm text-gray-400 dark:text-gray-400">Allow location tracking for nearby restaurants</p>
                      </div>
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 bg-gray-600`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 translate-x-1`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/20 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-white dark:text-white mb-4">Data Management</h3>
                  <div className="space-y-4">
                    <button className="w-full text-left p-4 bg-white/5 dark:bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-white/10 dark:hover:bg-gray-700/70 transition-colors duration-300">
                      <p className="text-white dark:text-white font-medium">Download Your Data</p>
                      <p className="text-sm text-gray-400 dark:text-gray-400">Download a copy of your personal data</p>
                    </button>
                    <button className="w-full text-left p-4 bg-white/5 dark:bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-white/10 dark:hover:bg-gray-700/70 transition-colors duration-300">
                      <p className="text-white dark:text-white font-medium">Delete Your Account</p>
                      <p className="text-sm text-gray-400 dark:text-gray-400">Permanently delete your account and all data</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white dark:text-white mb-4">Password & Security</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                    Update Password
                  </button>
                </div>

                <div className="pt-6 border-t border-white/20 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-white dark:text-white mb-4">Two-Factor Authentication</h3>
                  <p className="text-gray-300 dark:text-gray-300 mb-4">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <button className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
                    Enable Two-Factor Auth
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;