import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema({
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
  profileImage: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  experience: {
    years: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
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
      default: 0,
    },
  }],
  personalInfo: {
    age: {
      type: Number,
    },
    location: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    languages: [{
      type: String,
      trim: true,
    }],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const About = mongoose.model("About", aboutSchema);
