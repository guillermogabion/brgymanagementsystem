import api from '../lib/axios';

export interface Resident {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  purok: string;
  houseNumber: string;
  phoneNumber: string;
  isIndigent: string;
  isSeniorCitizen: string;
  createdAt?: string;
}

export interface PaginatedResidents {
  data: Resident[];
  total: number;
  pages: number;
  currentPage: number;
}

export const residentService = {
  // GET all users
//   getAll: async (): Promise<User[]> => {
//     const response = await api.get('/users');
//     return response.data;
//   },
    getAll: async (page: number, limit: number, search: string) => {
        const res = await api.get(`/residents`, { params: { page, limit, search } });
        return res.data; // This is the object with { data, total, pages }
    },

  

  // GET one user
  getById: async (id: number): Promise<Resident> => {
    const response = await api.get(`/residents/${id}`);
    return response.data;
  },

  // CREATE user
  create: async (residentData: Omit<Resident, 'id'>) => {

    // return console.log(residentData, 'test');
    const response = await api.post('/residents', residentData);
    return response.data;
  },

  // UPDATE user
  update: async (id: number, residentData: Partial<Resident>) => {
    const response = await api.put(`/residents/${id}`, residentData);
    return response.data;
  },

  // DELETE user
  delete: async (id: number) => {
    const response = await api.delete(`/residents/${id}`);
    return response.data;
  }
};