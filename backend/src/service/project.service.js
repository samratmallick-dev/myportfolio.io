import projectRepository from "../repository/project.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { uploadToCloudinary } from "../utilities/cloudinary/upload.js";

class ProjectService {
      async createProject(projectData, images) {
            if (images && images.length > 0) {
                  const uploadPromises = images.map(image =>
                        uploadToCloudinary(image, "projects/images")
                  );

                  const cloudinaryResponses = await Promise.all(uploadPromises);

                  projectData.images = cloudinaryResponses.map(response => ({
                        public_id: response.public_id,
                        url: response.secure_url,
                        alt: projectData.title || "Project image",
                  }));
            }

            const project = await projectRepository.create(projectData);
            return project;
      }

      async getAllProjects() {
            const projects = await projectRepository.findActive();
            return projects;
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

      async updateProject(id, projectData, images) {
            const existingProject = await projectRepository.findById(id);

            if (!existingProject) {
                  throw ApiError.notFound("Project not found");
            }

            if (images && images.length > 0) {
                  const uploadPromises = images.map(image =>
                        uploadToCloudinary(image, "projects/images")
                  );

                  const cloudinaryResponses = await Promise.all(uploadPromises);

                  projectData.images = [
                        ...existingProject.images,
                        ...cloudinaryResponses.map(response => ({
                              public_id: response.public_id,
                              url: response.secure_url,
                              alt: projectData.title || "Project image",
                        }))
                  ];
            }

            const updatedProject = await projectRepository.updateById(id, projectData);
            return updatedProject;
      }

      async deleteProject(id) {
            const project = await projectRepository.findById(id);

            if (!project) {
                  throw ApiError.notFound("Project not found");
            }

            await projectRepository.deleteById(id);
            return { message: "Project deleted successfully" };
      }

      async getFeaturedProjects() {
            const projects = await projectRepository.findFeatured();
            return projects;
      }

      async setFeaturedProjects(projectIds) {
            if (!Array.isArray(projectIds) || projectIds.length === 0) {
                  throw ApiError.badRequest("Project IDs array is required");
            }

            const projects = await projectRepository.updateFeatured(projectIds);
            return projects;
      }

      async getAllProjectsAdmin() {
            const projects = await projectRepository.findAll();
            return projects;
      }

      async getProjectsByCategory(category) {
            const projects = await projectRepository.findByCategory(category);
            return projects;
      }

      async getProjectsByTechnology(technology) {
            const projects = await projectRepository.findByTechnology(technology);
            return projects;
      }
}

export default new ProjectService();
