import axios from 'axios';
import toast from 'react-hot-toast';
import { surveyApi } from '../features/surveys/api/surveyApi';
import { responseApi } from '../features/responses/api/responseApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('survey_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle error notifications
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized on protected endpoint, remove stale token
    if (error.response?.status === 401) {
      localStorage.removeItem('survey_auth_token');
      localStorage.removeItem('survey_auth_user');
    }

    const errorMsg =
      error.response?.data?.message ||
      (error.response?.data?.errors && error.response.data.errors[0]?.message) ||
      error.message ||
      'An unexpected error occurred';

    // Don't show toast for 404s if handled locally
    if (error.response?.status !== 404) {
      toast.error(errorMsg);
    }
    return Promise.reject(error);
  }
);

export { surveyApi, responseApi };
export default apiClient;
