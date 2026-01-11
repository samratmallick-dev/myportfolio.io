import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
      fetchHeroData,
      fetchHeroById,
      addOrUpdateHero,
      updateHeroById,
      deleteHeroById,
      fetchAllHeroData,
} from "@/config/api";

const initialState = {
      heroData: null,
      allHeroData: [],
      currentHero: null,
      isLoading: false,
      error: null,
      success: false,
};

// Async thunks
export const getHeroData = createAsyncThunk(
      "hero/fetchHeroData",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchHeroData();
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const getHeroById = createAsyncThunk(
      "hero/fetchHeroById",
      async (id, { rejectWithValue }) => {
            try {
                  const response = await fetchHeroById(id);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const addUpdateHeroData = createAsyncThunk(
      "hero/addUpdateHeroData",
      async (formData, { rejectWithValue }) => {
            try {
                  const response = await addOrUpdateHero(formData);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const updateHeroDataById = createAsyncThunk(
      "hero/updateHeroById",
      async ({ id, formData }, { rejectWithValue }) => {
            try {
                  const response = await updateHeroById(id, formData);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const deleteHeroDataById = createAsyncThunk(
      "hero/deleteHeroById",
      async (id, { rejectWithValue }) => {
            try {
                  const response = await deleteHeroById(id);
                  return { id, message: response.message };
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const getAllHeroData = createAsyncThunk(
      "hero/fetchAllHeroData",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchAllHeroData();
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

const heroSlice = createSlice({
      name: "hero",
      initialState,
      reducers: {
            clearError: (state) => {
                  state.error = null;
            },
            clearSuccess: (state) => {
                  state.success = false;
            },
            resetHeroState: (state) => {
                  state.heroData = null;
                  state.currentHero = null;
                  state.isLoading = false;
                  state.error = null;
                  state.success = false;
            },
      },
      extraReducers: (builder) => {
            // Fetch hero data
            builder
                  .addCase(getHeroData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getHeroData.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.heroData = action.payload;
                        state.error = null;
                  })
                  .addCase(getHeroData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });

            // Fetch hero by ID
            builder
                  .addCase(getHeroById.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getHeroById.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.currentHero = action.payload;
                        state.error = null;
                  })
                  .addCase(getHeroById.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });

            // Add/update hero data
            builder
                  .addCase(addUpdateHeroData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(addUpdateHeroData.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.heroData = action.payload;
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(addUpdateHeroData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            // Update hero by ID
            builder
                  .addCase(updateHeroDataById.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(updateHeroDataById.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.currentHero = action.payload;
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(updateHeroDataById.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            // Delete hero by ID
            builder
                  .addCase(deleteHeroDataById.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(deleteHeroDataById.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.allHeroData = state.allHeroData.filter(
                              (hero) => hero._id !== action.payload.id
                        );
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(deleteHeroDataById.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            // Fetch all hero data
            builder
                  .addCase(getAllHeroData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getAllHeroData.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.allHeroData = action.payload;
                        state.error = null;
                  })
                  .addCase(getAllHeroData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });
      },
});

export const { clearError, clearSuccess, resetHeroState } = heroSlice.actions;
export default heroSlice.reducer;