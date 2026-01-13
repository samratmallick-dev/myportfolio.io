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
            type: String,
            required: true,
            trim: true,
      },
      features: [{
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

export const Service = mongoose.model("Service", serviceSchema);
