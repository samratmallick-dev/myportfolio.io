import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
      fetchAllEducation,
      fetchEducationById,
      createEducation,
      updateEducationById,
      deleteEducationById,
      fetchAllEducationAdmin,
      fetchLatestEducation,
} from "@/config/api";

const initialState = {
      educationData: [],
      allEducationData: [],
      currentEducation: null,
      latestEducation: null,
      isLoading: false,
      error: null,
      success: false,
};

// Async thunks
export const getAllEducationData = createAsyncThunk(
      "education/fetchAllEducation",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchAllEducation();
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const getEducationById = createAsyncThunk(
      "education/fetchEducationById",
      async (id, { rejectWithValue }) => {
            try {
                  const response = await fetchEducationById(id);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const createEducationData = createAsyncThunk(
      "education/createEducation",
      async (educationData, { rejectWithValue }) => {
            try {
                  const response = await createEducation(educationData);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const updateEducationData = createAsyncThunk(
      "education/updateEducation",
      async ({ id, educationData }, { rejectWithValue }) => {
            try {
                  const response = await updateEducationById(id, educationData);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const deleteEducationData = createAsyncThunk(
      "education/deleteEducation",
      async (id, { rejectWithValue }) => {
            try {
                  const response = await deleteEducationById(id);
                  return { id, message: response.message };
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const getAllEducationAdminData = createAsyncThunk(
      "education/fetchAllEducationAdmin",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchAllEducationAdmin();
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const getLatestEducationData = createAsyncThunk(
      "education/fetchLatestEducation",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchLatestEducation();
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

const educationSlice = createSlice({
      name: "education",
      initialState,
      reducers: {
            clearError: (state) => {
                  state.error = null;
            },
            clearSuccess: (state) => {
                  state.success = false;
            },
            resetEducationState: (state) => {
                  state.educationData = [];
                  state.currentEducation = null;
                  state.latestEducation = null;
                  state.isLoading = false;
                  state.error = null;
                  state.success = false;
            },
      },
      extraReducers: (builder) => {
            // Fetch all education data
            builder
                  .addCase(getAllEducationData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getAllEducationData.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.educationData = action.payload || [];
                        state.error = null;
                  })
                  .addCase(getAllEducationData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });

            // Fetch education by ID
            builder
                  .addCase(getEducationById.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getEducationById.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.currentEducation = action.payload;
                        state.error = null;
                  })
                  .addCase(getEducationById.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });

            // Create education
            builder
                  .addCase(createEducationData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(createEducationData.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.educationData.push(action.payload);
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(createEducationData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            // Update education
            builder
                  .addCase(updateEducationData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(updateEducationData.fulfilled, (state, action) => {
                        state.isLoading = false;
                        const index = state.educationData.findIndex(item => item._id === action.payload._id);
                        if (index !== -1) {
                              state.educationData[index] = action.payload;
                        }
                        state.currentEducation = action.payload;
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(updateEducationData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            // Delete education
            builder
                  .addCase(deleteEducationData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(deleteEducationData.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.educationData = state.educationData.filter(
                              (education) => education._id !== action.payload.id
                        );
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(deleteEducationData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            // Fetch all education admin
            builder
                  .addCase(getAllEducationAdminData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getAllEducationAdminData.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.allEducationData = action.payload;
                        state.error = null;
                  })
                  .addCase(getAllEducationAdminData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });

            // Fetch latest education
            builder
                  .addCase(getLatestEducationData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getLatestEducationData.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.latestEducation = action.payload;
                        state.error = null;
                  })
                  .addCase(getLatestEducationData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });
      },
});

export const { clearError, clearSuccess, resetEducationState } = educationSlice.actions;
export default educationSlice.reducer;