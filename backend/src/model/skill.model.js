import mongoose from "mongoose";

const skillItemSchema = new mongoose.Schema(
      {
            name: { 
                  type: String, 
                  required: true, 
                  trim: true 
            },
            level: { 
                  type: Number, 
                  required: true, 
                  min: 0, 
                  max: 100 
            },
            iconName: { 
                  type: String, 
                  required: true 
            },
            iconColor: { 
                  type: String, 
                  required: true 
            },
      },
      { timestamps: true }
);

const skillSchema = new mongoose.Schema(
      {
            category: { 
                  type: String, 
                  required: true, 
                  unique: true, 
                  trim: true 
            },
            skills: { 
                  type: [skillItemSchema], 
                  default: [] 
            },
            isActive: { 
                  type: Boolean, 
                  default: true 
            },
      },
      { timestamps: true }
);

export const Skill = mongoose.model("Skill", skillSchema);
