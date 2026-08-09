import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
      slug: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
      },
      title: {
            type: String,
            required: true,
            trim: true,
      },
      shortDescription: {
            type: String,
            trim: true,
      },
      description: {
            type: String,
            required: true,
            trim: true,
      },
      category: {
            type: String,
            trim: true,
      },
      year: {
            type: Number,
      },
      image: {
            type: {
                  public_id: { type: String },
                  url: { type: String },
            },
            default: null,
      },
      gallery: {
            type: [String],
            default: [],
      },
      technologies: [{
            type: String,
            required: true,
            trim: true,
      }],
      features: {
            type: [{
                  title: String,
                  description: String,
                  icon: String,
            }],
            default: [],
      },
      problem: {
            type: String,
      },
      solution: {
            type: String,
      },
      objective: {
            type: String,
      },
      architecture: {
            type: [{
                  title: String,
                  description: String,
                  type: { type: String }, // e.g., 'frontend', 'backend', 'database'
            }],
            default: [],
      },
      process: {
            type: [{
                  step: Number,
                  title: String,
                  description: String,
            }],
            default: [],
      },
      challenges: {
            type: [{
                  challenge: String,
                  solution: String,
            }],
            default: [],
      },
      results: {
            type: [{
                  title: String,
                  description: String,
            }],
            default: [],
      },
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
      order: {
            type: Number,
            default: 0,
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

projectSchema.index({ isActive: 1, isFeatured: 1, order: 1, createdAt: 1 });
projectSchema.index({ isActive: 1, createdAt: 1 });

export const Project = mongoose.model("Project", projectSchema);
