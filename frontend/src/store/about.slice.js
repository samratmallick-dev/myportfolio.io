import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
      fetchAboutData,
      fetchAboutById,
      addOrUpdateAbout,
      updateAboutById,
      deleteAboutById,
      fetchAllAboutData,
} from "@/config/api";

const initialState = {
      aboutData: null,
      allAboutData: [],
      currentAbout: null,
      isLoading: false,
      error: null,
      success: false,
};

// Async thunks
export const getAboutData = createAsyncThunk(
      "about/fetchAboutData",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchAboutData();
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const getAboutById = createAsyncThunk(
      "about/fetchAboutById",
      async (id, { rejectWithValue }) => {
            try {
                  const response = await fetchAboutById(id);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const addUpdateAboutData = createAsyncThunk(
      "about/addUpdateAboutData",
      async (formData, { rejectWithValue }) => {
            try {
                  const response = await addOrUpdateAbout(formData);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const updateAboutDataById = createAsyncThunk(
      "about/updateAboutById",
      async ({ id, formData }, { rejectWithValue }) => {
            try {
                  const response = await updateAboutById(id, formData);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const deleteAboutDataById = createAsyncThunk(
      "about/deleteAboutById",
      async (id, { rejectWithValue }) => {
            try {
                  const response = await deleteAboutById(id);
                  return { id, message: response.message };
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const getAllAboutData = createAsyncThunk(
      "about/fetchAllAboutData",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchAllAboutData();
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

const aboutSlice = createSlice({
      name: "about",
      initialState,
      reducers: {
            clearError: (state) => {
                  state.error = null;
            },
            clearSuccess: (state) => {
                  state.success = false;
            },
            resetAboutState: (state) => {
                  state.aboutData = null;
                  state.currentAbout = null;
                  state.isLoading = false;
                  state.error = null;
                  state.success = false;
            },
      },
      extraReducers: (builder) => {
            // Fetch about data
            builder
                  .addCase(getAboutData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getAboutData.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.aboutData = action.payload;
                        state.error = null;
                  })
                  .addCase(getAboutData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });

            // Fetch about by ID
            builder
                  .addCase(getAboutById.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getAboutById.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.currentAbout = action.payload;
                        state.error = null;
                  })
                  .addCase(getAboutById.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });

            // Add/update about data
            builder
                  .addCase(addUpdateAboutData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(addUpdateAboutData.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.aboutData = action.payload;
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(addUpdateAboutData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            // Update about by ID
            builder
                  .addCase(updateAboutDataById.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(updateAboutDataById.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.currentAbout = action.payload;
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(updateAboutDataById.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            // Delete about by ID
            builder
                  .addCase(deleteAboutDataById.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(deleteAboutDataById.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.allAboutData = state.allAboutData.filter(
                              (about) => about._id !== action.payload.id
                        );
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(deleteAboutDataById.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            // Fetch all about data
            builder
                  .addCase(getAllAboutData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getAllAboutData.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.allAboutData = action.payload;
                        state.error = null;
                  })
                  .addCase(getAllAboutData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });
      },
});

export const { clearError, clearSuccess, resetAboutState } = aboutSlice.actions;
export default aboutSlice.reducer;