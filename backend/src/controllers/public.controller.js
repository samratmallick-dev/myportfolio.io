import { asyncHandler } from "../utilities/error/asyncHandler.js";
import { sendSuccess, sendPaginated } from "../utilities/response/apiResponse.js";
import heroService from "../service/hero.service.js";
import aboutService from "../service/about.service.js";
import educationService from "../service/education.service.js";
import skillService from "../service/skill.service.js";
import projectService from "../service/project.service.js";
import serviceService from "../service/service.service.js";
import contactService from "../service/contact.service.js";

/**
 * Public content sections are optional. A missing document should not turn
 * the whole section endpoint into a 500/404 that then gets cached.
 */
const optional = async (promise, fallback) => {
      try {
            return await promise;
      } catch (error) {
            if (error?.statusCode === 404) return fallback;
            throw error;
      }
};

class PublicController {
      // Kept for backward compatibility. New clients should call the
      // lightweight section endpoints below.
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

      getHero = asyncHandler(async (req, res) => {
            const hero = await optional(heroService.getPublicHeroContent(), null);
            sendSuccess(res, "Hero content retrieved successfully", hero);
      });

      getAbout = asyncHandler(async (req, res) => {
            const about = await optional(aboutService.getPublicAboutContent(), null);
            sendSuccess(res, "About content retrieved successfully", about);
      });

      getEducation = asyncHandler(async (req, res) => {
            const education = await educationService.getPublicEducation();
            sendSuccess(res, "Education retrieved successfully", education);
      });

      getSkills = asyncHandler(async (req, res) => {
            const skills = await skillService.getPublicCategories();
            sendSuccess(res, "Skills retrieved successfully", skills);
      });

      getFeaturedProjects = asyncHandler(async (req, res) => {
            const projects = await projectService.getPublicFeaturedProjects();
            sendSuccess(res, "Featured projects retrieved successfully", projects);
      });

      getProjects = asyncHandler(async (req, res) => {
            const { items, pagination } = await projectService.getPublicProjectsPage(req.query);
            sendPaginated(res, "Projects retrieved successfully", items, pagination);
      });

      getServices = asyncHandler(async (req, res) => {
            const services = await serviceService.getPublicServices();
            sendSuccess(res, "Services retrieved successfully", services);
      });

      getContact = asyncHandler(async (req, res) => {
            const contact = await optional(contactService.getPublicContactDetails(), null);
            sendSuccess(res, "Contact details retrieved successfully", contact);
      });
}

export default new PublicController();
