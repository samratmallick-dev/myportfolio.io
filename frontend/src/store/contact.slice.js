import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
      fetchContactDetails,
      addOrUpdateContactDetails,
      updateContactDetails,
      sendContactMessage,
      fetchAllMessagesAdmin,
      fetchMessageById,
      deleteMessage,
      markMessageAsRead,
      fetchUnreadCount
} from "../config/api.js";

// Async thunks
export const getContactDetails = createAsyncThunk(
      "contact/getContactDetails",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchContactDetails();
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.message || "Failed to fetch contact details");
            }
      }
);

export const addUpdateContactDetails = createAsyncThunk(
      "contact/addUpdateContactDetails",
      async (formData, { rejectWithValue }) => {
            try {
                  const response = await addOrUpdateContactDetails(formData);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.message || "Failed to update contact details");
            }
      }
);

export const updateContactDetailsById = createAsyncThunk(
      "contact/updateContactDetailsById",
      async ({ id, formData }, { rejectWithValue }) => {
            try {
                  const response = await updateContactDetails(id, formData);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.message || "Failed to update contact details");
            }
      }
);

export const sendMessage = createAsyncThunk(
      "contact/sendMessage",
      async (messageData, { rejectWithValue }) => {
            try {
                  const response = await sendContactMessage(messageData);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.message || "Failed to send message");
            }
      }
);

export const getAllMessages = createAsyncThunk(
      "contact/getAllMessages",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchAllMessagesAdmin();
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.message || "Failed to fetch messages");
            }
      }
);

export const getMessageById = createAsyncThunk(
      "contact/getMessageById",
      async (messageId, { rejectWithValue }) => {
            try {
                  const response = await fetchMessageById(messageId);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.message || "Failed to fetch message");
            }
      }
);

export const deleteMessageById = createAsyncThunk(
      "contact/deleteMessageById",
      async (messageId, { rejectWithValue }) => {
            try {
                  await deleteMessage(messageId);
                  return messageId;
            } catch (error) {
                  return rejectWithValue(error.message || "Failed to delete message");
            }
      }
);

export const markAsRead = createAsyncThunk(
      "contact/markAsRead",
      async (messageId, { rejectWithValue }) => {
            try {
                  const response = await markMessageAsRead(messageId);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.message || "Failed to mark as read");
            }
      }
);

export const getUnreadCount = createAsyncThunk(
      "contact/getUnreadCount",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchUnreadCount();
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.message || "Failed to fetch unread count");
            }
      }
);

const contactSlice = createSlice({
      name: "contact",
      initialState: {
            contactDetails: null,
            messages: [],
            currentMessage: null,
            unreadCount: 0,
            loading: false,
            error: null,
      },
      reducers: {
            clearError: (state) => {
                  state.error = null;
            },
      },
      extraReducers: (builder) => {
            builder
                  // Get contact details
                  .addCase(getContactDetails.pending, (state) => {
                        state.loading = true;
                        state.error = null;
                  })
                  .addCase(getContactDetails.fulfilled, (state, action) => {
                        state.loading = false;
                        state.contactDetails = action.payload;
                  })
                  .addCase(getContactDetails.rejected, (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                  })
                  // Add/Update contact details
                  .addCase(addUpdateContactDetails.pending, (state) => {
                        state.loading = true;
                        state.error = null;
                  })
                  .addCase(addUpdateContactDetails.fulfilled, (state, action) => {
                        state.loading = false;
                        state.contactDetails = action.payload;
                  })
                  .addCase(addUpdateContactDetails.rejected, (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                  })
                  // Update contact details by ID
                  .addCase(updateContactDetailsById.pending, (state) => {
                        state.loading = true;
                        state.error = null;
                  })
                  .addCase(updateContactDetailsById.fulfilled, (state, action) => {
                        state.loading = false;
                        state.contactDetails = action.payload;
                  })
                  .addCase(updateContactDetailsById.rejected, (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                  })
                  // Send message
                  .addCase(sendMessage.pending, (state) => {
                        state.loading = true;
                        state.error = null;
                  })
                  .addCase(sendMessage.fulfilled, (state) => {
                        state.loading = false;
                  })
                  .addCase(sendMessage.rejected, (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                  })
                  // Get all messages
                  .addCase(getAllMessages.pending, (state) => {
                        state.loading = true;
                        state.error = null;
                  })
                  .addCase(getAllMessages.fulfilled, (state, action) => {
                        state.loading = false;
                        state.messages = action.payload;
                  })
                  .addCase(getAllMessages.rejected, (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                  })
                  // Get message by ID
                  .addCase(getMessageById.pending, (state) => {
                        state.loading = true;
                        state.error = null;
                  })
                  .addCase(getMessageById.fulfilled, (state, action) => {
                        state.loading = false;
                        state.currentMessage = action.payload;
                  })
                  .addCase(getMessageById.rejected, (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                  })
                  // Delete message
                  .addCase(deleteMessageById.pending, (state) => {
                        state.loading = true;
                        state.error = null;
                  })
                  .addCase(deleteMessageById.fulfilled, (state, action) => {
                        state.loading = false;
                        state.messages = state.messages.filter(msg => msg._id !== action.payload);
                  })
                  .addCase(deleteMessageById.rejected, (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                  })
                  // Mark as read
                  .addCase(markAsRead.pending, (state) => {
                        state.error = null;
                  })
                  .addCase(markAsRead.fulfilled, (state, action) => {
                        const messageIndex = state.messages.findIndex(msg => msg._id === action.payload._id);
                        if (messageIndex !== -1) {
                              state.messages[messageIndex] = action.payload;
                        }
                        if (state.currentMessage && state.currentMessage._id === action.payload._id) {
                              state.currentMessage = action.payload;
                        }
                  })
                  .addCase(markAsRead.rejected, (state, action) => {
                        state.error = action.payload;
                  })
                  // Get unread count
                  .addCase(getUnreadCount.pending, (state) => {
                        state.error = null;
                  })
                  .addCase(getUnreadCount.fulfilled, (state, action) => {
                        state.unreadCount = action.payload;
                  })
                  .addCase(getUnreadCount.rejected, (state, action) => {
                        state.error = action.payload;
                  });
      },
});

export const { clearError } = contactSlice.actions;
export default contactSlice.reducer;