import heroService from "../service/hero.service.js";
import { sendSuccess } from "../utilities/response/apiResponse.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";
import { broadcastPortfolioUpdate } from "../config/socket/socket.config.js";

class HeroController {
      addUpdateHeroContent = asyncHandler(async (req, res) => {
            const heroData = req.body;
            const profileImage = req.file;

            const hero = await heroService.addUpdateHeroContent(heroData, profileImage);
            broadcastPortfolioUpdate("hero", hero);
            sendSuccess(res, "Hero content updated successfully", hero);
      });

      getHeroContent = asyncHandler(async (req, res) => {  
            const hero = await heroService.getHeroContent();
            sendSuccess(res, "Hero content retrieved successfully", hero);
      });

      getHeroContentById = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const hero = await heroService.getHeroContentById(id);
            sendSuccess(res, "Hero content retrieved successfully", hero);
      });

      updateHeroContent = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const heroData = req.body;
            const profileImage = req.file;
            const hero = await heroService.updateHeroContent(id, heroData, profileImage);
            broadcastPortfolioUpdate("hero", hero);
            sendSuccess(res, "Hero content updated successfully", hero);
      });

      deleteHeroContent = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const result = await heroService.deleteHeroContent(id);
            broadcastPortfolioUpdate("hero", null);
            sendSuccess(res, "Hero content deleted successfully", result);
      });

      getAllHeroContent = asyncHandler(async (req, res) => {
            const heroes = await heroService.getAllHeroContent();
            sendSuccess(res, "All hero content retrieved successfully", heroes);
      });
};

export default new HeroController();

