import axios from 'axios';

// Handle different environment variable formats
const envBaseUrl = import.meta.env.VITE_BASE_URL;
const API_BASE_URL = envBaseUrl
      ? (envBaseUrl.startsWith('http') ? envBaseUrl : `http://localhost:${envBaseUrl}`)
      : 'http://localhost:8000';

console.log('Environment VITE_BASE_URL:', envBaseUrl);
console.log('Final API Base URL:', API_BASE_URL);

// Create axios instance with default configuration
const api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
            'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for cookies if using session-based auth
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

// Admin login API function
export const loginAdmin = async (credentials) => {
      try {
            const response = await api.post(adminAuthEndpoints.login, credentials);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

// Admin logout API function
export const logoutAdmin = async () => {
      try {
            const response = await api.post(adminAuthEndpoints.logout);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

// Check admin authentication status
export const checkAdminAuth = async () => {
      try {
            const response = await api.get(adminAuthEndpoints.checkAuth);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

// Generate OTP for email/password update
export const generateOTP = async (data) => {
      const res = await api.post(adminAuthEndpoints.generateOTP, data);
      return res.data;
};


// Verify OTP and update email
export const verifyOTPAndUpdateEmail = async (data) => {
      try {
            const response = await api.post(adminAuthEndpoints.verifyOTPUpdateEmail, data);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

// Verify OTP and update password
export const verifyOTPAndUpdatePassword = async (data) => {
      try {
            const response = await api.post(adminAuthEndpoints.verifyOTPUpdatePassword, data);
            return response.data;
      } catch (error) {
            throw error.response?.data || error;
      }
};

// Request interceptor to add auth token if available
api.interceptors.request.use(
      (config) => {
            const token = localStorage.getItem('adminToken');
            console.log('Request interceptor - Token:', token);
            console.log('Request interceptor - URL:', config.url);
            console.log('Request interceptor - Method:', config.method);
            if (token) {
                  config.headers.Authorization = `Bearer ${token}`;
                  console.log('Request interceptor - Headers:', config.headers);
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
