import aboutRepository from "../repository/about.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { uploadToCloudinary } from "../utilities/cloudinary/upload.js";
import Logger from "../config/logger/logger.config.js";

class AboutService {
      async addUpdateAboutContent(aboutData, aboutImage) {
            Logger.info('Adding/updating about content', { hasImage: !!aboutImage });
            let aboutContent = await aboutRepository.findActive();

            if (aboutImage) {
                  Logger.info('Uploading about image to Cloudinary');
                  const cloudinaryResponse = await uploadToCloudinary(aboutImage, "about/profile");
                  aboutData.aboutImage = {
                        public_id: cloudinaryResponse.public_id,
                        url: cloudinaryResponse.secure_url,
                  };
            }

            if (aboutContent) {
                  Logger.info('Updating existing about content', { aboutId: aboutContent._id });
                  aboutContent = await aboutRepository.updateById(aboutContent._id, aboutData);
            } else {
                  Logger.info('Creating new about content');
                  aboutContent = await aboutRepository.create(aboutData);
            }

            Logger.info('About content operation completed successfully');
            return aboutContent;
      }

      async getAboutContent() {
            const aboutContent = await aboutRepository.findActive();

            if (!aboutContent) {
                  throw ApiError.notFound("About content not found");
            }

            return aboutContent;
      }

      async getAboutContentById(id) {
            const aboutContent = await aboutRepository.findById(id);

            if (!aboutContent) {
                  throw ApiError.notFound("About content not found");
            }

            return aboutContent;
      }

      async updateAboutContent(id, aboutData, aboutImage) {
            const existingAbout = await aboutRepository.findById(id);

            if (!existingAbout) {
                  throw ApiError.notFound("About content not found");
            }

            if (aboutImage) {
                  const cloudinaryResponse = await uploadToCloudinary(aboutImage, "about/profile");
                  aboutData.aboutImage = {
                        public_id: cloudinaryResponse.public_id,
                        url: cloudinaryResponse.secure_url,
                  };
            }

            const updatedAbout = await aboutRepository.updateById(id, aboutData);
            return updatedAbout;
      }

      async deleteAboutContent(id) {
            const aboutContent = await aboutRepository.findById(id);

            if (!aboutContent) {
                  throw ApiError.notFound("About content not found");
            }

            await aboutRepository.deleteById(id);
            return { message: "About content deleted successfully" };
      }

      async getAllAboutContent() {
            const aboutContents = await aboutRepository.findAll();
            return aboutContents;
      }
}

export default new AboutService();
