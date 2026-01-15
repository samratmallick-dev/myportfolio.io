import mongoose from "mongoose";

const contactDetailsSchema = new mongoose.Schema({
      name: {
            type: String,
            required: true,
            trim: true,
      },
      email: {
            type: String,
            required: true,
            trim: true,
      },
      mobile: {
            type: String,
            required: true,
            trim: true,
      },
      address: {
            type: String,
            required: true,
            trim: true,
      },
      contactImage: {
            public_id: {
                  type: String,
            },
            url: {
                  type: String,
            },
      },
      socialLinks: [{
            platform: {
                  type: String,
                  required: true,
                  trim: true,
            },
            url: {
                  type: String,
                  required: true,
                  trim: true,
            },
            icon: {
                  type: String,
                  trim: true,
            },
      }],
      isActive: {
            type: Boolean,
            default: true,
      },
}, {
      timestamps: true,
});

const messageSchema = new mongoose.Schema({
      name: {
            type: String,
            required: true,
            trim: true,
      },
      email: {
            type: String,
            required: true,
            trim: true,
      },
      mobile: {
            type: String,
            required: true,
            trim: true,
      },
      message: {
            type: String,
            required: true,
            trim: true,
      },
      status: {
            type: String,
            enum: ["unread", "read", "replied"],
            default: "unread",
      },
      replyMessage: {
            type: String,
            trim: true,
      },
      repliedAt: {
            type: Date,
      },
      repliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
      },
      isReplied: {
            type: Boolean,
            default: false,
      },
      isActive: {
            type: Boolean,
            default: true,
      },
}, {
      timestamps: true,
});

export const ContactDetails = mongoose.model("ContactDetails", contactDetailsSchema);
export const Message = mongoose.model("Message", messageSchema);
