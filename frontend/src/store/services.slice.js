import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
      fetchAllServices,
      fetchServiceById,
      createService,
      updateServiceById,
      deleteServiceById,
      fetchAllServicesAdmin,
} from "@/config/api";

const initialState = {
      servicesData: [],
      currentService: null,
      isLoading: false,
      error: null,
      success: false,
};

// Async thunks
export const getAllServices = createAsyncThunk(
      "services/fetchAllServices",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchAllServices();
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const getServiceById = createAsyncThunk(
      "services/fetchServiceById",
      async (id, { rejectWithValue }) => {
            try {
                  const response = await fetchServiceById(id);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const createServiceData = createAsyncThunk(
      "services/createService",
      async (serviceData, { rejectWithValue, dispatch }) => {
            try {
                  if (serviceData.features && typeof serviceData.features === 'string') {
                        serviceData.features = serviceData.features.split(',').map(f => f.trim()).filter(Boolean);
                  }
                  const response = await createService(serviceData);
                  dispatch(getAllServicesAdmin());
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const updateServiceData = createAsyncThunk(
      "services/updateService",
      async ({ id, serviceData }, { rejectWithValue, dispatch }) => {
            try {
                  if (serviceData.features && typeof serviceData.features === 'string') {
                        serviceData.features = serviceData.features.split(',').map(f => f.trim()).filter(Boolean);
                  }
                  const response = await updateServiceById(id, serviceData);
                  dispatch(getAllServicesAdmin());
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const deleteServiceData = createAsyncThunk(
      "services/deleteService",
      async (id, { rejectWithValue, dispatch }) => {
            try {
                  const response = await deleteServiceById(id);
                  dispatch(getAllServicesAdmin());
                  return { id, message: response.message };
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const getAllServicesAdmin = createAsyncThunk(
      "services/fetchAllServicesAdmin",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchAllServicesAdmin();
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

const servicesSlice = createSlice({
      name: "services",
      initialState,
      reducers: {
            clearError: (state) => {
                  state.error = null;
            },
            clearSuccess: (state) => {
                  state.success = false;
            },
      },
      extraReducers: (builder) => {
            // Fetch all services
            builder
                  .addCase(getAllServices.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getAllServices.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.servicesData = action.payload || [];
                        state.error = null;
                  })
                  .addCase(getAllServices.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });

            // Fetch service by ID
            builder
                  .addCase(getServiceById.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getServiceById.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.currentService = action.payload;
                        state.error = null;
                  })
                  .addCase(getServiceById.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });

            // Create service
            builder
                  .addCase(createServiceData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(createServiceData.fulfilled, (state) => {
                        state.isLoading = false;
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(createServiceData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            // Update service
            builder
                  .addCase(updateServiceData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(updateServiceData.fulfilled, (state) => {
                        state.isLoading = false;
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(updateServiceData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            // Delete service
            builder
                  .addCase(deleteServiceData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(deleteServiceData.fulfilled, (state) => {
                        state.isLoading = false;
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(deleteServiceData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            // Fetch all services admin
            builder
                  .addCase(getAllServicesAdmin.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getAllServicesAdmin.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.servicesData = action.payload || [];
                        state.error = null;
                  })
                  .addCase(getAllServicesAdmin.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });
      },
});

export const { clearError, clearSuccess } = servicesSlice.actions;
export default servicesSlice.reducer;