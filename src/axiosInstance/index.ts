// Import Axios
import axios from 'axios';
import { baseClockifyURL } from './constants';

// Create an Axios instance with default configurations
const api = axios.create({
  baseURL: baseClockifyURL , // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': 'M2ZjOTJiZmEtMmNkOS00ZjkzLWI4NjItOWJmZDIyYzUxNjQy',
  },
  // Add other configurations as needed
});

// Interceptors to handle requests and responses
api.interceptors.request.use(
  (config) => {
    // Example: Add authorization token to headers if needed
    const token = localStorage.getItem('authToken'); // or from store/session
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally (e.g., show error messages)
    if (error.response && error.response.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
    }
    return Promise.reject(error);
  }
);

export default api;
