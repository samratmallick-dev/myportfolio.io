import "dotenv/config";
import mongoose from "mongoose";
import connectDb from "../src/config/db/config.db.js";
import { Project } from "../src/model/project.model.js";
import { generateSlug } from "../src/utilities/slug.util.js";

const migrateProjects = async () => {
    try {
        await connectDb();
        console.log("Connected to DB, starting migration...");

        const projects = await Project.find({});
        console.log(`Found ${projects.length} projects to check.`);

        for (const project of projects) {
            let updated = false;

            // Generate slug if it doesn't exist
            if (!project.slug) {
                let baseSlug = generateSlug(project.title);
                let slug = baseSlug;
                let counter = 2;
                
                // Ensure uniqueness
                while (await Project.findOne({ slug })) {
                    slug = `${baseSlug}-${counter}`;
                    counter++;
                }

                project.slug = slug;
                updated = true;
            }

            // Populate safe defaults for new array fields if they are missing or undefined
            // Mongoose defaults often apply on creation, but for existing docs they might be missing.
            // Wait, we defined defaults in the schema. Mongoose .save() will apply defaults if undefined.
            
            if (updated) {
                await project.save();
                console.log(`Migrated project: ${project.title} (slug: ${project.slug})`);
            } else {
                console.log(`Project already has slug: ${project.title} (slug: ${project.slug})`);
            }
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrateProjects();
