import { api } from './api';

export interface Client {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string | null;
  dni?: string;
  birthDate?: string | null;
  allergies?: string | null;
  chronicConditions?: string | null;
  isPregnant?: boolean;
  isLactating?: boolean;
  loyaltyPoints?: number;
  totalPurchases?: string;
  favorite?: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  lastPurchaseDate?: string | null;
}

export interface ClientDebt {
  id: number;
  clientId: number;
  totalDebt: number;
  paidAmount: number;
  pendingAmount: number;
  lastPaymentDate?: string | null;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}

export interface ClientHealthRecord {
  id: number;
  clientId: number;
  glucoseLevel?: number;           // g/dL
  bloodPressureSystolic?: number;  // Máxima
  bloodPressureDiastolic?: number; // Mínima
  weight?: number;                 // kg
  heartRate?: number;              // lpm
  recordDate: string;              // dd/mm/aaaa
  notes?: string;
  glucoseStatus?: 'normal' | 'alta' | 'baja' | 'no_data';
  bloodPressureStatus?: 'normal' | 'alta' | 'baja' | 'ideal' | 'no_data';
  heartRateStatus?: 'normal' | 'alerta' | 'peligro' | 'no_data';
  createdAt: string;
  updatedAt: string;
}

export interface HealthStats {
  totalRecords: number;
  lastRecord: ClientHealthRecord;
  glucose: {
    average: number | null;
    lastValue: number | null;
    trend: string;
  };
  bloodPressure: {
    systolicAverage: number | null;
    diastolicAverage: number | null;
    lastValues: { systolic: number | null; diastolic: number | null } | null;
  };
  weight: {
    average: number | null;
    lastValue: number | null;
    trend: string;
  };
  heartRate: {
    average: number | null;
    lastValue: number | null;
    trend: string;
  };
}

export interface CreateClientDto {
  firstName: string;        // Obligatorio
  lastName?: string;         // Opcional
  phone: string;             // Obligatorio
  email?: string;
  address?: string;
  dni?: string;
  birthDate?: string;
  allergies?: string[];
  regularMedications?: string[];
  notes?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {}

export interface CreateHealthRecordDto {
  clientId: number;
  glucoseLevel?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  weight?: number;
  heartRate?: number;
  recordDate: string; // Formato: YYYY-MM-DD
  notes?: string;
}

export interface UpdateHealthRecordDto extends Partial<CreateHealthRecordDto> {}

export interface PaymentDto {
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export interface ClientSearchParams {
  q?: string;
  phone?: string;
  email?: string;
  dni?: string;
  page?: number;
  limit?: number;
}

// Interfaz para la respuesta paginada del backend
export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Interfaz para respuesta simple
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const clientsService = {
  // --- CRUD Básico de Clientes ---
  getAll: async (params?: ClientSearchParams) => {
    const response = await api.get<ApiPaginatedResponse<Client>>('/clients', { params });
    return response.data; // Devuelve toda la respuesta estructurada
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data;
  },

  search: async (query: string) => {
    const response = await api.get<ApiPaginatedResponse<Client>>('/clients', { 
      params: { q: query } 
    });
    return response.data; // Devuelve la respuesta paginada
  },

  create: async (data: CreateClientDto) => {
    const response = await api.post<ApiResponse<Client>>('/clients', data);
    return response.data;
  },

  update: async (id: number, data: UpdateClientDto) => {
    const response = await api.put<ApiResponse<Client>>(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/clients/${id}`);
    return response.data;
  },

  // --- Deudas del Cliente ---
  getDebt: async (clientId: number) => {
    const response = await api.get<ApiResponse<ClientDebt>>(`/clients/${clientId}/debts`);
    return response.data;
  },

  registerPayment: async (clientId: number, data: PaymentDto) => {
    const response = await api.post<ApiResponse<ClientDebt>>(`/clients/${clientId}/pagos`, data);
    return response.data;
  },

  getPendingAmount: async (clientId: number) => {
    const response = await api.get<ApiResponse<{ clientId: number; pendingAmount: number }>>(
      `/clients/${clientId}/debt/pending`
    );
    return response.data;
  },

  checkCanDelete: async (clientId: number) => {
    const response = await api.get<ApiResponse<{ clientId: number; canDelete: boolean }>>(
      `/clients/${clientId}/debt/can-delete`
    );
    return response.data;
  },

  // --- Registros de Salud ---
  createHealthRecord: async (clientId: number, data: CreateHealthRecordDto) => {
    const response = await api.post<ApiResponse<ClientHealthRecord>>(
      `/clients/${clientId}/health-records`, 
      data
    );
    return response.data;
  },

  getHealthRecords: async (clientId: number) => {
    const response = await api.get<ApiResponse<ClientHealthRecord[]>>(
      `/clients/${clientId}/health-records`
    );
    return response.data;
  },

  getHealthRecordById: async (id: number) => {
    const response = await api.get<ApiResponse<ClientHealthRecord>>(`/health-records/${id}`);
    return response.data;
  },

  updateHealthRecord: async (id: number, data: UpdateHealthRecordDto) => {
    const response = await api.put<ApiResponse<ClientHealthRecord>>(`/health-records/${id}`, data);
    return response.data;
  },

  deleteHealthRecord: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/health-records/${id}`);
    return response.data;
  },

  getHealthStats: async (clientId: number) => {
    const response = await api.get<ApiResponse<HealthStats>>(`/clients/${clientId}/health-stats`);
    return response.data;
  },

  // --- Historial de Compras ---
  getClientPurchases: async (clientId: number) => {
    const response = await api.get<ApiResponse<any[]>>(`/clients/${clientId}/purchases`);
    return response.data;
  },

  updateLoyaltyPoints: async (clientId: number, points: number) => {
    const response = await api.patch<ApiResponse<{ loyaltyPoints: number }>>(
      `/clients/${clientId}/loyalty`, 
      { points }
    );
    return response.data;
  },
};