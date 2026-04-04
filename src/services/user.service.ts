import { api } from './api';

export const userService = {
  createEmployee: async (data: { email: string; full_name: string; password: string; role: string }) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  getEmployees: async () => {
    const response = await api.get('/users');
    return response.data;
  }
};
