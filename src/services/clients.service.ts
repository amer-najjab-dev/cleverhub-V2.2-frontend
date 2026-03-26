import { api } from './api';

export interface Client {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  address?: string | null;
  dni?: string;
  birth_date?: string | null;
  allergies?: string | null;
  chronic_conditions?: string | null;
  is_pregnant?: boolean;
  is_lactating?: boolean;
  loyalty_points?: number;
  total_purchases?: string;
  favorite?: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  last_purchase_date?: string | null;
  total_debt?: number;
}

export interface ClientDebt {
  id: number;
  client_id: number;
  total_debt: number;
  paid_amount: number;
  pending_amount: number;
  last_payment_date?: string | null;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  notes?: string | null;
  created_at: string;
  updated_at: string;
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
  first_name: string;        // Obligatorio
  last_name?: string;         // Opcional
  phone: string;             // Obligatorio
  email?: string;
  address?: string;
  dni?: string;
  birthDate?: string;
  allergies?: string | null;
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
    // Cambiar de /pagos a /debt/payments
    const response = await api.post<ApiResponse<ClientDebt>>(`/clients/${clientId}/debt/payments`, data);
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
      `/clients/${clientId}/can-delete`
    );
    return response.data;
  },

  // --- Registros de Salud ---
  createHealthRecord: async (clientId: number, data: CreateHealthRecordDto) => {
  // Convertir camelCase a snake_case para el backend
  const payload = {
    client_id: clientId,
    glucose_level: data.glucoseLevel,
    blood_pressure_systolic: data.bloodPressureSystolic,
    blood_pressure_diastolic: data.bloodPressureDiastolic,
    weight: data.weight,
    heart_rate: data.heartRate,
    record_date: data.recordDate,
    notes: data.notes
  };
  
  const response = await api.post(`/clients/${clientId}/health-records`, payload);

  const item = response.data.data;
    const mappedData = {
      id: item.id,
      clientId: item.client_id,
      glucoseLevel: item.glucose_level,
      bloodPressureSystolic: item.blood_pressure_systolic,
      bloodPressureDiastolic: item.blood_pressure_diastolic,
      weight: item.weight,
      heartRate: item.heart_rate,
      recordDate: item.record_date,
      notes: item.notes,
      glucoseStatus: item.glucose_status,
      bloodPressureStatus: item.blood_pressure_status,
      heartRateStatus: item.heart_rate_status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
    
    return {
      ...response.data,
      data: mappedData
    };
  },

  getHealthRecords: async (clientId: number) => {
    const response = await api.get(`/clients/${clientId}/health-records`);
    // Mapear snake_case a camelCase
    const mappedData = response.data.data.map((item: any) => ({
      id: item.id,
      clientId: item.client_id,
      glucoseLevel: item.glucose_level,
      bloodPressureSystolic: item.blood_pressure_systolic,
      bloodPressureDiastolic: item.blood_pressure_diastolic,
      weight: item.weight,
      heartRate: item.heart_rate,
      recordDate: item.record_date,  // ← Mapeo clave
      notes: item.notes,
      glucoseStatus: item.glucose_status,
      bloodPressureStatus: item.blood_pressure_status,
      heartRateStatus: item.heart_rate_status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
    return {
      ...response.data,
      data: mappedData
    };
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