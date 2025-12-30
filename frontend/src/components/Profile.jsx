import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated, fetchUserData, loading, debouncedFetchUserData, resetTokenValidity } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && (!user || !user.id)) {
      // Only fetch user data if we have a token
      if (localStorage.getItem('accessToken')) {
        debouncedFetchUserData();
      }
    }
  }, [isAuthenticated, user, debouncedFetchUserData]);
  
  // Effect to reset token validity when component mounts
  useEffect(() => {
    resetTokenValidity();
  }, [resetTokenValidity]);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    height: '',
    weight: '',
    age: '',
    gender: '',
    activityLevel: 'moderate',
    goal: 'weight-loss'
  });
  
  // This effect is now handled above with debounced function
  
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);
  
  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' }
  ];
  
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Your Profile
          </h1>
          <p className="text-xl text-gray-300 dark:text-gray-300 animate-fade-in">
            Manage your account settings and preferences
          </p>
        </div>
        
        <div className={`bg-white/10 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700 shadow-2xl shadow-blue-500/10 transition-all duration-500 hover:shadow-blue-500/20 ${theme === 'dark' ? 'dark' : ''}`}>
          {/* Animated Tab Navigation */}
          <div className="border-b border-white/20 dark:border-gray-700 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-t-3xl"></div>
            <nav className="relative flex space-x-8 px-6 py-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-4 px-6 rounded-xl font-medium text-sm transition-all duration-300 group ${
                    activeTab === tab.id
                      ? 'text-blue-400 bg-white/10 dark:bg-gray-700/50 border border-white/20'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-white/5 dark:hover:bg-gray-700/30'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-100 transition-transform duration-300 origin-left"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Animated Tab Content */}
          <div className="p-8 transition-all duration-500">
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-fade-in">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                  <div className="group relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 dark:border-gray-600/50 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-500/20">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&color=fff&size=128`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-white dark:text-white mb-2 transition-all duration-300 group-hover:text-blue-300">
                      {user?.name || profileData.name || 'User Name'}
                    </h3>
                    <p className="text-gray-400 dark:text-gray-400 mb-4 transition-all duration-300 group-hover:text-gray-300">
                      {user?.email || profileData.email || 'user@example.com'}
                    </p>
                    <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 transform hover:shadow-lg hover:shadow-blue-500/30 group">
                      <span>Change Photo</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-3 transition-all duration-300 group-hover:text-blue-300">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your name"
                          className="w-full px-6 py-4 rounded-xl border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      </div>
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-3 transition-all duration-300 group-hover:text-blue-300">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="w-full px-6 py-4 rounded-xl border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      </div>
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-3 transition-all duration-300 group-hover:text-blue-300">
                        Height (cm)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="height"
                          value={profileData.height}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 rounded-xl border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-3 transition-all duration-300 group-hover:text-blue-300">
                        Weight (kg)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="weight"
                          value={profileData.weight}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 rounded-xl border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      </div>
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-3 transition-all duration-300 group-hover:text-blue-300">
                        Age
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="age"
                          value={profileData.age}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 rounded-xl border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      </div>
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-3 transition-all duration-300 group-hover:text-blue-300">
                        Gender
                      </label>
                      <div className="relative">
                        <select
                          name="gender"
                          value={profileData.gender}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 rounded-xl border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10 appearance-none"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-6">
                  <button className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 hover:scale-105 transform hover:shadow-2xl hover:shadow-blue-500/30 overflow-hidden">
                    <span className="relative z-10">Save Changes</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'preferences' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-3 transition-all duration-300 group-hover:text-blue-300">
                      Activity Level
                    </label>
                    <div className="relative">
                      <select
                        name="activityLevel"
                        value={profileData.activityLevel}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 rounded-xl border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10 appearance-none"
                      >
                        <option value="sedentary">Sedentary (little or no exercise)</option>
                        <option value="light">Lightly active (light exercise 1-3 days/week)</option>
                        <option value="moderate">Moderately active (moderate exercise 3-5 days/week)</option>
                        <option value="active">Very active (hard exercise 6-7 days/week)</option>
                        <option value="extra">Extra active (very hard exercise & physical job)</option>
                      </select>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-3 transition-all duration-300 group-hover:text-blue-300">
                      Goal
                    </label>
                    <div className="relative">
                      <select
                        name="goal"
                        value={profileData.goal}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 rounded-xl border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10 appearance-none"
                      >
                        <option value="weight-loss">Weight Loss</option>
                        <option value="muscle-gain">Muscle Gain</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="improve-health">Improve Health</option>
                      </select>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-4 transition-all duration-300 group-hover:text-blue-300">
                      Dietary Preferences
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'].map((diet) => (
                        <div key={diet} className="group">
                          <label className="flex items-center space-x-3 p-4 rounded-xl border border-gray-600 bg-white/5 dark:bg-gray-700/50 hover:bg-white/10 dark:hover:bg-gray-700/70 transition-all duration-300 cursor-pointer group">
                            <input
                              type="checkbox"
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-white/10"
                            />
                            <span className="text-gray-300 dark:text-gray-300 capitalize transition-colors duration-300 group-hover:text-blue-300">
                              {diet.replace('-', ' ')}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-6">
                  <button className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 hover:scale-105 transform hover:shadow-2xl hover:shadow-blue-500/30 overflow-hidden">
                    <span className="relative z-10">Save Preferences</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <h3 className="text-xl font-semibold text-white dark:text-white mb-6">Change Password</h3>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-3 transition-all duration-300 group-hover:text-blue-300">
                      Current Password
                    </label>
                    <div className="relative group">
                      <input
                        type="password"
                        className="w-full px-6 py-4 rounded-xl border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-3 transition-all duration-300 group-hover:text-blue-300">
                      New Password
                    </label>
                    <div className="relative group">
                      <input
                        type="password"
                        className="w-full px-6 py-4 rounded-xl border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-3 transition-all duration-300 group-hover:text-blue-300">
                      Confirm New Password
                    </label>
                    <div className="relative group">
                      <input
                        type="password"
                        className="w-full px-6 py-4 rounded-xl border border-gray-600 bg-white/5 dark:bg-gray-700/50 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-6">
                  <button className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 hover:scale-105 transform hover:shadow-2xl hover:shadow-blue-500/30 overflow-hidden">
                    <span className="relative z-10">Update Password</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </button>
                </div>
                
                <div className="pt-8 border-t border-white/20 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-white dark:text-white mb-4">Two-Factor Authentication</h3>
                  <p className="text-gray-300 dark:text-gray-300 mb-6">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <button className="group relative bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 hover:scale-105 transform hover:shadow-2xl hover:shadow-green-500/30 overflow-hidden">
                    <span className="relative z-10">Enable Two-Factor Auth</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
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