import { useState } from 'react';

const MealPlanner = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [mealType, setMealType] = useState('breakfast');
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const meals = {
    breakfast: [
      { name: 'Oatmeal with Berries', calories: 320, protein: 12, carbs: 52, fat: 8 },
      { name: 'Greek Yogurt Parfait', calories: 280, protein: 18, carbs: 35, fat: 6 },
      { name: 'Avocado Toast', calories: 350, protein: 10, carbs: 45, fat: 15 }
    ],
    lunch: [
      { name: 'Grilled Chicken Salad', calories: 420, protein: 35, carbs: 25, fat: 20 },
      { name: 'Quinoa Bowl', calories: 480, protein: 22, carbs: 55, fat: 18 },
      { name: 'Turkey Wrap', calories: 380, protein: 28, carbs: 40, fat: 12 }
    ],
    dinner: [
      { name: 'Salmon with Veggies', calories: 450, protein: 38, carbs: 30, fat: 22 },
      { name: 'Lean Beef Stir Fry', calories: 420, protein: 32, carbs: 35, fat: 18 },
      { name: 'Vegetable Pasta', calories: 400, protein: 18, carbs: 55, fat: 12 }
    ]
  };

  const currentMeals = meals[mealType] || [];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white dark:text-white mb-4">
            Your <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Personalized</span> Meal Plan
          </h2>
          <p className="text-xl text-gray-300 dark:text-gray-300 max-w-3xl mx-auto">
            Get AI-generated meal recommendations tailored to your goals and preferences
          </p>
        </div>

        {/* Day Selector */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {days.map((day, index) => (
              <button
                key={day}
                onClick={() => setSelectedDay(index)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
                  selectedDay === index
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-white/10 dark:bg-gray-800/30 text-gray-300 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-700/50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Meal Type Selector */}
        <div className="flex justify-center mb-8 space-x-4">
          {['breakfast', 'lunch', 'dinner'].map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`px-6 py-3 rounded-lg capitalize transition-all duration-300 ${
                mealType === type
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/10 dark:bg-gray-800/30 text-gray-300 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-700/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Meal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentMeals.map((meal, index) => (
            <div 
              key={index}
              className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-md p-6 rounded-xl border border-white/20 dark:border-gray-700 hover:scale-105 transition-transform duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white dark:text-white group-hover:text-blue-400 transition-colors duration-300">
                  {meal.name}
                </h3>
                <span className="text-sm bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                  {meal.calories} cal
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white dark:text-white">{meal.protein}g</div>
                  <div className="text-xs text-gray-400">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white dark:text-white">{meal.carbs}g</div>
                  <div className="text-xs text-gray-400">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white dark:text-white">{meal.fat}g</div>
                  <div className="text-xs text-gray-400">Fat</div>
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02]">
                Add to Plan
              </button>
            </div>
          ))}
        </div>

        {/* AI Recommendation Section */}
        <div className="mt-12 bg-white/10 dark:bg-gray-800/30 backdrop-blur-md p-8 rounded-2xl border border-white/20 dark:border-gray-700">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white dark:text-white mb-2">AI-Powered Recommendations</h3>
            <p className="text-gray-300 dark:text-gray-300">
              Based on your profile and goals, our AI suggests these meals for optimal nutrition
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-bold text-white dark:text-white mb-2">Goal Tracking</h4>
              <p className="text-sm text-gray-300 dark:text-gray-300">
                Your meals are optimized to help you reach your fitness goals
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-blue-600/20 rounded-xl">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-bold text-white dark:text-white mb-2">Nutrition Analytics</h4>
              <p className="text-sm text-gray-300 dark:text-gray-300">
                Detailed nutrition breakdowns for better tracking
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-xl">
              <div className="text-3xl mb-2">🤖</div>
              <h4 className="font-bold text-white dark:text-white mb-2">Smart Suggestions</h4>
              <p className="text-sm text-gray-300 dark:text-gray-300">
                AI learns your preferences to suggest better meals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanner;