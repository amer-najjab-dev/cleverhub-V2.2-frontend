import { api } from './api';

export interface Pharmacy {
  id: number;
  name: string;
  license: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: number;
  pharmacy_id: number;
  plan: 'BASIC' | 'PREMIUM';
  status: 'TRIAL' | 'ACTIVE' | 'GRACE_PERIOD' | 'SUSPENDED' | 'CANCELLED';
  start_date: string;
  end_date: string;
  next_billing_date: string;
  pharmacy?: Pharmacy;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'SUPER_ADMIN';
  pharmacy_id: number | null;
  pharmacy?: Pharmacy;
  is_active: boolean;
  created_at: string;
}

export interface HealthStatus {
  summary: {
    total: number;
    green: number;
    yellow: number;
    red: number;
  };
  status: {
    green: any[];
    yellow: any[];
    red: any[];
  };
}

export interface BroadcastPayload {
  target: 'ALL' | 'ACTIVE' | 'GRACE_PERIOD' | 'SUSPENDED' | 'SPECIFIC_PHARMACY';
  title: string;
  message: string;
  action_url?: string;
  filters?: {
    sendEmail?: boolean;
    pharmacy_ids?: number[];
  };
}

export const adminService = {
  // Farmacias
  getPharmacies: async (): Promise<Pharmacy[]> => {
    const response = await api.get('/admin/pharmacies');
    return response.data.data;
  },
  createPharmacy: (data: Partial<Pharmacy>) => api.post('/admin/pharmacies', data),
  updatePharmacy: (id: number, data: Partial<Pharmacy>) => api.put(`/admin/pharmacies/${id}`, data),
  deletePharmacy: (id: number) => api.delete(`/admin/pharmacies/${id}`),

  // Suscripciones
  getSubscriptions: async (): Promise<Subscription[]> => {
    const response = await api.get('/admin/subscriptions');
    return response.data.data;
  },
  createSubscription: (data: { pharmacy_id: number; plan: string; trial_days?: number }) =>
    api.post('/admin/subscriptions', data),
  renewSubscription: (data: { pharmacyId: number; months: number; amount: number; paymentMethod: string; transactionId: string }) =>
    api.post('/admin/subscriptions/renew', data),
  extendCourtesy: (data: { pharmacyId: number; days: number; reason: string }) =>
    api.post('/admin/subscriptions/extend-courtesy', data),

  // Usuarios globales
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data.data;
  },
  createUser: (data: Partial<User>) => api.post('/admin/users', data),
  updateUser: (id: number, data: Partial<User>) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),

  // Health status
  getHealthStatus: async (): Promise<HealthStatus> => {
    const response = await api.get('/api/admin/health-status');
    return response.data.data;
  },

  // Broadcast
  sendBroadcast: (data: BroadcastPayload) => api.post('/admin/broadcast', data),

  // Impersonate
  impersonate: (pharmacyId: number) => api.post(`/admin/impersonate/${pharmacyId}`),

  // Stats globales
  getGlobalStats: () => api.get('/admin/stats'),
};