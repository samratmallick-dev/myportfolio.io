import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPublicInitialData } from "@/config/api";

const initialState = {
      hero: null,
      about: null,
      education: [],
      skills: [],
      featuredProjects: [],
      services: [],
      contact: null,
      isLoading: false,
      error: null,
      isInitialized: false,
};

export const getPublicInitialData = createAsyncThunk(
      "public/fetchInitialData",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchPublicInitialData();
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

const publicSlice = createSlice({
      name: "public",
      initialState,
      reducers: {
            clearError: (state) => {
                  state.error = null;
            },
      },
      extraReducers: (builder) => {
            builder
                  .addCase(getPublicInitialData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getPublicInitialData.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.hero = action.payload.hero;
                        state.about = action.payload.about;
                        state.education = action.payload.education;
                        state.skills = action.payload.skills;
                        state.featuredProjects = action.payload.featuredProjects;
                        state.services = action.payload.services;
                        state.contact = action.payload.contact;
                        state.isInitialized = true;
                        state.error = null;
                  })
                  .addCase(getPublicInitialData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });
      },
});

export const { clearError } = publicSlice.actions;
export default publicSlice.reducer;
