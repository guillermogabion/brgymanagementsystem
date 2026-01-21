import api from '../lib/axios';

export interface User {
  id: number;
  username: string;
  role: string;
  password?: string; // Optional because we don't always fetch/send it
  createdAt?: string;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  pages: number;
  currentPage: number;
}

export const userService = {
  // GET all users
//   getAll: async (): Promise<User[]> => {
//     const response = await api.get('/users');
//     return response.data;
//   },
    getAll: async (page: number, limit: number, search: string) => {
        const res = await api.get(`/users`, { params: { page, limit, search } });
        return res.data; // This is the object with { data, total, pages }
    },

  

  // GET one user
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // CREATE user
  create: async (userData: Omit<User, 'id'>) => {

    // return console.log(userData, 'test');
    const response = await api.post('/users', userData);
    return response.data;
  },

  // UPDATE user
  update: async (id: number, userData: Partial<User>) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // DELETE user
  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};