import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
      fetchAllProjects,
      fetchProjectById,
      fetchProjectBySlug,
      createProject,
      updateProjectById,
      deleteProjectById,
      fetchAllProjectsAdmin,
      fetchFeaturedProjects,
      fetchPublicProjects,
      setFeaturedProject,
} from "@/config/api";

const PUBLIC_PROJECTS_TTL = 60 * 1000;

const emptyPublicPagination = (page = 1, limit = 9) => ({
      page,
      limit,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
});

const initialState = {
      projectsData: [],
      featuredProjects: [],
      currentProject: null,
      isLoading: false,
      error: null,
      success: false,
      publicProjects: {
            items: [],
            pagination: emptyPublicPagination(),
            status: 'idle',
            error: null,
            fetchedAt: 0,
      },
};

export const getAllProjects = createAsyncThunk(
      "project/fetchAllProjects",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchAllProjects();
                  return response.data ?? response;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const getProjectById = createAsyncThunk(
      "project/fetchProjectById",
      async (id, { rejectWithValue }) => {
            try {
                  const response = await fetchProjectById(id);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const getProjectBySlugThunk = createAsyncThunk(
      "project/fetchProjectBySlug",
      async (slug, { rejectWithValue }) => {
            try {
                  const response = await fetchProjectBySlug(slug);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const createProjectData = createAsyncThunk(
      "project/createProject",
      async (projectData, { rejectWithValue, dispatch }) => {
            try {
                  const response = await createProject(projectData);
                  dispatch(getAllProjectsAdmin());
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const updateProjectData = createAsyncThunk(
      "project/updateProject",
      async ({ id, projectData }, { rejectWithValue, dispatch }) => {
            try {
                  const response = await updateProjectById(id, projectData);
                  dispatch(getAllProjectsAdmin());
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const deleteProjectData = createAsyncThunk(
      "project/deleteProject",
      async (id, { rejectWithValue, dispatch }) => {
            try {
                  const response = await deleteProjectById(id);
                  dispatch(getAllProjectsAdmin());
                  return { id, message: response.message };
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const getAllProjectsAdmin = createAsyncThunk(
      "project/fetchAllProjectsAdmin",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchAllProjectsAdmin();
                  return response.data ?? response;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const getFeaturedProjects = createAsyncThunk(
      "project/fetchFeaturedProjects",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchFeaturedProjects();
                  return response.data ?? response;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

/**
 * Paginated, card-only public project list. Kept separate from the admin
 * `projectsData` state so lazy public loading never disturbs admin CRUD.
 */
export const getPublicProjectsPage = createAsyncThunk(
      "project/fetchPublicProjectsPage",
      async ({ page = 1, limit = 9, force = false } = {}, { rejectWithValue, signal }) => {
            try {
                  const data = await fetchPublicProjects({ page, limit, signal, cache: !force });
                  return { page, limit, ...data };
            } catch (error) {
                  if (signal.aborted) return rejectWithValue({ aborted: true });
                  return rejectWithValue(error?.message || 'Failed to load projects');
            }
      },
      {
            condition: ({ page = 1, limit = 9, force = false } = {}, { getState }) => {
                  const current = getState().project?.publicProjects;
                  if (!current) return false;

                  if (!force && current.status === 'loading' && current.pagination.page === page && current.pagination.limit === limit) {
                        return false;
                  }

                  if (force) return true;

                  const isFresh = current.status === 'succeeded'
                        && current.pagination.page === page
                        && current.pagination.limit === limit
                        && Date.now() - current.fetchedAt < PUBLIC_PROJECTS_TTL;

                  return !isFresh;
            },
      }
);

export const updateFeaturedProjects = createAsyncThunk(
      "project/updateFeaturedProjects",
      async (projectIds, { rejectWithValue, dispatch, getState }) => {
            try {
                  const state = getState();
                  const currentFeatured = state.project.featuredProjects.map(p => p._id);
                  const allProjects = state.project.projectsData;

                  const promises = [];
                  for (const project of allProjects) {
                        const shouldBeFeatured = projectIds.includes(project._id);
                        const isFeatured = currentFeatured.includes(project._id);

                        if (shouldBeFeatured !== isFeatured) {
                              promises.push(setFeaturedProject(project._id, shouldBeFeatured));
                        }
                  }
                  await Promise.all(promises);

                  dispatch(getFeaturedProjects());
                  return projectIds;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

const projectSlice = createSlice({
      name: "project",
      initialState,
      reducers: {
            clearError: (state) => {
                  state.error = null;
            },
            clearSuccess: (state) => {
                  state.success = false;
            },
            resetProjectState: (state) => {
                  state.projectsData = [];
                  state.featuredProjects = [];
                  state.currentProject = null;
                  state.isLoading = false;
                  state.error = null;
                  state.success = false;
            },
            setProjects: (state, action) => {
                  state.projectsData = action.payload;
            },
      },
      extraReducers: (builder) => {
            builder
                  .addCase(getAllProjects.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getAllProjects.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.projectsData = action.payload || [];
                        state.error = null;
                  })
                  .addCase(getAllProjects.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });

            builder
                  .addCase(getProjectById.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getProjectById.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.currentProject = action.payload;
                        state.error = null;
                  })
                  .addCase(getProjectById.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });

            builder
                  .addCase(getProjectBySlugThunk.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getProjectBySlugThunk.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.currentProject = action.payload;
                        state.error = null;
                  })
                  .addCase(getProjectBySlugThunk.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });

            builder
                  .addCase(createProjectData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(createProjectData.fulfilled, (state) => {
                        state.isLoading = false;
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(createProjectData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            builder
                  .addCase(updateProjectData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(updateProjectData.fulfilled, (state) => {
                        state.isLoading = false;
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(updateProjectData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            builder
                  .addCase(deleteProjectData.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(deleteProjectData.fulfilled, (state) => {
                        state.isLoading = false;
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(deleteProjectData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            builder
                  .addCase(getAllProjectsAdmin.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getAllProjectsAdmin.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.projectsData = action.payload || [];
                        state.error = null;
                  })
                  .addCase(getAllProjectsAdmin.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });

            builder
                  .addCase(getFeaturedProjects.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getFeaturedProjects.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.featuredProjects = action.payload || [];
                        state.error = null;
                  })
                  .addCase(getFeaturedProjects.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });

            builder
                  .addCase(updateFeaturedProjects.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                        state.success = false;
                  })
                  .addCase(updateFeaturedProjects.fulfilled, (state) => {
                        state.isLoading = false;
                        state.success = true;
                        state.error = null;
                  })
                  .addCase(updateFeaturedProjects.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                        state.success = false;
                  });

            builder
                  .addCase(getPublicProjectsPage.pending, (state, action) => {
                        const { page = 1, limit = 9 } = action.meta.arg || {};
                        state.publicProjects.status = 'loading';
                        state.publicProjects.error = null;
                        state.publicProjects.pagination = {
                              ...state.publicProjects.pagination,
                              page,
                              limit,
                        };
                  })
                  .addCase(getPublicProjectsPage.fulfilled, (state, action) => {
                        const { page, limit, items, pagination } = action.payload;
                        state.publicProjects.status = 'succeeded';
                        state.publicProjects.error = null;
                        state.publicProjects.items = items;
                        state.publicProjects.pagination = pagination || emptyPublicPagination(page, limit);
                        state.publicProjects.fetchedAt = Date.now();
                  })
                  .addCase(getPublicProjectsPage.rejected, (state, action) => {
                        if (action.payload?.aborted) {
                              state.publicProjects.status = state.publicProjects.items.length ? 'succeeded' : 'idle';
                              return;
                        }
                        state.publicProjects.status = 'failed';
                        state.publicProjects.error = action.payload || 'Failed to load projects';
                  });
      },
});

export const { clearError, clearSuccess, resetProjectState, setProjects } = projectSlice.actions;
export default projectSlice.reducer;