import axios from 'axios';

// Detect host for local development. Default to port 8000 if not specified.
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Standard fallback to localhost PHP dev server
  return 'http://localhost:8000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careerbridge_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // For multipart uploads, let Axios determine the boundary headers automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch Unauthorized codes
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear credentials
      localStorage.removeItem('careerbridge_token');
      localStorage.removeItem('careerbridge_user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { getApiBaseUrl };
