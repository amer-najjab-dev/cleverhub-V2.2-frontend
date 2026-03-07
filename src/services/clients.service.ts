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

export const clientsService = {
  // --- CRUD Básico de Clientes ---
  getAll: (params?: ClientSearchParams) => 
    api.get<Client[]>('/clients', { params }),

  getById: (id: number) => 
    api.get<Client>(`/clients/${id}`),

  search: (query: string) => 
    api.get<Client[]>('/clients', { params: { q: query } }),

  create: (data: CreateClientDto) => 
    api.post<Client>('/clients', data),

  update: (id: number, data: UpdateClientDto) => 
    api.put<Client>(`/clients/${id}`, data),

  delete: (id: number) => 
    api.delete(`/clients/${id}`),

  // --- Deudas del Cliente ---
  getDebt: (clientId: number) => 
    api.get<ClientDebt>(`/clients/${clientId}/debt`),

  registerPayment: (clientId: number, data: PaymentDto) => 
  api.post<ClientDebt>(`/clients/${clientId}/pagos`, data),

  getPendingAmount: (clientId: number) => 
    api.get<{ clientId: number; pendingAmount: number }>(`/clients/${clientId}/debt/pending`),

  checkCanDelete: (clientId: number) => 
    api.get<{ clientId: number; canDelete: boolean }>(`/clients/${clientId}/debt/can-delete`),

  // --- Registros de Salud ---
  createHealthRecord: (clientId: number, data: CreateHealthRecordDto) => 
    api.post<ClientHealthRecord>(`/clients/${clientId}/health-records`, data),

  getHealthRecords: (clientId: number) => 
    api.get<ClientHealthRecord[]>(`/clients/${clientId}/health-records`),

  getHealthRecordById: (id: number) => 
    api.get<ClientHealthRecord>(`/health-records/${id}`),

  updateHealthRecord: (id: number, data: UpdateHealthRecordDto) => 
    api.put<ClientHealthRecord>(`/health-records/${id}`, data),

  deleteHealthRecord: (id: number) => 
    api.delete(`/health-records/${id}`),

  getHealthStats: (clientId: number) => 
    api.get<HealthStats>(`/clients/${clientId}/health-stats`),

  // --- Historial de Compras ---
  // CAMBIO: getPurchaseHistory → getClientPurchases, y ajustamos el tipo de retorno
  getClientPurchases: (clientId: number) => 
    api.get<{ success: boolean; data: any[] }>(`/clients/${clientId}/purchases`),

  updateLoyaltyPoints: (clientId: number, points: number) => 
    api.patch(`/clients/${clientId}/loyalty`, { points }),
};