import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
      fetchPublicInitialData,
      fetchPublicHero,
      fetchPublicAbout,
      fetchPublicEducation,
      fetchPublicSkills,
      fetchPublicFeaturedProjects,
      fetchPublicServices,
      fetchPublicContact,
} from "@/config/api";

// How long successfully fetched section data stays fresh in Redux. Socket
// updates bypass this and refresh the affected section immediately.
export const PUBLIC_SECTION_TTL = 5 * 60 * 1000;

const SECTION_DEFAULTS = {
      hero: null,
      about: null,
      education: [],
      skills: [],
      projects: [],
      services: [],
      contact: null,
};

const SECTION_FETCHERS = {
      hero: fetchPublicHero,
      about: fetchPublicAbout,
      education: fetchPublicEducation,
      skills: fetchPublicSkills,
      projects: fetchPublicFeaturedProjects,
      services: fetchPublicServices,
      contact: fetchPublicContact,
};

export const PUBLIC_SECTIONS = Object.keys(SECTION_FETCHERS);

const createSectionState = (fallback) => ({
      data: fallback,
      status: "idle",
      error: null,
      fetchedAt: 0,
      lastUpdatedAt: 0,
});

const createInitialState = () =>
      Object.entries(SECTION_DEFAULTS).reduce((state, [section, fallback]) => {
            state[section] = createSectionState(fallback);
            return state;
      }, {});

const normalizeError = (error) => {
      if (!error) return { message: "Request failed" };
      if (typeof error === "string") return { message: error };
      return {
            message: error.message || error.data?.message || "Request failed",
            status: error.statusCode || error.status || error.response?.status || null,
      };
};

/**
 * Fetch one public section. `condition` deduplicates concurrent and
 * StrictMode double-invoked requests, and reuses fresh Redux data.
 */
export const fetchPublicSection = createAsyncThunk(
      "public/fetchSection",
      async ({ section, params, force = false } = {}, { rejectWithValue, signal }) => {
            const fetcher = SECTION_FETCHERS[section];
            const startedAt = Date.now();

            if (!fetcher) {
                  return rejectWithValue({
                        section,
                        startedAt,
                        error: { message: `Unknown public section: ${section}` },
                  });
            }

            try {
                  const data = await fetcher({
                        signal,
                        ...(params || {}),
                        ...(force ? { cache: false } : {}),
                  });
                  return { section, data, startedAt };
            } catch (error) {
                  if (signal.aborted) {
                        return rejectWithValue({ section, startedAt, aborted: true });
                  }
                  return rejectWithValue({ section, startedAt, error: normalizeError(error) });
            }
      },
      {
            condition: ({ section, force = false } = {}, { getState }) => {
                  if (!section || !SECTION_FETCHERS[section]) return false;

                  const current = getState().public?.[section];
                  if (!current) return false;
                  if (current.status === "loading") return false;
                  if (force) return true;

                  const isFresh = current.status === "succeeded"
                        && Date.now() - current.fetchedAt < PUBLIC_SECTION_TTL;

                  return !isFresh;
            },
      }
);

// Legacy aggregate loader. Kept only for backward compatibility; the
// homepage no longer dispatches it.
export const getPublicInitialData = createAsyncThunk(
      "public/fetchInitialData",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchPublicInitialData();
                  return response.data ?? response;
            } catch (error) {
                  return rejectWithValue(normalizeError(error));
            }
      }
);

const applySection = (state, section, data) => {
      if (!state[section]) return;
      state[section].data = data ?? SECTION_DEFAULTS[section];
      state[section].status = "succeeded";
      state[section].error = null;
      state[section].fetchedAt = Date.now();
      state[section].lastUpdatedAt = Date.now();
};

const publicSlice = createSlice({
      name: "public",
      initialState: createInitialState(),
      reducers: {
            clearError: (state, action) => {
                  const section = action.payload;
                  if (section && state[section]) {
                        state[section].error = null;
                        return;
                  }
                  PUBLIC_SECTIONS.forEach((key) => {
                        state[key].error = null;
                  });
            },
            // Real-time updates from Socket.IO / admin mutations.
            updatePublicData: (state, action) => {
                  const { type, data } = action.payload || {};
                  if (!type) return;

                  if (type === "projects") {
                        const featured = Array.isArray(data) ? data : data?.featured;
                        if (Array.isArray(featured)) {
                              applySection(state, "projects", featured);
                        }
                        return;
                  }

                  const section = type === "service" ? "services" : type;
                  if (!state[section]) return;
                  applySection(state, section, data);
            },
            invalidatePublicSection: (state, action) => {
                  const section = action.payload;
                  if (!section || !state[section]) return;
                  state[section].status = "idle";
                  state[section].error = null;
                  state[section].fetchedAt = 0;
            },
            resetPublicSections: (state) => {
                  PUBLIC_SECTIONS.forEach((section) => {
                        state[section] = createSectionState(SECTION_DEFAULTS[section]);
                  });
            },
      },
      extraReducers: (builder) => {
            builder
                  .addCase(fetchPublicSection.pending, (state, action) => {
                        const section = action.meta.arg.section;
                        if (!state[section]) return;
                        state[section].status = "loading";
                        state[section].error = null;
                  })
                  .addCase(fetchPublicSection.fulfilled, (state, action) => {
                        const { section, data, startedAt } = action.payload;
                        if (!state[section]) return;

                        // A Socket.IO update landed after this request started.
                        // Keep the newer data rather than overwriting it.
                        if (state[section].lastUpdatedAt > startedAt) {
                              state[section].status = "succeeded";
                              return;
                        }

                        state[section].data = data ?? SECTION_DEFAULTS[section];
                        state[section].status = "succeeded";
                        state[section].error = null;
                        state[section].fetchedAt = Date.now();
                  })
                  .addCase(fetchPublicSection.rejected, (state, action) => {
                        const { section, error, startedAt, aborted } = action.payload || {};
                        if (!section || !state[section]) return;

                        if (aborted) {
                              state[section].status = state[section].data
                                    ? "succeeded"
                                    : "idle";
                              return;
                        }

                        if (state[section].lastUpdatedAt > startedAt) {
                              state[section].status = "succeeded";
                              return;
                        }

                        state[section].status = "failed";
                        state[section].error = error?.message || "Unable to load this section";
                  })
                  .addCase(getPublicInitialData.fulfilled, (state, action) => {
                        const payload = action.payload?.data ?? action.payload ?? {};
                        applySection(state, "hero", payload.hero);
                        applySection(state, "about", payload.about);
                        applySection(state, "education", payload.education);
                        applySection(state, "skills", payload.skills);
                        applySection(state, "projects", payload.featuredProjects);
                        applySection(state, "services", payload.services);
                        applySection(state, "contact", payload.contact);
                  });
      },
});

export const {
      clearError,
      updatePublicData,
      invalidatePublicSection,
      resetPublicSections,
} = publicSlice.actions;

export const selectPublicSection = (state, section) => state.public[section];

export default publicSlice.reducer;
