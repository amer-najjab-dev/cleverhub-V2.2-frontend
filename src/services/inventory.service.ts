import { api } from './api';
import { AxiosResponse } from 'axios';

// ============================================
// TIPOS PARA INVENTARIO
// ============================================

export interface InventoryProduct {
  id: number;
  name: string;
  dosage?: string;
  stock: number;
  reserved: number;
  available: number;  // Calculado: stock - reserved
  ordered: number;
  pricePPH: number;
  pricePPV: number;
  zone: string;
  expiryDate: string;
  barcode1: string;
  barcode2?: string;
  laboratory?: string;
  category?: string;
}

export interface ExpiryAlert {
  id: number;
  productId: number;
  productName: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'critical' | 'warning' | 'normal' | 'expired';
  lotNumber?: string;
  quantity: number;
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  type: 'entrada' | 'salida' | 'ajuste' | 'devolucion';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  date: string;
  userId: number;
}

export interface StockAdjustment {
  productId: number;
  newStock: number;
  newOrdered?: number;
  newExpiryDate?: string;
  reason: string;
  notes?: string;
}

export interface InventorySummary {
  totalProducts: number;
  totalStockValue: number;  // Suma de (stock * pricePPH)
  totalRetailValue: number;  // Suma de (stock * pricePPV)
  lowStockCount: number;
  expiringCount: number;
  expiredCount: number;
}

// Interfaz para la respuesta del backend
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

// Helper para extraer data de AxiosResponse
const extractData = <T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> => {
  return response.data;
};

// ============================================
// INVENTORY SERVICE
// ============================================

export const inventoryService = {
  /**
   * Obtener todos los productos con stock
   * @param params - Filtros (categoría, laboratorio, zona, etc.)
   */
 getInventory: (params?: any): Promise<ApiResponse<InventoryProduct[]>> => 
  api.get<ApiResponse<InventoryProduct[]>>('/inventory', { params }).then(extractData),

  /**
   * Obtener un producto específico por ID
   */
  getProduct: (id: number): Promise<ApiResponse<InventoryProduct>> => 
    api.get<ApiResponse<InventoryProduct>>(`/inventory/products/${id}`).then(extractData),

  /**
   * Obtener alertas de caducidad
   * @param days - Días para considerar (ej: 90 para crítico, 180 para advertencia)
   */
  getExpiryAlerts: (days?: number): Promise<ApiResponse<ExpiryAlert[]>> => 
    api.get<ApiResponse<ExpiryAlert[]>>('/inventory/expiry-alerts', { params: { days } }).then(extractData),

  /**
   * Obtener historial de movimientos de stock
   * @param productId - Opcional, filtrar por producto
   */
  getStockMovements: (productId?: number): Promise<ApiResponse<StockMovement[]>> => {
    const params: any = {};
    if (productId) params.productId = productId;
    return api.get<ApiResponse<StockMovement[]>>('/inventory/movements', { params }).then(extractData);
  },

  /**
   * Ajustar stock de un producto
   */
  adjustStock: (data: StockAdjustment): Promise<ApiResponse<InventoryProduct>> => 
    api.post<ApiResponse<InventoryProduct>>('/inventory/adjust', data).then(extractData),

  /**
   * Obtener resumen del inventario
   */
  getSummary: (): Promise<ApiResponse<InventorySummary>> => 
    api.get<ApiResponse<InventorySummary>>('/inventory/summary').then(extractData),

  /**
   * Buscar productos por código de barras
   */
  scanBarcode: (barcode: string): Promise<ApiResponse<InventoryProduct>> => 
    api.get<ApiResponse<InventoryProduct>>(`/inventory/scan/${barcode}`).then(extractData),
};