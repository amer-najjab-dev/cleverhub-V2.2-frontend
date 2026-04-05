import { api } from '../api';

export interface Assignment {
  id: number;
  employee_id: number;
  shift_id: number;
  date: string;
  shift?: {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    color: string;
  };
  employee?: {
    id: number;
    user: {
      id: number;
      full_name: string;
      email: string;
    };
  };
}

export const assignmentService = {
  // Asignar rango de fechas
  assignRange: async (employeeId: number, shiftId: number, startDate: string, endDate: string): 
Promise<Assignment[]> => {
    const response = await api.post('/hr/assignments/range', { employeeId, shiftId, startDate, endDate });
    return response.data.data;
  },

  // Obtener asignaciones por rango
  getByDateRange: async (startDate: string, endDate: string): Promise<Assignment[]> => {
    const response = await api.get(`/hr/assignments?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data;
  },

  // Eliminar asignación
  delete: async (id: number): Promise<void> => {
    await api.delete(`/hr/assignments/${id}`);
  }
};
