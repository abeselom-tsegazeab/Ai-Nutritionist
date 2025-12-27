import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  nutrients: [],
  dailyIntake: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  },
  recommendations: [],
  loading: false,
  error: null,
};

const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    setNutrients: (state, action) => {
      state.nutrients = action.payload;
      state.loading = false;
      state.error = null;
    },
    setDailyIntake: (state, action) => {
      state.dailyIntake = { ...state.dailyIntake, ...action.payload };
      state.loading = false;
      state.error = null;
    },
    addNutrient: (state, action) => {
      state.nutrients.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    updateDailyIntake: (state, action) => {
      state.dailyIntake = { ...state.dailyIntake, ...action.payload };
      state.loading = false;
      state.error = null;
    },
    setRecommendations: (state, action) => {
      state.recommendations = action.payload;
      state.loading = false;
      state.error = null;
    },
    addRecommendation: (state, action) => {
      state.recommendations.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    resetNutrition: (state) => {
      state.nutrients = [];
      state.dailyIntake = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
      state.recommendations = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const { 
  setNutrients, 
  setDailyIntake, 
  addNutrient, 
  updateDailyIntake, 
  setRecommendations, 
  addRecommendation,
  setLoading, 
  setError,
  resetNutrition
} = nutritionSlice.actions;

export default nutritionSlice.reducer;