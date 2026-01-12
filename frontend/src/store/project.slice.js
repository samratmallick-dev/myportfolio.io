import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
      fetchAllProjects,
      fetchProjectById,
      createProject,
      updateProjectById,
      deleteProjectById,
      fetchAllProjectsAdmin,
      fetchFeaturedProjects,
      setFeaturedProject,
} from "@/config/api";

const initialState = {
      projectsData: [],
      featuredProjects: [],
      currentProject: null,
      isLoading: false,
      error: null,
      success: false,
};

// Async thunks
export const getAllProjects = createAsyncThunk(
      "project/fetchAllProjects",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchAllProjects();
                  return response.data;
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
                  dispatch(getFeaturedProjects());
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
                  return response.data;
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
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.response?.data || error.message);
            }
      }
);

export const updateFeaturedProjects = createAsyncThunk(
      "project/updateFeaturedProjects",
      async (projectIds, { rejectWithValue, dispatch, getState }) => {
            try {
                  const state = getState();
                  const currentFeatured = state.project.featuredProjects.map(p => p._id);
                  const allProjects = state.project.projectsData;

                  for (const project of allProjects) {
                        const shouldBeFeatured = projectIds.includes(project._id);
                        const isFeatured = currentFeatured.includes(project._id);

                        if (shouldBeFeatured !== isFeatured) {
                              await setFeaturedProject(project._id, shouldBeFeatured);
                        }
                  }

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
      },
      extraReducers: (builder) => {
            // Fetch all projects
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

            // Fetch project by ID
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

            // Create project
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

            // Update project
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

            // Delete project
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

            // Fetch all projects admin
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

            // Fetch featured projects
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

            // Update featured projects
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
      },
});

export const { clearError, clearSuccess, resetProjectState } = projectSlice.actions;
export default projectSlice.reducer;
