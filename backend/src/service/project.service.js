import projectRepository from "../repository/project.repository.js";
import ApiError from "../utilities/error/apiError.js";
import Logger from "../config/logger/logger.config.js";

class ProjectService {
      async createProject(projectData) {
            Logger.info('Creating new project', { title: projectData.title });
            if (projectData.technologies && typeof projectData.technologies === 'string') {
                  projectData.technologies = projectData.technologies.split(',').map(t => t.trim()).filter(Boolean);
            }
            const project = await projectRepository.create(projectData);
            Logger.info('Project created successfully', { projectId: project._id });
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

      async updateProject(id, projectData) {
            const existingProject = await projectRepository.findById(id);

            if (!existingProject) {
                  throw ApiError.notFound("Project not found");
            }

            if (projectData.technologies && typeof projectData.technologies === 'string') {
                  projectData.technologies = projectData.technologies.split(',').map(t => t.trim()).filter(Boolean);
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
