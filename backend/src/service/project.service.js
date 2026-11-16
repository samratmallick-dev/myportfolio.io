import projectRepository from "../repository/project.repository.js";
import ApiError from "../utilities/error/apiError.js";
import Logger from "../config/logger/logger.config.js";
import { generateSlug } from "../utilities/slug.util.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utilities/cloudinary/upload.js";

class ProjectService {
      // Helper to parse JSON-stringified arrays from FormData
      _parseArrayFields(data) {
            const arrayFields = ['features', 'architecture', 'process', 'challenges', 'results'];
            for (const field of arrayFields) {
                  if (data[field] && typeof data[field] === 'string') {
                        try {
                              const parsed = JSON.parse(data[field]);
                              data[field] = Array.isArray(parsed) ? parsed : [data[field]];
                        } catch {
                              // if not valid JSON, treat as comma-separated
                              data[field] = data[field].split(',').map(s => s.trim()).filter(Boolean);
                        }
                  }
            }
      }

      async createProject(projectData, imageFile = null) {
            Logger.info('Creating new project', { title: projectData.title });
            if (projectData.technologies && typeof projectData.technologies === 'string') {
                  projectData.technologies = projectData.technologies.split(',').map(t => t.trim()).filter(Boolean);
            }
            this._parseArrayFields(projectData);
            
            if (!projectData.slug) {
                  let baseSlug = generateSlug(projectData.title);
                  let slug = baseSlug;
                  let counter = 2;
                  while (await projectRepository.findAnyBySlug(slug)) {
                        slug = `${baseSlug}-${counter}`;
                        counter++;
                  }
                  projectData.slug = slug;
            } else {
                  if (await projectRepository.findAnyBySlug(projectData.slug)) {
                        throw ApiError.badRequest("Slug already exists");
                  }
            }

            if (imageFile) {
                  Logger.info('Uploading project image to Cloudinary');
                  const cloudinaryResponse = await uploadToCloudinary(imageFile, { folder: 'projects/images' });
                  projectData.image = {
                        public_id: cloudinaryResponse.public_id,
                        url: cloudinaryResponse.secure_url,
                  };
            }

            const project = await projectRepository.create(projectData);
            Logger.info('Project created successfully', { projectId: project._id });
            return project;
      }

      async getAllProjects() {
            const projects = await projectRepository.findActive();
            return projects;
      }

      /**
       * Public, paginated project listing.
       * Only card fields are selected; page/limit are normalised by the repo.
       */
      async getPublicProjectsPage(query = {}) {
            return await projectRepository.findPublicPage(query);
      }

      async getProjectById(id) {
            const project = await projectRepository.findById(id);

            if (!project) {
                  throw ApiError.notFound("Project not found");
            }

            if (!project.isActive) {
                  throw ApiError.badRequest("Project is not active");
            }

            return project;
      }

      async getProjectBySlug(slug) {
            const project = await projectRepository.findBySlug(slug);

            if (!project) {
                  throw ApiError.notFound("Project not found");
            }

            return project;
      }

      async updateProject(id, projectData, imageFile = null) {
            const existingProject = await projectRepository.findById(id);

            if (!existingProject) {
                  throw ApiError.notFound("Project not found");
            }

            if (projectData.technologies && typeof projectData.technologies === 'string') {
                  projectData.technologies = projectData.technologies.split(',').map(t => t.trim()).filter(Boolean);
            }
            this._parseArrayFields(projectData);
            
            // If slug is provided and different from existing, check uniqueness
            if (projectData.slug && projectData.slug !== existingProject.slug) {
                  if (await projectRepository.findAnyBySlug(projectData.slug)) {
                        throw ApiError.badRequest("Slug already exists");
                  }
            } else if (!projectData.slug) {
                  // If slug is not provided in update, do not overwrite existing slug
                  delete projectData.slug;
            }

            if (imageFile) {
                  // Delete old image from Cloudinary if exists
                  if (existingProject.image?.public_id) {
                        await deleteFromCloudinary(existingProject.image.public_id).catch(() => {});
                  }
                  Logger.info('Uploading updated project image to Cloudinary');
                  const cloudinaryResponse = await uploadToCloudinary(imageFile, { folder: 'projects/images' });
                  projectData.image = {
                        public_id: cloudinaryResponse.public_id,
                        url: cloudinaryResponse.secure_url,
                  };
            }

            const updatedProject = await projectRepository.updateById(id, projectData);
            return updatedProject;
      }

      async deleteProject(id) {
            Logger.info('Deleting project', { projectId: id });
            const project = await projectRepository.findById(id);

            if (!project) {
                  Logger.error('Project deletion failed - project not found', { projectId: id });
                  throw ApiError.notFound("Project not found");
            }

            await projectRepository.deleteById(id);
            Logger.info('Project deleted successfully', { projectId: id });
            return { message: "Project deleted successfully" };
      }

      async getAllProjectsAdmin() {
            const projects = await projectRepository.findAll();
            return projects;
      }

      async getFeaturedProjects() {
            const projects = await projectRepository.findFeatured();
            return projects;
      }

      async getPublicFeaturedProjects() {
            return await projectRepository.findFeaturedPublic();
      }

      async setFeaturedProject(id, isFeatured) {
            const project = await projectRepository.findById(id);

            if (!project) {
                  throw ApiError.notFound("Project not found");
            }

            const updatedProject = await projectRepository.updateById(id, { isFeatured });
            return updatedProject;
      }
}

export default new ProjectService();
