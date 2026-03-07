import { api } from '../../../services/api';
import { Supplier, CreditNote, ProductPurchase } from '../types/supplier.types';

export const supplierService = {
  // ========== CRUD BÁSICO ==========
  
  getAll: async (filters?: { search?: string; city?: string; minBalance?: number; maxBalance?: number }) => {
    const params: any = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.city) params.city = filters.city;
    if (filters?.minBalance !== undefined) params.minBalance = filters.minBalance;
    if (filters?.maxBalance !== undefined) params.maxBalance = filters.maxBalance;
    
    const response = await api.get('/suppliers', { params });
    return response.data.data as Supplier[];
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data.data as Supplier;
  },
  
  search: async (query: string) => {
    const response = await api.get('/suppliers/search', { params: { q: query } });
    return response.data.data as Supplier[];
  },
  
  create: async (data: Partial<Supplier>) => {
    const response = await api.post('/suppliers', data);
    return response.data.data as Supplier;
  },
  
  update: async (id: string, data: Partial<Supplier>) => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data.data as Supplier;
  },
  
  delete: async (id: string) => {
    await api.delete(`/suppliers/${id}`);
  },
  
  // ========== NOTAS DE CRÉDITO ==========
  
  getCreditNotes: async (supplierId: string) => {
    const response = await api.get(`/suppliers/${supplierId}/credits`);
    return response.data.data as CreditNote[];
  },
  
  createCreditNote: async (data: any) => {
    const response = await api.post('/suppliers/credits', data);
    return response.data.data as CreditNote;
  },
  
  applyCreditNote: async (creditId: string, amount: number, appliedTo: string) => {
    const response = await api.post(`/suppliers/credits/${creditId}/apply`, { amount, appliedTo });
    return response.data.data as CreditNote;
  },
  
  // ========== RECEPCIÓN ==========
  
  processDelivery: async (data: any) => {
    const response = await api.post('/suppliers/delivery', data);
    return response.data.data;
  },
  
  getDeliveryNote: async (id: string) => {
    const response = await api.get(`/suppliers/delivery/${id}`);
    return response.data.data;
  },
  
  // ========== HISTORIAL ==========
  
  getProductHistory: async (productId: number) => {
    const response = await api.get(`/suppliers/products/${productId}/history`);
    return response.data.data as ProductPurchase[];
  }
};