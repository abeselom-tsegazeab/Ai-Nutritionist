import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    height: '175',
    weight: '70',
    age: '30',
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'weight-loss'
  });

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'security', label: 'Security' }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white dark:text-white mb-2">Your Profile</h1>
          <p className="text-gray-300 dark:text-gray-300">Manage your account settings and preferences</p>
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
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    JD
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white dark:text-white">John Doe</h3>
                    <p className="text-gray-400 dark:text-gray-400">john.doe@example.com</p>
                    <button className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors duration-300">
                      Change Photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={profileData.height}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={profileData.weight}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={profileData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                      Activity Level
                    </label>
                    <select
                      name="activityLevel"
                      value={profileData.activityLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="sedentary">Sedentary (little or no exercise)</option>
                      <option value="light">Lightly active (light exercise 1-3 days/week)</option>
                      <option value="moderate">Moderately active (moderate exercise 3-5 days/week)</option>
                      <option value="active">Very active (hard exercise 6-7 days/week)</option>
                      <option value="extra">Extra active (very hard exercise & physical job)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                      Goal
                    </label>
                    <select
                      name="goal"
                      value={profileData.goal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="weight-loss">Weight Loss</option>
                      <option value="muscle-gain">Muscle Gain</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="improve-health">Improve Health</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                      Dietary Preferences
                    </label>
                    <div className="space-y-2">
                      {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'].map((diet) => (
                        <label key={diet} className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-white/10"
                          />
                          <span className="ml-2 text-gray-300 dark:text-gray-300 capitalize">{diet.replace('-', ' ')}</span>
                        </label>
                      ))}
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

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-white dark:text-white mb-4">Change Password</h3>
                  </div>
                  
                  <div className="md:col-span-2">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
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

export default Profile;