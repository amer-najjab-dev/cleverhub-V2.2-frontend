import { api } from '../api';

export interface Employee {
  id: number;
  user_id: number;
  pharmacy_id: number;
  default_shift_id: number | null;
  vacation_days: number;
  vacation_days_used: number;
  phone?: string;
  address?: string;
  cni?: string;
  birth_date?: string;
  marital_status?: string;
  children_count?: number;
  user?: {
    id: number;
    full_name: string;
    email: string;
  };
  default_shift?: {
    id: number;
    name: string;
    start_time?: string;
    end_time?: string;
  };
}

export const employeeService = {
  // Obtener todos los empleados
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get('/hr/employees');
    return response.data.data;
  },

  // Obtener empleado por ID
  getById: async (id: number): Promise<Employee> => {
    const response = await api.get(`/hr/employees/${id}`);
    return response.data.data;
  },

  // Crear empleado
  create: async (data: any): Promise<Employee> => {
    const response = await api.post('/hr/employees', data);
    return response.data.data;
  },

  // Actualizar empleado
  update: async (id: number, data: any): Promise<Employee> => {
    const response = await api.put(`/hr/employees/${id}`, data);
    return response.data.data;
  },

  // Eliminar empleado
  delete: async (id: number): Promise<void> => {
    await api.delete(`/hr/employees/${id}`);
  },

  // Actualizar turno por defecto del empleado
  updateDefaultShift: async (employeeId: number, shiftId: number): Promise<void> => {
    await api.put(`/hr/employees/${employeeId}/shift`, { shiftId });
  },

  // Obtener solicitudes de tiempo libre
  getTimeOffRequests: async (employeeId?: number): Promise<any[]> => {
    const params = employeeId ? { employeeId } : {};
    const response = await api.get('/hr/time-off-requests', { params });
    return response.data.data;
  },

  // Crear solicitud de tiempo libre
  createTimeOffRequest: async (data: { employeeId: number; startDate: string; endDate: string; type: string; notes?: string }): Promise<any> => {
    const response = await api.post('/hr/time-off-requests', data);
    return response.data.data;
  }
};