import { api } from '../api';

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  min_employees_required: number;
  color: string;
  is_guard: boolean;
  created_at: string;
  updated_at: string;
}

export const shiftService = {
  // Obtener todos los turnos
  getAll: async (): Promise<Shift[]> => {
    const response = await api.get('/hr/shifts');
    return response.data.data;
  },

  // Crear turno
  create: async (data: {
    name: string;
    start_time: string;
    end_time: string;
    min_employees_required: number;
    color?: string;
  }): Promise<Shift> => {
    const response = await api.post('/hr/shifts', data);
    return response.data.data;
  },

  // Actualizar turno
  update: async (id: number, data: Partial<Shift>): Promise<Shift> => {
    const response = await api.put(`/hr/shifts/${id}`, data);
    return response.data.data;
  },

  // Eliminar turno
  delete: async (id: number): Promise<void> => {
    await api.delete(`/hr/shifts/${id}`);
  }
};
