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
      fetchUnreadCount,
      replyToMessage
} from "../config/api.js";

// Async thunks
export const getContactDetails = createAsyncThunk(
      "contact/getContactDetails",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchContactDetails();
                  return response.data;
            } catch (error) {
                  console.error('Get contact details error:', error);
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
                  console.error('Add/update contact details error:', error);
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
                  console.error('Update contact details error:', error);
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
                  console.error('Send message error:', error);

                  // Extract error message properly
                  let errorMessage = "Failed to send message. Please try again.";

                  if (error.message) {
                        errorMessage = error.message;
                  } else if (error.response?.data?.message) {
                        errorMessage = error.response.data.message;
                  } else if (typeof error === 'string') {
                        errorMessage = error;
                  }

                  return rejectWithValue(errorMessage);
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
                  console.error('Get all messages error:', error);
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
                  console.error('Get message by ID error:', error);
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
                  console.error('Delete message error:', error);
                  return rejectWithValue(error.message || "Failed to delete message");
            }
      }
);

export const markAsRead = createAsyncThunk(
      "contact/markAsRead",
      async (messageId, { rejectWithValue }) => {
            try {
                  const response = await markMessageAsRead(messageId);
                  return { ...response.data, _id: messageId };
            } catch (error) {
                  console.error('Mark as read error:', error);
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
                  console.error('Get unread count error:', error);
                  return rejectWithValue(error.message || "Failed to fetch unread count");
            }
      }
);

export const replyToMessageThunk = createAsyncThunk(
      "contact/replyToMessage",
      async ({ messageId, replyData }, { rejectWithValue }) => {
            try {
                  const response = await replyToMessage(messageId, replyData);
                  return response.data;
            } catch (error) {
                  console.error('Reply to message error:', error);
                  return rejectWithValue(error.message || "Failed to send reply");
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
            messageSubmitting: false,
            messageSuccess: false,
      },
      reducers: {
            clearError: (state) => {
                  state.error = null;
            },
            clearMessageSuccess: (state) => {
                  state.messageSuccess = false;
            },
            resetMessageState: (state) => {
                  state.messageSubmitting = false;
                  state.messageSuccess = false;
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
                        state.messageSubmitting = true;
                        state.messageSuccess = false;
                        state.error = null;
                  })
                  .addCase(sendMessage.fulfilled, (state) => {
                        state.messageSubmitting = false;
                        state.messageSuccess = true;
                        state.error = null;
                  })
                  .addCase(sendMessage.rejected, (state, action) => {
                        state.messageSubmitting = false;
                        state.messageSuccess = false;
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
                              state.messages[messageIndex].status = 'read';
                        }
                        if (state.currentMessage && state.currentMessage._id === action.payload._id) {
                              state.currentMessage.status = 'read';
                        }
                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                  })
                  .addCase(markAsRead.rejected, (state, action) => {
                        state.error = action.payload;
                  })
                  .addCase(getUnreadCount.pending, (state) => {
                        state.error = null;
                  })
                  .addCase(getUnreadCount.fulfilled, (state, action) => {
                        state.unreadCount = action.payload;
                  })
                  .addCase(getUnreadCount.rejected, (state, action) => {
                        state.error = action.payload;
                  })
                  // Reply to message
                  .addCase(replyToMessageThunk.pending, (state) => {
                        state.loading = true;
                        state.error = null;
                  })
                  .addCase(replyToMessageThunk.fulfilled, (state, action) => {
                        state.loading = false;
                        const messageIndex = state.messages.findIndex(msg => msg._id === action.payload._id);
                        if (messageIndex !== -1) {
                              state.messages[messageIndex] = action.payload;
                        }
                        if (state.currentMessage && state.currentMessage._id === action.payload._id) {
                              state.currentMessage = action.payload;
                        }
                        if (action.payload.status === 'replied') {
                              state.unreadCount = Math.max(0, state.unreadCount - 1);
                        }
                  })
                  .addCase(replyToMessageThunk.rejected, (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                  });
      },
});

export const { clearError, clearMessageSuccess, resetMessageState } = contactSlice.actions;
export default contactSlice.reducer;