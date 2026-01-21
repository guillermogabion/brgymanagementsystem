import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your Node.js backend URL
//   baseURL: 'http://192.168.1.15:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;