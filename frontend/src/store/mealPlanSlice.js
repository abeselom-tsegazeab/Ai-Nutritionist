import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mealPlans: [],
  currentMealPlan: null,
  loading: false,
  error: null,
};

const mealPlanSlice = createSlice({
  name: 'mealPlan',
  initialState,
  reducers: {
    setMealPlans: (state, action) => {
      state.mealPlans = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentMealPlan: (state, action) => {
      state.currentMealPlan = action.payload;
      state.loading = false;
      state.error = null;
    },
    addMealPlan: (state, action) => {
      state.mealPlans.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    updateMealPlan: (state, action) => {
      const index = state.mealPlans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.mealPlans[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    deleteMealPlan: (state, action) => {
      state.mealPlans = state.mealPlans.filter(plan => plan.id !== action.payload);
      if (state.currentMealPlan && state.currentMealPlan.id === action.payload) {
        state.currentMealPlan = null;
      }
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
    clearMealPlans: (state) => {
      state.mealPlans = [];
      state.currentMealPlan = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { 
  setMealPlans, 
  setCurrentMealPlan, 
  addMealPlan, 
  updateMealPlan, 
  deleteMealPlan, 
  setLoading, 
  setError,
  clearMealPlans
} = mealPlanSlice.actions;

export default mealPlanSlice.reducer;