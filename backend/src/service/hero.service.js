import heroRepository from "../repository/hero.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { uploadToCloudinary } from "../utilities/cloudinary/upload.js";

class HeroService {
  async addUpdateHeroContent(heroData, profileImage) {
    let heroContent = await heroRepository.findActive();

    if (profileImage) {
      const cloudinaryResponse = await uploadToCloudinary(profileImage, "hero/profile");
      heroData.profileImage = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    }

    if (heroContent) {
      heroContent = await heroRepository.updateById(heroContent._id, heroData);
    } else {
      heroContent = await heroRepository.create(heroData);
    }

    return heroContent;
  }

  async getHeroContent() {
    const heroContent = await heroRepository.findActive();
    
    if (!heroContent) {
      throw ApiError.notFound("Hero content not found");
    }

    return heroContent;
  }

  async getHeroContentById(id) {
    const heroContent = await heroRepository.findById(id);
    
    if (!heroContent) {
      throw ApiError.notFound("Hero content not found");
    }

    return heroContent;
  }

  async updateHeroContent(id, heroData, profileImage) {
    const existingHero = await heroRepository.findById(id);
    
    if (!existingHero) {
      throw ApiError.notFound("Hero content not found");
    }

    if (profileImage) {
      const cloudinaryResponse = await uploadToCloudinary(profileImage, "hero/profile");
      heroData.profileImage = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    }

    const updatedHero = await heroRepository.updateById(id, heroData);
    return updatedHero;
  }

  async deleteHeroContent(id) {
    const heroContent = await heroRepository.findById(id);
    
    if (!heroContent) {
      throw ApiError.notFound("Hero content not found");
    }

    await heroRepository.deleteById(id);
    return { message: "Hero content deleted successfully" };
  }

  async getAllHeroContent() {
    const heroContents = await heroRepository.findAll();
    return heroContents;
  }
}

export default new HeroService();
