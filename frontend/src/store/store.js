import { configureStore } from '@reduxjs/toolkit';
import authSlice from './auth.slice.js';
import heroSlice from './hero.slice.js';
import aboutSlice from './about.slice.js';
import educationSlice from './education.slice.js';
import skillsSlice from './skills.slice.js';
import contactSlice from './contact.slice.js';
import projectSlice from './project.slice.js';
import serviceSlice from './services.slice.js';

export const store = configureStore({
      reducer: {
            auth: authSlice.reducer,
            hero: heroSlice.reducer,
            about: aboutSlice.reducer,
            education: educationSlice.reducer,
            skills: skillsSlice.reducer,
            project: projectSlice.reducer,
            services: serviceSlice.reducer,
            contact: contactSlice.reducer,
      },
});
