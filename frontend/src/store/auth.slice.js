import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
      loginAdmin,
      logoutAdmin,
      logoutAllAdminSessions,
      checkAdminAuth,
      refreshAdminSession,
      fetchAdminSessions,
      revokeAdminSession,
      changeAdminPassword,
      createAdminAccount,
      generateOTP,
      verifyOTPAndUpdateEmail,
      verifyOTPAndUpdatePassword
} from "@/config/api";

const initialState = {
      admin: null,
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: true,
      isLoading: false,
      error: null,
};

const extractMessage = (payload, fallback) => {
      if (!payload) return fallback;
      if (typeof payload === "string") return payload;
      return payload.message || payload.error || fallback;
};

const applySession = (state, { admin = null, accessToken = null } = {}) => {
      state.admin = admin;
      state.user = admin;
      state.accessToken = accessToken || null;
      state.isAuthenticated = Boolean(admin && accessToken);
      state.isInitializing = false;
      state.error = null;
};

const clearSession = (state, error = null) => {
      state.admin = null;
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
      state.error = error;
};

// --- Thunks ---------------------------------------------------------------

export const loginUser = createAsyncThunk(
      'auth/login',
      async (credentials, { rejectWithValue }) => {
            try {
                  const response = await loginAdmin(credentials);
                  if (!response?.success || !response?.data) {
                        return rejectWithValue(extractMessage(response, 'Login failed. Please try again.'));
                  }
                  return response.data;
            } catch (error) {
                  return rejectWithValue(extractMessage(error, 'Login failed. Please try again.'));
            }
      }
);

export const refreshSession = createAsyncThunk(
      'auth/refresh',
      async (_, { rejectWithValue }) => {
            try {
                  const response = await refreshAdminSession();
                  if (!response?.success || !response?.data) {
                        return rejectWithValue(extractMessage(response, 'Session refresh failed.'));
                  }
                  return response.data;
            } catch (error) {
                  return rejectWithValue(extractMessage(error, 'Session refresh failed.'));
            }
      }
);

export const fetchCurrentAdmin = createAsyncThunk(
      'auth/fetchCurrentAdmin',
      async (_, { rejectWithValue }) => {
            try {
                  const response = await checkAdminAuth();
                  if (!response?.success || !response?.data) {
                        return rejectWithValue(extractMessage(response, 'Unable to load the admin profile.'));
                  }
                  return response.data;
            } catch (error) {
                  return rejectWithValue(extractMessage(error, 'Unable to load the admin profile.'));
            }
      }
);

export const initializeAuth = createAsyncThunk(
      'auth/initialize',
      async (_, { dispatch, rejectWithValue }) => {
            let refreshed;
            try {
                  refreshed = await dispatch(refreshSession()).unwrap();
            } catch {
                  return rejectWithValue(null);
            }

            if (!refreshed?.accessToken) {
                  return rejectWithValue(null);
            }

            try {
                  const profile = await dispatch(fetchCurrentAdmin()).unwrap();
                  if (profile?.admin) {
                        return { admin: profile.admin, accessToken: refreshed.accessToken };
                  }
            } catch {
                  // Profile reload is optional; the refresh already proved the
                  // session is valid, so a failure here must not block boot.
            }

            return { admin: refreshed.admin || null, accessToken: refreshed.accessToken };
      }
);

let initializationPromise = null;

export const ensureAuthInitialized = (dispatch) => {
      if (!initializationPromise) {
            initializationPromise = Promise.resolve(dispatch(initializeAuth()));
      }
      return initializationPromise;
};

export const resetAuthInitialization = () => {
      initializationPromise = null;
};

export const logoutUser = createAsyncThunk(
      'auth/logout',
      async (_, { rejectWithValue }) => {
            try {
                  await logoutAdmin();
                  return true;
            } catch (error) {
                  return rejectWithValue(extractMessage(error, null));
            }
      }
);

export const logoutAllSessions = createAsyncThunk(
      'auth/logoutAll',
      async (_, { rejectWithValue }) => {
            try {
                  await logoutAllAdminSessions();
                  return true;
            } catch (error) {
                  return rejectWithValue(extractMessage(error, 'Unable to log out of all sessions.'));
            }
      }
);

export const loadAdminSessions = createAsyncThunk(
      'auth/loadSessions',
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchAdminSessions();
                  return response?.data?.sessions || [];
            } catch (error) {
                  return rejectWithValue(extractMessage(error, 'Unable to load sessions.'));
            }
      }
);

export const revokeAdminSessionThunk = createAsyncThunk(
      'auth/revokeSession',
      async (sessionId, { rejectWithValue }) => {
            try {
                  await revokeAdminSession(sessionId);
                  return sessionId;
            } catch (error) {
                  return rejectWithValue(extractMessage(error, 'Unable to revoke the session.'));
            }
      }
);

export const changeAdminPasswordThunk = createAsyncThunk(
      'auth/changePassword',
      async (payload, { rejectWithValue }) => {
            try {
                  const response = await changeAdminPassword(payload);
                  return response;
            } catch (error) {
                  return rejectWithValue(extractMessage(error, 'Unable to change the password.'));
            }
      }
);

export const createAdminThunk = createAsyncThunk(
      'auth/createAdmin',
      async (payload, { rejectWithValue }) => {
            try {
                  const response = await createAdminAccount(payload);
                  return response;
            } catch (error) {
                  return rejectWithValue(extractMessage(error, 'Unable to create the administrator.'));
            }
      }
);

export const generateOTPThunk = createAsyncThunk(
      "auth/generateOTP",
      async ({ purpose, newEmail }, { rejectWithValue }) => {
            try {
                  return await generateOTP({ purpose, newEmail });
            } catch (err) {
                  return rejectWithValue(extractMessage(err, "OTP failed"));
            }
      }
);


export const verifyOTPAndUpdateEmailThunk = createAsyncThunk(
      'auth/verifyOTPAndUpdateEmail',
      async (data, { rejectWithValue }) => {
            try {
                  const response = await verifyOTPAndUpdateEmail(data);
                  try {
                        await logoutAdmin();
                  } catch (logoutError) {
                        console.error('Logout failed:', logoutError);
                  }
                  return { ...response, shouldLogout: true };
            } catch (error) {
                  return rejectWithValue(extractMessage(error, 'Failed to update email.'));
            }
      }
);

export const verifyOTPAndUpdatePasswordThunk = createAsyncThunk(
      'auth/verifyOTPAndUpdatePassword',
      async (data, { rejectWithValue }) => {
            try {
                  const response = await verifyOTPAndUpdatePassword(data);
                  return { ...response, shouldLogout: true };
            } catch (error) {
                  return rejectWithValue(extractMessage(error, 'Failed to update password.'));
            }
      }
);

const authSlice = createSlice({
      name: "auth",
      initialState,
      reducers: {
            clearError: (state) => { state.error = null; },
            clearAuthState: (state) => { clearSession(state, null); },
            setUser: (state, action) => {
                  state.admin = action.payload;
                  state.user = action.payload;
                  state.isAuthenticated = Boolean(action.payload);
                  state.isInitializing = false;
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
                        applySession(state, action.payload);
                  })
                  .addCase(loginUser.rejected, (state, action) => {
                        state.isLoading = false;
                        state.isAuthenticated = false;
                        state.admin = null;
                        state.user = null;
                        state.accessToken = null;
                        state.isInitializing = false;
                        state.error = extractMessage(action.payload, 'Login failed');
                  });

            builder
                  .addCase(refreshSession.pending, (state) => {
                        state.error = null;
                  })
                  .addCase(refreshSession.fulfilled, (state, action) => {
                        applySession(state, action.payload);
                  })
                  .addCase(refreshSession.rejected, (state) => {
                        state.admin = null;
                        state.user = null;
                        state.accessToken = null;
                        state.isAuthenticated = false;
                        state.isInitializing = false;
                  });

            builder
                  .addCase(fetchCurrentAdmin.pending, (state) => {
                        state.error = null;
                  })
                  .addCase(fetchCurrentAdmin.fulfilled, (state, action) => {
                        const admin = action.payload?.admin || null;
                        state.admin = admin;
                        state.user = admin;
                        state.isAuthenticated = Boolean(admin && state.accessToken);
                        state.isInitializing = false;
                        state.error = null;
                  })
                  .addCase(fetchCurrentAdmin.rejected, (state, action) => {
                        state.admin = null;
                        state.user = null;
                        state.isAuthenticated = false;
                        state.isInitializing = false;
                        state.error = extractMessage(action.payload, null);
                  });

            builder
                  .addCase(initializeAuth.pending, (state) => {
                        state.isInitializing = true;
                  })
                  .addCase(initializeAuth.fulfilled, (state, action) => {
                        applySession(state, action.payload);
                  })
                  .addCase(initializeAuth.rejected, (state) => {
                        state.admin = null;
                        state.user = null;
                        state.accessToken = null;
                        state.isAuthenticated = false;
                        state.isInitializing = false;
                        state.error = null;
                  });

            builder
                  .addCase(logoutUser.pending, (state) => { state.isLoading = true; })
                  .addCase(logoutUser.fulfilled, (state) => {
                        clearSession(state, null);
                        state.isLoading = false;
                  })
                  .addCase(logoutUser.rejected, (state) => {
                        clearSession(state, null);
                        state.isLoading = false;
                  });

            builder
                  .addCase(logoutAllSessions.pending, (state) => { state.isLoading = true; })
                  .addCase(logoutAllSessions.fulfilled, (state) => {
                        clearSession(state, null);
                        state.isLoading = false;
                  })
                  .addCase(logoutAllSessions.rejected, (state, action) => {
                        clearSession(state, null);
                        state.isLoading = false;
                        state.error = extractMessage(action.payload, null);
                  });

            builder
                  .addCase(revokeAdminSessionThunk.rejected, (state, action) => {
                        state.error = extractMessage(action.payload, null);
                  });

            builder
                  .addCase(changeAdminPasswordThunk.pending, (state) => { state.error = null; })
                  .addCase(changeAdminPasswordThunk.fulfilled, (state) => {
                        clearSession(state, null);
                  })
                  .addCase(changeAdminPasswordThunk.rejected, (state, action) => {
                        state.error = extractMessage(action.payload, null);
                  });

            builder
                  .addCase(createAdminThunk.pending, (state) => { state.error = null; })
                  .addCase(createAdminThunk.fulfilled, (state) => { state.error = null; })
                  .addCase(createAdminThunk.rejected, (state, action) => {
                        state.error = extractMessage(action.payload, null);
                  });

            builder
                  .addCase(generateOTPThunk.pending, (state) => {
                        state.error = null;
                  })
                  .addCase(generateOTPThunk.fulfilled, (state) => {
                        state.error = null;
                  })
                  .addCase(generateOTPThunk.rejected, (state, action) => {
                        state.error = extractMessage(action.payload, 'Failed to generate OTP');
                  });

            builder
                  .addCase(verifyOTPAndUpdateEmailThunk.pending, (state) => {
                        state.error = null;
                  })
                  .addCase(verifyOTPAndUpdateEmailThunk.fulfilled, (state) => {
                        clearSession(state, null);
                  })
                  .addCase(verifyOTPAndUpdateEmailThunk.rejected, (state, action) => {
                        state.error = extractMessage(action.payload, 'Failed to update email');
                  });

            builder
                  .addCase(verifyOTPAndUpdatePasswordThunk.pending, (state) => {
                        state.error = null;
                  })
                  .addCase(verifyOTPAndUpdatePasswordThunk.fulfilled, (state) => {
                        clearSession(state, null);
                  })
                  .addCase(verifyOTPAndUpdatePasswordThunk.rejected, (state, action) => {
                        state.error = extractMessage(action.payload, 'Failed to update password');
                  });
      }
});

export const { clearError, clearAuthState, setUser } = authSlice.actions;
export const authActions = authSlice.actions;
export default authSlice.reducer;