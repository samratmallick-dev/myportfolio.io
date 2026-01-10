import aboutService from "../service/about.service.js";
import { sendSuccess, sendCreated, sendNotFound } from "../utilities/response/apiResponse.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";

class AboutController {
  addUpdateAboutContent = asyncHandler(async (req, res) => {
    const aboutData = req.body;
      const profileImage = req.files?.profileImage?.[0];
      
      const about = await aboutService.addUpdateAboutContent(aboutData, profileImage);
      
      sendSuccess(res, "About content updated successfully", about);
  });

  getAboutContent = asyncHandler(async (req, res) => {
    const about = await aboutService.getAboutContent();
      
      sendSuccess(res, "About content retrieved successfully", about);
  });

  getAboutContentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
      const about = await aboutService.getAboutContentById(id);
      
      sendSuccess(res, "About content retrieved successfully", about);
  });

  updateAboutContent = asyncHandler(async (req, res) => {
    const { id } = req.params;
      const aboutData = req.body;
      const profileImage = req.files?.profileImage?.[0];
      
      const about = await aboutService.updateAboutContent(id, aboutData, profileImage);
      
      sendSuccess(res, "About content updated successfully", about);
  });

  deleteAboutContent = asyncHandler(async (req, res) => {
    const { id } = req.params;
      
      const result = await aboutService.deleteAboutContent(id);
      
      sendSuccess(res, "About content deleted successfully", result);
  });

  getAllAboutContent = asyncHandler(async (req, res) => {
    const abouts = await aboutService.getAllAboutContent();
      
      sendSuccess(res, "All about content retrieved successfully", abouts);
  });
}

export default new AboutController();


