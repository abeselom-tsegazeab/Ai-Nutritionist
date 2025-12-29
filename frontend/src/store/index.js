import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import userReducer from './userSlice';
import mealPlanReducer from './mealPlanSlice';
import nutritionReducer from './nutritionSlice';

// Persist config for user slice
const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['user', 'isAuthenticated'], // only persist user and isAuthenticated
};

export const store = configureStore({
  reducer: {
    user: persistReducer(userPersistConfig, userReducer),
    mealPlan: mealPlanReducer,
    nutrition: nutritionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export default store;