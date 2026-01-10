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
  shortDescription: {
    type: String,
    trim: true,
  },
  technologies: [{
    type: String,
    required: true,
    trim: true,
  }],
  category: {
    type: String,
    required: true,
    trim: true,
  },
  images: [{
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      trim: true,
    },
  }],
  liveUrl: {
    type: String,
    trim: true,
  },
  githubUrl: {
    type: String,
    trim: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["completed", "in-progress", "planned"],
    default: "completed",
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  teamSize: {
    type: Number,
    min: 1,
  },
  role: {
    type: String,
    trim: true,
  },
  challenges: [{
    type: String,
    trim: true,
  }],
  solutions: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Project = mongoose.model("Project", projectSchema);
