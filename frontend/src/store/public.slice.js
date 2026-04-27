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
                  return response.data ?? response;
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
            updatePublicData: (state, action) => {
                  const { type, data } = action.payload;
                  if (type === "hero") state.hero = data;
                  else if (type === "about") state.about = data;
                  else if (type === "contact") state.contact = data;
                  else if (type === "skills") state.skills = data;
                  else if (type === "education") state.education = data;
                  else if (type === "services") state.services = data;
                  else if (type === "projects") state.featuredProjects = data?.featured ?? data;
            },
      },
      extraReducers: (builder) => {
            builder
                  .addCase(getPublicInitialData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getPublicInitialData.fulfilled, (state, action) => {
                        const payload = action.payload?.data ?? action.payload;
                        state.isLoading = false;
                        state.hero = payload.hero;
                        state.about = payload.about;
                        state.education = payload.education;
                        state.skills = payload.skills;
                        state.featuredProjects = payload.featuredProjects;
                        state.services = payload.services;
                        state.contact = payload.contact;
                        state.isInitialized = true;
                        state.error = null;
                  })
                  .addCase(getPublicInitialData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });
      },
});

export const { clearError, updatePublicData } = publicSlice.actions;
export default publicSlice.reducer;