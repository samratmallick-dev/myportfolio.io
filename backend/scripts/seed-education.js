import "dotenv/config";
import mongoose from 'mongoose';
import { Education } from '../src/model/education.model.js';

const educationData = [
      {
            title: 'Skill Development Program on Web Design',
            description: 'Comprehensive training program covering modern web design principles, responsive layouts, and user experience design',
            certification: true,
            certificateLink: '#',
            date: '2023'
      },
      {
            title: 'Bachelor of Technology (B.Tech)',
            description: 'Currently pursuing B.Tech degree with focus on computer science and software engineering principles',
            certification: false,
            certificateLink: '#',
            date: '2022 - Present'
      },
      {
            title: '10th Grade Certification',
            description: 'Completed 10th grade with a focus on science and mathematics',
            certification: true,
            certificateLink: '#',
            date: '2020'
      },
      {
            title: '12th Grade Certification',
            description: 'Completed 12th grade with a focus on science and mathematics',
            certification: true,
            certificateLink: '#',
            date: '2022'
      },
];

const seedEducation = async () => {
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

            // Clear existing education data
            await Education.deleteMany({});
            console.log('Cleared existing education data');

            // Insert new education data
            const insertedEducation = await Education.insertMany(educationData);
            console.log(`Successfully inserted ${insertedEducation.length} education records:`);
            insertedEducation.forEach((edu, index) => {
                  console.log(`${index + 1}. ${edu.title} - ${edu.date}`);
            });

            // Close connection
            await mongoose.connection.close();
            console.log('Database connection closed');

      } catch (error) {
            console.error('Error seeding education data:', error);
            process.exit(1);
      }
};

// Run the seed function
seedEducation();
