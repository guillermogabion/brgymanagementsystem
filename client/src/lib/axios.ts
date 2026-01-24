import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:5000/api',
  baseURL: 'http://brgymanagementsystem-api/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ADD THIS INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get the token saved during login
    if (token) {
      // Attach the token to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// OPTIONAL: Global error handler for "Token Expired"
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If the token is invalid or expired, log the user out
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;