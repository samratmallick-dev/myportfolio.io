import projectService from "../service/project.service.js";
import { sendSuccess, sendCreated } from "../utilities/response/apiResponse.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";
import { broadcastPortfolioUpdate } from "../config/socket/socket.config.js";

class ProjectController {
      createProject = asyncHandler(async (req, res) => {
            const projectData = req.body;
            const project = await projectService.createProject(projectData);
            const featured = await projectService.getFeaturedProjects();
            const all = await projectService.getAllProjects();
            broadcastPortfolioUpdate("projects", { featured, all });
            sendCreated(res, "Project created successfully", project);
      });

      getAllProjects = asyncHandler(async (req, res) => {
            const projects = await projectService.getAllProjects();
            sendSuccess(res, "Projects retrieved successfully", projects);
      });

      getProjectById = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const project = await projectService.getProjectById(id);
            sendSuccess(res, "Project retrieved successfully", project);
      });

      updateProject = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const projectData = req.body;
            const project = await projectService.updateProject(id, projectData);
            const featured = await projectService.getFeaturedProjects();
            const all = await projectService.getAllProjects();
            broadcastPortfolioUpdate("projects", { featured, all });
            sendSuccess(res, "Project updated successfully", project);
      });

      deleteProject = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const result = await projectService.deleteProject(id);
            const featured = await projectService.getFeaturedProjects();
            const all = await projectService.getAllProjects();
            broadcastPortfolioUpdate("projects", { featured, all });
            sendSuccess(res, "Project deleted successfully", result);
      });

      getAllProjectsAdmin = asyncHandler(async (req, res) => {
            const projects = await projectService.getAllProjectsAdmin();
            sendSuccess(res, "All projects retrieved successfully", projects);
      });

      getFeaturedProjects = asyncHandler(async (req, res) => {
            const projects = await projectService.getFeaturedProjects();
            sendSuccess(res, "Featured projects retrieved successfully", projects);
      });

      setFeaturedProject = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const { isFeatured } = req.body;
            const project = await projectService.setFeaturedProject(id, isFeatured);
            const featured = await projectService.getFeaturedProjects();
            const all = await projectService.getAllProjects();
            broadcastPortfolioUpdate("projects", { featured, all });
            sendSuccess(res, "Project featured status updated successfully", project);
      });
}

export default new ProjectController();
