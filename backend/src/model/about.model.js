import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema({
      paragraphs: {
            type: String,
            required: true,
            trim: true,
      },
      aboutImage: {
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

export const About = mongoose.model("About", aboutSchema);
