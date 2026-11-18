import { configureStore } from '@reduxjs/toolkit';
import authSlice, { clearAuthState, refreshSession } from './auth.slice.js';
import { configureAuthApi } from '@/config/api';
import heroSlice from './hero.slice.js';
import aboutSlice from './about.slice.js';
import educationSlice from './education.slice.js';
import skillsSlice from './skills.slice.js';
import contactSlice from './contact.slice.js';
import projectSlice from './project.slice.js';
import serviceSlice from './services.slice.js';
import publicSlice from './public.slice.js';

export const store = configureStore({
      reducer: {
            auth: authSlice,
            hero: heroSlice,
            about: aboutSlice,
            education: educationSlice,
            skills: skillsSlice,
            project: projectSlice,
            services: serviceSlice,
            contact: contactSlice,
            public: publicSlice,
      },
});

// Give the Axios client a way to read the in-memory access token and to
// perform a single-flight session refresh, without creating a circular import.
configureAuthApi({
      getAccessToken: () => store.getState().auth?.accessToken || null,
      refreshSession: () =>
            store.dispatch(refreshSession()).then((action) => {
                  if (refreshSession.fulfilled.match(action)) {
                        return action.payload;
                  }
                  return Promise.reject(
                        typeof action.payload === 'string'
                              ? new Error(action.payload)
                              : new Error('Session refresh failed')
                  );
            }),
      onAuthFailure: () => {
            store.dispatch(clearAuthState());
      },
});
