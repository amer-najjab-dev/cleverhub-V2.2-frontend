import { api } from './api';

export interface Module {
  name: string;
  path: string;
  icon: string;
}

export const moduleService = {
  getModules: async (): Promise<Module[]> => {
    try {
      const response = await api.get('/modules');
      return response.data.data;
    } catch (error) {
      console.error('Error loading modules:', error);
      return [];
    }
  }
};
