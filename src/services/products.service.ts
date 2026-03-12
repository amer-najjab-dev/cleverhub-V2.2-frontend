import { api } from './api';

export interface Product {
  id: number;
  name: string;
  description?: string;
  pricePPV: number;
  pricePPH: number;
  stock: number;
  category: string;
  category_id?: number;
  sku?: string;
  expirationDate?: Date;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  dosageForm?: string;
  barcode?: string;
  zone?: string;
  active: boolean;
  laboratory?: string;
  prescription: boolean;
  posologyAdult?: string;
  posologyChild?: string;
  contraindications?: string;
  monograph?: string;
  priceHistories?: PriceHistory[];
  inventoryLots?: InventoryLot[];
  stockMovements?: StockMovement[];
}

export interface ProductSearchParams {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface PriceHistory {
  id: number;
  date: string;
  pricePPV: number;
  pricePPH: number;
}

export interface InventoryLot {
  id: number;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: number;
  type: 'vente' | 'achat' | 'retour' | 'ajustement';
  quantity: number;
  stockAfter: number;
  notes?: string;
  createdAt: string;
  lot?: InventoryLot;
}

// Interfaz para respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const productsService = {
  // Obtener todos los productos (con paginación)
  getAll: async (params?: ProductSearchParams): Promise<Product[]> => {
    const response = await api.get('/products', { params });
    return response.data.data; // Devuelve solo el array de productos
  },

  // Obtener productos con paginación (incluye meta)
  getAllPaginated: async (params?: ProductSearchParams): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products', { params });
    return response.data; // Devuelve toda la estructura { data, meta }
  },

  // Obtener producto por ID
  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  // Buscar productos
  search: async (query: string): Promise<Product[]> => {
    const response = await api.get('/products', { params: { q: query } });
    return response.data.data;
  },

  // Crear producto
  create: async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data.data;
  },

  // Actualizar producto
  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data.data;
  },

  // Actualizar stock
  updateStock: async (id: number, stockChange: number): Promise<Product> => {
    const response = await api.patch(`/products/${id}/stock`, { stock: stockChange });
    return response.data.data;
  },

  // Eliminar producto
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Obtener productos por categoría
  getByCategory: async (categoryId: number): Promise<Product[]> => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data.data;
  },

  // Obtener productos con stock bajo
  getLowStock: async (threshold: number = 10): Promise<Product[]> => {
    const response = await api.get('/products', { params: { lowStock: threshold } });
    return response.data.data;
  },

  // Obtener productos próximos a caducar
  getExpiringSoon: async (days: number = 30): Promise<Product[]> => {
    const response = await api.get('/products', { params: { expiringIn: days } });
    return response.data.data;
  },

  // Contar productos por categoría
  countByCategory: async (): Promise<Record<string, number>> => {
    const response = await api.get('/products/stats/categories');
    return response.data.data;
  }
};