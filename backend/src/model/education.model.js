import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
      title: {
            type: String,
            required: true,
            trim: true,
      },
      description: {
            type: String,
            required: true,
            trim: true,
      },
      certification: {
            type: Boolean,
            default: false,
      },
      certificateLink: {
            type: String,
            trim: true,
      },
      date: {
            type: String,
            required: true,
            trim: true,
      },
      isActive: {
            type: Boolean,
            default: true,
      },
}, {
      timestamps: true,
});

educationSchema.index({ isActive: 1, createdAt: -1 });

export const Education = mongoose.model("Education", educationSchema);
