import educationService from "../service/education.service.js";
import { sendSuccess, sendCreated, sendNotFound } from "../utilities/response/apiResponse.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";

class EducationController {
  createEducation = asyncHandler(async (req, res) => {
    const educationData = req.body;
      const logo = req.files?.logo?.[0];
      
      const education = await educationService.createEducation(educationData, logo);
      sendCreated(res, "Education created successfully", education);
  });

  getAllEducation = asyncHandler(async (req, res) => {
    const educationList = await educationService.getAllEducation();
      sendSuccess(res, "Education list retrieved successfully", educationList);
  });

  getEducationById = asyncHandler(async (req, res) => {
    const { id } = req.params;
      const education = await educationService.getEducationById(id);
      sendSuccess(res, "Education retrieved successfully", education);
  });

  updateEducation = asyncHandler(async (req, res) => {
    const { id } = req.params;
      const educationData = req.body;
      const logo = req.files?.logo?.[0];
      
      const education = await educationService.updateEducation(id, educationData, logo);
      sendSuccess(res, "Education updated successfully", education);
  });

  deleteEducation = asyncHandler(async (req, res) => {
    const { id } = req.params;
      const result = await educationService.deleteEducation(id);
      sendSuccess(res, "Education deleted successfully", result);
  });

  getAllEducationAdmin = asyncHandler(async (req, res) => {
    const educationList = await educationService.getAllEducationAdmin();
      sendSuccess(res, "All education retrieved successfully", educationList);
  });

  getLatestEducation = asyncHandler(async (req, res) => {
    const education = await educationService.getLatestEducation();
      sendSuccess(res, "Latest education retrieved successfully", education);
  });
}

export default new EducationController();


