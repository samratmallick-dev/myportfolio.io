import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
      loginAdmin,
      logoutAdmin,
      checkAdminAuth,
      generateOTP,
      verifyOTPAndUpdateEmail,
      verifyOTPAndUpdatePassword
} from "@/config/api";

const getInitialUser = () => {
      try {
            const storedUser = localStorage.getItem('adminUser');
            if (!storedUser) return null;

            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && Object.keys(parsedUser).length === 0) {
                  localStorage.removeItem('adminUser');
                  return null;
            }
            return parsedUser;
      } catch (error) {
            localStorage.removeItem('adminUser');
            return null;
      }
};

const initialState = {
      isLoading: false,
      isAuthenticated: !!localStorage.getItem('adminToken'),
      user: getInitialUser(),
      error: null,
      token: localStorage.getItem('adminToken') || null
};

export const loginUser = createAsyncThunk(
      'auth/login',
      async (credentials, { rejectWithValue }) => {
            try {
                  const response = await loginAdmin(credentials);
                  if (response.success && response.data) {
                        localStorage.setItem('adminToken', response.data.token || 'default-token');
                        if (response.data.user && Object.keys(response.data.user).length > 0) {
                              localStorage.setItem('adminUser', JSON.stringify(response.data.user));
                        } else {
                              localStorage.removeItem('adminUser');
                        }
                  }
                  return response;
            } catch (error) {
                  return rejectWithValue(error.message || 'Login failed. Please try again.');
            }
      }
);

export const logoutUser = createAsyncThunk(
      'auth/logout',
      async (_, { rejectWithValue }) => {
            try {
                  const response = await logoutAdmin();
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminUser');
                  return response;
            } catch (error) {
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminUser');
                  return rejectWithValue(error.message || 'Logout failed.');
            }
      }
);

export const checkAuth = createAsyncThunk(
      'auth/checkAuth',
      async (_, { rejectWithValue }) => {
            try {
                  const token = localStorage.getItem('adminToken');
                  if (!token) throw new Error('No token found');
                  const response = await checkAdminAuth();
                  return response;
            } catch (error) {
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminUser');
                  return rejectWithValue(error.message || 'Authentication check failed.');
            }
      }
);

export const generateOTPThunk = createAsyncThunk(
      'auth/generateOTP',
      async ({ purpose, newEmail }, { rejectWithValue }) => {
            try {
                  const response = await generateOTP({ purpose, newEmail });
                  return response;
            } catch (error) {
                  const errorMessage = error?.message || error?.data?.message || 'Failed to generate OTP.';
                  return rejectWithValue(errorMessage);
            }
      }
);

export const verifyOTPAndUpdateEmailThunk = createAsyncThunk(
      'auth/verifyOTPAndUpdateEmail',
      async (data, { rejectWithValue, dispatch }) => {
            try {
                  const response = await verifyOTPAndUpdateEmail(data);
                  // After successful email update, clear authentication
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminUser');
                  // Call logout API to clear server-side session
                  try {
                        await logoutAdmin();
                  } catch (logoutError) {
                        // Continue even if logout API fails
                        console.error('Logout failed:', logoutError);
                  }
                  return { ...response, shouldLogout: true };
            } catch (error) {
                  return rejectWithValue(error.message || 'Failed to update email.');
            }
      }
);

export const verifyOTPAndUpdatePasswordThunk = createAsyncThunk(
      'auth/verifyOTPAndUpdatePassword',
      async (data, { rejectWithValue, dispatch }) => {
            try {
                  const response = await verifyOTPAndUpdatePassword(data);
                  // After successful password update, clear authentication
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminUser');
                  // Call logout API to clear server-side session
                  try {
                        await logoutAdmin();
                  } catch (logoutError) {
                        // Continue even if logout API fails
                        console.error('Logout failed:', logoutError);
                  }
                  return { ...response, shouldLogout: true };
            } catch (error) {
                  return rejectWithValue(error.message || 'Failed to update password.');
            }
      }
);

const authSlice = createSlice({
      name: "auth",
      initialState,
      reducers: {
            clearError: (state) => { state.error = null; },
            setUser: (state, action) => {
                  state.user = action.payload;
                  state.isAuthenticated = true;
            }
      },
      extraReducers: (builder) => {
            builder
                  .addCase(loginUser.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(loginUser.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.isAuthenticated = true;
                        state.user = action.payload.data?.user || null;
                        state.token = action.payload.data?.token || null;
                        state.error = null;
                  })
                  .addCase(loginUser.rejected, (state, action) => {
                        state.isLoading = false;
                        state.isAuthenticated = false;
                        state.user = null;
                        state.token = null;
                        state.error = action.payload || 'Login failed';
                  });

            builder
                  .addCase(logoutUser.pending, (state) => { state.isLoading = true; })
                  .addCase(logoutUser.fulfilled, (state) => {
                        state.isLoading = false;
                        state.isAuthenticated = false;
                        state.user = null;
                        state.token = null;
                        state.error = null;
                  })
                  .addCase(logoutUser.rejected, (state, action) => {
                        state.isLoading = false;
                        state.isAuthenticated = false;
                        state.user = null;
                        state.token = null;
                        state.error = action.payload || 'Logout failed';
                  });

            builder
                  .addCase(checkAuth.pending, (state) => { state.isLoading = true; })
                  .addCase(checkAuth.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.isAuthenticated = true;
                        state.user = action.payload.data || null;
                        if (action.payload.data) {
                              localStorage.setItem('adminUser', JSON.stringify(action.payload.data));
                        }
                        state.error = null;
                  })
                  .addCase(checkAuth.rejected, (state, action) => {
                        state.isLoading = false;
                        state.isAuthenticated = false;
                        state.user = null;
                        state.token = null;
                        state.error = action.payload || 'Authentication check failed';
                  });

            // --- OTP Cases: No global isLoading to prevent UI unmount ---
            builder
                  .addCase(generateOTPThunk.pending, (state) => {
                        state.error = null;
                  })
                  .addCase(generateOTPThunk.fulfilled, (state) => {
                        state.error = null;
                  })
                  .addCase(generateOTPThunk.rejected, (state, action) => {
                        state.error = action.payload || 'Failed to generate OTP';
                  });

            builder
                  .addCase(verifyOTPAndUpdateEmailThunk.pending, (state) => {
                        state.error = null;
                  })
                  .addCase(verifyOTPAndUpdateEmailThunk.fulfilled, (state, action) => {
                        if (action.payload.shouldLogout) {
                              // Clear authentication state after email update
                              state.isAuthenticated = false;
                              state.user = null;
                              state.token = null;
                        } else {
                              state.user = action.payload.data?.user || state.user;
                        }
                        state.error = null;
                  })
                  .addCase(verifyOTPAndUpdateEmailThunk.rejected, (state, action) => {
                        state.error = action.payload || 'Failed to update email';
                  });

            builder
                  .addCase(verifyOTPAndUpdatePasswordThunk.pending, (state) => {
                        state.error = null;
                  })
                  .addCase(verifyOTPAndUpdatePasswordThunk.fulfilled, (state, action) => {
                        if (action.payload.shouldLogout) {
                              // Clear authentication state after password update
                              state.isAuthenticated = false;
                              state.user = null;
                              state.token = null;
                        }
                        state.error = null;
                  })
                  .addCase(verifyOTPAndUpdatePasswordThunk.rejected, (state, action) => {
                        state.error = action.payload || 'Failed to update password';
                  });
      }
});

export const { clearError, setUser } = authSlice.actions;
export const authActions = authSlice.actions;
export default authSlice.reducer;