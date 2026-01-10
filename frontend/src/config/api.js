export const SummeryApi = {
      // Admin User
      initializeAdminUrl: "/api/v1/admin/initialize",
      loginUrl: "/api/v1/admin/login",
      generateOtpUrl: "/api/v1/admin/generate-otp",
      verifyOtpUpdateEmailUrl: "/api/v1/admin/verify-otp-update-email",
      verifyOtpUpdatePasswordUrl: "/api/v1/admin/verify-otp-update-password",
      getAdminUserUrl: "/api/v1/admin/get-admin-user",
      logoutUrl: "/api/v1/admin/logout",

      // Hero
      addUpdateHeroContentUrl: "/api/v1/hero/add-and-update-hero-content",
      getHeroContentUrl: "/api/v1/hero/get-hero-content",

      // About
      addUpdateAboutContentUrl: "/api/v1/about/add-and-update-about-content",
      getAboutContentUrl: "/api/v1/about/get-about-content",

      // Contact (Details + Contact Me)
      addUpdateContactDetailsUrl: "/api/v1/contact/add-update-contact-details",
      getContactDetailsUrl: "/api/v1/contact/get-contact-details",
      sendMessageUrl: "/api/v1/contact/send-message",
      getAllMessagesUrl: "/api/v1/contact/get-all-messages",
      getMessageUrl: (messageId) => `/api/v1/contact/get-message/${messageId}`,
      deleteMessageUrl: (messageId) => `/api/v1/contact/delete-message/${messageId}`,

      // Education
      createEducationUrl: "/api/v1/education/create-education-details",
      getAllEducationUrl: "/api/v1/education/get-all-education-details",
      getEducationUrl: (id) => `/api/v1/education/get-education-details/${id}`,
      updateEducationUrl: (id) => `/api/v1/education/update-education-details/${id}`,
      deleteEducationUrl: (id) => `/api/v1/education/delete-education-details/${id}`,

      // Projects
      createProjectUrl: "/api/v1/projects/add-project",
      getAllProjectsUrl: "/api/v1/projects/get-all-projects",
      getProjectUrl: (projectId) => `/api/v1/projects/get-project/${projectId}`,
      updateProjectUrl: (projectId) => `/api/v1/projects/update-project/${projectId}`,
      deleteProjectUrl: (projectId) => `/api/v1/projects/delete-project/${projectId}`,
      getFeaturedProjectsUrl: "/api/v1/projects/get-featured-projects",
      setFeaturedProjectsUrl: "/api/v1/projects/set-featured-projects",

      // Services
      createServiceUrl: "/api/v1/services/create-services",
      getAllServicesUrl: "/api/v1/services/get-all-services",
      getServiceUrl: (servicesId) => `/api/v1/services/get-services/${servicesId}`,
      updateServiceUrl: (servicesId) => `/api/v1/services/update-services/${servicesId}`,
      deleteServiceUrl: (servicesId) => `/api/v1/services/delete-services/${servicesId}`,

      // Skills
      createSkillCategoryUrl: "/api/v1/skills/create-skill-category",
      getAllSkillCategoriesUrl: "/api/v1/skills/get-all-skill-categories",
      getSkillCategoryUrl: (id) => `/api/v1/skills/get-skill-categories/${id}`,
      deleteSkillCategoryUrl: (id) => `/api/v1/skills/delete-skill-category/${id}`,
      addSkillToCategoryUrl: (categoryId) => `/api/v1/skills/add-skill-to-category/${categoryId}`,
      updateSkillInCategoryUrl: (categoryId, skillId) => `/api/v1/skills/update-skill-in-category/${categoryId}/${skillId}`,
      deleteSkillFromCategoryUrl: (categoryId, skillId) => `/api/v1/skills/delete-skill-from-category/${categoryId}/${skillId}`
};
