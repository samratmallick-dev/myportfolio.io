import axios from 'axios';

const envBaseUrl = import.meta.env.VITE_BASE_URL;
const API_BASE_URL = envBaseUrl ? (envBaseUrl.startsWith('http') ? envBaseUrl : `http://localhost:${envBaseUrl}`) : 'http://localhost:8000';

const api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
            'Content-Type': 'application/json',
      },
      withCredentials: true, 
});

// Admin authentication endpoints
export const adminAuthEndpoints = {
      login: '/api/v1/admin/login',
      logout: '/api/v1/admin/logout',
      checkAuth: '/api/v1/admin/get-admin-user',
      generateOTP: '/api/v1/admin/generate-otp',
      verifyOTPUpdateEmail: '/api/v1/admin/verify-otp-update-email',
      verifyOTPUpdatePassword: '/api/v1/admin/verify-otp-update-password',
};

// Admin Api function
export const loginAdmin = async (credentials) => {
      try {
            const response = await api.post(adminAuthEndpoints.login, credentials);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const logoutAdmin = async () => {
      try {
            const response = await api.post(adminAuthEndpoints.logout);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const checkAdminAuth = async () => {
      try {
            const response = await api.get(adminAuthEndpoints.checkAuth);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const generateOTP = async (data) => {
      const res = await api.post(adminAuthEndpoints.generateOTP, data);
      return res.data;
};


export const verifyOTPAndUpdateEmail = async (data) => {
      try {
            const response = await api.post(adminAuthEndpoints.verifyOTPUpdateEmail, data);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const verifyOTPAndUpdatePassword = async (data) => {
      try {
            const response = await api.post(adminAuthEndpoints.verifyOTPUpdatePassword, data);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

// Hero endpoints
export const heroEndpoints = {
      addUpdateHero: '/api/v1/hero/add-and-update-hero-content',
      getHeroContent: '/api/v1/hero/get-hero-content',
      getHeroById: '/api/v1/hero/get-hero-content/:id',
      updateHeroById: '/api/v1/hero/update-hero-content/:id',
      deleteHeroById: '/api/v1/hero/delete-hero-content/:id',
      getAllHeroContent: '/api/v1/hero/get-all-hero-content',
};

// Hero API functions
export const fetchHeroData = async () => {
      try {
            const response = await api.get(heroEndpoints.getHeroContent);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const fetchHeroById = async (id) => {
      try {
            const response = await api.get(heroEndpoints.getHeroById.replace(':id', id));
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const addOrUpdateHero = async (formData) => {
      try {
            const response = await api.post(heroEndpoints.addUpdateHero, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const updateHeroById = async (id, formData) => {
      try {
            const response = await api.put(heroEndpoints.updateHeroById.replace(':id', id), formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const deleteHeroById = async (id) => {
      try {
            const response = await api.delete(heroEndpoints.deleteHeroById.replace(':id', id));
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const fetchAllHeroData = async () => {
      try {
            const response = await api.get(heroEndpoints.getAllHeroContent);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

// About endpoints
export const aboutEndpoints = {
      addUpdateAbout: '/api/v1/about/add-and-update-about-content',
      getAboutContent: '/api/v1/about/get-about-content',
      getAboutById: '/api/v1/about/get-about-content/:id',
      updateAboutById: '/api/v1/about/update-about-content/:id',
      deleteAboutById: '/api/v1/about/delete-about-content/:id',
      getAllAboutContent: '/api/v1/about/get-all-about-content',
};

// About API functions
export const fetchAboutData = async () => {
      try {
            const response = await api.get(aboutEndpoints.getAboutContent);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const fetchAboutById = async (id) => {
      try {
            const response = await api.get(aboutEndpoints.getAboutById.replace(':id', id));
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const addOrUpdateAbout = async (formData) => {
      try {
            const response = await api.post(aboutEndpoints.addUpdateAbout, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const updateAboutById = async (id, formData) => {
      try {
            const response = await api.put(aboutEndpoints.updateAboutById.replace(':id', id), formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const deleteAboutById = async (id) => {
      try {
            const response = await api.delete(aboutEndpoints.deleteAboutById.replace(':id', id));
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const fetchAllAboutData = async () => {
      try {
            const response = await api.get(aboutEndpoints.getAllAboutContent);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

// Education endpoints
export const educationEndpoints = {
      createEducation: '/api/v1/education/create-education-details',
      getAllEducation: '/api/v1/education/get-all-education-details',
      getEducationById: '/api/v1/education/get-education-details/:id',
      updateEducationById: '/api/v1/education/update-education-details/:id',
      deleteEducationById: '/api/v1/education/delete-education-details/:id',
      getAllEducationAdmin: '/api/v1/education/get-all-education-admin',
      getLatestEducation: '/api/v1/education/get-latest-education',
};

// Education API functions
export const fetchAllEducation = async () => {
      try {
            const response = await api.get(educationEndpoints.getAllEducation);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const fetchEducationById = async (id) => {
      try {
            const response = await api.get(educationEndpoints.getEducationById.replace(':id', id));
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const createEducation = async (educationData) => {
      try {
            const response = await api.post(educationEndpoints.createEducation, educationData);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const updateEducationById = async (id, educationData) => {
      try {
            const response = await api.put(educationEndpoints.updateEducationById.replace(':id', id), educationData);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const deleteEducationById = async (id) => {
      try {
            const response = await api.delete(educationEndpoints.deleteEducationById.replace(':id', id));
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const fetchAllEducationAdmin = async () => {
      try {
            const response = await api.get(educationEndpoints.getAllEducationAdmin);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const fetchLatestEducation = async () => {
      try {
            const response = await api.get(educationEndpoints.getLatestEducation);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

// Skill endpoints
export const skillEndpoints = {
      createCategory: '/api/v1/skills/create-category',
      getAllCategories: '/api/v1/skills/get-all-categories',
      getCategoryById: '/api/v1/skills/get-category/:id',
      addSkill: '/api/v1/skills/add-skill/:id',
      updateSkill: '/api/v1/skills/update-skill/:categoryId/:skillId',
      deleteCategory: '/api/v1/skills/delete-category/:id',
      deleteSkill: '/api/v1/skills/delete-skill/:categoryId/:skillId',
};

// Skill API functions
export const createSkillCategory = async (categoryData) => {
      const response = await api.post(skillEndpoints.createCategory, categoryData);
      return response.data;
};

export const fetchAllSkillCategories = async () => {
      const response = await api.get(skillEndpoints.getAllCategories);
      return response.data;
};

export const addSkillToCategory = async (categoryId, skillData) => {
      const response = await api.post(skillEndpoints.addSkill.replace(':id', categoryId), skillData);
      return response.data;
};

export const updateSkillInCategory = async (categoryId, skillId, skillData) => {
      const response = await api.put(skillEndpoints.updateSkill.replace(':categoryId', categoryId).replace(':skillId', skillId), skillData);
      return response.data;
};

export const deleteSkillCategory = async (categoryId) => {
      const response = await api.delete(skillEndpoints.deleteCategory.replace(':id', categoryId));
      return response.data;
};

export const deleteSkillFromCategory = async (categoryId, skillId) => {
      const response = await api.delete(skillEndpoints.deleteSkill.replace(':categoryId', categoryId).replace(':skillId', skillId));
      return response.data;
};

// Project endpoints
export const projectEndpoints = {
      createProject: '/api/v1/projects/create-project',
      getAllProjects: '/api/v1/projects/get-all-projects',
      getProjectById: '/api/v1/projects/get-project/:id',
      updateProjectById: '/api/v1/projects/update-project/:id',
      deleteProjectById: '/api/v1/projects/delete-project/:id',
      getAllProjectsAdmin: '/api/v1/projects/get-all-projects-admin',
      getFeaturedProjects: '/api/v1/projects/get-featured-projects',
      setFeaturedProject: '/api/v1/projects/set-featured-project/:id',
};

// Project API functions
export const fetchAllProjects = async () => {
      const response = await api.get(projectEndpoints.getAllProjects);
      return response.data;
};

export const fetchProjectById = async (id) => {
      const response = await api.get(projectEndpoints.getProjectById.replace(':id', id));
      return response.data;
};

export const createProject = async (projectData) => {
      const response = await api.post(projectEndpoints.createProject, projectData);
      return response.data;
};

export const updateProjectById = async (id, projectData) => {
      const response = await api.put(projectEndpoints.updateProjectById.replace(':id', id), projectData);
      return response.data;
};

export const deleteProjectById = async (id) => {
      const response = await api.delete(projectEndpoints.deleteProjectById.replace(':id', id));
      return response.data;
};

export const fetchAllProjectsAdmin = async () => {
      const response = await api.get(projectEndpoints.getAllProjectsAdmin);
      return response.data;
};

export const fetchFeaturedProjects = async () => {
      const response = await api.get(projectEndpoints.getFeaturedProjects);
      return response.data;
};

export const setFeaturedProject = async (id, isFeatured) => {
      const response = await api.patch(projectEndpoints.setFeaturedProject.replace(':id', id), { isFeatured });
      return response.data;
};

// Request interceptor to add auth token if available
api.interceptors.request.use(
      (config) => {
            const token = localStorage.getItem('adminToken');
            // console.log('Request interceptor - Token:', token);
            // console.log('Request interceptor - URL:', config.url);
            // console.log('Request interceptor - Method:', config.method);
            if (token) {
                  config.headers.Authorization = `Bearer ${token}`;
                  // console.log('Request interceptor - Headers:', config.headers);
            }
            return config;
      },
      (error) => {
            return Promise.reject(error);
      }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
      (response) => response,
      (error) => {
            console.log('Response interceptor - Error:', error);
            console.log('Response interceptor - Error response:', error.response);
            console.log('Response interceptor - Status:', error.response?.status);
            console.log('Response interceptor - Data:', error.response?.data);
            if (error.response?.status === 401) {
                  // Token expired or invalid, clear local storage
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminUser');
                  // Redirect to login page could be handled here or in the auth slice
            }
            return Promise.reject(error);
      }
);

export default api;
