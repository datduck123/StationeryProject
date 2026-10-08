import axios from "axios";

export const API_BASE_URL = "http://localhost:8080/api";
export const TOKEN_STORAGE_KEY = "stationery_jwt_token";
export const USER_STORAGE_KEY = "stationery_clinic_auth_user";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle token expiration / unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response && response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      // Only redirect if not already on login or public page
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/forgot-password")
      ) {
        window.location.href = "/login?sessionExpired=true";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
