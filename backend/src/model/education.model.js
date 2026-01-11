import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
      institution: {
            type: String,
            required: true,
            trim: true,
      },
      degree: {
            type: String,
            required: true,
            trim: true,
      },
      field: {
            type: String,
            required: true,
            trim: true,
      },
      startDate: {
            type: Date,
            required: true,
      },
      endDate: {
            type: Date,
      },
      isCurrentlyStudying: {
            type: Boolean,
            default: false,
      },
      grade: {
            type: String,
            trim: true,
      },
      description: {
            type: String,
            trim: true,
      },
      achievements: [{
            type: String,
            trim: true,
      }],
      logo: {
            public_id: {
                  type: String,
            },
            url: {
                  type: String,
            },
      },
      isActive: {
            type: Boolean,
            default: true,
      },
}, {
      timestamps: true,
});

educationSchema.pre("save", function (next) {
      if (this.isCurrentlyStudying) {
            this.endDate = undefined;
      }
      next();
});

export const Education = mongoose.model("Education", educationSchema);
