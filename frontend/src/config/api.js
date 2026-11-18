import axios from 'axios';
import { createHttpCache, sectionForUrl, isPublicUrl, ALL_SECTIONS } from '@/utils/httpCache';
import { SECTIONS, publishSectionUpdate, getRecentServerVersion, markLocalMutation } from '@/utils/sectionCache';

const API_BASE_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_BASE_URL_LOCAL || "http://localhost:8000") : import.meta.env.VITE_API_BASE_URL;

const authBridge = {
      getAccessToken: () => null,
      refreshSession: () => Promise.reject(new Error("Authentication bridge is not configured")),
      onAuthFailure: () => {},
};

export const configureAuthApi = ({
      getAccessToken,
      refreshSession,
      onAuthFailure,
} = {}) => {
      if (typeof getAccessToken === "function") authBridge.getAccessToken = getAccessToken;
      if (typeof refreshSession === "function") authBridge.refreshSession = refreshSession;
      if (typeof onAuthFailure === "function") authBridge.onAuthFailure = onAuthFailure;
};

export const getAccessToken = () => authBridge.getAccessToken();


const httpCache = createHttpCache({ maxEntries: 120 });

const getCacheKey = (config) => {
      const url = config.url || "";
      const params = config.params ? JSON.stringify(config.params) : "";
      return `${config.baseURL || ""}:${config.method}:${url}?${params}`;
};

const isCacheableUrl = (config) =>
      config.cache === true || isPublicUrl(config.url || "");

const api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
            'Content-Type': 'application/json',
      },
      withCredentials: true,
      timeout: 15000,
      maxRedirects: 5,
      maxContentLength: 50 * 1024 * 1024,
});

export const clearClientCache = () => {
      httpCache.clear();
};

export const invalidateSectionHttpCache = (section = ALL_SECTIONS) => {
      if (section === undefined) return 0;
      return httpCache.invalidate(section);
};

const notifyMutationPersisted = (config) => {
      const section = sectionForUrl(config.url || "");
      if (section === undefined) return;

      httpCache.invalidate(section);

      const targets = section === ALL_SECTIONS ? SECTIONS : [section];
      const mutationStartedAt = config.__mutationStartedAt || 0;

      targets.forEach((target) => {
            markLocalMutation(target);
            const version = getRecentServerVersion(target, mutationStartedAt) ?? Date.now();
            publishSectionUpdate({ section: target, version });
      });
};

const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

api.defaults.adapter = async (config) => {
      const method = (config.method || 'get').toLowerCase();

      if (method !== 'get') {
            config.__mutationStartedAt = Date.now();
            const response = await defaultAdapter(config);

            if (response.status >= 200 && response.status < 300) {
                  notifyMutationPersisted(config);
            }
            return response;
      }

      const key = getCacheKey(config);
      const url = config.url || '';
      const section = sectionForUrl(url);
      const cacheSection = isPublicUrl(url) ? (section ?? ALL_SECTIONS) : section;

      const allowCacheWrite = isCacheableUrl(config);
      const allowCacheRead = allowCacheWrite && config.cache !== false;
      const allowDedupe = config.cache !== false;

      const seq = httpCache.captureSeq(cacheSection);
      const ttl = config.ttl || 5 * 60 * 1000;

      if (allowCacheRead) {
            const cached = httpCache.get(key);
            if (cached !== undefined) {
                  return {
                        data: cached,
                        status: 200,
                        statusText: 'OK',
                        headers: { 'x-client-cache': 'HIT' },
                        config,
                  };
            }
      }

      if (allowDedupe) {
            const pendingRequest = httpCache.getPending(key);
            if (pendingRequest) {
                  const response = await pendingRequest;
                  return {
                        ...response,
                        config,
                  };
            }
      }

      const requestPromise = defaultAdapter(config);
      if (allowDedupe) {
            httpCache.setPending(key, { promise: requestPromise, section: cacheSection, seq });
      }

      try {
            const response = await requestPromise;
            if (allowCacheWrite && response.status >= 200 && response.status < 300) {
                  httpCache.set(key, {
                        data: response.data,
                        section: cacheSection,
                        seq,
                        ttl,
                  });
            }
            return response;
      } finally {
            if (allowDedupe) httpCache.deletePending(key);
      }
};

export const publicEndpoints = {
      initialData: '/api/v1/public/initial-data',
      hero: '/api/v1/public/hero',
      about: '/api/v1/public/about',
      education: '/api/v1/public/education',
      skills: '/api/v1/public/skills',
      featuredProjects: '/api/v1/public/featured-projects',
      projects: '/api/v1/public/projects',
      services: '/api/v1/public/services',
      contact: '/api/v1/public/contact',
};

const getPublicData = async (url, { signal, params, ttl = 5 * 60 * 1000, cache = true } = {}) => {
      try {
            const response = await api.get(url, {
                  signal,
                  params,
                  cache,
                  ttl,
                  timeout: 10000,
            });
            return response.data?.data ?? response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const fetchPublicInitialData = async () => ({
      data: await getPublicData(publicEndpoints.initialData, { ttl: 5 * 60 * 1000 }),
});

export const fetchPublicHero = ({ signal, cache = true } = {}) =>
      getPublicData(publicEndpoints.hero, { signal, cache, ttl: 2 * 60 * 1000 });

export const fetchPublicAbout = ({ signal, cache = true } = {}) =>
      getPublicData(publicEndpoints.about, { signal, cache });

export const fetchPublicEducation = ({ signal, cache = true } = {}) =>
      getPublicData(publicEndpoints.education, { signal, cache });

export const fetchPublicSkills = ({ signal, cache = true } = {}) =>
      getPublicData(publicEndpoints.skills, { signal, cache });

export const fetchPublicFeaturedProjects = ({ signal, cache = true } = {}) =>
      getPublicData(publicEndpoints.featuredProjects, { signal, cache, ttl: 2 * 60 * 1000 });

export const fetchPublicProjects = async ({ page = 1, limit = 9, signal, cache = true } = {}) => {
      const data = await getPublicData(publicEndpoints.projects, {
            signal,
            params: { page, limit },
            cache,
            ttl: 60 * 1000,
      });
      return {
            items: Array.isArray(data?.items) ? data.items : [],
            pagination: data?.pagination || { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
};

export const fetchPublicServices = ({ signal, cache = true } = {}) =>
      getPublicData(publicEndpoints.services, { signal, cache });

export const fetchPublicContact = ({ signal, cache = true } = {}) =>
      getPublicData(publicEndpoints.contact, { signal, cache });

export const adminAuthEndpoints = {
      login: '/api/v1/admin/login',
      refresh: '/api/v1/admin/refresh',
      logout: '/api/v1/admin/logout',
      logoutAll: '/api/v1/admin/logout-all',
      me: '/api/v1/admin/me',
      sessions: '/api/v1/admin/sessions',
      revokeSession: '/api/v1/admin/sessions/:id',
      changePassword: '/api/v1/admin/change-password',
      createAdmin: '/api/v1/admin/create',
      checkAuth: '/api/v1/admin/me',
      generateOTP: '/api/v1/admin/generate-otp',
      verifyOTPUpdateEmail: '/api/v1/admin/verify-otp-update-email',
      verifyOTPUpdatePassword: '/api/v1/admin/verify-otp-update-password',
};

const AUTH_URLS_SKIP_INTERCEPTOR = [
      adminAuthEndpoints.login,
      adminAuthEndpoints.refresh,
      adminAuthEndpoints.logout,
      adminAuthEndpoints.logoutAll,
];

const unwrapAuth = async (request) => {
      try {
            const response = await request;
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

// --- Authentication API ----------------------------------------------------

export const loginAdmin = (credentials) =>
      unwrapAuth(api.post(adminAuthEndpoints.login, credentials));

export const refreshAdminSession = () =>
      unwrapAuth(api.post(adminAuthEndpoints.refresh, undefined, { cache: false }));

export const logoutAdmin = () =>
      unwrapAuth(api.post(adminAuthEndpoints.logout, undefined, { cache: false }));

export const logoutAllAdminSessions = () =>
      unwrapAuth(api.post(adminAuthEndpoints.logoutAll, undefined, { cache: false }));

export const checkAdminAuth = () =>
      unwrapAuth(api.get(adminAuthEndpoints.me, { cache: false }));

export const fetchAdminSessions = () =>
      unwrapAuth(api.get(adminAuthEndpoints.sessions, { cache: false }));

export const revokeAdminSession = (sessionId) =>
      unwrapAuth(
            api.delete(
                  adminAuthEndpoints.revokeSession.replace(':id', encodeURIComponent(sessionId)),
                  { cache: false }
            )
      );

export const changeAdminPassword = (payload) =>
      unwrapAuth(api.patch(adminAuthEndpoints.changePassword, payload, { cache: false }));

export const createAdminAccount = (payload) =>
      unwrapAuth(api.post(adminAuthEndpoints.createAdmin, payload, { cache: false }));

export const generateOTP = async (data) => {
      try {
            const res = await api.post(adminAuthEndpoints.generateOTP, data, {
                  timeout: 50000 
            });
            return res.data;
      } catch (error) {
            throw error.response?.data || error;
      }
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
      getProjectBySlug: '/api/v1/projects/:slug',
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

export const fetchProjectBySlug = async (slug) => {
      const response = await api.get(projectEndpoints.getProjectBySlug.replace(':slug', slug));
      return response.data;
};

export const createProject = async (formData) => {
      const response = await api.post(projectEndpoints.createProject, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
};

export const updateProjectById = async (id, formData) => {
      const response = await api.put(projectEndpoints.updateProjectById.replace(':id', id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
      });
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

// Service endpoints
export const serviceEndpoints = {
      createService: '/api/v1/services/create-services',
      getAllServices: '/api/v1/services/get-all-services',
      getServiceById: '/api/v1/services/get-services/:id',
      updateServiceById: '/api/v1/services/update-services/:id',
      deleteServiceById: '/api/v1/services/delete-services/:id',
      getAllServicesAdmin: '/api/v1/services/get-all-services-admin',
};

// Service API functions
export const fetchAllServices = async () => {
      const response = await api.get(serviceEndpoints.getAllServices);
      return response.data;
};

export const fetchServiceById = async (id) => {
      const response = await api.get(serviceEndpoints.getServiceById.replace(':id', id));
      return response.data;
};

export const createService = async (serviceData) => {
      const response = await api.post(serviceEndpoints.createService, serviceData);
      return response.data;
};

export const updateServiceById = async (id, serviceData) => {
      const response = await api.put(serviceEndpoints.updateServiceById.replace(':id', id), serviceData);
      return response.data;
};

export const deleteServiceById = async (id) => {
      const response = await api.delete(serviceEndpoints.deleteServiceById.replace(':id', id));
      return response.data;
};

export const fetchAllServicesAdmin = async () => {
      const response = await api.get(serviceEndpoints.getAllServicesAdmin);
      return response.data;
};

// Contact endpoints
export const contactEndpoints = {
      addUpdateContactDetails: '/api/v1/contact/add-update-contact-details',
      getContactDetails: '/api/v1/contact/get-contact-details',
      updateContactDetails: '/api/v1/contact/update-contact-details/:id',
      sendMessage: '/api/v1/contact/send-message',
      getAllMessages: '/api/v1/contact/get-all-messages',
      getMessageById: '/api/v1/contact/get-message/:messageId',
      deleteMessage: '/api/v1/contact/delete-message/:messageId',
      markAsRead: '/api/v1/contact/mark-as-read/:messageId',
      getUnreadCount: '/api/v1/contact/get-unread-count',
      getAllMessagesAdmin: '/api/v1/contact/get-all-messages-admin',
};

// Contact API functions
export const fetchContactDetails = async () => {
      try {
            const response = await api.get(contactEndpoints.getContactDetails);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const addOrUpdateContactDetails = async (formData) => {
      try {
            const response = await api.post(contactEndpoints.addUpdateContactDetails, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const updateContactDetails = async (id, formData) => {
      try {
            const response = await api.put(contactEndpoints.updateContactDetails.replace(':id', id), formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const sendContactMessage = async (messageData) => {
      try {
            const response = await api.post(contactEndpoints.sendMessage, messageData, {
                  timeout: 10000, 
            });
            return response.data;
      } catch (error) {
            console.error('sendContactMessage API error:', error);
            if (error.code === 'ECONNABORTED') {
                  throw new Error('Request timeout. Please try again.');
            }
            if (error.response?.status === 500) {
                  throw new Error(error.response?.data?.message || 'Server error. Please try again later.');
            }
            throw error.response?.data || error;
      }
};

export const fetchAllMessages = async () => {
      try {
            const response = await api.get(contactEndpoints.getAllMessages);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const fetchMessageById = async (messageId) => {
      try {
            const response = await api.get(contactEndpoints.getMessageById.replace(':messageId', messageId));
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const deleteMessage = async (messageId) => {
      try {
            const response = await api.delete(contactEndpoints.deleteMessage.replace(':messageId', messageId));
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const markMessageAsRead = async (messageId) => {
      try {
            const response = await api.put(contactEndpoints.markAsRead.replace(':messageId', messageId));
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const fetchUnreadCount = async () => {
      try {
            const response = await api.get(contactEndpoints.getUnreadCount);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

export const fetchAllMessagesAdmin = async () => {
      try {
            const response = await api.get(contactEndpoints.getAllMessagesAdmin);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

api.interceptors.request.use(
      (config) => {
            const token = authBridge.getAccessToken();
            if (token && !config.__skipAuthHeader) {
                  config.headers = config.headers || {};
                  if (typeof config.headers.set === "function") {
                        config.headers.set('Authorization', `Bearer ${token}`);
                  } else {
                        config.headers.Authorization = `Bearer ${token}`;
                  }
            }
            return config;
      },
      (error) => {
            console.error('Request interceptor error:', error);
            return Promise.reject(error);
      }
);

let refreshInFlight = null;

const refreshOnce = () => {
      if (!refreshInFlight) {
            refreshInFlight = Promise.resolve()
                  .then(() => authBridge.refreshSession())
                  .finally(() => {
                        refreshInFlight = null;
                  });
      }
      return refreshInFlight;
};

const redirectToLogin = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname || '';
      if (path.startsWith('/auth/login')) return;
      window.location.assign('/auth/login');
};

api.interceptors.response.use(
      (response) => response,
      async (error) => {
            if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
                  return Promise.reject(error);
            }

            const config = error.config || {};
            const status = error.response?.status;
            const url = String(config.url || '');
            const isPublicRequest = url.includes('/public/');
            const isAuthRequest = AUTH_URLS_SKIP_INTERCEPTOR.some((endpoint) => url.includes(endpoint));

            const canAttemptRefresh =
                  status === 401 &&
                  !config.__retriedAfterRefresh &&
                  !isPublicRequest &&
                  !isAuthRequest;

            if (canAttemptRefresh) {
                  config.__retriedAfterRefresh = true;

                  try {
                        await refreshOnce();
                        const token = authBridge.getAccessToken();

                        if (token) {
                              config.headers = config.headers || {};
                              if (typeof config.headers.set === 'function') {
                                    config.headers.set('Authorization', `Bearer ${token}`);
                              } else {
                                    config.headers.Authorization = `Bearer ${token}`;
                              }
                              return api(config);
                        }
                  } catch {
                        // The refresh failed: the session is gone.
                        authBridge.onAuthFailure();
                        redirectToLogin();
                        return Promise.reject(error);
                  }
            }

            if (status === 401 && !isPublicRequest && !isAuthRequest) {
                  authBridge.onAuthFailure();
                  redirectToLogin();
            }

            console.error('API Response Error:', {
                  status,
                  message: error.response?.data?.message || error.message,
                  url,
            });

            if (!error.response) {
                  console.error('Network error - no response received');
                  error.message = 'Network error. Please check your internet connection.';
            }

            return Promise.reject(error);
      }
);

export default api;