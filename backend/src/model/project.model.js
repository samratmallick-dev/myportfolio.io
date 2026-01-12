import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
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
      technologies: [{
            type: String,
            required: true,
            trim: true,
      }],
      githubUrl: {
            type: String,
            trim: true,
      },
      liveUrl: {
            type: String,
            trim: true,
      },
      status: {
            type: String,
            enum: ["Completed", "In Progress", "On Hold"],
            default: "Completed",
      },
      isActive: {
            type: Boolean,
            default: true,
      },
      isFeatured: {
            type: Boolean,
            default: false,
      },
}, {
      timestamps: true,
});

export const Project = mongoose.model("Project", projectSchema);
