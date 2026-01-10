import educationRepository from "../repository/education.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { uploadToCloudinary } from "../utilities/cloudinary/upload.js";

class EducationService {
  async createEducation(educationData, logo) {
    if (logo) {
      const cloudinaryResponse = await uploadToCloudinary(logo, "education/logos");
      educationData.logo = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    }

    const education = await educationRepository.create(educationData);
    return education;
  }

  async getAllEducation() {
    const educationList = await educationRepository.findActive();
    return educationList;
  }

  async getEducationById(id) {
    const education = await educationRepository.findById(id);
    
    if (!education) {
      throw ApiError.notFound("Education not found");
    }

    if (!education.isActive) {
      throw ApiError.badRequest("Education is not active");
    }

    return education;
  }

  async updateEducation(id, educationData, logo) {
    const existingEducation = await educationRepository.findById(id);
    
    if (!existingEducation) {
      throw ApiError.notFound("Education not found");
    }

    if (logo) {
      const cloudinaryResponse = await uploadToCloudinary(logo, "education/logos");
      educationData.logo = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    }

    const updatedEducation = await educationRepository.updateById(id, educationData);
    return updatedEducation;
  }

  async deleteEducation(id) {
    const education = await educationRepository.findById(id);
    
    if (!education) {
      throw ApiError.notFound("Education not found");
    }

    await educationRepository.deleteById(id);
    return { message: "Education deleted successfully" };
  }

  async getAllEducationAdmin() {
    const educationList = await educationRepository.findAll();
    return educationList;
  }

  async getLatestEducation() {
    const education = await educationRepository.findLatest();
    return education;
  }
}

export default new EducationService();
