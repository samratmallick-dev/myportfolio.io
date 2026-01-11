import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
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
      icon: {
            public_id: {
                  type: String,
                  required: true,
            },
            url: {
                  type: String,
                  required: true,
            },
      },
      features: [{
            type: String,
            trim: true,
      }],
      pricing: {
            type: String,
            trim: true,
      },
      duration: {
            type: String,
            trim: true,
      },
      technologies: [{
            type: String,
            trim: true,
      }],
      process: [{
            step: {
                  type: Number,
                  required: true,
            },
            title: {
                  type: String,
                  required: true,
                  trim: true,
            },
            description: {
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

export const Service = mongoose.model("Service", serviceSchema);
