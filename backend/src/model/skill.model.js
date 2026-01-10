import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
  },
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    icon: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
    },
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    }],
  }],
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Skill = mongoose.model("Skill", skillSchema);
