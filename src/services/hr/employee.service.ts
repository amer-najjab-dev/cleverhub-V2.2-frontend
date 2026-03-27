import { api } from '../api';

// ==================== TIPOS ====================

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

export interface ShiftAssignment {
  id: number;
  employee_id: number;
  shift_id: number;
  date: string;
  created_at: string;
  updated_at: string;
  employee?: {
    id: number;
    user?: { full_name: string };
  };
  shift?: Shift;
}

export interface TimeOffRequest {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  coverage_warning: boolean;
  coverage_details?: any;
  created_at: string;
  updated_at: string;
  employeeName?: string;
  employeeEmail?: string;
  reviewerName?: string;
}

export interface ShiftSwapRequest {
  id: number;
  from_employee_id: number;
  to_employee_id: number;
  from_shift_id: number;
  to_shift_id: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  from_employee?: { user?: { full_name: string } };
  to_employee?: { user?: { full_name: string } };
  from_shift?: Shift;
  to_shift?: Shift;
}

export interface CoverageData {
  date: string;
  shiftId: number;
  shiftName: string;
  currentCount: number;
  requiredMin: number;
  isCritical: boolean;
  employees: { id: number; name: string | null }[];
}

export interface CoverageCheckResult {
  coverage: CoverageData[];
  warnings: {
    date: string;
    shift: string;
    current: number;
    required: number;
    message: string;
  }[];
  hasWarnings: boolean;
}

export interface VacationBalance {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface PharmacyConfig {
  id: number;
  shift_id: number;
  min_employees_required: number;
  shift?: Shift;
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
  // ==================== EMPLEADOS ====================
  getAllEmployees: async (): Promise<Employee[]> => {
    const response = await api.get('/hr/employees');
    return response.data.data;
  },

  getEmployeeById: async (id: number): Promise<Employee> => {
    const response = await api.get(`/hr/employees/${id}`);
    return response.data.data;
  },

  createEmployee: async (data: {
    email: string;
    fullName: string;
    phone?: string;
    dni?: string;
    password?: string;
    defaultShiftId?: number;
    vacationDays?: number;
  }): Promise<Employee> => {
    const response = await api.post('/hr/employees', data);
    return response.data.data;
  },

  updateEmployee: async (id: number, data: {
    defaultShiftId?: number;
    vacationDays?: number;
    vacationDaysUsed?: number;
    isActive?: boolean;
  }): Promise<Employee> => {
    const response = await api.put(`/hr/employees/${id}`, data);
    return response.data.data;
  },

  deleteEmployee: async (id: number): Promise<void> => {
    await api.delete(`/hr/employees/${id}`);
  },

  // ==================== TURNOS ====================
  getShifts: async (): Promise<Shift[]> => {
    const response = await api.get('/hr/shifts');
    return response.data.data;
  },

  createShift: async (data: {
    name: string;
    startTime: string;
    endTime: string;
    isGuard?: boolean;
    minEmployeesRequired?: number;
  }): Promise<Shift> => {
    const response = await api.post('/hr/shifts', data);
    return response.data.data;
  },

  updateShift: async (id: number, data: Partial<Shift>): Promise<Shift> => {
    const response = await api.put(`/hr/shifts/${id}`, data);
    return response.data.data;
  },

  deleteShift: async (id: number): Promise<void> => {
    await api.delete(`/hr/shifts/${id}`);
  },

  // ==================== ASIGNACIONES DE TURNO ====================
  getShiftAssignments: async (params: {
    startDate?: string;
    endDate?: string;
    employeeId?: number;
  }): Promise<ShiftAssignment[]> => {
    const response = await api.get('/hr/shift-assignments', { params });
    return response.data.data;
  },

  assignShift: async (data: {
    employeeId: number;
    shiftId: number;
    date?: string;
  }): Promise<ShiftAssignment | Employee> => {
    const response = await api.post('/hr/shift-assignments', data);
    return response.data.data;
  },

  // ==================== SOLICITUDES DE VACACIONES ====================
  getTimeOffRequests: async (params?: {
    status?: string;
    employeeId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<TimeOffRequest[]> => {
    const response = await api.get('/hr/time-off-requests', { params });
    return response.data.data;
  },

  createTimeOffRequest: async (data: {
    startDate: string;
    endDate: string;
    notes?: string;
  }): Promise<TimeOffRequest> => {
    const response = await api.post('/hr/time-off-requests', data);
    return response.data.data;
  },

  approveTimeOffRequest: async (id: number): Promise<TimeOffRequest> => {
    const response = await api.patch(`/hr/time-off-requests/${id}/approve`);
    return response.data.data;
  },

  rejectTimeOffRequest: async (id: number): Promise<TimeOffRequest> => {
    const response = await api.patch(`/hr/time-off-requests/${id}/reject`);
    return response.data.data;
  },

  getVacationBalance: async (): Promise<VacationBalance> => {
    const response = await api.get('/hr/time-off-requests/balance');
    return response.data.data;
  },

  // ==================== COBERTURA ====================
  checkCoverage: async (data: {
    startDate: string;
    endDate: string;
    employeeId?: number;
  }): Promise<CoverageCheckResult> => {
    const response = await api.post('/hr/coverage/check', data);
    return response.data.data;
  },

  getCoverage: async (params: {
    startDate: string;
    endDate: string;
  }): Promise<CoverageData[]> => {
    const response = await api.get('/hr/coverage', { params });
    return response.data.data;
  },

  // ==================== CONFIGURACIÓN DE FARMACIA ====================
  getPharmacyConfig: async (): Promise<PharmacyConfig[]> => {
    const response = await api.get('/hr/pharmacy-config');
    return response.data.data;
  },

  updatePharmacyConfig: async (data: {
    shiftId: number;
    minEmployeesRequired: number;
  }[]): Promise<PharmacyConfig[]> => {
    const response = await api.put('/hr/pharmacy-config', data);
    return response.data.data;
  },

  setConfigOverride: async (data: {
    shiftId: number;
    date: string;
    minEmployeesRequired: number;
  }): Promise<any> => {
    const response = await api.post('/hr/pharmacy-config/overrides', data);
    return response.data.data;
  },

  deleteConfigOverride: async (id: number): Promise<void> => {
    await api.delete(`/hr/pharmacy-config/overrides/${id}`);
  },

  // ==================== FESTIVOS ====================
  getHolidays: async (): Promise<Holiday[]> => {
    const response = await api.get('/hr/holidays');
    return response.data.data;
  },

  createHoliday: async (data: {
    name: string;
    date: string;
    isRecurring: boolean;
  }): Promise<Holiday> => {
    const response = await api.post('/hr/holidays', data);
    return response.data.data;
  },

  deleteHoliday: async (id: number): Promise<void> => {
    await api.delete(`/hr/holidays/${id}`);
  }
};
