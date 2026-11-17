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
import { normalizeSection, isVersionNewer } from "@/utils/sectionCache";

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
      version: 0,
      versionAt: 0,
      isRefreshing: false,
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

const applySection = (state, section, data, version) => {
      if (!state[section]) return;
      state[section].data = data ?? SECTION_DEFAULTS[section];
      state[section].status = "succeeded";
      state[section].error = null;
      state[section].fetchedAt = Date.now();
      state[section].lastUpdatedAt = Date.now();
      if (Number.isFinite(version) && version > state[section].version) {
            state[section].version = version;
            state[section].versionAt = Date.now();
      }
};

const hasLoadedData = (sectionState) =>
      sectionState && sectionState.status === "succeeded";

const markStale = (sectionState, version) => {
      if (Number.isFinite(version) && version > sectionState.version) {
            sectionState.version = version;
            sectionState.versionAt = Date.now();
      }
      sectionState.fetchedAt = 0;
      sectionState.error = null;
      if (sectionState.status === "failed") {
            sectionState.status = "idle";
      }
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
            updatePublicData: (state, action) => {
                  const { type, data, version } = action.payload || {};
                  const section = normalizeSection(type);
                  if (!section || !state[section]) return;

                  const current = state[section];
                  const incoming = Number.isFinite(version) ? version : Date.now();

                  if (!isVersionNewer(incoming, current.version) && hasLoadedData(current) && !current.error) {
                        return;
                  }

                  if (section === "projects") {
                        const featured = Array.isArray(data) ? data : data?.featured;
                        if (Array.isArray(featured)) {
                              applySection(state, "projects", featured, incoming);
                        } else if (data === undefined) {
                              markStale(current, incoming);
                        }
                        return;
                  }

                  if (data === undefined) {
                        markStale(current, incoming);
                        return;
                  }

                  applySection(state, section, data, incoming);
            },
            externalSectionUpdated: (state, action) => {
                  const { section, version } = action.payload || {};
                  if (!section || !state[section]) return;

                  const current = state[section];
                  if (!isVersionNewer(version, current.version)) return;

                  markStale(current, version);
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
                        const current = state[section];
                        current.error = null;
                        if (hasLoadedData(current)) {
                              current.isRefreshing = true;
                        } else {
                              current.status = "loading";
                        }
                  })
                  .addCase(fetchPublicSection.fulfilled, (state, action) => {
                        const { section, data, startedAt } = action.payload;
                        if (!state[section]) return;
                        const current = state[section];
                        current.isRefreshing = false;

                        if (current.lastUpdatedAt > startedAt || current.versionAt > startedAt) {
                              if (!hasLoadedData(current)) {
                                    current.status = "idle";
                                    current.fetchedAt = 0;
                              }
                              return;
                        }

                        current.data = data ?? SECTION_DEFAULTS[section];
                        current.status = "succeeded";
                        current.error = null;
                        current.fetchedAt = Date.now();
                  })
                  .addCase(fetchPublicSection.rejected, (state, action) => {
                        const { section, error, startedAt, aborted } = action.payload || {};
                        if (!section || !state[section]) return;
                        const current = state[section];
                        current.isRefreshing = false;

                        if (aborted) {
                              current.status = hasLoadedData(current) ? "succeeded" : "idle";
                              return;
                        }

                        if (current.lastUpdatedAt > startedAt || current.versionAt > startedAt) {
                              if (!hasLoadedData(current)) {
                                    current.status = "idle";
                                    current.fetchedAt = 0;
                              }
                              return;
                        }

                        const message = error?.message || "Unable to load this section";

                        if (hasLoadedData(current)) {
                              current.status = "succeeded";
                              current.error = message;
                              current.fetchedAt = Date.now();
                              return;
                        }

                        current.status = "failed";
                        current.error = message;
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
      externalSectionUpdated,
      invalidatePublicSection,
      resetPublicSections,
} = publicSlice.actions;

export const selectPublicSection = (state, section) => state.public[section];

export default publicSlice.reducer;
