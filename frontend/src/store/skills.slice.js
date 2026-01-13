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
                  return await createSkillCategory(categoryData);
            } catch (error) {
                  return rejectWithValue(error?.response?.data || error);
            }
      }
);

export const getAllCategories = createAsyncThunk(
      'skills/getAllCategories',
      async (_, { rejectWithValue }) => {
            try {
                  return await fetchAllSkillCategories();
            } catch (error) {
                  return rejectWithValue(error?.response?.data || error);
            }
      }
);

export const addSkill = createAsyncThunk(
      'skills/addSkill',
      async ({ categoryId, skillData }, { rejectWithValue }) => {
            try {
                  return await addSkillToCategory(categoryId, skillData);
            } catch (error) {
                  return rejectWithValue(error?.response?.data || error);
            }
      }
);

export const updateSkill = createAsyncThunk(
      'skills/updateSkill',
      async ({ categoryId, skillId, skillData }, { rejectWithValue }) => {
            try {
                  return await updateSkillInCategory(categoryId, skillId, skillData);
            } catch (error) {
                  return rejectWithValue(error?.response?.data || error);
            }
      }
);

export const deleteCategory = createAsyncThunk(
      'skills/deleteCategory',
      async (categoryId, { rejectWithValue }) => {
            try {
                  await deleteSkillCategory(categoryId);
                  return categoryId;
            } catch (error) {
                  return rejectWithValue(error?.response?.data || error);
            }
      }
);

export const deleteSkill = createAsyncThunk(
      'skills/deleteSkill',
      async ({ categoryId, skillId }, { rejectWithValue }) => {
            try {
                  await deleteSkillFromCategory(categoryId, skillId);
                  return { categoryId, skillId };
            } catch (error) {
                  return rejectWithValue(error?.response?.data || error);
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

                  .addCase(getAllCategories.pending, (state) => {
                        state.isLoading = true;
                  })
                  .addCase(getAllCategories.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.categories = action.payload?.data || [];
                  })
                  .addCase(getAllCategories.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  })

                  .addCase(createCategory.pending, (state) => {
                        state.isLoading = true;
                  })
                  .addCase(createCategory.fulfilled, (state) => {
                        state.isLoading = false;
                        state.success = true;
                  })
                  .addCase(createCategory.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  })

                  .addCase(addSkill.pending, (state) => {
                        state.isLoading = true;
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
                  })
                  .addCase(deleteCategory.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.categories = state.categories.filter(
                              (cat) => cat._id !== action.payload
                        );
                        state.success = true;
                  })
                  .addCase(deleteCategory.rejected, (state, action) => {
                        state.isLoading = false;
                        state.error = action.payload;
                  })

                  .addCase(deleteSkill.pending, (state) => {
                        state.isLoading = true;
                  })
                  .addCase(deleteSkill.fulfilled, (state, action) => {
                        const { categoryId, skillId } = action.payload;
                        state.isLoading = false;
                        state.categories = state.categories.map((category) =>
                              category._id === categoryId
                                    ? {
                                          ...category,
                                          skills: category.skills.filter(
                                                (skill) => skill._id !== skillId
                                          ),
                                    }
                                    : category
                        );
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
