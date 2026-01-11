import mongoose from "mongoose";

const heroSchema = new mongoose.Schema({
      name: {
            type: String,
            required: true,
            trim: true,
      },
      title: {
            type: String,
            required: true,
            trim: true,
      },
      subtitle: {
            type: String,
            trim: true,
      },
      description: {
            type: String,
            trim: true,
      },
      profileImage: {
            public_id: {
                  type: String,
                  required: false,
            },
            url: {
                  type: String,
                  required: false,
            },
      },
      resumeUrl: {
            type: String,
            trim: true,
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

export const Hero = mongoose.model("Hero", heroSchema);
