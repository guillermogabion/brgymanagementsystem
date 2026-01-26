import api from '../lib/axios';


export interface User {
  id: number;
  username: string;
  role: string;
  designation?: string;
  email?: string;
  pic?: string;
}

export const userService = {
  // GET the currently logged-in user profile
  getMe: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },
};
export const authService = {
  login: async (credentials: any) => {
    const response = await api.post(`users/login`, credentials);
    return response.data; 
  },
};

