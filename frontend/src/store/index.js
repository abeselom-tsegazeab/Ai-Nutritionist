import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import mealPlanReducer from './mealPlanSlice';
import nutritionReducer from './nutritionSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    mealPlan: mealPlanReducer,
    nutrition: nutritionReducer,
  },
});

export default store;