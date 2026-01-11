import "dotenv/config";
import mongoose from 'mongoose';
import { Skill } from '../src/model/skill.model.js';

const skillsData = [
      {
            category: "Frontend Development",
            skills: [
                  {
                        name: "ReactJS",
                        level: 90,
                        iconName: "Code2",
                        iconColor: "text-blue-500",
                  },
                  {
                        name: "JavaScript",
                        level: 85,
                        iconName: "Terminal",
                        iconColor: "text-yellow-500",
                  },
                  {
                        name: "HTML/CSS",
                        level: 95,
                        iconName: "Palette",
                        iconColor: "text-orange-500",
                  },
                  {
                        name: "Tailwind CSS",
                        level: 88,
                        iconName: "Palette",
                        iconColor: "text-cyan-500",
                  }
            ]
      },
      {
            category: "Backend Development",
            skills: [
                  {
                        name: "NodeJS",
                        level: 85,
                        iconName: "Server",
                        iconColor: "text-green-500",
                  },
                  {
                        name: "ExpressJS",
                        level: 82,
                        iconName: "Server",
                        iconColor: "text-gray-500",
                  },
                  {
                        name: "MongoDB",
                        level: 80,
                        iconName: "Database",
                        iconColor: "text-green-600",
                  },
                  {
                        name: "SQL",
                        level: 60,
                        iconName: "Database",
                        iconColor: "text-green-600",
                  }
            ]
      },
      {
            category: "Tools & Others",
            skills: [
                  {
                        name: "Git",
                        level: 85,
                        iconName: "Terminal",
                        iconColor: "text-orange-500",
                  },
                  {
                        name: "VSCode",
                        level: 90,
                        iconName: "Code2",
                        iconColor: "text-blue-600",
                  },
                  {
                        name: "C Programming",
                        level: 75,
                        iconName: "Terminal",
                        iconColor: "text-gray-600",
                  },
                  {
                        name: "Java",
                        level: 75,
                        iconName: "Coffee",
                        iconColor: "text-red-500",
                  }
            ]
      }
];

const seedSkills = async () => {
      try {
            const url = process.env.MONGO_URL;
            const name = process.env.MONGO_NAME;
            
            if (!(url && name)) {
                  console.error("Please provide MONGO_URL and MONGO_NAME in the environment variables");
                  process.exit(1);
            }

            // Connect to MongoDB
            const connection = await mongoose.connect(`${url}/${name}`);
            console.log('Connected to MongoDB');
            console.log(`MongoDB connected: ${connection.connection.host}`);

            // Clear existing skills data
            await Skill.deleteMany({});
            console.log('Cleared existing skills data');

            // Flatten skills data for insertion
            const flattenedSkills = [];
            skillsData.forEach(category => {
                  category.skills.forEach(skill => {
                        flattenedSkills.push({
                              category: category.category,
                              name: skill.name,
                              level: skill.level,
                              iconName: skill.iconName,
                              iconColor: skill.iconColor,
                              isActive: true
                        });
                  });
            });

            // Insert new skills data
            const insertedSkills = await Skill.insertMany(flattenedSkills);
            console.log(`Successfully inserted ${insertedSkills.length} skills:`);
            
            // Group by category for display
            const skillsByCategory = {};
            insertedSkills.forEach(skill => {
                  if (!skillsByCategory[skill.category]) {
                        skillsByCategory[skill.category] = [];
                  }
                  skillsByCategory[skill.category].push(skill.name);
            });

            Object.keys(skillsByCategory).forEach(category => {
                  console.log(`- ${category}: ${skillsByCategory[category].join(', ')}`);
            });

            // Close connection
            await mongoose.connection.close();
            console.log('Database connection closed');

      } catch (error) {
            console.error('Error seeding skills data:', error);
            process.exit(1);
      }
};

// Run the seed function
seedSkills();
