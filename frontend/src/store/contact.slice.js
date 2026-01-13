import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
      fetchContactDetails,
      addOrUpdateContactDetails,
      updateContactDetails,
      sendContactMessage,
      fetchAllMessages,
      fetchMessageById,
      deleteMessage,
      markMessageAsRead,
      fetchUnreadCount,
      fetchAllMessagesAdmin,
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

export const addUpdateContact = createAsyncThunk(
      "contact/addUpdateContact",
      async (formData, { rejectWithValue }) => {
            try {
                  const response = await addOrUpdateContactDetails(formData);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.message || "Failed to add/update contact");
            }
      }
);

export const updateContact = createAsyncThunk(
      "contact/updateContact",
      async ({ id, formData }, { rejectWithValue }) => {
            try {
                  const response = await updateContactDetails(id, formData);
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.message || "Failed to update contact");
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
                  const response = await fetchAllMessages();
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

export const removeMessage = createAsyncThunk(
      "contact/removeMessage",
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

export const getAllMessagesAdmin = createAsyncThunk(
      "contact/getAllMessagesAdmin",
      async (_, { rejectWithValue }) => {
            try {
                  const response = await fetchAllMessagesAdmin();
                  return response.data;
            } catch (error) {
                  return rejectWithValue(error.message || "Failed to fetch admin messages");
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
                        state.contactDetails = null;
                        // Don't set error for 404 - it's expected when no contact exists
                        if (!action.payload?.includes('not found')) {
                              state.error = action.payload;
                        }
                  })
                  // Add/Update contact
                  .addCase(addUpdateContact.pending, (state) => {
                        state.loading = true;
                        state.error = null;
                  })
                  .addCase(addUpdateContact.fulfilled, (state, action) => {
                        state.loading = false;
                        state.contactDetails = action.payload;
                  })
                  .addCase(addUpdateContact.rejected, (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                  })
                  // Update contact
                  .addCase(updateContact.pending, (state) => {
                        state.loading = true;
                        state.error = null;
                  })
                  .addCase(updateContact.fulfilled, (state, action) => {
                        state.loading = false;
                        state.contactDetails = action.payload;
                  })
                  .addCase(updateContact.rejected, (state, action) => {
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
                  // Remove message
                  .addCase(removeMessage.pending, (state) => {
                        state.loading = true;
                        state.error = null;
                  })
                  .addCase(removeMessage.fulfilled, (state, action) => {
                        state.loading = false;
                        state.messages = state.messages.filter(msg => msg._id !== action.payload);
                  })
                  .addCase(removeMessage.rejected, (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                  })
                  // Mark as read
                  .addCase(markAsRead.pending, (state) => {
                        state.loading = true;
                        state.error = null;
                  })
                  .addCase(markAsRead.fulfilled, (state, action) => {
                        state.loading = false;
                        const index = state.messages.findIndex(msg => msg._id === action.payload._id);
                        if (index !== -1) {
                              state.messages[index] = action.payload;
                        }
                  })
                  .addCase(markAsRead.rejected, (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                  })
                  // Get unread count
                  .addCase(getUnreadCount.fulfilled, (state, action) => {
                        state.unreadCount = action.payload.count;
                  })
                  // Get all messages admin
                  .addCase(getAllMessagesAdmin.pending, (state) => {
                        state.loading = true;
                        state.error = null;
                  })
                  .addCase(getAllMessagesAdmin.fulfilled, (state, action) => {
                        state.loading = false;
                        state.messages = action.payload;
                  })
                  .addCase(getAllMessagesAdmin.rejected, (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                  });
      },
});

export const contactActions = contactSlice.actions;
export default contactSlice.reducer;