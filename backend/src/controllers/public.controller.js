import { asyncHandler } from "../utilities/error/asyncHandler.js";
import { sendSuccess } from "../utilities/response/apiResponse.js";
import heroService from "../service/hero.service.js";
import aboutService from "../service/about.service.js";
import educationService from "../service/education.service.js";
import skillService from "../service/skill.service.js";
import projectService from "../service/project.service.js";
import serviceService from "../service/service.service.js";
import contactService from "../service/contact.service.js";

class PublicController {
      getPublicData = asyncHandler(async (req, res) => {
            const [hero, about, education, skills, featuredProjects, services, contact] = await Promise.allSettled([
                  heroService.getHeroContent(),
                  aboutService.getAboutContent(),
                  educationService.getAllEducation(),
                  skillService.getAllCategories(),
                  projectService.getFeaturedProjects(),
                  serviceService.getAllServices(),
                  contactService.getContactDetails()
            ]);

            if (hero.status === "rejected") throw hero.reason;
            if (about.status === "rejected") throw about.reason;

            const data = {
                  hero: hero.value,
                  about: about.value,
                  education: education.status === "fulfilled" ? education.value : [],
                  skills: skills.status === "fulfilled" ? skills.value : [],
                  featuredProjects: featuredProjects.status === "fulfilled" ? featuredProjects.value : [],
                  services: services.status === "fulfilled" ? services.value : [],
                  contact: contact.status === "fulfilled" ? contact.value : null,
            };

            sendSuccess(res, "Public data retrieved successfully", data);
      });
};

export default new PublicController();