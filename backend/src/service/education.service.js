import educationRepository from "../repository/education.repository.js";
import ApiError from "../utilities/error/apiError.js";

class EducationService {
      async createEducation(educationData) {
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

      async updateEducation(id, educationData) {
            const existingEducation = await educationRepository.findById(id);

            if (!existingEducation) {
                  throw ApiError.notFound("Education not found");
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
