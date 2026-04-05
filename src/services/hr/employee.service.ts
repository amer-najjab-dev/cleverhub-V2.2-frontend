import { api } from '../api';

export interface Employee {
  id: number;
  user_id: number;
  pharmacy_id: number;
  default_shift_id: number | null;
  vacation_days: number;
  vacation_days_used: number;
  user?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export const employeeService = {
  // Obtener todos los empleados
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get('/hr/employees');
    return response.data.data;
  },

  // Crear empleado
  create: async (data: { email: string; full_name: string; password: string }): Promise<Employee> => {
    const response = await api.post('/hr/employees', data);
    return response.data.data;
  }
};
