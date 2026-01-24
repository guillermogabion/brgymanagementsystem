import api from '../lib/axios';

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post(`users/login`, credentials);
    return response.data; 
  },
};