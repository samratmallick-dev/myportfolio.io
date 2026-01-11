import mongoose from "mongoose";

const heroSchema = new mongoose.Schema({
      name: {
            type: String,
            required: true,
            trim: true,
      },
      title: {
            type: [String],
            required: true,
      },
      description: {
            type: String,
            required: true,
            trim: true,
      },
      resumeLink: {
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
      isActive: {
            type: Boolean,
            default: true,
      },
}, {
      timestamps: true,
});

export const Hero = mongoose.model("Hero", heroSchema);
