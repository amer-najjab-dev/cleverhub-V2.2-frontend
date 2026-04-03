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
  getInventory: async (params?: any): Promise<ApiResponse<InventoryProduct[]>> => {
    const response = await api.get<ApiResponse<any[]>>('/inventory', { params });
    
    // Transformar los datos del backend al formato esperado por el frontend
    const transformedData = response.data.data.map((item: any) => ({
      id: item.product_id,
      name: item.product?.name || '',
      dosage: item.product?.dosageForm,
      stock: item.quantity,
      reserved: 0,
      available: item.quantity,
      ordered: 0,
      pricePPH: parseFloat(item.product?.pricePPH || 0),
      pricePPV: parseFloat(item.product?.pricePPV || 0),
      zone: item.product?.zone,
      expiryDate: item.expiry_date,
      barcode1: item.product?.barcode || '',
      barcode2: '',
      laboratory: item.product?.laboratory,
      category: item.product?.category
    }));
    
    return {
      success: response.data.success,
      data: transformedData,
      meta: response.data.meta
    };
  },

  /**
   * Obtener resumen del inventario
   */
  getSummary: async (): Promise<ApiResponse<InventorySummary>> => {
    const response = await api.get<ApiResponse<any>>('/inventory/summary');
    
    // Transformar los datos del backend al formato esperado por el frontend
    const transformedData: InventorySummary = {
      totalProducts: response.data.data?.total_products || 0,
      totalStockValue: response.data.data?.total_value || 0,
      totalRetailValue: response.data.data?.total_retail_value || 0,
      lowStockCount: response.data.data?.low_stock || 0,
      expiringCount: response.data.data?.expiring_soon || 0,
      expiredCount: response.data.data?.expired || 0
    };
    
    return {
      success: response.data.success,
      data: transformedData,
      meta: response.data.meta
    };
  },

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
   * Buscar productos por código de barras
   */
  scanBarcode: (barcode: string): Promise<ApiResponse<InventoryProduct>> => 
    api.get<ApiResponse<InventoryProduct>>(`/inventory/scan/${barcode}`).then(extractData),
};