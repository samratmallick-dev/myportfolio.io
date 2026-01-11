import "dotenv/config";
import mongoose from 'mongoose';
import { About } from '../src/model/about.model.js';

const aboutData = {
      paragraphs: `I am a passionate full-stack developer with a strong foundation in modern web technologies. My journey in tech started with a curiosity about how things work on the internet, which evolved into a career focused on creating meaningful digital experiences.

With expertise in both frontend and backend development, I enjoy tackling complex problems and turning ideas into reality. I believe in writing clean, maintainable code and staying updated with the latest industry trends.

When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or sharing knowledge with the developer community. I'm always eager to take on new challenges and collaborate on innovative projects that make a difference.`,
      aboutImage: {
            public_id: 'portfolio/about_placeholder',
            url: 'https://via.placeholder.com/600x400/4f46e5/ffffff?text=About+Me'
      },
      isActive: true
};

const seedAbout = async () => {
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

            // Clear existing about data
            await About.deleteMany({});
            console.log('Cleared existing about data');

            // Insert new about data
            const insertedAbout = await About.create(aboutData);
            console.log(`Successfully inserted about record:`);
            console.log(`1. About section with ${insertedAbout.paragraphs.length} characters`);

            // Close connection
            await mongoose.connection.close();
            console.log('Database connection closed');

      } catch (error) {
            console.error('Error seeding about data:', error);
            process.exit(1);
      }
};

// Run the seed function
seedAbout();
