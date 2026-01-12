import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
      createSkillCategory,
      fetchAllSkillCategories,
      addSkillToCategory,
      updateSkillInCategory,
      deleteSkillCategory,
      deleteSkillFromCategory,
} from '@/config/api';

export const createCategory = createAsyncThunk(
      'skills/createCategory',
      async (categoryData, { rejectWithValue }) => {
            try {
                  const response = await createSkillCategory(categoryData);
                  return response;
            } catch (error) {
                  return rejectWithValue(error?.response?.data || error?.data || { message: error.message || 'Failed to create category' });
            }
      }
);

export const getAllCategories = createAsyncThunk(
      'skills/getAllCategories',
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchAllSkillCategories();
                  return response;
            } catch (error) {
                  return rejectWithValue(error?.response?.data || error?.data || { message: error.message || 'Failed to fetch categories' });
            }
      }
);

export const addSkill = createAsyncThunk(
      'skills/addSkill',
      async ({ categoryId, skillData }, { rejectWithValue }) => {
            try {
                  const response = await addSkillToCategory(categoryId, skillData);
                  return response;
            } catch (error) {
                  return rejectWithValue(error?.response?.data || error?.data || { message: error.message || 'Failed to add skill' });
            }
      }
);

export const updateSkill = createAsyncThunk(
      'skills/updateSkill',
      async ({ categoryId, skillId, skillData }, { rejectWithValue }) => {
            try {
                  const response = await updateSkillInCategory(categoryId, skillId, skillData);
                  return response;
            } catch (error) {
                  return rejectWithValue(error?.response?.data || error?.data || { message: error.message || 'Failed to update skill' });
            }
      }
);

export const deleteCategory = createAsyncThunk(
      'skills/deleteCategory',
      async (categoryId, { rejectWithValue }) => {
            try {
                  const response = await deleteSkillCategory(categoryId);
                  return response;
            } catch (error) {
                  return rejectWithValue(error?.response?.data || error?.data || { message: error.message || 'Failed to delete category' });
            }
      }
);

export const deleteSkill = createAsyncThunk(
      'skills/deleteSkill',
      async ({ categoryId, skillId }, { rejectWithValue }) => {
            try {
                  const response = await deleteSkillFromCategory(categoryId, skillId);
                  return response;
            } catch (error) {
                  return rejectWithValue(error?.response?.data || error?.data || { message: error.message || 'Failed to delete skill' });
            }
      }
);

const skillsSlice = createSlice({
      name: 'skills',
      initialState: {
            categories: [],
            isLoading: false,
            error: null,
            success: false,
      },
      reducers: {
            clearError: (state) => {
                  state.error = null;
            },
            clearSuccess: (state) => {
                  state.success = false;
            },
      },
      extraReducers: (builder) => {
            builder
                  .addCase(createCategory.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(createCategory.fulfilled, (state) => {
                        state.isLoading = false;
                        state.success = true;
                  })
                  .addCase(createCategory.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  })
                  .addCase(getAllCategories.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(getAllCategories.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.categories = action.payload.data || [];
                  })
                  .addCase(getAllCategories.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  })
                  .addCase(addSkill.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(addSkill.fulfilled, (state) => {
                        state.isLoading = false;
                        state.success = true;
                  })
                  .addCase(addSkill.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  })
                  .addCase(updateSkill.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(updateSkill.fulfilled, (state) => {
                        state.isLoading = false;
                        state.success = true;
                  })
                  .addCase(updateSkill.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  })
                  .addCase(deleteCategory.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(deleteCategory.fulfilled, (state) => {
                        state.isLoading = false;
                        state.success = true;
                  })
                  .addCase(deleteCategory.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  })
                  .addCase(deleteSkill.pending, (state) => {
                        state.isLoading = true;
                        state.error = null;
                  })
                  .addCase(deleteSkill.fulfilled, (state) => {
                        state.isLoading = false;
                        state.success = true;
                  })
                  .addCase(deleteSkill.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  });
      },
});

export const { clearError, clearSuccess } = skillsSlice.actions;
export default skillsSlice.reducer;
