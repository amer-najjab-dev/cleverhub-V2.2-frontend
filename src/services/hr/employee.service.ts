import { api } from '../api';

// ==================== TIPOS REALES DEL BACKEND (snake_case) ====================

export interface Employee {
  id: number;
  user_id: number;
  default_shift_id: number | null;
  vacation_days: number;
  vacation_days_used: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
  };
  default_shift?: Shift;
}

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  is_guard: boolean;
  min_employees_required: number;
  created_at: string;
  updated_at: string;
}

export interface TimeOffRequest {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
  notes: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  coverage_warning: boolean;
  coverage_details: any;
  created_at: string;
  updated_at: string;
  employeeName?: string;
  employeeEmail?: string;
}

export interface GuardPeriod {
  id: number;
  shift_id: number;
  shift_name?: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Holiday {
  id: number;
  name: string;
  date: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== SERVICIO ====================

export const employeeService = {
  // Empleados
  getEmployees: async (): Promise<Employee[]> => {
    const res = await api.get('/hr/employees');
    return res.data.data;
  },
  
  getEmployeeById: async (id: number): Promise<Employee> => {
    const res = await api.get(`/hr/employees/${id}`);
    return res.data.data;
  },
  
  createEmployee: async (data: { fullName: string; email: string; phone?: string; shiftId?: number }): Promise<Employee> => {
    const res = await api.post('/hr/employees', {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      defaultShiftId: data.shiftId
    });
    return res.data.data;
  },
  
  updateEmployeeShift: async (employeeId: number, shiftId: number, date: string | null = null): Promise<void> => {
    const payload: any = { employeeId, shiftId };
    if (date) payload.date = date;
    await api.put(`/hr/employees/${employeeId}/shift`, payload);
  },

  assignShiftWithRange: async (employeeId: number, shiftId: number, startDate: string, endDate: string): Promise<void> => {
    await api.post('/hr/employees/assign-shift-range', {
      employeeId,
      shiftId,
      startDate,
      endDate
    });
  },
  
  // Turnos
  getShifts: async (): Promise<Shift[]> => {
    const res = await api.get('/hr/shifts');
    return res.data.data;
  },
  
  // Vacaciones
  getTimeOffRequests: async (): Promise<TimeOffRequest[]> => {
    const res = await api.get('/hr/time-off-requests');
    return res.data.data;
  },
  
  createTimeOffRequest: async (data: { startDate: string; endDate: string; notes?: string }): Promise<TimeOffRequest> => {
    const res = await api.post('/hr/time-off-requests', data);
    return res.data.data;
  },
  
  approveTimeOff: async (id: number): Promise<void> => {
    await api.patch(`/hr/time-off-requests/${id}/approve`);
  },
  
  rejectTimeOff: async (id: number): Promise<void> => {
    await api.patch(`/hr/time-off-requests/${id}/reject`);
  },
  
  // Guardias
  getGuardPeriods: async (): Promise<GuardPeriod[]> => {
    const res = await api.get('/hr/guard-periods');
    return res.data.data;
  },
  
  createGuardPeriod: async (data: { shiftId: number; startDate: string; endDate: string }): Promise<GuardPeriod> => {
    const res = await api.post('/hr/guard-periods', data);
    return res.data.data;
  },
  
  deleteGuardPeriod: async (id: number): Promise<void> => {
    await api.delete(`/hr/guard-periods/${id}`);
  },

  // ==================== FESTIVOS ====================
  getHolidays: async (): Promise<Holiday[]> => {
    const res = await api.get('/hr/holidays');
    return res.data.data;
  },

  createHoliday: async (data: { name: string; date: string; isRecurring: boolean }): Promise<Holiday> => {
    const res = await api.post('/hr/holidays', data);
    return res.data.data;
  },

  deleteHoliday: async (id: number): Promise<void> => {
    await api.delete(`/hr/holidays/${id}`);
  },

  // ==================== COBERTURA ====================
  getCoverage: async (params: { startDate: string; endDate: string }): Promise<any[]> => {
    const res = await api.get('/hr/coverage', { params });
    return res.data.data;
  },

  assignShift: async (data: { employeeId: number; shiftId: number; date?: string }): Promise<void> => {
    const res = await api.post('/hr/shift-assignments', data);
    return res.data.data;
  },

  updateShiftConfig: async (shiftId: number, minEmployeesRequired: number): Promise<void> => {
    await api.patch(`/hr/shifts/${shiftId}/config`, { min_employees_required: minEmployeesRequired });
  },

  removeShiftAssignment: async (employeeId: number, shiftId: number, date: string): Promise<void> => {
    await api.delete('/hr/shift-assignments', { data: { employeeId, shiftId, date } });
  },

  // ==================== NUEVOS MÉTODOS ====================
  
  /**
   * Obtener todos los empleados (versión genérica)
   */
  getEmployeesList: async (): Promise<any[]> => {
    const response = await api.get('/hr/employees');
    return response.data.data;
  },

  /**
   * Obtener asignaciones de turno por shift y fecha
   * @param shiftId - ID del turno
   * @param date - Fecha en formato YYYY-MM-DD
   */
  getShiftAssignments: async (shiftId: number, date: string): Promise<any[]> => {
    const response = await api.get(`/hr/shift-assignments?shiftId=${shiftId}&date=${date}`);
    return response.data.data;
  },

  /**
   * Asignar un empleado a un turno en una fecha específica
   * @param employeeId - ID del empleado
   * @param shiftId - ID del turno
   * @param date - Fecha en formato YYYY-MM-DD
   */
  assignEmployeeToShift: async (employeeId: number, shiftId: number, date: string): Promise<void> => {
    await api.post('/hr/shift-assignments', { employee_id: employeeId, shift_id: shiftId, date });
  },

  /**
   * Eliminar asignación de turno
   * @param shiftId - ID del turno
   * @param employeeId - ID del empleado
   * @param date - Fecha en formato YYYY-MM-DD
   */
  removeShiftAssignmentById: async (shiftId: number, employeeId: number, date: string): Promise<void> => {
    await api.delete(`/hr/shift-assignments?shiftId=${shiftId}&employeeId=${employeeId}&date=${date}`);
  },

  /**
   * Actualizar configuración mínima de empleados para un turno
   * @param shiftId - ID del turno
   * @param minEmployees - Número mínimo de empleados requeridos
   */
  updateShiftMinEmployees: async (shiftId: number, minEmployees: number): Promise<void> => {
    await api.patch(`/hr/shifts/${shiftId}/config`, { min_employees_required: minEmployees });
  },
};