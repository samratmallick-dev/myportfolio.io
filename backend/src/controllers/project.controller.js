import projectService from "../service/project.service.js";
import { sendSuccess, sendCreated, sendNotFound } from "../utilities/response/apiResponse.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";

class ProjectController {
      createProject = asyncHandler(async (req, res) => {
            const projectData = req.body;
            const images = req.files?.images || [];

            const project = await projectService.createProject(projectData, images);

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
            const images = req.files?.images || [];

            const project = await projectService.updateProject(id, projectData, images);

            sendSuccess(res, "Project updated successfully", project);
      });

      deleteProject = asyncHandler(async (req, res) => {
            const { id } = req.params;

            const result = await projectService.deleteProject(id);

            sendSuccess(res, "Project deleted successfully", result);
      });

      getFeaturedProjects = asyncHandler(async (req, res) => {
            const projects = await projectService.getFeaturedProjects();

            sendSuccess(res, "Featured projects retrieved successfully", projects);
      });

      setFeaturedProjects = asyncHandler(async (req, res) => {
            const { projectIds } = req.body;

            const projects = await projectService.setFeaturedProjects(projectIds);

            sendSuccess(res, "Featured projects set successfully", projects);
      });

      getAllProjectsAdmin = asyncHandler(async (req, res) => {
            const projects = await projectService.getAllProjectsAdmin();

            sendSuccess(res, "All projects retrieved successfully", projects);
      });

      getProjectsByCategory = asyncHandler(async (req, res) => {
            const { category } = req.params;
            const projects = await projectService.getProjectsByCategory(category);

            sendSuccess(res, "Projects by category retrieved successfully", projects);
      });

      getProjectsByTechnology = asyncHandler(async (req, res) => {
            const { technology } = req.params;
            const projects = await projectService.getProjectsByTechnology(technology);

            sendSuccess(res, "Projects by technology retrieved successfully", projects);
      });
}

export default new ProjectController();


