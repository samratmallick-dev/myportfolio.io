import "dotenv/config";
import mongoose from 'mongoose';
import { Hero } from '../src/model/hero.model.js';

const heroData = {
      name: 'John Doe',
      title: ['Full Stack Developer', 'UI/UX Designer', 'Problem Solver'],
      description: 'Passionate developer with expertise in modern web technologies. I love creating beautiful, functional applications that solve real-world problems.',
      resumeLink: '#',
      profileImage: {
            public_id: 'portfolio/profile_placeholder',
            url: 'https://via.placeholder.com/400x400/4f46e5/ffffff?text=Profile'
      },
      isActive: true
};

const seedHero = async () => {
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

            // Clear existing hero data
            await Hero.deleteMany({});
            console.log('Cleared existing hero data');

            // Insert new hero data
            const insertedHero = await Hero.create(heroData);
            console.log(`Successfully inserted hero record:`);
            console.log(`1. ${insertedHero.name} - ${insertedHero.title.join(', ')}`);

            // Close connection
            await mongoose.connection.close();
            console.log('Database connection closed');

      } catch (error) {
            console.error('Error seeding hero data:', error);
            process.exit(1);
      }
};

// Run the seed function
seedHero();
